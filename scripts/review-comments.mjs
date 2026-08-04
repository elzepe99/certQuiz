/**
 * Dump every commented question in a deck as a review document.
 *
 * This is the entry point for the "fix the questions I flagged" loop: it joins
 * the Supabase `comments` rows to the deck JSON on the question's permanent id
 * and prints each flagged question with its options, current answer, and the
 * comments left on it — everything needed to adjudicate a fix in one place.
 *
 *   node scripts/review-comments.mjs                          # list decks with comments
 *   node scripts/review-comments.mjs salesforce-integration-architect
 *   node scripts/review-comments.mjs <deck-id> --out review.md
 *
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DECKS_DIR = join(ROOT, 'public', 'decks');

function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const path = join(ROOT, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const URL_BASE = process.env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!URL_BASE || !KEY) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.');
  console.error('Copy .env.example to .env.local and fill it in.');
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const outFlag = process.argv.indexOf('--out');
const outPath = outFlag !== -1 ? process.argv[outFlag + 1] : null;
const deckId = args[0];

async function fetchComments(filterDeckId) {
  const qs = new URLSearchParams({
    select: 'id,deck_id,question_hash,author,body,created_at',
    order: 'created_at.asc',
  });
  if (filterDeckId) qs.set('deck_id', `eq.${filterDeckId}`);
  const res = await fetch(`${URL_BASE}/rest/v1/comments?${qs}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

const manifest = JSON.parse(readFileSync(join(DECKS_DIR, 'manifest.json'), 'utf8'));
const rows = await fetchComments(deckId);

if (rows.length === 0) {
  console.log(deckId ? `No comments on deck "${deckId}".` : 'No comments found.');
  process.exit(0);
}

// No deck argument: just report where the comments live.
if (!deckId) {
  const byDeck = new Map();
  for (const r of rows) byDeck.set(r.deck_id, (byDeck.get(r.deck_id) ?? 0) + 1);
  console.log(`${rows.length} comments across ${byDeck.size} deck(s):\n`);
  for (const [id, n] of [...byDeck].sort((a, b) => b[1] - a[1])) {
    const meta = manifest.decks.find((d) => d.id === id);
    console.log(`  ${String(n).padStart(4)}  ${id}${meta ? '' : '   (not in manifest)'}`);
  }
  console.log(`\nRun again with a deck id to see the flagged questions.`);
  process.exit(0);
}

const meta = manifest.decks.find((d) => d.id === deckId);
if (!meta) {
  console.error(`Deck "${deckId}" is not in manifest.json.`);
  process.exit(1);
}
const questions = JSON.parse(readFileSync(join(DECKS_DIR, meta.file), 'utf8'));
const byId = new Map(questions.map((q, i) => [q.id, { q, number: i + 1 }]));

const grouped = new Map();
for (const r of rows) {
  const arr = grouped.get(r.question_hash) ?? [];
  arr.push(r);
  grouped.set(r.question_hash, arr);
}

const out = [];
const orphans = [];
out.push(`# Commented questions — ${meta.name}`);
out.push(`\n${rows.length} comments on ${grouped.size} questions.\n`);

const entries = [...grouped.entries()]
  .map(([hash, comments]) => ({ hash, comments, hit: byId.get(hash) }))
  .sort((a, b) => (a.hit?.number ?? 1e9) - (b.hit?.number ?? 1e9));

for (const { hash, comments, hit } of entries) {
  if (!hit) {
    orphans.push({ hash, comments });
    continue;
  }
  const { q, number } = hit;
  out.push(`\n---\n`);
  out.push(`## Q${number}  \`${hash}\`  _[${q._cat}]_\n`);
  out.push(`${q.question}\n`);
  for (const L of ['A', 'B', 'C', 'D', 'E']) {
    const text = q[`option${L}`];
    if (!text) continue;
    const marker = q.correct.split(',').map((s) => s.trim()).includes(L) ? '**' : '';
    out.push(`- ${marker}${L}. ${text}${marker}`);
  }
  out.push(`\n**Current answer: ${q.correct}**\n`);
  out.push(`> ${q.explanation.replace(/\n/g, '\n> ')}\n`);
  out.push(`### Comments`);
  for (const c of comments) {
    out.push(`- **${c.author}** (${c.created_at.slice(0, 10)}): ${c.body}`);
  }
}

if (orphans.length) {
  out.push(`\n---\n\n## Orphaned comments (${orphans.length})`);
  out.push(`\nThese hashes match no question in the deck — most likely left on a`);
  out.push(`question that was edited before permanent ids existed.\n`);
  for (const { hash, comments } of orphans) {
    out.push(`- \`${hash}\``);
    for (const c of comments) out.push(`  - **${c.author}**: ${c.body}`);
  }
}

const text = out.join('\n') + '\n';
if (outPath) {
  writeFileSync(outPath, text, 'utf8');
  console.log(`Wrote ${outPath} — ${grouped.size} questions, ${orphans.length} orphaned.`);
} else {
  console.log(text);
}
