/**
 * Structural audit of a deck, to decide where a fact-check should look first.
 *
 * This finds nothing about Salesforce. It finds places where a question
 * contradicts ITSELF, which is where wrong answers concentrate — on the
 * ADM-201 deck the "explanation argues for a different option than the key
 * names" check surfaced three wrong answers with no domain knowledge at all.
 *
 * A caution learned on that deck: the inverse is NOT a clean bill of health.
 * Five further ADM-201 answers were wrong while agreeing perfectly with their
 * own explanation, because both were generated together from the same mistake.
 * Passing this audit means "nothing self-evidently broken", not "correct".
 *
 * One caveat worth knowing before you trust the first check: it scores an
 * option's vocabulary against the OPENING of the explanation, so it gets
 * noisier as a deck improves. A thorough explanation that walks every option in
 * order to reject it looks, to this heuristic, a lot like one arguing against
 * its own key. Read the flagged questions; do not just count them.
 *
 *   node scripts/audit-deck.mjs public/decks/<deck>.json
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/audit-deck.mjs <deck.json>');
  process.exit(1);
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const questions = JSON.parse(readFileSync(file, 'utf8'));

const norm = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const STOP = new Set(
  ('the a an of to in for is are and or on with be by that this it as can when will from should ' +
   'use used which what not you your they their two three all any each other than then these those ' +
   'has have was were would could may might must into over under about across also more most only')
    .split(' '),
);
const keywords = (s) => new Set(norm(s).split(' ').filter((w) => w && !STOP.has(w)));

const answerLetters = (q) =>
  q.correct.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);

const present = (q) => LETTERS.filter((c) => (q[`option${c}`] ?? '').trim());

/** How much of an option's vocabulary shows up in the opening of the explanation. */
function optionSupport(q, headChars = 420) {
  const head = keywords((q.explanation ?? '').slice(0, headChars));
  const score = {};
  for (const c of present(q)) {
    const ok = keywords(q[`option${c}`]);
    score[c] = ok.size ? [...ok].filter((w) => head.has(w)).length / ok.size : 0;
  }
  return score;
}

const findings = { contradiction: [], count: [], emptyRef: [], dupOption: [], dupStem: [], noExpl: [] };

// ── the high-yield one: explanation favours options the key does not name ────
for (const [i, q] of questions.entries()) {
  const actual = answerLetters(q);
  const score = optionSupport(q);
  if (!Object.keys(score).length || !actual.length) continue;

  const ranked = Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, actual.length);
  const favouredFloor = Math.min(...ranked.map((c) => score[c]));
  const keyCeiling = Math.max(...actual.map((c) => score[c] ?? 0), 0);

  const sameSet = ranked.length === actual.length && ranked.every((c) => actual.includes(c));
  if (!sameSet && favouredFloor >= 0.6 && favouredFloor - keyCeiling >= 0.34) {
    findings.contradiction.push({
      n: i + 1,
      key: q.correct,
      favours: ranked.sort().join(','),
      margin: (favouredFloor - keyCeiling).toFixed(2),
      stem: q.question.slice(0, 88),
    });
  }
}

// ── "choose N" that does not match the number of marked answers ──────────────
for (const [i, q] of questions.entries()) {
  const t = q.question.toLowerCase();
  const got = answerLetters(q).length;
  let want = null;
  if (/choose (three|3)\b|which three\b|\bthree (options|answers|actions|features|tools|ways|items|steps|things)\b/.test(t)) want = 3;
  else if (/choose (two|2)\b|which two\b|\btwo (options|answers|actions|features|tools|ways|items|steps|things|changes|components|reasons|methods|objects|types|considerations|approaches|solutions|capabilities|requirements|benefits)\b/.test(t)) want = 2;
  if (want && want !== got) {
    findings.count.push({ n: i + 1, want, got, key: q.correct, stem: q.question.slice(0, 88) });
  }
}

// ── keys pointing at options that do not exist, and duplicated option text ───
for (const [i, q] of questions.entries()) {
  for (const c of answerLetters(q)) {
    if (!LETTERS.includes(c) || !(q[`option${c}`] ?? '').trim()) {
      findings.emptyRef.push({ n: i + 1, letter: c, key: q.correct, stem: q.question.slice(0, 88) });
    }
  }
  const seen = new Map();
  for (const c of present(q)) {
    const k = norm(q[`option${c}`]);
    if (!k) continue;
    if (seen.has(k)) {
      findings.dupOption.push({ n: i + 1, pair: `${seen.get(k)}/${c}`, text: q[`option${c}`].slice(0, 62) });
    } else seen.set(k, c);
  }
  if (!(q.explanation ?? '').trim()) findings.noExpl.push({ n: i + 1, stem: q.question.slice(0, 88) });
}

// ── repeated stems ───────────────────────────────────────────────────────────
const byStem = new Map();
for (const [i, q] of questions.entries()) {
  const k = norm(q.question);
  if (!byStem.has(k)) byStem.set(k, []);
  byStem.get(k).push(i + 1);
}
for (const [, ns] of byStem) if (ns.length > 1) findings.dupStem.push({ ns });

// ── report ───────────────────────────────────────────────────────────────────
console.log(`${file}\n${questions.length} questions\n`);

const section = (title, rows, fmt) => {
  console.log(`${title}: ${rows.length}`);
  for (const r of rows) console.log('   ' + fmt(r));
  if (rows.length) console.log('');
};

section('Explanation argues against its own key', findings.contradiction, (r) =>
  `#${String(r.n).padStart(3)}  key=${r.key.padEnd(6)} favours=${r.favours.padEnd(6)} (margin ${r.margin})  ${r.stem}`);
section('Answer count does not match "choose N"', findings.count, (r) =>
  `#${String(r.n).padStart(3)}  asks ${r.want}, marked ${r.got} (${r.key})  ${r.stem}`);
section('Key points at a missing option', findings.emptyRef, (r) =>
  `#${String(r.n).padStart(3)}  ${r.letter} of ${r.key}  ${r.stem}`);
section('Duplicate option text', findings.dupOption, (r) =>
  `#${String(r.n).padStart(3)}  ${r.pair}  ${r.text}`);
section('Duplicate stems', findings.dupStem, (r) => `#${r.ns.join(' / #')}`);
section('Empty explanation', findings.noExpl, (r) => `#${String(r.n).padStart(3)}  ${r.stem}`);

const total = Object.values(findings).reduce((a, b) => a + b.length, 0);
console.log(`${total} structural finding(s). These are leads, not verdicts — and a clean`);
console.log('run does not mean the answers are right, only that none contradict themselves.');
