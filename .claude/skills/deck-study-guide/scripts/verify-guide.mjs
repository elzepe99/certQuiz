#!/usr/bin/env node
/**
 * Checks the wiring that a study guide needs in order to actually reach a reader.
 *
 * Every check here exists because the step it covers is silent when skipped:
 * `build-guide.mjs` prints "built" whether or not you edited the file it reads,
 * and the app shows no guide tab whether or not the manifest entry is missing.
 *
 *   node .claude/skills/deck-study-guide/scripts/verify-guide.mjs            all guides
 *   node .claude/skills/deck-study-guide/scripts/verify-guide.mjs <slug>     one, by out-basename
 *
 * Run it AFTER `npm run build:guide`. Exits non-zero on any FAIL.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const only = process.argv[2];

let fails = 0;
let warns = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); fails++; };
const warn = (m) => { console.log(`  warn  ${m}`); warns++; };
const read = (p) => fs.readFileSync(path.join(REPO, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(REPO, p));

// --- the GUIDES array, parsed from source ------------------------------------------
// Parsed rather than imported because build-guide.mjs does its work at module scope;
// importing it would rebuild every guide as a side effect of verifying one.
const buildSrc = read('scripts/build-guide.mjs');
const guides = [...buildSrc.matchAll(/source:\s*'([^']+)',\s*\n\s*out:\s*'([^']+)'/g)]
  .map(([, source, out]) => ({ source, out, slug: path.basename(out, '.html') }));

if (!guides.length) {
  console.error('Could not parse the GUIDES array out of scripts/build-guide.mjs.');
  process.exit(1);
}

const selected = only ? guides.filter((g) => g.slug === only) : guides;
if (only && !selected.length) {
  console.error(`No GUIDES entry emits ${only}.html. build-guide.mjs knows: ${guides.map((g) => g.slug).join(', ')}`);
  console.error('A guide missing from that array is the single most common reason a guide edit changes nothing.');
  process.exit(1);
}

// --- the shared stylesheet ----------------------------------------------------------
// The fragments share one stylesheet BY COPY, so drift is invisible until two guides
// look different side by side.
// Compared newline-insensitively: this repo checks out CRLF and stores LF, so a
// byte comparison reports every freshly written file as divergent.
const styleOf = (src) => {
  const m = read(src).match(/<style>[\s\S]*?<\/style>/);
  return m ? m[0].replace(/\r\n/g, '\n') : null;
};
const styles = new Map();
for (const g of guides) {
  if (!exists(g.source)) continue;
  const s = styleOf(g.source);
  if (!s) continue;
  const key = String(s.length) + ':' + s.slice(0, 2000);
  if (!styles.has(key)) styles.set(key, []);
  styles.get(key).push(g.slug);
}
console.log('\nShared stylesheet');
if (styles.size === 1) ok(`all ${guides.length} fragments carry the same <style> block`);
else {
  fail(`the <style> block has diverged into ${styles.size} versions:`);
  for (const group of styles.values()) console.log(`          ${group.join(', ')}`);
  console.log('        A palette change must be made in every fragment, not one.');
}

// --- manifest -----------------------------------------------------------------------
const manifest = JSON.parse(read('public/decks/manifest.json'));
const byGuide = new Map(manifest.decks.filter((d) => d.guide).map((d) => [d.guide, d]));

// --- per guide ----------------------------------------------------------------------
const titlesFromHtml = (html) =>
  [...html.matchAll(/<h2 class="sect">[\s\S]*?<span>([\s\S]*?)<\/span>\s*<\/h2>/g)]
    .map(([, t]) => t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());

const titlesFromMd = (md) =>
  [...md.matchAll(/^##\s+(?:\d+\.\s*)?(.+)$/gm)].map(([, t]) => t.trim());

// HTML entities against the Markdown's literal characters; compare on words only.
const norm = (s) =>
  s.toLowerCase()
    .replace(/&[a-z]+;|&#\d+;/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

for (const g of selected) {
  console.log(`\n${g.slug}`);

  if (!exists(g.source)) { fail(`${g.source} is missing`); continue; }
  const fragment = read(g.source);

  if (/<!doctype|<html[\s>]/i.test(fragment)) {
    fail(`${g.source} contains a document shell; it must be a bare fragment`);
  } else ok('fragment has no document shell');

  // The readable/NotebookLM source is named after the OUT basename, not the source.
  const mdPath = `study-guides/${g.slug}.md`;
  const hasMd = exists(mdPath);
  if (!hasMd) fail(`${mdPath} is missing (the .md is the NotebookLM source and must be kept in parallel)`);

  // Built output
  if (!exists(g.out)) {
    fail(`${g.out} is missing — run \`npm run build:guide\``);
  } else {
    const built = read(g.out);
    const htmlTitles = titlesFromHtml(fragment);
    const missing = htmlTitles.filter((t) => !built.includes(t));
    if (!htmlTitles.length) fail('the fragment has no <h2 class="sect"> sections to check');
    else if (missing.length) {
      fail(`${missing.length} section heading(s) are in the fragment but NOT in ${g.out}:`);
      for (const m of missing) console.log(`          ${m}`);
      console.log('        A stale build is the trap: build-guide.mjs prints "built" either way.');
    } else ok(`all ${htmlTitles.length} section headings reached ${g.out}`);

    if (built.length < fragment.length) {
      fail(`${g.out} is smaller than its source fragment — the build did not wrap this file`);
    }
  }

  // .md / .artifact.html section parity
  if (hasMd) {
    const md = read(mdPath);
    const h = titlesFromHtml(fragment).map(norm);
    const m = titlesFromMd(md).map(norm);
    const onlyHtml = h.filter((t) => !m.includes(t));
    const onlyMd = m.filter((t) => !h.includes(t));
    if (!onlyHtml.length && !onlyMd.length) ok(`.md and .artifact.html agree on all ${h.length} sections`);
    else {
      warn(`section drift between ${mdPath} and ${g.source}`);
      for (const t of onlyHtml) console.log(`          html only: ${t}`);
      for (const t of onlyMd) console.log(`          md only:   ${t}`);
      console.log('        Both files are hand-maintained. Editing one alone is the classic mistake.');
    }
  }

  // Manifest wiring
  const want = `guides/${g.slug}.html`;
  const deck = byGuide.get(want);
  if (!deck) {
    fail(`no deck in manifest.json has "guide": "${want}" — the app will show no Guide tab`);
  } else {
    ok(`manifest: ${deck.id} points at ${want}`);

    // The question count goes stale on every import.
    const deckPath = `public/decks/${deck.file}`;
    if (exists(deckPath)) {
      const questions = JSON.parse(read(deckPath));
      const n = Array.isArray(questions) ? questions.length : null;
      if (n) {
        // Only phrasings that can ONLY mean the whole deck. Two looser patterns were
        // tried and both false-positived: a bare "N questions" matches the exam's own
        // scored count, and "the deck's N" matches "the deck's 21 items cover grants".
        const DECK_COUNT = [
          /\b(\d{2,4})\s+questions\s+in\b/g,
          /\ball\s+(\d{2,4})\s+(?:questions|against)\b/g,
        ];
        const claimed = new Set();
        for (const text of [fragment, hasMd ? read(mdPath) : '']) {
          for (const re of DECK_COUNT) {
            for (const [, c] of text.matchAll(re)) claimed.add(Number(c));
          }
        }
        const wrong = [...claimed].filter((c) => c !== n);
        if (!claimed.size) warn(`neither file states a question count; the deck holds ${n}`);
        else if (wrong.length) {
          fail(`the guide claims ${wrong.join(', ')} question(s) but ${deck.file} holds ${n}`);
          console.log('        Counts go stale on every import. Re-measure, do not copy the old row.');
        } else ok(`question count ${n} matches the deck`);
      }
    }
  }
}

console.log(`\n${fails} failure(s), ${warns} warning(s)`);
process.exit(fails ? 1 : 0);
