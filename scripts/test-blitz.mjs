/**
 * Regression tests for src/lib/blitz.ts — the scoring and the speech script for
 * Blitz mode. Run after touching any of it:
 *
 *   npm run test:blitz
 *
 * Two things here are worth pinning rather than eyeballing. The score curve is
 * the whole feel of the mode, and it is easy to change by a factor of two while
 * still "looking right" in a single run. And the speech script is what the
 * narrator actually says: a bug there is only audible, so nothing else in the
 * repo would catch it.
 *
 * The sweep at the end reads every real deck and reports how much of it the
 * voice can carry. If a richtext rule change makes the code detector fire more
 * widely, the "code shown on screen" count jumps here — the same early warning
 * `test:richtext` gives, from the listener's side.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const esbuild = (
  await import(pathToFileURL(path.join(ROOT, 'node_modules/esbuild/lib/main.js')).href)
).default;

// Bundled rather than transformed in isolation: blitz.ts leans on richtext.ts
// for code detection, and `tsconfig` is what teaches esbuild the `@/` alias.
const built = await esbuild.build({
  entryPoints: [path.join(ROOT, 'src/lib/blitz.ts')],
  bundle: true,
  format: 'esm',
  write: false,
  tsconfig: path.join(ROOT, 'tsconfig.json'),
  logLevel: 'silent',
});
const js = built.outputFiles[0].text;
const {
  BLITZ_BASE_POINTS,
  CODE_SPOKEN_PLACEHOLDER,
  MAX_STREAK_STEPS,
  STREAK_BONUS_STEP,
  VISUAL_BONUS_SECONDS,
  MAX_UTTERANCE_CHARS,
  buildRunOrder,
  hasCode,
  maxPossibleScore,
  scoreAnswer,
  speakableText,
  speechScript,
  splitForSpeech,
  timeBudgetSeconds,
} = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));

let pass = 0;
let fail = 0;

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass++;
  } else {
    fail++;
    console.log(`  FAIL  ${name}`);
    console.log(`        got:      ${a}`);
    console.log(`        expected: ${e}`);
  }
}

function ok(name, condition, detail = '') {
  if (condition) pass++;
  else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

// ---------------------------------------------------------------- scoring ---
console.log('\nScoring');

check(
  'a wrong answer is worth nothing, however fast',
  scoreAnswer({ correct: false, msLeft: 30000, msTotal: 30000, streakBefore: 4 }),
  { base: 0, streakBonus: 0, points: 0 },
);

check(
  'an instant first answer is worth full base and no streak bonus',
  scoreAnswer({ correct: true, msLeft: 30000, msTotal: 30000, streakBefore: 0 }),
  { base: BLITZ_BASE_POINTS, streakBonus: 0, points: BLITZ_BASE_POINTS },
);

check(
  'answering on the last tick still earns half marks',
  scoreAnswer({ correct: true, msLeft: 0, msTotal: 30000, streakBefore: 0 }),
  { base: 500, streakBonus: 0, points: 500 },
);

check(
  'halfway through the clock is worth three quarters',
  scoreAnswer({ correct: true, msLeft: 15000, msTotal: 30000, streakBefore: 0 }),
  { base: 750, streakBonus: 0, points: 750 },
);

check(
  'the second correct answer in a row is the first to earn a bonus',
  scoreAnswer({ correct: true, msLeft: 30000, msTotal: 30000, streakBefore: 1 }).streakBonus,
  STREAK_BONUS_STEP,
);

check(
  'the streak bonus is capped',
  scoreAnswer({ correct: true, msLeft: 0, msTotal: 30000, streakBefore: 99 }).streakBonus,
  MAX_STREAK_STEPS * STREAK_BONUS_STEP,
);

// A zero budget would otherwise divide by zero and hand out NaN points.
ok(
  'a zero-length clock does not produce NaN',
  Number.isFinite(scoreAnswer({ correct: true, msLeft: 0, msTotal: 0, streakBefore: 0 }).points),
);

ok(
  'the possible ceiling grows with every question',
  maxPossibleScore(5) > maxPossibleScore(4) && maxPossibleScore(0) === 0,
);

// ------------------------------------------------------------ time budget ---
console.log('Time budget');

check('plain question gets the chosen seconds', timeBudgetSeconds(30), 30);
check(
  'a question with code gets the visual bonus',
  timeBudgetSeconds(30, { hasCode: true }),
  30 + VISUAL_BONUS_SECONDS,
);
check(
  'a question with a figure gets the same bonus, not two of them',
  timeBudgetSeconds(30, { hasCode: true, hasDiagram: true }),
  30 + VISUAL_BONUS_SECONDS,
);
check('a nonsense budget falls back rather than going negative', timeBudgetSeconds(-5), 5);

// ------------------------------------------------------------ spoken text ---
console.log('Spoken text');

check('plain prose survives intact', speakableText('Which two options apply?'), 'Which two options apply?');
check('whitespace collapses', speakableText('a\n\n  b\tc'), 'a b c');
check(
  'a fenced snippet becomes one spoken note',
  speakableText('Look at this:\n```\npublic class A {\n}\n```\nWhat happens?'),
  `Look at this: ${CODE_SPOKEN_PLACEHOLDER} What happens?`,
);
check(
  'two adjacent snippets do not stutter the note',
  speakableText('```\nSELECT Id FROM Account\n```\n```\nSELECT Id FROM Contact\n```'),
  CODE_SPOKEN_PLACEHOLDER,
);
check('an empty string stays empty', speakableText(''), '');

// ------------------------------------------------------------- utterances --
console.log('Utterance splitting');

check('short text is one utterance', splitForSpeech('Hello there.'), ['Hello there.']);
check('empty text produces nothing', splitForSpeech('   '), []);
{
  const long = 'This is a sentence about integration patterns. '.repeat(12);
  const pieces = splitForSpeech(long);
  ok('a long passage is broken up', pieces.length > 1);
  ok(
    'no piece exceeds the cap',
    pieces.every((p) => p.length <= MAX_UTTERANCE_CHARS),
    `longest ${Math.max(...pieces.map((p) => p.length))}`,
  );
  // Losing a clause to the splitter would silently change the question.
  check(
    'nothing is dropped',
    pieces.join(' ').replace(/\s+/g, ' ').trim(),
    long.replace(/\s+/g, ' ').trim(),
  );
}
{
  // One unpunctuated run longer than the cap must still come apart.
  const runOn = 'word '.repeat(120).trim();
  const pieces = splitForSpeech(runOn);
  ok(
    'a sentence with no full stop still splits at word boundaries',
    pieces.length > 1 && pieces.every((p) => p.length <= MAX_UTTERANCE_CHARS),
  );
}

// ----------------------------------------------------------- speech script --
console.log('Speech script');

const sample = {
  question: 'Which object stores the record?',
  optionA: 'Account',
  optionB: 'Contact',
  optionC: 'Lead',
  correct: 'A',
  explanation: '',
  _cat: 'Data',
};

check(
  'one chunk for the stem plus one per present option',
  speechScript(sample).map((c) => c.kind),
  ['stem', 'option', 'option', 'option'],
);
check(
  'options are announced by letter',
  speechScript(sample)
    .filter((c) => c.kind === 'option')
    .map((c) => c.text),
  ['Option A. Account', 'Option B. Contact', 'Option C. Lead'],
);
check(
  'absent options produce no chunk',
  speechScript({ ...sample, optionD: '', optionE: '   ' }).length,
  4,
);
check(
  'an option that is nothing but code still says something',
  speechScript({ ...sample, optionC: '```\nSELECT Id FROM Lead\n```' })[3].text,
  `Option C. ${CODE_SPOKEN_PLACEHOLDER}`,
);

// The 'question only' read-aloud mode. The stem still has to be complete —
// dropping the options must not drop anything else with them.
check(
  'question-only reads the stem and nothing else',
  speechScript(sample, false).map((c) => c.kind),
  ['stem'],
);
check(
  'question-only still says the whole stem',
  speechScript(sample, false).map((c) => c.text).join(' '),
  sample.question,
);
{
  const longStem = { ...sample, question: 'A sentence about integration patterns. '.repeat(20) };
  const full = speechScript(longStem, true);
  const stemOnly = speechScript(longStem, false);
  ok(
    'a long stem is still split when the options are dropped',
    stemOnly.length > 1 && stemOnly.every((c) => c.kind === 'stem'),
  );
  check(
    'the stem chunks are identical in both modes',
    stemOnly.map((c) => c.text),
    full.filter((c) => c.kind === 'stem').map((c) => c.text),
  );
}

// -------------------------------------------------------------- run order ---
console.log('Run order');

{
  const order = buildRunOrder({ source: 'set', total: 100, setStart: 40, setEnd: 60 });
  check('a set run covers exactly that set', [...order].sort((a, b) => a - b), [
    ...Array.from({ length: 20 }, (_, i) => 40 + i),
  ]);
}
{
  const order = buildRunOrder({ source: 'deck', total: 37, setStart: 0, setEnd: 10 });
  check('a deck run covers every question once', new Set(order).size, 37);
}
{
  const order = buildRunOrder({ source: 'random', total: 100, setStart: 0, setEnd: 10, size: 20 });
  ok('a random run is the requested length with no repeats', order.length === 20 && new Set(order).size === 20);
}
{
  const order = buildRunOrder({ source: 'random', total: 6, setStart: 0, setEnd: 6, size: 20 });
  check('a random run cannot exceed the deck', order.length, 6);
}
check('an empty deck yields an empty run', buildRunOrder({ source: 'deck', total: 0, setStart: 0, setEnd: 0 }), []);
{
  // A set whose bounds are stale (deck shrank) must not produce an empty run.
  const order = buildRunOrder({ source: 'set', total: 10, setStart: 40, setEnd: 60 });
  ok('out-of-range set bounds fall back to the whole deck', order.length === 10);
}

// ------------------------------------------------------------- deck sweep ---
console.log('Deck sweep');

const decksDir = path.join(ROOT, 'public/decks');
const files = fs
  .readdirSync(decksDir)
  .filter((f) => f.endsWith('.json') && !/manifest|deck-template/.test(f));

let questions = 0;
let withCode = 0;
let emptySpoken = 0;
let longestStem = 0;
let overLong = 0;

for (const file of files) {
  const deck = JSON.parse(fs.readFileSync(path.join(decksDir, file), 'utf8'));
  if (!Array.isArray(deck)) continue;
  for (const q of deck) {
    questions++;
    if (hasCode(q)) withCode++;
    const script = speechScript(q);
    if (script.length === 0 || script.some((c) => !c.text.trim())) emptySpoken++;
    if (script.some((c) => c.text.length > MAX_UTTERANCE_CHARS)) overLong++;
    const stem = script.find((c) => c.kind === 'stem');
    if (stem) longestStem = Math.max(longestStem, stem.text.length);
  }
}

ok('every question produces something to say', emptySpoken === 0, `${emptySpoken} silent`);
ok(
  'no question produces an utterance past the cap',
  overLong === 0,
  `${overLong} questions with an over-long chunk`,
);
console.log(
  `  ${questions} questions · ${withCode} carry code (spoken as a note, +${VISUAL_BONUS_SECONDS}s) · longest spoken stem ${longestStem} chars`,
);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
