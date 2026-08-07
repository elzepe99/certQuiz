/**
 * Merge the two ADM-201 Freecram scrapes into one deck.
 *
 * The dumps (v2026-06-19 q72 and v2026-03-19 q103) are snapshots of the same exam
 * taken three months apart, so they overlap — but almost nothing matches exactly,
 * and three separate things had to be handled before the overlap became visible.
 *
 * 1. OPTION SHUFFLE. The same item appears with its options in a different order,
 *    so `correct` is a different letter in each dump. Answers are therefore
 *    compared as option TEXT, never as letters.
 *
 * 2. STEM REWORDING. Between snapshots Salesforce renamed the role, so June says
 *    "a Platform Administrator" where March says "an administrator", and March
 *    appends "Choose 2 answers" where June folds the count into the sentence.
 *    Raw stem similarity scored real twins as low as 0.62 — below obvious
 *    non-matches. Normalizing that boilerplate away first, and scoring on the
 *    better of (stem overlap, option-set overlap), separates cleanly: all 17 true
 *    pairs land at >=0.739, the best false pair at 0.667. Hence THRESHOLD 0.70.
 *
 * 3. SOURCE CORRUPTION. Five June stems and two June options end in a bare
 *    integer glued to the final punctuation ("...for the sales reps?31"). That
 *    digit sits inside freecram's own question <div> with no separator, so it is
 *    bad data at the source rather than a parse error, and it is stripped here.
 *
 * Twins that agree collapse to the June copy: it is the newer snapshot and uses
 * current exam terminology, where March carries scanning damage ("manual shared",
 * "ascreen flow", "rehired in V administrator"). March wins only when it offers
 * strictly more options, since truncation is the costlier defect.
 *
 * Twins that DISAGREE on the answer are real editorial conflicts. Two exist and
 * both are resolved explicitly in RESOLUTIONS below, with reasoning. Any new
 * conflict is kept in full and reported rather than silently decided.
 *
 *   node scripts/merge-adm201.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = [
  { path: join(ROOT, 'freecram-scraper', 'questions_adm201.json'), tag: 'jun' },
  { path: join(ROOT, 'freecram-scraper', 'questions_adm201_mar.json'), tag: 'mar' },
];
const OUT = join(ROOT, 'freecram-scraper', 'questions_adm201_merged.json');
const DRY = process.argv.includes('--dry');

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
/** Character-bigram overlap at which two answer texts count as the same wording. */
const ANSWER_MATCH = 0.85;

/**
 * Hand-resolved answer conflicts, keyed by the losing row.
 * Each entry records why the survivor is right — these are judgement calls, not
 * anything the merge could have derived.
 */
const RESOLUTIONS = {
  'mar#88':
    'Auto Number -> Text: Salesforce permits the conversion and retains existing values, ' +
    'so June\'s "values will remain unchanged" is correct and March\'s "is prevented" is wrong.',
  'mar#7':
    'Missed key fields + no backward stage moves: June\'s Opportunity Path is the real answer, ' +
    'because guided selling is configured inside Path rather than being a separate toggle. ' +
    'Both dumps already agree on the other two (required on page layout, validation rules).',
  'mar#72':
    'Consistent category values across Accounts and Cases: sharing one value set across two ' +
    'objects is exactly what a Global Picklist does, so mar#48\'s "dependent + global" holds. ' +
    'This row also argues against itself — it answers A,D while its explanation closes by ' +
    'explaining "why A and B are the correct answers".',
  'mar#100':
    'Expense reports out to an external HR system: Outbound Message is the tool that actually ' +
    'sends data to an external endpoint, so June\'s "outbound message + approval process" holds. ' +
    'A Quick Action only creates a record locally and sends nothing outward, and this row\'s own ' +
    'explanation asserts otherwise. Both dumps already agree on the approval process.',
};

/** Trailing bare integer fused to the closing punctuation — freecram's own junk. */
const ARTIFACT = /([?."!])\d{1,3}\s*$/;

/**
 * Citation markers left in the AI-written explanations, fused to the last word of
 * a sentence ("...left unchecked by default35."). Requiring the digits to be glued
 * to a letter AND followed by a sentence break is what keeps real numbers safe:
 * the same text contains "forecasting3_overview" and "na35.salesforce.com" inside
 * reference URLs, and both survive because neither is followed by a sentence end.
 */
const CITATION = /([a-z")])(\d{1,3})(?=\.(?:\s|$)|\s*$)/g;

const repairs = [];

function stripTrailingArtifact(s, ref, field) {
  const v = (s ?? '').trim();
  if (!ARTIFACT.test(v)) return v;
  const fixed = v.replace(ARTIFACT, '$1');
  repairs.push(`${ref} ${field}: ...${v.slice(-42)}  ->  ...${fixed.slice(-36)}`);
  return fixed;
}

function stripCitations(s, ref) {
  let hits = 0;
  const fixed = (s ?? '').replace(CITATION, (_m, ch) => {
    hits++;
    return ch;
  });
  if (hits) repairs.push(`${ref} explanation: removed ${hits} citation marker(s)`);
  return fixed;
}

function cleanRow(q, ref) {
  const out = { ...q, question: stripTrailingArtifact(q.question, ref, 'stem') };
  for (const c of LETTERS) {
    out[`option${c}`] = stripTrailingArtifact(q[`option${c}`], ref, `option${c}`);
  }
  out.explanation = stripCitations(q.explanation, ref);
  return out;
}

/** Strip the wording that changed between snapshots but carries no meaning. */
function canon(s) {
  let t = (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  t = t.replace(/platform administrator/g, 'administrator');
  t = t.replace(/\b(an|a|the) administrator\b/g, 'administrator');
  t = t.replace(/choose (two|three|2|3) answers?/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

const words = (s) => new Set(canon(s).split(' ').filter(Boolean));
const jaccard = (a, b) => {
  const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  let hit = 0;
  for (const v of a) if (b.has(v)) hit++;
  return hit / union.size;
};

const optionWords = (q) => words(LETTERS.map((c) => q[`option${c}`] ?? '').join(' '));

/**
 * Same item?
 *
 * A strong stem match settles it on its own. Option overlap alone must NOT,
 * because Salesforce items are built from a small shared vocabulary: "change the
 * owner of a case after 7 days" and "order of execution when a Case is saved"
 * are different questions whose four options are both drawn from
 * assignment/auto-response/workflow/escalation rules, and they scored 0.750 on
 * options while sharing only 0.156 of their stems.
 *
 * So option overlap is corroborating evidence, admissible only when the stems are
 * at least loosely related. That floor still catches the one badly reworded twin
 * ("Dream house realty ... Choose 2 options" vs "DreamHouse Reality ... Which two
 * features", stem 0.378) without readmitting the false pair.
 */
const STEM_ALONE = 0.7;
const OPTS_STRONG = 0.85;
const STEM_FLOOR = 0.3;

function isSameItem(a, b) {
  const stem = jaccard(words(a.question), words(b.question));
  if (stem >= STEM_ALONE) return true;
  return stem >= STEM_FLOOR && jaccard(optionWords(a), optionWords(b)) >= OPTS_STRONG;
}

/** The correct options as text, so a shuffled twin stays comparable. */
const answerTexts = (q) =>
  q.correct
    .split(',')
    .map((c) => canon(q[`option${c.trim().toUpperCase()}`] ?? ''))
    .filter(Boolean);

/**
 * Character bigrams of the space-stripped text.
 *
 * Word-level overlap is too brittle for the defects March actually has: it scores
 * "manually shared" vs "manual shared" at 0.75 and "reassign the case" vs
 * "re assign the case" at 0.40, both of which are the same answer. Dropping
 * spaces makes a split word identical to its joined form, and bigrams absorb the
 * leftover suffix, while genuinely different answers ("global picklist" vs
 * "custom picklist") still score ~0.39 and stay flagged.
 */
function bigrams(s) {
  const t = s.replace(/\s+/g, '');
  const g = new Set();
  for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2));
  return g;
}

/** Answer sets match if each text finds a near-twin — tolerates March's typos. */
function sameAnswer(a, b) {
  const [x, y] = [answerTexts(a), answerTexts(b)];
  if (!x.length || x.length !== y.length) return false;
  const spare = [...y];
  for (const t of x) {
    const bt = bigrams(t);
    const i = spare.findIndex((u) => jaccard(bt, bigrams(u)) >= ANSWER_MATCH);
    if (i === -1) return false;
    spare.splice(i, 1);
  }
  return true;
}

const optionCount = (q) => LETTERS.filter((c) => (q[`option${c}`] ?? '').trim()).length;

const rows = [];
for (const src of SOURCES) {
  const parsed = JSON.parse(readFileSync(src.path, 'utf8'));
  parsed.forEach((q, i) => {
    const ref = `${src.tag}#${i + 1}`;
    rows.push({ ...cleanRow(q, ref), _src: src.tag, _ref: ref });
  });
  console.log(`${src.tag.padEnd(4)} ${parsed.length} rows`);
}

if (repairs.length) {
  console.log(`\nStripped ${repairs.length} trailing-digit artifact(s):`);
  for (const r of repairs) console.log(`  ${r}`);
}

const kept = [];
const dropped = [];
const conflicts = [];

for (const q of rows) {
  const twin = kept.find((k) => isSameItem(k, q));
  if (!twin) {
    kept.push(q);
    continue;
  }

  if (sameAnswer(twin, q)) {
    // Agreeing twin: keep June unless March is strictly fuller.
    if (optionCount(q) > optionCount(twin)) {
      kept[kept.indexOf(twin)] = q;
      dropped.push({ loser: twin, winner: q, why: 'agreed; kept the fuller option set' });
    } else {
      dropped.push({ loser: q, winner: twin, why: 'agreed; kept the newer/cleaner copy' });
    }
    continue;
  }

  const ruling = RESOLUTIONS[q._ref];
  if (ruling) {
    dropped.push({ loser: q, winner: twin, why: `RESOLVED — ${ruling}` });
  } else {
    kept.push(q);
    conflicts.push({ a: twin, b: q });
  }
}

// `_url`, `_src`, `_ref` are scrape bookkeeping. Ids come later from
// add-question-ids.mjs, which hashes the final content.
const clean = kept.map(({ _url, _src, _ref, ...q }) => q);

console.log(`\n${rows.length} scraped -> ${clean.length} unique (${dropped.length} collapsed)`);

console.log('\nCollapsed:');
for (const d of dropped) console.log(`  ${d.loser._ref} -> ${d.winner._ref}  ${d.why}`);

if (conflicts.length) {
  console.log(`\n!! ${conflicts.length} UNRESOLVED answer conflict(s) — both kept, review by hand:`);
  for (const c of conflicts) {
    console.log(`\n  ${c.a.question.slice(0, 120)}`);
    for (const q of [c.a, c.b]) {
      console.log(`    [${q._ref}] ${q.correct} = ${answerTexts(q).join(' | ').slice(0, 110)}`);
    }
  }
} else {
  console.log('\nNo unresolved answer conflicts.');
}

if (!DRY) {
  writeFileSync(OUT, JSON.stringify(clean, null, 2) + '\n', 'utf8');
  console.log(`\nWrote ${OUT}`);
} else {
  console.log('\n[dry run] nothing written');
}
