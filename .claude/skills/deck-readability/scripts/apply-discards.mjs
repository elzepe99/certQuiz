/**
 * Turn a batch of rewritten explanations into a findings file for
 * apply-findings.mjs, for the "why the other options are wrong" pass.
 *
 *   node .claude/skills/deck-readability/scripts/apply-discards.mjs \
 *        <batch.mjs> <out-findings.json> [--deck public/decks/<deck>.json]
 *
 * <batch.mjs> default-exports { "<question id>": "<prose>" } with NO References
 * block — apply-findings.mjs appends that and merges it with whatever the
 * question already carries. The deck is inferred from the ids unless --deck
 * says otherwise.
 *
 * This exists for three guards, not for the file shuffling:
 *
 *   1. Every non-keyed option must have a line. On a five-option question it is
 *      genuinely easy to write four and miss one, and nothing downstream would
 *      notice — apply-findings.mjs only cares that the explanation changed.
 *   2. The verdict is forced to `clarified`. This pass never moves a key, so it
 *      must never stamp a correction notice; a notice on every question trains
 *      the reader to skip the one that matters.
 *   3. Existing references are carried forward. apply-findings.mjs requires a
 *      citation on any touched question, and re-typing them by hand is how a
 *      verified URL gets dropped.
 *
 * It also strips *markdown emphasis*, because the app renders explanations as
 * plain text and would print the asterisks.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const [batchPath, outPath] = positional;
const deckFlag = args.indexOf('--deck');
let deckPath = deckFlag >= 0 ? args[deckFlag + 1] : null;

if (!batchPath || !outPath) {
  console.error('usage: node apply-discards.mjs <batch.mjs> <out-findings.json> [--deck <deck.json>]');
  process.exit(2);
}

const PROSE = (await import(pathToFileURL(resolve(batchPath)).href)).default;
const ids = Object.keys(PROSE);
if (!ids.length) {
  console.error(`${batchPath}: default export is empty`);
  process.exit(2);
}

const DECKS_DIR = 'public/decks';

/** Find the one deck containing these ids, so a batch cannot be applied to the wrong file. */
if (!deckPath) {
  const candidates = readdirSync(DECKS_DIR)
    .filter((f) => f.endsWith('.json') && !/manifest|deck-template/.test(f))
    .filter((f) => {
      const d = JSON.parse(readFileSync(join(DECKS_DIR, f), 'utf8'));
      if (!Array.isArray(d)) return false;
      const have = new Set(d.map((q) => q.id));
      return ids.every((id) => have.has(id));
    });
  if (candidates.length !== 1) {
    console.error(
      candidates.length
        ? `ids appear in more than one deck (${candidates.join(', ')}); pass --deck`
        : 'no single deck contains all these ids; pass --deck',
    );
    process.exit(1);
  }
  deckPath = join(DECKS_DIR, candidates[0]);
}

const deck = JSON.parse(readFileSync(deckPath, 'utf8'));
const byId = new Map(deck.map((q) => [q.id, q]));
const REF_MARKER = /(^|\n)\s*References?\s*:?\s*\n?/i;

const errors = [];
const findings = [];

for (const [id, raw] of Object.entries(PROSE)) {
  const q = byId.get(id);
  if (!q) {
    errors.push(`${id}: not in ${deckPath}`);
    continue;
  }

  // The app has no markdown pass; asterisks would render literally.
  const body = String(raw).trim().replace(/\n{2,}/g, '\n').replace(/\*([^*\n]+)\*/g, '$1');

  if (body === q.explanation.split(REF_MARKER)[0].trim()) {
    errors.push(`${id}: identical to the current explanation — stale batch`);
    continue;
  }

  const keys = new Set(q.correct.split(',').map((s) => s.trim()));
  const missing = ['A', 'B', 'C', 'D', 'E']
    .filter((L) => (q['option' + L] || '').trim() && !keys.has(L))
    .filter((L) => !new RegExp(`Option ${L}[ (]`).test(body));
  if (missing.length) {
    errors.push(
      `${id}: no discard line for option(s) ${missing.join(', ')} — ` +
        `every non-keyed option needs one, including any already covered in the prose above`,
    );
    continue;
  }

  const distractors = ['A', 'B', 'C', 'D', 'E'].filter(
    (L) => (q['option' + L] || '').trim() && !keys.has(L),
  ).length;
  if (distractors === 1 && /Why the other options are wrong/.test(body)) {
    errors.push(`${id}: one distractor — use the singular "Why the other option is wrong:"`);
    continue;
  }

  const m = q.explanation.match(REF_MARKER);
  const refs = m
    ? q.explanation
        .slice(m.index + m[0].length)
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.startsWith('https://'))
    : [];
  if (!refs.length) {
    errors.push(
      `${id}: no existing reference to carry forward. apply-findings.mjs requires one on ` +
        `any touched question — run factcheck-deck on this deck first`,
    );
    continue;
  }

  findings.push({ id, verdict: 'clarified', explanation: body, references: refs });
}

if (errors.length) {
  console.error(`\nRefusing to build findings for ${ids.length} question(s):\n`);
  errors.forEach((e) => console.error('  - ' + e));
  console.error('');
  process.exit(1);
}

writeFileSync(
  outPath,
  JSON.stringify(
    { deck: deckPath.replace(/\\/g, '/'), reviewed: new Date().toISOString().slice(0, 10), findings },
    null,
    2,
  ),
);

const lines = findings.reduce(
  (n, f) => n + (f.explanation.match(/^Option [A-E][ (]/gm) || []).length,
  0,
);
console.log(
  `wrote ${findings.length} finding(s) with ${lines} discard line(s) to ${outPath}\n` +
    `every non-keyed option has a line; verdict is 'clarified', so no correction notice fires.\n` +
    `next: node .claude/skills/factcheck-deck/scripts/apply-findings.mjs ${outPath}`,
);
