/**
 * Reformat question stems and option text for READABILITY ONLY.
 *
 * This exists because scraped decks arrive with the punctuation knocked out of
 * them — sentences run together ("...invest in middleware Which three
 * considerations..."), words fuse ("Salesforcewith"), and "Choose 2 answers"
 * trails off with no full stop. That is bad on screen and much worse in Blitz,
 * where `splitForSpeech` breaks the stem at SENTENCE ENDS: a stem with no
 * sentence ends is handed to the synthesiser as one 350-character run.
 *
 * The whole point of this script is the guard, not the edit. Rewriting a stem
 * by hand is a content change wearing a formatting change's clothes, and on a
 * fact-checked deck that is how a question quietly stops matching the answer
 * that was verified against it. So every edit must be MEANING-PRESERVING, and
 * that is checked mechanically rather than promised:
 *
 *   normalize(before) === normalize(after)
 *
 * where normalize() strips case, whitespace and punctuation and keeps only the
 * letters and digits in order. That permits exactly the intended class of
 * change — inserting spaces, inserting punctuation, fixing capitalisation,
 * splitting a fused word — and rejects everything else, including adding a
 * clarifying word, dropping a redundant one, fixing a typo, or reordering a
 * clause. Those are edits a human should make deliberately, not smuggle
 * through a formatting pass.
 *
 * A violation fails the WHOLE run, not just its own edit. A half-applied
 * formatting pass is harder to reason about than one that did nothing.
 *
 * Ids are frozen (see add-question-ids.mjs), so editing a stem or an option
 * does not orphan in-app comments. Nothing here touches `correct`, and this
 * script deliberately cannot: changing an answer goes through
 * .claude/skills/factcheck-deck/scripts/apply-findings.mjs, which enforces the
 * "a changed key must ship a rewritten explanation" invariant that this script
 * knows nothing about.
 *
 *   node scripts/reformat-stems.mjs <edits.json> [--dry]
 *
 * edits.json:
 *   {
 *     "deck": "public/decks/<deck>.json",
 *     "edits": [
 *       { "id": "21e6ad5a", "question": "...", "optionB": "..." }
 *     ]
 *   }
 *
 * Any of `question`, `optionA`..`optionE` may appear on an edit. Omitted
 * fields are left alone. The deck's existing indentation and line endings are
 * preserved, so the diff shows the lines you actually changed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const file = args.find((a) => !a.startsWith('--'));

if (!file) {
  console.error('usage: node scripts/reformat-stems.mjs <edits.json> [--dry]');
  process.exit(2);
}

const EDITABLE = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'optionE'];

/**
 * Letters and digits only. Two strings that normalize the same say the same
 * words in the same order, and differ only in spacing, punctuation and case.
 */
function normalize(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/** Describe what actually changed, so a reviewer can scan the run. */
function describe(before, after) {
  const bits = [];
  const punct = (s) => (s.match(/[.,;:?!'"()—–-]/g) || []).length;
  const dp = punct(after) - punct(before);
  if (dp > 0) bits.push(`+${dp} punctuation`);
  else if (dp < 0) bits.push(`${dp} punctuation`);
  const dspace = (after.split(/\s/).length - before.split(/\s/).length);
  if (dspace > 0) bits.push(`+${dspace} word break${dspace > 1 ? 's' : ''}`);
  else if (dspace < 0) bits.push(`${dspace} word breaks`);
  // Compare letters and digits with case intact: the guard has already proven
  // they match case-insensitively, so any difference here is capitalisation.
  const letters = (s) => s.replace(/[^A-Za-z0-9]+/g, '');
  if (letters(before) !== letters(after)) bits.push('case');
  return bits.length ? bits.join(', ') : 'whitespace';
}

const spec = JSON.parse(readFileSync(resolve(file), 'utf8'));
if (!spec.deck || !Array.isArray(spec.edits)) {
  console.error(`${file}: needs a "deck" path and an "edits" array`);
  process.exit(2);
}

const deckPath = resolve(spec.deck);
const rawDeck = readFileSync(deckPath, 'utf8');
const deck = JSON.parse(rawDeck);

// Preserve the file's own formatting. Decks in this repo are not consistent —
// integration is 4-space CRLF, the rest are 2-space LF — and silently
// renormalising one buries a two-line change in a whole-file diff.
const indentMatch = rawDeck.match(/\n(\s+)"?\{?/);
const indent = rawDeck.match(/\n(\s+)\{/) ? rawDeck.match(/\n(\s+)\{/)[1].length : 2;
const eol = rawDeck.includes('\r\n') ? '\r\n' : '\n';
const trailingNewline = /\n$/.test(rawDeck);

const byId = new Map(deck.map((q) => [q.id, q]));
const errors = [];
const planned = [];

spec.edits.forEach((edit, i) => {
  const where = `edits[${i}]${edit.id ? ` (${edit.id})` : ''}`;
  const q = byId.get(edit.id);
  if (!q) {
    errors.push(`${where}: no question with that id in ${spec.deck}`);
    return;
  }
  const fields = Object.keys(edit).filter((k) => k !== 'id');
  const bad = fields.filter((f) => !EDITABLE.includes(f));
  if (bad.length) {
    errors.push(
      `${where}: this script only reformats ${EDITABLE.join(', ')} — refusing ${bad.join(', ')}. ` +
        `Answer and explanation changes go through apply-findings.mjs.`,
    );
    return;
  }
  if (!fields.length) {
    errors.push(`${where}: no fields to change`);
    return;
  }

  fields.forEach((f) => {
    const before = q[f] ?? '';
    const after = edit[f];
    if (typeof after !== 'string') {
      errors.push(`${where}.${f}: must be a string`);
      return;
    }
    if (before === after) {
      errors.push(`${where}.${f}: identical to what is already in the deck — stale edit`);
      return;
    }
    if (normalize(before) !== normalize(after)) {
      // Show the first divergence, which is almost always the real mistake.
      const nb = normalize(before);
      const na = normalize(after);
      let k = 0;
      while (k < nb.length && k < na.length && nb[k] === na[k]) k++;
      errors.push(
        `${where}.${f}: NOT a formatting-only change — the words differ.\n` +
          `      diverges at char ${k}: deck has "...${nb.slice(k, k + 40)}"\n` +
          `                             edit has "...${na.slice(k, k + 40)}"`,
      );
      return;
    }
    planned.push({ q, field: f, before, after });
  });
});

if (errors.length) {
  console.error(`\nRefusing to apply ${spec.edits.length} edit(s):\n`);
  errors.forEach((e) => console.error('  - ' + e));
  console.error(
    '\nNo changes were written. This script only adds punctuation, spacing and\n' +
      'capitalisation; it will not let a formatting pass alter what a question says.\n',
  );
  process.exit(1);
}

planned.forEach(({ q, field, before, after }) => {
  console.log(`${q.id}  ${field.padEnd(9)} ${describe(before, after)}`);
  if (!DRY) q[field] = after;
});

if (!DRY) {
  let out = JSON.stringify(deck, null, indent);
  if (eol === '\r\n') out = out.replace(/\n/g, '\r\n');
  writeFileSync(deckPath, out + (trailingNewline ? eol : ''));
}

const touched = new Set(planned.map((p) => p.q.id)).size;
console.log(
  `\n${DRY ? '[dry run] ' : ''}${planned.length} field(s) reformatted across ${touched} question(s) ` +
    `in ${spec.deck}.\nEvery edit verified meaning-preserving: same words, same order.`,
);
