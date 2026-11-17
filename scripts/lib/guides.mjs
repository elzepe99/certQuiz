/**
 * Which study guides exist, derived from the deck manifest.
 *
 * A deck's `guide` field in public/decks/manifest.json is the single place a
 * guide is declared: it is what makes the app show a Guide tab, and it is what
 * `build-guide.mjs` builds and `verify-guide.mjs` checks. There is no second
 * list to keep in step.
 *
 * The source fragment is found by convention: the deck id with any leading
 * `salesforce-` dropped, as `study-guides/<name>.artifact.html`.
 */
import fs from 'node:fs';
import path from 'node:path';

export function guideSourceFor(deckId) {
  return `study-guides/${deckId.replace(/^salesforce-/, '')}.artifact.html`;
}

/** One entry per manifest deck that declares a guide, in manifest order. */
export function listGuides(repo) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(repo, 'public/decks/manifest.json'), 'utf8'),
  );
  return manifest.decks
    .filter((d) => d.guide)
    .map((d) => ({
      deck: d,
      source: guideSourceFor(d.id),
      out: `public/${d.guide}`,
      slug: path.basename(d.guide, '.html'),
      lang: 'en',
    }));
}

/**
 * Fragments in study-guides/ that no manifest deck points at. Such a file is
 * never built and never shown, and nothing else would say so.
 */
export function orphanFragments(repo, guides) {
  const known = new Set(guides.map((g) => g.source));
  return fs
    .readdirSync(path.join(repo, 'study-guides'))
    .filter((f) => f.endsWith('.artifact.html'))
    .map((f) => `study-guides/${f}`)
    .filter((p) => !known.has(p));
}
