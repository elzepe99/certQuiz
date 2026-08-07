/**
 * Add explicit code fences to the one Platform Developer II question whose
 * markup is jammed onto the same line as its prose.
 *
 * The code-block detector in src/lib/richtext.ts works line by line, so it can
 * separate code from prose only where the deck author already put a newline.
 * Question d50c6ceb has none — the <apex:page> tag runs straight on from
 * "...overriding the Standard controller for Case." mid-sentence, and the
 * <apex:commandButton> trails the last sentence the same way. No heuristic can
 * split that, so the fix belongs in the data.
 *
 * A sweep of all twelve decks found this to be the only question of its shape,
 * which is why this script targets one id rather than taking a pattern.
 *
 * The wording, options and answer are untouched — only whitespace and fences
 * change — so this deliberately does NOT stamp a `corrected` record. That
 * notice tells a learner the item was substantively fixed, and nothing here
 * changes what the question asks or what the right answer is.
 *
 *   node scripts/fix-dev2-code-formatting.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'decks',
  'salesforce_questions_Dev2.json',
);
const DRY = process.argv.includes('--dry');

const ID = 'd50c6ceb';

/** Guard: refuse to run if the question is not byte-for-byte what we expect. */
const EXPECTED =
  'A developer has a page with two extensions overriding the Standard controller ' +
  'for Case.<apex:page standardController="Case" extension="CaseExtensionOne,' +
  'CaseExtension Two" showHeader="false"> Each extension has a method called Save. ' +
  'The page has a command button as defined: <apex:commandButton value="Save" ' +
  'action="{!save}"/>';

/* Prose and markup separated onto their own lines, with the markup fenced.
 * The code is reproduced verbatim — including `extension=` (singular) and the
 * space in "CaseExtension Two" — because those quirks belong to the question as
 * imported, and silently repairing them here would change what is being asked. */
const REPLACEMENT = [
  'A developer has a page with two extensions overriding the Standard controller for Case.',
  '',
  '```html',
  '<apex:page standardController="Case" extension="CaseExtensionOne,CaseExtension Two" showHeader="false">',
  '```',
  '',
  'Each extension has a method called Save. The page has a command button as defined:',
  '',
  '```html',
  '<apex:commandButton value="Save" action="{!save}"/>',
  '```',
].join('\n');

const raw = readFileSync(FILE, 'utf8');
const questions = JSON.parse(raw);
const q = questions.find((x) => x.id === ID);

if (!q) {
  console.error(`No question with id ${ID} in ${FILE}.`);
  process.exit(1);
}

if (q.question === REPLACEMENT) {
  console.log(`${ID} is already fenced — nothing to do.`);
  process.exit(0);
}

if (q.question !== EXPECTED) {
  console.error(
    `${ID} does not match the text this script was written against; it has been ` +
      `edited since. Refusing to overwrite.\n\nFound:\n${q.question}`,
  );
  process.exit(1);
}

q.question = REPLACEMENT;

if (DRY) {
  console.log(`[dry] would rewrite ${ID}:\n`);
  console.log(REPLACEMENT);
} else {
  // Match the file's existing line endings so the diff stays one question wide.
  let out = JSON.stringify(questions, null, 2) + '\n';
  if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(FILE, out, 'utf8');
  console.log(`Rewrote ${ID} with fenced markup.`);
}
