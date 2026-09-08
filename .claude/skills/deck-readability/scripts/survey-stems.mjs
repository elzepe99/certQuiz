/**
 * Survey a deck's stems for the formatting damage a scrape leaves behind.
 *
 *   node .claude/skills/deck-readability/scripts/survey-stems.mjs <deck.json>
 *
 * Everything here is a LEAD, not a worklist. Two of the five checks over-fire
 * badly and are reported that way on purpose — a survey that hid its false
 * positives would send you editing stems that are already fine:
 *
 *   - "fused word" is really "unusually long token", and most long tokens are
 *     ordinary English (`considerations`, `recommendations`). The genuine joins
 *     are picked out by eye from the distinct-token list this prints.
 *   - "missing sentence break" fires on "to the Northern Trail Outfitters",
 *     because it cannot tell a company name from the start of a new sentence.
 *
 * The over-long-sentence check is the one that matters for Blitz: splitForSpeech
 * breaks narration at sentence ends, and hardWrap only falls back to a comma
 * once a chunk passes 60% of the 200-character cap. So a long sentence with a
 * late comma already breathes; one without does not.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MAX_UTTERANCE_CHARS = 200;
const BREATHE_AT = MAX_UTTERANCE_CHARS * 0.6;

const file = process.argv[2];
if (!file) {
  console.error('usage: node survey-stems.mjs <deck.json>');
  process.exit(2);
}

const deck = JSON.parse(readFileSync(resolve(file), 'utf8'));
const sentences = (s) => s.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [s];

const noTerminal = [];
const noSpace = [];
const doubleSpace = [];
const sentenceBreak = [];
const overLong = [];
const tokens = new Map();

for (const q of deck) {
  const s = q.question ?? '';
  if (!/[.?!]\s*$/.test(s.trim())) noTerminal.push(q.id);
  // "Force.com sites" and "salesforce.com/x" are not missing a space, so skip a
  // full stop that is really part of a domain.
  if (/[a-z][.,;:][A-Za-z]/.test(s.replace(/\.(com|org|net|io|gov|edu)\b/gi, '$1'))) noSpace.push(q.id);
  if (/ {2,}/.test(s)) doubleSpace.push(q.id);
  if (/[a-z0-9)\]]\s+(Which|What|How|Why|When|Where|Universal|Northern|The\s|An?\s)/.test(s)) {
    sentenceBreak.push(q.id);
  }
  for (const sent of sentences(s)) {
    const t = sent.trim();
    if (t.length > MAX_UTTERANCE_CHARS) {
      const breathes = [...t.matchAll(/[,;:]/g)].some((m) => m.index > BREATHE_AT);
      overLong.push({ id: q.id, len: t.length, breathes });
    }
  }
  for (const tok of s.match(/[A-Za-z][A-Za-z']{9,}/g) ?? []) {
    if (!tokens.has(tok)) tokens.set(tok, q.id);
  }
}

const line = (label, ids, note = '') =>
  console.log(`${String(ids.length).padStart(4)}  ${label}${note ? `  — ${note}` : ''}`);

console.log(`\n${file}\n${deck.length} questions\n`);
line('no terminal punctuation', noTerminal, 'reliable; usually a trailing "Choose N answers"');
line('no space after punctuation', noSpace, 'reliable');
line('double space', doubleSpace, 'reliable');
line('missing sentence break', sentenceBreak, 'OVER-FIRES on "the Northern Trail Outfitters"');
line('over-long sentence (>200 chars)', overLong);

const stuck = overLong.filter((o) => !o.breathes);
console.log(
  `${String(stuck.length).padStart(4)}  ...of those, with NO comma past ${Math.round(BREATHE_AT)} chars` +
    ` — the ones hardWrap cannot break gracefully`,
);

if (noTerminal.length) console.log(`\nno terminal punctuation:\n  ${noTerminal.join(' ')}`);
if (noSpace.length) console.log(`\nno space after punctuation:\n  ${noSpace.join(' ')}`);
if (sentenceBreak.length) console.log(`\nmissing sentence break (verify each):\n  ${sentenceBreak.join(' ')}`);
if (stuck.length) {
  console.log('\nover-long with no late comma (read these; fix only real punctuation errors):');
  for (const o of stuck) console.log(`  ${o.id}  ${o.len} chars`);
}

console.log(
  `\ndistinct tokens >=10 chars (${tokens.size}) — scan for genuine joins such as ` +
    `Salesforcewith, anddoctors, arebreaking, databaseand, orchestratedvia.\n` +
    `Most entries here are ordinary long words; there is no dictionary in this repo to filter them.\n`,
);
console.log([...tokens.keys()].sort().join(' '));
console.log(
  `\nNext: hand-write the judgment calls, generate the mechanical full stops by rule,\n` +
    `then apply with  node scripts/reformat-stems.mjs <edits.json> --dry\n`,
);
