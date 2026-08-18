/**
 * Apply a fact-check findings file to a deck.
 *
 * This exists so the invariants are enforced by a machine instead of by memory
 * at the end of a long review. The one that matters most: a question whose ANSWER
 * changes must also ship a rewritten explanation. Skipping that leaves the deck
 * showing a new key above prose still arguing for the old one, which reads as
 * authoritative and is worse than the original mistake.
 *
 *   node .claude/skills/factcheck-deck/scripts/apply-findings.mjs findings.json [--dry]
 *
 * findings.json:
 * {
 *   "deck": "public/decks/<deck>.json",
 *   "reviewed": "2026-08-08",
 *   "findings": [
 *     { "id": "c19a756b", "verdict": "confirmed",
 *       "references": ["https://..."] },
 *
 *     { "id": "7a1c0d94", "verdict": "clarified",
 *       "explanation": "...", "references": ["https://..."] },
 *
 *     { "id": "b054672a", "verdict": "reasoning",
 *       "explanation": "...", "references": ["https://..."],
 *       "note": "answer stands; the explanation taught a limit that does not exist" },
 *
 *     { "id": "9f21ab03", "verdict": "corrected",
 *       "was": "A", "correct": "C,D",
 *       "explanation": "...", "references": ["https://..."],
 *       "note": "what the documentation established" }
 *   ]
 * }
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..', '..', '..');

const libPath = join(REPO, 'scripts', 'lib', 'corrections.mjs');
if (!existsSync(libPath)) {
  console.error(`Cannot find ${libPath}. Run this from the cert-quiz repo.`);
  process.exit(1);
}
const { stampCorrection } = await import(`file://${libPath.replace(/\\/g, '/')}`);

const findingsPath = process.argv[2];
const DRY = process.argv.includes('--dry');
/**
 * Fail unless every question in the deck has a verdict. Use this on the final
 * batch: the goal of a full pass is that each explanation ends up carrying the
 * documentation that settles it, and a question with no finding silently has no
 * citation. Omit it while batches are still in flight.
 */
const REQUIRE_COMPLETE = process.argv.includes('--require-complete');
if (!findingsPath) {
  console.error('usage: node apply-findings.mjs <findings.json> [--dry] [--require-complete]');
  process.exit(1);
}

const spec = JSON.parse(readFileSync(findingsPath, 'utf8'));
const deckPath = resolve(REPO, spec.deck);
const raw = readFileSync(deckPath, 'utf8');
const deck = JSON.parse(raw);
const byId = new Map(deck.map((q) => [q.id, q]));

const reviewed = spec.reviewed;
if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewed ?? '')) {
  console.error('findings.reviewed must be an ISO date (YYYY-MM-DD) — it is stamped onto each correction.');
  process.exit(1);
}

/**
 * `corrected` and `reasoning` stamp a visible notice onto the question;
 * `clarified` and `confirmed` do not.
 *
 * The notice is a warning a learner meets mid-study, so it has to mean something
 * changed that bears on the answer: the key moved, the item is defective, or the
 * old explanation taught something false. A cleaner rewrite of prose that was
 * merely thin is invisible work — `clarified` improves the explanation and says
 * nothing, so the notices that remain keep their weight.
 */
const VERDICTS = new Set(['confirmed', 'clarified', 'reasoning', 'corrected']);
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** Split an explanation into prose and its existing reference list. */
function splitExplanation(text) {
  const m = (text ?? '').match(/(^|\n)\s*References?\s*:?\s*\n?/i);
  if (!m || m.index === undefined) return { body: (text ?? '').trim(), refs: [] };
  return {
    body: text.slice(0, m.index).trim(),
    refs: text
      .slice(m.index + m[0].length)
      .trim()
      .split(/\n+/)
      .map((l) => l.replace(/^[\s•\-*]+/, '').trim())
      .filter(Boolean),
  };
}

const errors = [];
const planned = [];

for (const [i, f] of (spec.findings ?? []).entries()) {
  const where = `findings[${i}]${f.id ? ` id=${f.id}` : ''}`;
  const q = byId.get(f.id);

  if (!q) { errors.push(`${where}: id not found in ${spec.deck}`); continue; }
  if (!VERDICTS.has(f.verdict)) {
    errors.push(`${where}: verdict must be one of ${[...VERDICTS].join(', ')}`);
    continue;
  }

  const refs = (f.references ?? []).filter((r) => /^https:\/\/\S+$/.test(r));
  if (!refs.length) {
    // The whole point of the pass is that a verdict is backed by something
    // checkable. A verdict with no citation is an opinion.
    errors.push(`${where}: needs at least one https reference`);
    continue;
  }

  if (f.verdict === 'corrected') {
    if (!f.correct) { errors.push(`${where}: 'corrected' needs a new 'correct' key`); continue; }
    if (f.was && f.was !== q.correct) {
      errors.push(`${where}: 'was' is ${f.was} but the deck currently has ${q.correct} — findings are stale`);
      continue;
    }
    if (f.correct === q.correct) {
      errors.push(`${where}: verdict 'corrected' but the key is unchanged (${q.correct}); use 'reasoning' or 'confirmed'`);
      continue;
    }
    const letters = f.correct.split(',').map((c) => c.trim().toUpperCase());
    for (const c of letters) {
      if (!LETTERS.includes(c) || !(q[`option${c}`] ?? '').trim()) {
        errors.push(`${where}: new key names option ${c}, which is empty or invalid`);
      }
    }
    if (!f.explanation?.trim()) {
      errors.push(
        `${where}: changing the answer requires a rewritten explanation — the existing one argues for the old key`,
      );
    }
    if (!f.note?.trim()) errors.push(`${where}: 'corrected' needs a note saying what the documentation established`);
  }

  if (f.verdict === 'reasoning') {
    if (!f.explanation?.trim()) errors.push(`${where}: verdict 'reasoning' needs a replacement explanation`);
    if (!f.note?.trim()) {
      errors.push(
        `${where}: verdict 'reasoning' needs a note naming the false claim or the item defect — ` +
          `if the old explanation was merely thin, the verdict is 'clarified'`,
      );
    }
  }

  if (f.verdict === 'clarified') {
    if (!f.explanation?.trim()) errors.push(`${where}: verdict 'clarified' needs a replacement explanation`);
    if (f.note?.trim()) {
      errors.push(
        `${where}: verdict 'clarified' raises no notice, so its note would be discarded — ` +
          `use 'reasoning' if the old explanation was actually wrong, or drop the note`,
      );
    }
  }

  planned.push({ f, q, refs });
}

if (REQUIRE_COMPLETE) {
  const covered = new Set(planned.map((p) => p.q.id));
  const missing = deck.filter((q) => !covered.has(q.id));
  if (missing.length) {
    errors.push(
      `--require-complete: ${missing.length} question(s) have no verdict, so they would end up ` +
        `with no citation: ${missing.slice(0, 8).map((q) => q.id).join(', ')}` +
        (missing.length > 8 ? ` … and ${missing.length - 8} more` : ''),
    );
  }
}

if (errors.length) {
  console.error(`Refusing to apply — ${errors.length} problem(s):\n`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

const counts = { confirmed: 0, clarified: 0, reasoning: 0, corrected: 0 };
let refsAdded = 0;

for (const { f, q, refs } of planned) {
  // References already on the question must survive a rewritten explanation. Split
  // BOTH the incoming prose and the question's current explanation: a finding that
  // supplies `explanation` carries no References block of its own, so reading refs
  // only out of the incoming text silently dropped every citation the question
  // already had. This script must only ever add references — use replace-refs.mjs
  // to remove one.
  const incoming = splitExplanation(f.explanation ?? q.explanation);
  const onQuestion = splitExplanation(q.explanation);
  const kept = [...new Set([...onQuestion.refs, ...incoming.refs])];
  const merged = [...new Set([...kept, ...refs])];
  refsAdded += merged.length - kept.length;

  q.explanation = merged.length ? `${incoming.body}\nReferences:\n${merged.join('\n')}` : incoming.body;

  if (f.verdict === 'corrected') {
    const from = q.correct;
    q.correct = f.correct;
    stampCorrection(q, { via: 'validation', note: f.note, from, date: reviewed });
    console.log(`${q.id}  ${from} -> ${q.correct}  ${f.note.slice(0, 84)}`);
  } else if (f.verdict === 'reasoning') {
    stampCorrection(q, { via: 'validation', note: f.note, date: reviewed });
    console.log(`${q.id}  ${q.correct} (unchanged)  explanation was wrong — flagged`);
  } else if (f.verdict === 'clarified') {
    console.log(`${q.id}  ${q.correct} (unchanged)  explanation improved — silent`);
  }
  counts[f.verdict]++;
}

if (!DRY) {
  let out = JSON.stringify(deck, null, 2) + '\n';
  if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(deckPath, out, 'utf8');
}

console.log(
  `\n${DRY ? '[dry run] ' : ''}${planned.length} of ${deck.length} question(s) touched — ` +
    `${counts.corrected} answer(s) corrected, ${counts.reasoning} flagged reasoning fix(es), ` +
    `${counts.clarified} silent clarification(s), ${counts.confirmed} confirmed. ` +
    `${refsAdded} reference(s) added.`,
);

// Coverage across the WHOLE deck, not just this batch — the point of the pass is
// that every explanation ends up carrying the doc that settles it, and that is
// only visible deck-wide.
const cited = deck.filter((q) => /(^|\n)\s*References?\s*:/i.test(q.explanation ?? '')).length;
const uncited = deck.length - cited;
console.log(`Deck coverage: ${cited}/${deck.length} question(s) carry at least one reference.`);

if (uncited > 0) {
  const ids = deck
    .filter((q) => !/(^|\n)\s*References?\s*:/i.test(q.explanation ?? ''))
    .slice(0, 10)
    .map((q) => q.id);
  console.log(`  ${uncited} still uncited: ${ids.join(', ')}${uncited > 10 ? ` … and ${uncited - 10} more` : ''}`);
  console.log('  Re-run the final batch with --require-complete once every question has a verdict.');
}
