/**
 * Regression tests for src/lib/rush.ts — the Jackpot Rush clock and slot
 * machine. Run after touching any of it:
 *
 *   npm run test:rush
 *
 * The jackpot rate is the one worth pinning: it is the whole economy of the
 * mode, and a reel change that quietly took it from 1 in 8 to 1 in 36 would
 * still "look right" in a single game.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const esbuild = (
  await import(pathToFileURL(path.join(ROOT, 'node_modules/esbuild/lib/main.js')).href)
).default;

const built = await esbuild.build({
  entryPoints: [path.join(ROOT, 'src/lib/rush.ts')],
  bundle: true,
  format: 'esm',
  write: false,
  tsconfig: path.join(ROOT, 'tsconfig.json'),
  logLevel: 'silent',
});
const {
  DIFFICULTIES,
  JACKPOT_ODDS,
  TINCHO_MULTIPLIER,
  TINCHO_SHARE,
  applyAnswer,
  applyJackpot,
  endRush,
  formatClock,
  heatFor,
  isExpired,
  remainingMs,
  spin,
  startRush,
  survivedMs,
} = await import('data:text/javascript;base64,' + Buffer.from(built.outputFiles[0].text).toString('base64'));

let pass = 0;
let fail = 0;
function check(name, cond, detail = '') {
  if (cond) pass++;
  else {
    fail++;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

// A seeded dice, so the spin tests are repeatable.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── the clock, on the original four-minute table ──
const { startMs: START_MS, correctMs: CORRECT_BONUS_MS, wrongMs: WRONG_PENALTY_MS, jackpotMs: JACKPOT_BONUS_MS } =
  DIFFICULTIES.easy;
const T0 = 1_000_000;
let s = startRush(T0, 'easy');
check('starts running', s.phase === 'running');
check('starts with four minutes', remainingMs(s, T0) === START_MS);
check('easy is four minutes', START_MS === 240_000);

s = applyAnswer(s, true, T0 + 10_000);
check('right answer adds a minute', remainingMs(s, T0 + 10_000) === START_MS - 10_000 + CORRECT_BONUS_MS);
check('right answer builds the streak', s.streak === 1 && s.correct === 1);

s = applyAnswer(s, true, T0 + 20_000);
s = applyAnswer(s, false, T0 + 30_000);
check('wrong answer costs 15s', s.endsAt === T0 + START_MS + 2 * CORRECT_BONUS_MS - WRONG_PENALTY_MS);
check('wrong answer breaks the streak', s.streak === 0 && s.bestStreak === 2 && s.wrong === 1);

s = applyJackpot(s);
check('jackpot adds a minute', s.endsAt === T0 + START_MS + 2 * CORRECT_BONUS_MS - WRONG_PENALTY_MS + JACKPOT_BONUS_MS);
check('jackpot is counted', s.jackpots === 1);

check('not expired before the deadline', !isExpired(s, s.endsAt - 1));
check('expired at the deadline', isExpired(s, s.endsAt));

const late = applyAnswer(s, true, s.endsAt + 5);
check('an answer after the deadline scores nothing', late === s);

// A wrong answer that takes the clock through zero ends the run there.
let close = startRush(T0, 'easy');
const nearEnd = close.endsAt - 5_000;
close = applyAnswer(close, false, nearEnd);
check('penalty through zero ends the run', close.phase === 'over' && close.finalMs === 0);
check('ended run records when it ended', survivedMs(close, nearEnd + 99_999) === nearEnd - T0);

const over = endRush(startRush(T0, 'easy'), T0 + 60_000);
check('cashing out freezes the clock', remainingMs(over, T0 + 999_999) === START_MS - 60_000);
check('survival is time played', survivedMs(over, T0 + 999_999) === 60_000);
check('ending twice is a no-op', endRush(over, T0 + 70_000) === over);

// ── difficulty ──
check('normal is two minutes', remainingMs(startRush(T0, 'normal'), T0) === 120_000);
check('hard is one minute', remainingMs(startRush(T0, 'hard'), T0) === 60_000);
check('harder pays less per right answer',
  DIFFICULTIES.easy.correctMs > DIFFICULTIES.normal.correctMs && DIFFICULTIES.normal.correctMs > DIFFICULTIES.hard.correctMs);
const hard = applyAnswer(startRush(T0, 'hard'), true, T0);
check('hard right answer uses the hard table', hard.endsAt === T0 + 60_000 + DIFFICULTIES.hard.correctMs);
check("jackpot uses the run's table", applyJackpot(hard).endsAt === hard.endsAt + DIFFICULTIES.hard.jackpotMs);
check('idle clock shows the chosen start', remainingMs({ ...startRush(T0, 'hard'), phase: 'idle' }, T0) === 60_000);

// ── the slot machine ──
const rand = mulberry32(42);
const N = 40_000;
let wins = 0;
let tinchos = 0;
let tinchoOnReels = 0;
let falseWins = 0;
let pairs = 0;
for (let i = 0; i < N; i++) {
  const spun = spin(rand);
  const { reels, jackpot } = spun;
  const triple = reels[0] === reels[1] && reels[1] === reels[2];
  if (jackpot) wins++;
  if (spun.tincho) tinchos++;
  if (spun.tincho !== (triple && reels[0] === 'tincho')) falseWins++;
  if (!jackpot && reels.includes('tincho')) tinchoOnReels++;
  if (triple !== jackpot) falseWins++;
  if (!triple && (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2])) pairs++;
}
const rate = wins / N;
check('jackpot rate is about 1 in 8', Math.abs(rate - JACKPOT_ODDS) < 0.01, `got ${rate.toFixed(4)}`);
check('jackpot flag matches the reels', falseWins === 0, `${falseWins} mismatches`);
const tinchoRate = tinchos / N;
check('Tincho jackpot is about 1 in 48', Math.abs(tinchoRate - JACKPOT_ODDS * TINCHO_SHARE) < 0.005, `got ${tinchoRate.toFixed(4)}`);
check('Tincho shows up on losing spins too', tinchoOnReels / N > 0.2);
check('near misses happen', pairs / N > 0.3, `pairs ${(pairs / N).toFixed(3)}`);

const run = startRush(T0, 'normal');
check('Tincho jackpot pays double', applyJackpot(run, true).endsAt === run.endsAt + DIFFICULTIES.normal.jackpotMs * TINCHO_MULTIPLIER);
check('Tincho jackpot is counted twice over', applyJackpot(run, true).tinchos === 1 && applyJackpot(run, true).jackpots === 1);
check('a plain jackpot is not a Tincho', applyJackpot(run).tinchos === 0);

// ── heat and formatting ──
check('heat thresholds', [0, 2, 3, 4, 5, 7, 8, 20].map(heatFor).join() === '0,0,1,1,2,2,3,3');
check('clock format', formatClock(240_000) === '4:00' && formatClock(61_000) === '1:01');
check('clock rounds up', formatClock(100) === '0:01' && formatClock(0) === '0:00');

console.log(`\n${pass} passed, ${fail} failed`);
console.log(`Tincho jackpot rate: ${(tinchoRate * 100).toFixed(2)}% (target ${(JACKPOT_ODDS * TINCHO_SHARE * 100).toFixed(2)}%)`);
console.log(`Jackpot rate over ${N} seeded spins: ${(rate * 100).toFixed(2)}% (target ${(JACKPOT_ODDS * 100).toFixed(1)}%)`);
process.exit(fail ? 1 : 0);
