/**
 * Find intra-deck duplicate questions.
 *
 *   node scripts/find-duplicates.mjs [--threshold 0.72] [--deck <file.json>]
 *
 * Cross-deck repeats are deliberate — the same item legitimately appears in more
 * than one certification — so only pairs *within* one deck are reported.
 *
 * Similarity, not equality. freecram serves the same question twice with the
 * options shuffled and OCR noise in the text (`ReplaylD` for `ReplayId`, `CRH`
 * for `CRM`), so exact matching finds almost nothing. Stems are compared by
 * Jaccard overlap of their longer tokens.
 *
 * A pair surfaces two ways. Either the stems overlap at THRESHOLD, or — added
 * 2026-08-21 — the *keyed answers* match at KEYED_MATCH while the stems still
 * overlap at STEM_FLOOR. The second path exists because OCR noise can push a
 * true twin just under the stem gate: `4f119a16` reads "lightninglayout-items
 * im one column" where its twin reads "lightning-layout-items in one column",
 * and that one mangled sentence cost it 0.02.
 *
 * The keyed-answer comparison is IDF-weighted against the deck's own keyed
 * text, so matching on "granular locking" counts and matching on "Flow Builder"
 * does not. That matters: a raw keyed-text gate with no stem floor reports 64
 * extra pairs on this repo and roughly six are real — every Salesforce deck is
 * full of distinct questions that legitimately share a short answer. The stem
 * floor is what makes the second path usable, and it is deliberately far below
 * THRESHOLD rather than absent.
 *
 * Known limit: pairs whose stems were *rewritten* rather than OCR-damaged still
 * escape. `23b3dd3a`/`b8dcc15e` in data-architect key identical text and score
 * 0.10 on stems, so no stem floor catches them without admitting the 64. Those
 * need a human reading the deck; see the Duplicates section of CLAUDE.md.
 *
 * Each pair is classified by comparing the *text of the keyed options* rather
 * than the letters, because a shuffled copy keys a different letter to the same
 * answer:
 *
 *   SAME     every keyed answer has a close counterpart — a true duplicate, and
 *            scripts/remove-questions.mjs can drop the thinner copy
 *   DIFFERS  the keys point at materially different text — one may be wrong, or
 *            they may be distinct questions. A fact-check, never a dedupe.
 *
 * The SAME/DIFFERS split is a lead, not a verdict: read both questions before
 * removing anything. Borderline scores near ANSWER_MATCH are exactly where it
 * misjudges, in both directions.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DECKS = resolve(HERE, '..', 'public/decks');

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const THRESHOLD = Number(argOf('--threshold', '0.72'));
const ONLY = argOf('--deck', null);

/** Two keyed answers count as the same claim above this overlap. */
const ANSWER_MATCH = 0.6;

/** Second entry path: keyed answers this alike, with stems at least this alike. */
const KEYED_MATCH = Number(argOf('--keyed-match', '0.6'));
const STEM_FLOOR = Number(argOf('--stem-floor', '0.6'));

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const toks = (s) => new Set(norm(s).split(' ').filter((w) => w.length > 3));
const jaccard = (a, b) => {
  let hit = 0;
  a.forEach((x) => {
    if (b.has(x)) hit++;
  });
  return hit / (a.size + b.size - hit) || 0;
};

const keyedTexts = (q) =>
  (q.correct || '')
    .split(',')
    .map((s) => s.trim())
    .map((L) => q[`option${L}`] || '')
    .filter(Boolean);

/**
 * Inverse document frequency over one deck's keyed answers. A deck where thirty
 * questions key "Flow Builder" makes those tokens nearly free; "granular" and
 * "locking", appearing twice, stay expensive.
 */
function keyedIdf(keyedTokenSets, deckSize) {
  const df = new Map();
  keyedTokenSets.forEach((set) => set.forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const idf = new Map();
  df.forEach((count, t) => idf.set(t, Math.log(deckSize / count)));
  return idf;
}

/** Jaccard over keyed-answer tokens, each token weighted by its rarity. */
function weightedJaccard(a, b, idf) {
  const fallback = Math.log(2);
  let intersection = 0;
  let union = 0;
  const seen = new Set();
  a.forEach((t) => {
    union += idf.get(t) ?? fallback;
    seen.add(t);
    if (b.has(t)) intersection += idf.get(t) ?? fallback;
  });
  b.forEach((t) => {
    if (!seen.has(t)) union += idf.get(t) ?? fallback;
  });
  return union ? intersection / union : 0;
}

/** Do both questions key the same set of claims, ignoring letter and wording? */
function keysAgree(a, b) {
  const ka = keyedTexts(a);
  const kb = keyedTexts(b);
  if (ka.length !== kb.length || ka.length === 0) return false;
  const used = new Set();
  return ka.every((x) => {
    const i = kb.findIndex((y, idx) => !used.has(idx) && jaccard(toks(x), toks(y)) >= ANSWER_MATCH);
    if (i < 0) return false;
    used.add(i);
    return true;
  });
}

/** Prefer the copy carrying more for a learner to read. */
const weight = (q) =>
  (q.question || '').length +
  (q.explanation || '').length * 2 +
  ((q.explanation || '').match(/https:\/\//g) || []).length * 400 +
  (q.corrected ? 300 : 0);

const files = readdirSync(DECKS)
  .filter((f) => f.endsWith('.json') && !/manifest|deck-template/.test(f))
  .filter((f) => !ONLY || f === ONLY);

let same = 0;
let differs = 0;

for (const file of files) {
  const deck = JSON.parse(readFileSync(join(DECKS, file), 'utf8'));
  if (!Array.isArray(deck)) continue;
  const cache = deck.map((q) => toks(q.question));
  const keyedCache = deck.map((q) => toks(keyedTexts(q).join(' ')));
  const idf = keyedIdf(keyedCache, deck.length);
  const rows = [];

  for (let i = 0; i < deck.length; i++) {
    for (let j = i + 1; j < deck.length; j++) {
      const sim = jaccard(cache[i], cache[j]);
      const keyedSim = weightedJaccard(keyedCache[i], keyedCache[j], idf);
      const viaStem = sim >= THRESHOLD;
      const viaKeyed = keyedSim >= KEYED_MATCH && sim >= STEM_FLOOR;
      if (!viaStem && !viaKeyed) continue;
      const a = deck[i];
      const b = deck[j];
      const agree = keysAgree(a, b);
      const [keep, drop] = weight(a) >= weight(b) ? [a, b] : [b, a];
      rows.push({ sim, keyedSim, viaStem, agree, keep, drop });
      if (agree) same++;
      else differs++;
    }
  }

  if (!rows.length) continue;
  console.log(`\n### ${file}  (${rows.length} pair${rows.length > 1 ? 's' : ''})`);
  rows
    .sort((x, y) => y.sim - x.sim)
    .forEach((r) => {
      const scores =
        `stem ${r.sim.toFixed(2)} keyed ${r.keyedSim.toFixed(2)}` + (r.viaStem ? '' : ' *');
      if (r.agree) {
        console.log(
          `  SAME     ${scores}  keep ${r.keep.id} (${r.keep.correct})` +
            `  drop ${r.drop.id} (${r.drop.correct})`,
        );
      } else {
        console.log(`  DIFFERS  ${scores}  ${r.keep.id} vs ${r.drop.id}`);
        console.log(`             ${r.keep.id}: ${keyedTexts(r.keep).join(' | ').slice(0, 96)}`);
        console.log(`             ${r.drop.id}: ${keyedTexts(r.drop).join(' | ').slice(0, 96)}`);
      }
    });
}

console.log(
  `\n${same + differs} intra-deck pair(s): stems at Jaccard >= ${THRESHOLD}, or keyed ` +
    `answers >= ${KEYED_MATCH} with stems >= ${STEM_FLOOR} (marked *). ` +
    `${same} keying the same answer, ${differs} keying different answers.`,
);
if (same) {
  console.log('Read both copies before removing; then scripts/remove-questions.mjs.');
}
