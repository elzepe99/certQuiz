/**
 * Remove the last duplicate in the Integration Architect deck.
 *
 * Q49 was a three-option variant of Q44 — same stem, missing the "Apex triggers
 * can subscribe to Generic Events" distractor, first two options swapped. It
 * survived the earlier dedupe pass only because both twins carried comments.
 *
 * Its comment has since been moved onto Q44 in Supabase (copied with the
 * original author, body and timestamp, then the old row deleted — the anon role
 * may insert and delete but not update), so nothing references Q49 and it can
 * go. Q44 now holds both comments.
 *
 *   node scripts/remove-q49-variant.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'decks',
  'integration_architect_questions_corrected.json',
);
const DRY = process.argv.includes('--dry');
const REMOVE_ID = '7b5ecf20';

const raw = readFileSync(FILE, 'utf8');
const questions = JSON.parse(raw);

const victim = questions.find((q) => q.id === REMOVE_ID);
if (!victim) {
  console.error(`${REMOVE_ID} not found — already removed?`);
  process.exit(1);
}

const kept = questions.filter((q) => q.id !== REMOVE_ID);
console.log(`removing Q${questions.indexOf(victim) + 1}  ${REMOVE_ID}`);
console.log(`  ${victim.question.slice(0, 90)}...`);
console.log(`  answer was ${victim.correct}, ${['A', 'B', 'C', 'D', 'E'].filter((L) => victim[`option${L}`]).length} options`);

if (!DRY) {
  let out = JSON.stringify(kept, null, 2) + '\n';
  if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(FILE, out, 'utf8');
}

console.log(`\n${DRY ? '[dry run] ' : ''}${questions.length} -> ${kept.length} questions.`);
