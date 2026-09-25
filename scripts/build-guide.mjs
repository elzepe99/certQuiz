#!/usr/bin/env node
/**
 * Wraps a study-guide page source into a standalone HTML document under
 * public/guides/, so the app can link to it as a plain static file.
 *
 * Why a derive step rather than two hand-maintained copies: the same page is
 * ALSO published as a Claude Artifact, and the Artifact publisher supplies its
 * own <!doctype>/<head>/<body> skeleton — so its source must NOT carry those
 * tags. A standalone page must. One source, one wrap, no divergence.
 *
 * Source of truth:  study-guides/<name>.artifact.html   (shell-less fragment)
 * Emitted:          public/guides/<outName>.html        (full document)
 *
 *   node scripts/build-guide.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const GUIDES = [
  {
    source: 'study-guides/integration-architect.artifact.html',
    out: 'public/guides/salesforce-integration-architect.html',
    lang: 'en',
  },
  {
    source: 'study-guides/platform-developer-2.artifact.html',
    out: 'public/guides/salesforce-platform-developer-2.html',
    lang: 'en',
  },
  {
    source: 'study-guides/iam-architect.artifact.html',
    out: 'public/guides/salesforce-iam-architect.html',
    lang: 'en',
  },
  {
    source: 'study-guides/admin.artifact.html',
    out: 'public/guides/salesforce-admin.html',
    lang: 'en',
  },
  {
    source: 'study-guides/app-builder.artifact.html',
    out: 'public/guides/salesforce-app-builder.html',
    lang: 'en',
  },
  {
    source: 'study-guides/databricks-data-engineer-associate.artifact.html',
    out: 'public/guides/databricks-data-engineer-associate.html',
    lang: 'en',
  },
];

/** Pull the <title> out of the fragment so the standalone page keeps it. */
function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : 'Study guide';
}

function wrap(fragment, { lang }) {
  const title = extractTitle(fragment);
  // The fragment already carries its own <title> and <link> tags; leaving them
  // in <body> would be invalid, so they are lifted into <head> here.
  const head = [];
  const body = fragment.replace(
    /<title>[\s\S]*?<\/title>\s*|<link\b[^>]*>\s*/gi,
    (tag) => {
      head.push(tag.trim());
      return '';
    },
  );

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
${head.join('\n')}
</head>
<body>
${body.trim()}
</body>
</html>
`;
}

let failed = false;
for (const guide of GUIDES) {
  const srcPath = path.join(REPO, guide.source);
  const outPath = path.join(REPO, guide.out);

  if (!fs.existsSync(srcPath)) {
    console.error(`  MISSING  ${guide.source}`);
    failed = true;
    continue;
  }

  const fragment = fs.readFileSync(srcPath, 'utf8');

  // A fragment that already has a doc shell means someone edited the wrong
  // file; wrapping it again would nest <html> inside <body>.
  if (/<!doctype|<html[\s>]/i.test(fragment)) {
    console.error(`  ABORT    ${guide.source} already contains a document shell`);
    failed = true;
    continue;
  }

  const out = wrap(fragment, guide);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out, 'utf8');
  console.log(
    `  built    ${guide.out}  (${(out.length / 1024).toFixed(1)} KB)  "${extractTitle(fragment)}"`,
  );
}

process.exit(failed ? 1 : 0);
