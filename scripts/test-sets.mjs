/**
 * Regression tests for src/lib/sets.ts — the arithmetic that splits a deck into
 * study sets. Run it after touching any of it:
 *
 *   npm run test:sets
 *
 * The invariants below are what the UI actually depends on: the sets tile the
 * deck exactly (no gap, no overlap, sizes summing to the total), none exceeds
 * the chosen maximum, and no set is more than one question shorter than another
 * — that last one is what keeps a 141-question deck from ending on a set of 1.
 *
 * It also sweeps every real deck at each offered size, so a change that only
 * misbehaves at some particular length shows up here rather than in the app.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const esbuild = (
  await import(pathToFileURL(path.join(ROOT, 'node_modules/esbuild/lib/main.js')).href)
).default;
const src = fs.readFileSync(path.join(ROOT, 'src/lib/sets.ts'), 'utf8');
const js = esbuild.transformSync(src, { loader: 'ts', format: 'esm' }).code;
const {
  DEFAULT_SET_SIZE,
  SET_SIZE_OPTIONS,
  setBoundaries,
  setIndexOf,
  clampSetIndex,
  setRange,
  setInfoFor,
  applyQuestionOrder,
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

function ok(name, cond, detail = '') {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? `  — ${detail}` : ''}`);
  }
}

/** Set sizes implied by a boundary array. */
function sizes(boundaries) {
  const out = [];
  for (let i = 0; i < boundaries.length - 1; i++) out.push(boundaries[i + 1] - boundaries[i]);
  return out;
}

// ---------------------------------------------------------------- shapes

console.log('sets: the shapes the real decks produce at the default size');

// Pinned against the deck sizes in public/decks as of 2026-09-01. These are the
// splits the user signed off on; a change here is a product change, not a refactor.
check('integration 141 @40', sizes(setBoundaries(141, 40)), [36, 35, 35, 35]);
check('admin 154 @40', sizes(setBoundaries(154, 40)), [39, 39, 38, 38]);
check('databricks 147 @40', sizes(setBoundaries(147, 40)), [37, 37, 37, 36]);
check('dev-2 146 @40', sizes(setBoundaries(146, 40)), [37, 37, 36, 36]);
check('dld 137 @40', sizes(setBoundaries(137, 40)), [35, 34, 34, 34]);
check('sharing 136 @40', sizes(setBoundaries(136, 40)), [34, 34, 34, 34]);
check('data-architect 135 @40', sizes(setBoundaries(135, 40)), [34, 34, 34, 33]);
check('agentforce 121 @40', sizes(setBoundaries(121, 40)), [31, 30, 30, 30]);
check('app-builder 119 @40', sizes(setBoundaries(119, 40)), [40, 40, 39]);
check('iam 116 @40', sizes(setBoundaries(116, 40)), [39, 39, 38]);
check('data-cloud 100 @40', sizes(setBoundaries(100, 40)), [34, 33, 33]);
check('slack 37 @40 stays whole', sizes(setBoundaries(37, 40)), [37]);

// ---------------------------------------------------------------- edges

console.log('\nsets: edges');

check('empty deck', setBoundaries(0, 40), [0]);
check('one question', sizes(setBoundaries(1, 40)), [1]);
check('exactly one full set', sizes(setBoundaries(40, 40)), [40]);
check('one over a full set splits evenly', sizes(setBoundaries(41, 40)), [21, 20]);
check('size 0 means the whole deck', sizes(setBoundaries(141, 0)), [141]);
check('negative size means the whole deck', sizes(setBoundaries(141, -5)), [141]);
check('non-finite total', setBoundaries(NaN, 40), [0]);
check('non-finite size means the whole deck', sizes(setBoundaries(50, NaN)), [50]);

// ---------------------------------------------------------------- lookups

console.log('\nsets: lookups');

const b141 = setBoundaries(141, 40); // [0, 36, 71, 106, 141]
check('boundaries 141 @40', b141, [0, 36, 71, 106, 141]);
check('first question is in set 0', setIndexOf(0, b141), 0);
check('last of set 0', setIndexOf(35, b141), 0);
check('first of set 1', setIndexOf(36, b141), 1);
check('last question is in the final set', setIndexOf(140, b141), 3);
check('negative index clamps low', setIndexOf(-1, b141), 0);
check('past the end clamps high', setIndexOf(999, b141), 3);
// clampSetIndex takes a SET number; setIndexOf takes a QUESTION index. Passing
// one to the other reads plausibly and is silently wrong — `?set=2` came back as
// "set 1" during the first browser pass, because setIndexOf(2) is set 0.
check('clampSetIndex passes a valid set through', clampSetIndex(2, b141), 2);
check('clampSetIndex is not setIndexOf', setIndexOf(2, b141), 0);
check('clampSetIndex clamps high', clampSetIndex(9, b141), 3);
check('clampSetIndex clamps low', clampSetIndex(-3, b141), 0);
check('clampSetIndex of NaN', clampSetIndex(NaN, b141), 0);
check('clampSetIndex on an empty deck', clampSetIndex(2, [0]), 0);

check('range of set 1', setRange(1, b141), { start: 36, end: 71 });
check('range clamps past the end', setRange(99, b141), { start: 106, end: 141 });
check('range of an empty deck', setRange(0, [0]), { start: 0, end: 0 });

check('setInfoFor mid-deck', setInfoFor(141, 40, 80), {
  boundaries: [0, 36, 71, 106, 141],
  count: 4,
  setIdx: 2,
  start: 71,
  end: 106,
  size: 35,
});
check('setInfoFor on an empty deck still reports one set', setInfoFor(0, 40, 0), {
  boundaries: [0],
  count: 1,
  setIdx: 0,
  start: 0,
  end: 0,
  size: 0,
});

// ---------------------------------------------------------- question order

console.log('\nsets: applyQuestionOrder');

check('reorders by the given permutation', applyQuestionOrder(['a', 'b', 'c'], [2, 0, 1]), [
  'c',
  'a',
  'b',
]);
check('identity order', applyQuestionOrder(['a', 'b'], [0, 1]), ['a', 'b']);
check('wrong length is ignored', applyQuestionOrder(['a', 'b'], [0]), ['a', 'b']);
check('duplicate index is ignored', applyQuestionOrder(['a', 'b'], [0, 0]), ['a', 'b']);
check('out-of-range index is ignored', applyQuestionOrder(['a', 'b'], [0, 5]), ['a', 'b']);
check('missing order is ignored', applyQuestionOrder(['a', 'b'], undefined), ['a', 'b']);

// ------------------------------------------------------------ deck sweep

console.log('\nsets: deck sweep');

const deckDir = path.join(ROOT, 'public/decks');
const deckFiles = fs
  .readdirSync(deckDir)
  .filter((f) => f.endsWith('.json') && f !== 'manifest.json' && f !== 'deck-template.json')
  .sort();

ok('found decks to sweep', deckFiles.length > 0, `${deckFiles.length} files`);

for (const file of deckFiles) {
  const raw = JSON.parse(fs.readFileSync(path.join(deckDir, file), 'utf8'));
  const arr = Array.isArray(raw) ? raw : raw.questions;
  const total = arr.length;
  let defaultShape = '';

  for (const size of SET_SIZE_OPTIONS) {
    const boundaries = setBoundaries(total, size);
    const s = sizes(boundaries);
    const label = `${file} @${size || 'all'}`;

    ok(
      `${label}: tiles the deck`,
      boundaries[0] === 0 && boundaries[boundaries.length - 1] === total,
    );
    ok(`${label}: sizes sum to total`, s.reduce((a, b) => a + b, 0) === total);
    ok(`${label}: no empty set`, total === 0 || s.every((n) => n > 0));
    ok(`${label}: monotonic`, boundaries.every((v, i) => i === 0 || v > boundaries[i - 1]));
    if (size > 0) {
      ok(`${label}: none exceeds the max`, s.every((n) => n <= size), s.join('·'));
    }
    ok(
      `${label}: balanced within one question`,
      s.length === 0 || Math.max(...s) - Math.min(...s) <= 1,
      s.join('·'),
    );

    // Every question resolves back to the set that contains it.
    let lookupsOk = true;
    for (let i = 0; i < total; i++) {
      const n = setIndexOf(i, boundaries);
      if (i < boundaries[n] || i >= boundaries[n + 1]) {
        lookupsOk = false;
        break;
      }
    }
    ok(`${label}: every index resolves to its own set`, lookupsOk);

    if (size === DEFAULT_SET_SIZE) defaultShape = s.join(' · ');
  }

  const name = file.replace('.json', '');
  console.log(`  ${name.padEnd(42)} ${String(total).padStart(4)} q   ${defaultShape}`);
}

console.log(`\n  default set size: ${DEFAULT_SET_SIZE}`);
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
