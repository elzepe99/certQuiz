/**
 * What the four `test-*.mjs` suites share: loading a TypeScript module out of
 * src/ without a test runner, and counting assertions.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Import a module from src/ by repo-relative path. Bundled with esbuild (the
 * copy Vite already installs) so a module's own imports come along, and
 * tsconfig.json teaches it the `@/` alias.
 */
export async function loadTs(relPath) {
  const esbuild = (
    await import(pathToFileURL(path.join(ROOT, 'node_modules/esbuild/lib/main.js')).href)
  ).default;
  const built = await esbuild.build({
    entryPoints: [path.join(ROOT, relPath)],
    bundle: true,
    format: 'esm',
    write: false,
    tsconfig: path.join(ROOT, 'tsconfig.json'),
    logLevel: 'silent',
  });
  return import(
    'data:text/javascript;base64,' + Buffer.from(built.outputFiles[0].text).toString('base64')
  );
}

let pass = 0;
let fail = 0;

/** Deep equality by JSON, printing both sides on a mismatch. */
export function check(name, actual, expected) {
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

/** A plain truthy assertion. */
export function ok(name, condition, detail = '') {
  if (condition) pass++;
  else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/** Running totals, for each suite's own closing line. */
export function tally() {
  return { pass, fail };
}
