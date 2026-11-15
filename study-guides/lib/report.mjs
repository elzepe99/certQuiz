/**
 * The report every `reclassify-*.mjs` prints when run directly: how the deck's
 * questions fall across the exam's domains, next to the exam's own weights.
 *
 * Each reclassify file holds one deck's data (CALLS, EXAM, NAMES, ...) and ends
 * with a short `if (isMain(import.meta.url)) runReport({...})`. Run from the
 * repo root, e.g. `node study-guides/reclassify-admin.mjs`.
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

/** True when the calling module is the script node was started with. */
export function isMain(metaUrl) {
  return Boolean(process.argv[1]) && metaUrl === pathToFileURL(process.argv[1]).href;
}

export function loadDeck(deckFile) {
  return JSON.parse(fs.readFileSync(`public/decks/${deckFile}`, 'utf8'));
}

/**
 * Say out loud when an import has left questions unclassified, or a removal has
 * left calls pointing at ids the deck no longer holds. `extra` adds further
 * named id lists to the same line (Slack's `untiered`).
 */
export function checkCalls(deck, CALLS, extra = {}) {
  const ids = new Set(deck.map((q) => q.id));
  const missing = deck.filter((q) => !(q.id in CALLS)).map((q) => q.id);
  const stale = Object.keys(CALLS).filter((id) => !ids.has(id));
  const extras = Object.entries(extra);
  if (missing.length || stale.length || extras.some(([, list]) => list.length)) {
    console.log(
      'unclassified:', missing, 'stale:', stale,
      ...extras.flatMap(([label, list]) => [`${label}:`, list]),
    );
  }
}

/**
 * @param {object}   o
 * @param {string}   o.deckFile     file name under public/decks/
 * @param {object}   o.CALLS        question id -> domain code
 * @param {object}   o.EXAM         domain code -> exam weight in percent
 * @param {object}   o.NAMES        domain code -> display name
 * @param {number}   o.pad          width of the name column
 * @param {string}  [o.examLabel]   e.g. "60 scored questions"; omitted from the header when absent
 * @param {number}  [o.examQuestions=60]  scored questions, for the "~N Qs" column
 * @param {(deck: object[]) => object} [o.extraChecks]  further id lists for the unclassified line
 * @param {(deck: object[]) => (code: string) => string} [o.rowSuffix]  extra text per row
 * @param {string[]} [o.footer]     lines printed after the table
 */
export function runReport({
  deckFile, CALLS, EXAM, NAMES, pad,
  examLabel, examQuestions = 60, extraChecks, rowSuffix, footer = [],
}) {
  const deck = loadDeck(deckFile);
  checkCalls(deck, CALLS, extraChecks ? extraChecks(deck) : {});

  const n = deck.length;
  const counts = {};
  for (const q of deck) counts[CALLS[q.id]] = (counts[CALLS[q.id]] || 0) + 1;
  const suffix = rowSuffix ? rowSuffix(deck) : () => '';

  console.log(`deck ${n} questions${examLabel ? `  |  exam ${examLabel}` : ''}`);
  for (const d of Object.keys(EXAM)) {
    const c = counts[d] || 0;
    console.log(
      `${NAMES[d].padEnd(pad)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round((EXAM[d] * examQuestions) / 100).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${((100 * c) / n).toFixed(1).padStart(5)}%${suffix(d)}`,
    );
  }
  for (const line of footer) console.log(line);
}
