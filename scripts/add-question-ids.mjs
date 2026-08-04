/**
 * One-time migration: give every question a permanent `id`.
 *
 * The id is SEEDED WITH THE QUESTION'S CURRENT CONTENT HASH — the same FNV-1a
 * value the app has been storing in `comments.question_hash`. That means every
 * existing comment row already points at the right question and no database
 * migration is needed. Once written, the id is frozen: editing a stem, an
 * option, or the `correct` answer no longer detaches the comments.
 *
 * Run once per deck file. Re-running is safe — questions that already have an
 * id are left untouched.
 *
 *   node scripts/add-question-ids.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DECKS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'decks');
const DRY = process.argv.includes('--dry');

const SIG_SEP = String.fromCharCode(31);

/** Must stay byte-identical to questionSignature() in src/lib/storage.ts. */
function questionSignature(q) {
  return [
    q.question,
    q.optionA,
    q.optionB,
    q.optionC,
    q.optionD ?? '',
    q.optionE ?? '',
    q.correct,
    q._cat ?? '',
  ].join(SIG_SEP);
}

/** Must stay byte-identical to hashSignature() in src/lib/storage.ts. */
function hashSignature(sig) {
  let h = 0x811c9dc5;
  for (let i = 0; i < sig.length; i++) {
    h ^= sig.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

const manifest = JSON.parse(readFileSync(join(DECKS_DIR, 'manifest.json'), 'utf8'));

let totalAdded = 0;
let totalKept = 0;
const collisions = [];

for (const deck of manifest.decks) {
  const path = join(DECKS_DIR, deck.file);
  const raw = readFileSync(path, 'utf8');
  const usesCrlf = raw.includes('\r\n');
  const questions = JSON.parse(raw);

  if (!Array.isArray(questions)) {
    console.warn(`  ! ${deck.file} is not an array — skipped`);
    continue;
  }

  const used = new Set();
  let added = 0;
  let kept = 0;

  const next = questions.map((q, i) => {
    if (typeof q.id === 'string' && q.id.length > 0) {
      used.add(q.id);
      kept++;
      return q;
    }

    const base = hashSignature(questionSignature(q));
    // Exact-duplicate questions hash identically. The first keeps the bare hash
    // (and therefore its existing comments); later twins get a suffix so each
    // row still resolves to exactly one question.
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n++}`;
      if (n === 3) {
        collisions.push(`${deck.id} #${i + 1}: ${q.question.slice(0, 70)}...`);
      }
    }
    if (id !== base) {
      collisions.push(`${deck.id} #${i + 1} -> ${id}: ${q.question.slice(0, 70)}...`);
    }
    used.add(id);
    added++;

    // id first so it reads as the primary key of the record
    return { id, ...q };
  });

  totalAdded += added;
  totalKept += kept;
  console.log(`  ${deck.id.padEnd(38)} +${String(added).padStart(4)} new, ${kept} kept`);

  if (!DRY && added > 0) {
    let out = JSON.stringify(next, null, 2) + '\n';
    if (usesCrlf) out = out.replace(/\n/g, '\r\n');
    writeFileSync(path, out, 'utf8');
  }
}

console.log(`\n${DRY ? '[dry run] ' : ''}ids added: ${totalAdded}, already present: ${totalKept}`);
if (collisions.length) {
  console.log(`\nDuplicate questions found (${collisions.length}) — these share content:`);
  for (const c of collisions) console.log(`  ${c}`);
}
