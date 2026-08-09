/**
 * Replace or drop reference URLs across a deck.
 *
 * `apply-findings.mjs` only ever ADDS references — it merges and never removes,
 * which is right for a review pass but useless once a citation turns out to be
 * dead. This is the other half: it swaps a bad URL for a verified one, or drops
 * it entirely.
 *
 * The failure this exists for: help.salesforce.com answers every article id,
 * real or invented, with HTTP 200 and an identical shell. A pass that cited
 * without rendering each URL can leave a deck looking fully sourced while a
 * third of its links 404. Sweeping that up by hand across 100+ questions is
 * exactly the kind of edit that goes wrong quietly.
 *
 *   node replace-refs.mjs <deck.json> <map.json> [--dry] [--allow-uncited]
 *
 * map.json maps a DISTINCTIVE SUBSTRING of the bad URL (usually the article id)
 * to its replacement, or to null to drop it:
 *
 * {
 *   "sf.security_login_flow_overview.htm": "https://help.salesforce.com/...",
 *   "sf.some_retired_article.htm": null
 * }
 *
 * Matching on a substring rather than the whole URL is deliberate: the same
 * dead article often appears with different query-parameter ordering.
 *
 * By default the script REFUSES to leave any question with zero references —
 * stripping a dead link and silently dropping a question's only citation is how
 * you end up worse off than before. Pass --allow-uncited if that is genuinely
 * what you want.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [deckPath, mapPath] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const DRY = process.argv.includes('--dry');
const ALLOW_UNCITED = process.argv.includes('--allow-uncited');

if (!deckPath || !mapPath) {
  console.error('usage: node replace-refs.mjs <deck.json> <map.json> [--dry] [--allow-uncited]');
  process.exit(1);
}

const raw = readFileSync(deckPath, 'utf8');
const deck = JSON.parse(raw);
const map = JSON.parse(readFileSync(mapPath, 'utf8'));
const keys = Object.keys(map);

for (const [k, v] of Object.entries(map)) {
  if (v !== null && !/^https:\/\/\S+$/.test(v)) {
    console.error(`Replacement for "${k}" must be an https URL or null — got ${JSON.stringify(v)}`);
    process.exit(1);
  }
}

/**
 * Refuse overlapping keys. Matching is by substring in insertion order, so if
 * one key contains another the shorter one silently swallows the longer one's
 * URLs and sends them to the wrong replacement. Keeping the article's `.htm`
 * suffix in each key is usually enough to keep them disjoint, but relying on
 * the author to remember that is how you get a wrong citation that looks right.
 */
const overlaps = [];
for (const a of keys) {
  for (const b of keys) {
    if (a !== b && b.includes(a)) overlaps.push([a, b]);
  }
}
if (overlaps.length) {
  console.error('Refusing to apply — these map keys overlap, so matching order would decide the result:');
  for (const [a, b] of overlaps) console.error(`  "${a}" is a substring of "${b}"`);
  console.error('\nMake each key distinctive (keeping the .htm suffix usually does it).');
  process.exit(1);
}

/** Split an explanation into prose and its reference list. */
function split(text) {
  const m = (text ?? '').match(/(^|\n)\s*References?\s*:?\s*\n?/i);
  if (!m || m.index === undefined) return { body: (text ?? '').trim(), refs: [] };
  return {
    body: text.slice(0, m.index).trim(),
    refs: text
      .slice(m.index + m[0].length)
      .trim()
      .split(/\n+/)
      .map((l) => l.replace(/^[\s•\-*]+/, '').trim())
      .filter(Boolean),
  };
}

const changed = [];
const orphaned = [];
const hits = Object.fromEntries(keys.map((k) => [k, 0]));

for (const q of deck) {
  const { body, refs } = split(q.explanation);
  if (!refs.length) continue;

  let touched = false;
  const out = [];
  for (const url of refs) {
    const key = keys.find((k) => url.includes(k));
    if (!key) {
      out.push(url);
      continue;
    }
    hits[key]++;
    touched = true;
    if (map[key] !== null) out.push(map[key]);
  }
  if (!touched) continue;

  const merged = [...new Set(out)];
  if (!merged.length) orphaned.push(q.id);
  changed.push({ id: q.id, before: refs.length, after: merged.length });
  q.explanation = merged.length ? `${body}\nReferences:\n${merged.join('\n')}` : body;
}

const unused = keys.filter((k) => hits[k] === 0);
if (unused.length) {
  console.log(`Note: ${unused.length} map entr(ies) matched nothing — check for a typo:`);
  for (const k of unused) console.log(`  ${k}`);
  console.log('');
}

if (orphaned.length && !ALLOW_UNCITED) {
  console.error(
    `Refusing to apply — ${orphaned.length} question(s) would be left with no reference at all:\n` +
      orphaned.map((id) => `  ${id}`).join('\n') +
      `\n\nSupply a replacement for those, or pass --allow-uncited if you accept it.`,
  );
  process.exit(1);
}

if (!DRY) {
  let out = JSON.stringify(deck, null, 2) + '\n';
  if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(deckPath, out, 'utf8');
}

const swapped = Object.entries(hits).filter(([, n]) => n > 0);
console.log(
  `${DRY ? '[dry run] ' : ''}${changed.length} question(s) updated across ` +
    `${swapped.length} mapped URL(s); ${swapped.reduce((a, [, n]) => a + n, 0)} reference line(s) rewritten.`,
);
for (const [k, n] of swapped) {
  console.log(`  ${n.toString().padStart(3)} x  ${k}  ->  ${map[k] === null ? '(dropped)' : map[k]}`);
}

const cited = deck.filter((q) => /(^|\n)\s*References?\s*:/i.test(q.explanation ?? '')).length;
console.log(`\nDeck coverage: ${cited}/${deck.length} question(s) carry at least one reference.`);
