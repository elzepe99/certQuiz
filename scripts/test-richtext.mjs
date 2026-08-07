/**
 * Regression tests for src/lib/richtext.ts.
 *
 * The code-block detector is a heuristic, so it is only as good as the cases
 * it is pinned against. Every fixture below is a real string lifted from a
 * deck. Run this after touching any rule in richtext.ts:
 *
 *   npm run test:richtext
 *
 * It also sweeps every deck and reports how many blocks were detected. If a
 * rule change makes that number jump, something started over-firing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const esbuild = (
  await import(pathToFileURL(path.join(ROOT, 'node_modules/esbuild/lib/main.js')).href)
).default;
const src = fs.readFileSync(path.join(ROOT, 'src/lib/richtext.ts'), 'utf8');
const js = esbuild.transformSync(src, { loader: 'ts', format: 'esm' }).code;
const { parseRichText, splitInlineCode } = await import(
  'data:text/javascript;base64,' + Buffer.from(js).toString('base64')
);

let pass = 0;
let fail = 0;

function check(name, actual, expected) {
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

/** Assert which segments a string produces, as a compact kind string. */
function shape(text) {
  return parseRichText(text)
    .map((s) => (s.kind === 'code' ? 'C' : 'T'))
    .join('');
}

console.log('\nrichtext: explicit fences');

check(
  'prose + fence + prose',
  parseRichText('Given this code:\n```apex\npublic class A {\n}\n```\nWhat happens?'),
  [
    { kind: 'text', value: 'Given this code:' },
    { kind: 'code', value: 'public class A {\n}', lang: 'apex' },
    { kind: 'text', value: 'What happens?' },
  ],
);
check('fence with no language', shape('Look:\n```\nSELECT Id FROM Account\n```'), 'TC');
check('two fences', shape('```\nA a = 1;\n```\nmiddle\n```\nB b = 2;\n```'), 'CTC');
check('unterminated fence keeps its tail', shape('Broken:\n```apex\npublic class A {'), 'TC');
check(
  'fences beat the heuristic — prose forced into a block',
  shape('```\nWhere should the admin go?\n```'),
  'C',
);
check(
  'fence preserves indentation exactly',
  parseRichText('```\nclass A {\n    void b() {\n        return;\n    }\n}\n```')[0].value,
  'class A {\n    void b() {\n        return;\n    }\n}',
);

console.log('richtext: code the heuristic must find');

check(
  'Apex method with a SOSL search',
  shape(
    '"A developer wrote the following method to find all the test accounts in the org:\n' +
      'public static Account[] searchTestAccounts(){\n' +
      "    List<List<SObject>> searchList = [ FIND 'test' IN ALL FIELDS\n" +
      '                                        RETURNING Account(Name)];\n' +
      '    return (Account[]) searchList[0];\n' +
      '}\n' +
      'However, the test method below fails.',
  ),
  'TCT',
);
check(
  'blank lines inside a method body do not split the block',
  shape(
    '@isTest (SeeAllData= true)\n' +
      'public static void testDeleteTrigger(){\n\n' +
      "    Account testAccount = new Account(Name = 'Test');\n" +
      '    insert testAccount;\n\n' +
      '    delete testAccounts;\n' +
      '}\n' +
      'The developer org has five accounts.',
  ),
  'CT',
);
check(
  'Visualforce markup between two prose paragraphs',
  shape(
    'A Visualforce page contains an industry select list.\n' +
      '<apex:selectList value="{!selectedIndustry}">\n' +
      '<apex:selectOptions values="{!industries}"/>\n' +
      '</apex:selectList>\n' +
      'When a user changes the value, the table should update.',
  ),
  'TCT',
);
check(
  'numbered listing, colon gutter',
  shape(
    'The Apex method will be wired to a property.\n' +
      '01:\n' +
      '02: public class ContactFetcher {\n' +
      '03:\n' +
      '04:     static List<Contact> getRecentContacts(Id accountId) {\n' +
      '05:         return contacts;\n' +
      '06:     }\n' +
      '07: }\n' +
      'Which two lines must change?',
  ),
  'TCT',
);
check('multi-line SOQL option', shape('SELECT AccountId, Subject \nFROM Task \nWHERE X = 1;'), 'C');
check('single-line SOQL option', shape('SELECT Id FROM Account WHERE Id IN :aListVariable'), 'C');
check(
  'member assignment holds a block together',
  shape(
    'trigger T on Account (before insert)\n' +
      '{\n' +
      '    List<Account> l = new List<Account>();\n\n' +
      '    anAccount.OwnerId =TRegion.RegionManager__c\n\n' +
      '    update l;\n' +
      '}',
  ),
  'C',
);

console.log('richtext: prose the heuristic must leave alone');

const mustStayProse = [
  ['markdown bullet list', '* Salesforce Help: Prompt Template Versioning\n* States that this is immutable.'],
  ['sentence opening with a tag', '<apex:messages> displays all messages generated for the page using standard formatting.'],
  ['sentence opening with an annotation', '@AuraEnabled(cacheable=true) allows client-side caching for improved performance.'],
  ['prose starting with Where', 'Where should the administrator go to configure this setting?'],
  ['prose starting with Public', 'Public groups can be used to extend sharing rules to more users.'],
  ['prose starting with Select', 'Select two of the following options that apply to this scenario.'],
  ['instruction-style option', "Set size='12' for desktop/tablet"],
  ['API mentioned mid-sentence', 'Use Database.executeBatch() to invoke a Database.Batchable class.'],
  ['API opening a sentence', 'Test.fixedSearchResults() method to set up expected data'],
  ['bare annotation label', '@future annotation'],
];
for (const [name, text] of mustStayProse) {
  check(name, shape(text), 'T');
}

console.log('richtext: inline code and edge cases');

check('backticks split', splitInlineCode('Use `Database.insert()` here.'), [
  { code: false, value: 'Use ' },
  { code: true, value: 'Database.insert()' },
  { code: false, value: ' here.' },
]);
check('unmatched backtick stays literal', splitInlineCode('A ` lone tick'), [
  { code: false, value: 'A ` lone tick' },
]);
check('empty string', parseRichText(''), []);
check('whitespace only', parseRichText('   \n  '), []);
check('orphaned brace is not a block', shape('}'), 'T');

// Sweep every deck so an over-firing rule shows up as a count spike.
console.log('\nrichtext: deck sweep');
const deckDir = path.join(ROOT, 'public/decks');
const FIELDS = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'optionE', 'explanation'];
let totalBlocks = 0;
let totalQuestions = 0;
for (const file of fs
  .readdirSync(deckDir)
  .filter((f) => f.endsWith('.json') && f !== 'manifest.json' && f !== 'deck-template.json')
  .sort()) {
  const raw = JSON.parse(fs.readFileSync(path.join(deckDir, file), 'utf8'));
  const arr = Array.isArray(raw) ? raw : raw.questions;
  let blocks = 0;
  const touched = new Set();
  for (const q of arr) {
    for (const field of FIELDS) {
      const val = q[field];
      if (typeof val !== 'string' || !val) continue;
      for (const seg of parseRichText(val)) {
        if (seg.kind !== 'code') continue;
        blocks++;
        touched.add(q.id);
      }
    }
  }
  totalBlocks += blocks;
  totalQuestions += touched.size;
  if (blocks > 0) {
    console.log(`  ${file.padEnd(50)} ${String(blocks).padStart(4)} blocks in ${touched.size} questions`);
  }
}
console.log(`  ${'TOTAL'.padEnd(50)} ${String(totalBlocks).padStart(4)} blocks in ${totalQuestions} questions`);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
