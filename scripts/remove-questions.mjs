/**
 * Remove questions from a deck by id.
 *
 *   node scripts/remove-questions.mjs <deck.json> <id> [<id>...] [--dry-run]
 *
 * Written as a general tool rather than a one-shot because deduping is a
 * recurring need — freecram serves the same item more than once with the
 * options shuffled and OCR noise, so exact-match checks miss them.
 *
 * Refuses rather than guesses:
 *  - every id must exist in the deck (a stale id means the plan is out of date)
 *  - an id still referenced by src/diagrams/registry.ts is rejected, so a
 *    removal cannot silently orphan a figure
 *  - the file's existing indentation and line endings are preserved
 *
 * NOT handled, and the caller's problem: in-app comments are stored in Supabase
 * keyed on question id, so removing a question orphans any comment attached to
 * it. Check with `npm run review-comments` first if Supabase is configured.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const [deckArg, ...ids] = args.filter((a) => a !== '--dry-run');

if (!deckArg || ids.length === 0) {
  console.error('usage: node scripts/remove-questions.mjs <deck.json> <id> [<id>...] [--dry-run]');
  process.exit(2);
}

const deckPath = resolve(REPO, deckArg);
const raw = readFileSync(deckPath, 'utf8');
const deck = JSON.parse(raw);
if (!Array.isArray(deck)) {
  console.error(`${deckArg} is not an array of questions.`);
  process.exit(1);
}

const present = new Set(deck.map((q) => q.id));
const missing = ids.filter((id) => !present.has(id));
if (missing.length) {
  console.error(`Not in this deck, so the plan is stale: ${missing.join(', ')}`);
  process.exit(1);
}

// A figure is bound to a question id, not to a deck position. Removing a
// question that still has one would leave an entry pointing at nothing.
const registry = readFileSync(resolve(REPO, 'src/diagrams/registry.ts'), 'utf8');
const bound = ids.filter((id) => new RegExp(`['"\`]?${id}['"\`]?\\s*:`).test(registry));
if (bound.length) {
  console.error(
    `Still referenced by src/diagrams/registry.ts: ${bound.join(', ')}\n` +
      'Drop the registry entry first, or re-point it at the question being kept.',
  );
  process.exit(1);
}

const drop = new Set(ids);
const kept = deck.filter((q) => !drop.has(q.id));

const crlf = raw.includes('\r\n');
// Match the first indented line, whatever character it starts with. Matching
// the first indented `"` instead reads the *second* level of nesting — line 2
// of a deck is `{`, not a key — which doubled the file indentation on each run.
const indentMatch = raw.match(/\n([ \t]+)\S/);
const indent = indentMatch ? indentMatch[1].length : 2;
let out = JSON.stringify(kept, null, indent);
if (crlf) out = out.replace(/\n/g, '\r\n');
if (raw.endsWith('\n') || raw.endsWith('\r\n')) out += crlf ? '\r\n' : '\n';

console.log(`${deckArg}: ${deck.length} → ${kept.length} (removed ${deck.length - kept.length})`);
ids.forEach((id) => console.log(`  - ${id}`));

if (DRY) {
  console.log('[dry run] nothing written');
} else {
  writeFileSync(deckPath, out, 'utf8');
  console.log('written');
}
