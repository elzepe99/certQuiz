/**
 * Remove duplicate questions from the Integration Architect deck.
 *
 * Each pair below is the same item scraped twice with the options shuffled. The
 * twin that carries comments is kept so no comment is orphaned; its redundant
 * partner is removed.
 *
 * Q51/Q137 needed one extra step. The comment sits on Q51, but Q137 was the
 * better item — four options and the "choose 2" framing, where Q51 had been
 * truncated to three. Because comments bind to the permanent `id` rather than
 * to content, Q51 could simply take on Q137's fuller wording and keep its own
 * id, so the comment survives and the stronger question is the one retained.
 *
 * Q44/Q49 are left alone: both carry comments, so neither can be removed
 * without losing one.
 *
 *   node scripts/dedupe-integration-architect.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stampCorrection } from './lib/corrections.mjs';

const FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'decks',
  'integration_architect_questions_corrected.json',
);
const DRY = process.argv.includes('--dry');

/** Questions to remove, with the twin that is kept in their place. */
const REMOVE = {
  '4c2b26c8': 'Q76 — duplicate of Q9 (same ERP/middleware item, options shuffled). Neither twin has comments; Q9 is kept for its cleaner option wording.',
  '0bfdcf2c': 'Q86 — duplicate of Q42 (identical LWC stem). Q42 carries the comment that resolved the pair, so Q86 goes.',
  '62f27ce6': 'Q137 — duplicate of Q51. Its fuller four-option form has been moved onto Q51, which keeps the comment.',
};

/** Q51 takes over Q137's wording while keeping its own id. */
const ABSORB = {
  id: 'c7d46b81',
  note: 'Q51 absorbed its duplicate Q137: restored the full four-option "choose 2" form that Q51 had been truncated from. Answer is Named Credentials plus the standard REST insert.',
  set: {
    question:
      'Northern Trail Outfitters is in the final stages of merging two Salesforce orgs but needs to keep the retiring org available for a short period of time for lead management, as it is connected to multiple public website forms. The sales department has requested that new leads are available in the new Salesforce instance within 30 minutes. Which two approaches will require the least amount of development effort? Choose 2 answers',
    optionA: 'Use the Tooling API with Process Builder to insert leads in real time.',
    optionB: 'Configure named credentials in the source org.',
    optionC: 'Call the Salesforce REST API to insert the lead into the target org.',
    optionD: 'Use the Composite REST API to aggregate multiple leads in a single call.',
    optionE: '',
    correct: 'B,C',
    explanation:
      'Both orgs are Salesforce, so the retiring org needs only somewhere to authenticate and a standard endpoint to call. Named Credentials in the source org supply the target org\'s authentication declaratively, with no credential handling in code (B), and the standard REST API sObject insert accepts the Lead payload as-is (C). Composite REST (D) exists to batch several subrequests into one call — real work to build, for no benefit against a 30-minute SLA on leads arriving one form submission at a time. The Tooling API (A) addresses metadata and developer tooling rather than record CRUD.',
    _cat: 'Design Integration Solutions',
  },
};

const raw = readFileSync(FILE, 'utf8');
const questions = JSON.parse(raw);
const before = questions.length;

// Absorb first, so the surviving question is already in its final form.
const target = questions.find((q) => q.id === ABSORB.id);
if (!target) {
  console.error(`Absorb target ${ABSORB.id} not found.`);
  process.exit(1);
}
const priorAnswer = target.correct;
Object.assign(target, ABSORB.set);
stampCorrection(target, { via: 'comments', note: ABSORB.note, from: priorAnswer });
console.log(`absorbed  ${ABSORB.id}  answer ${priorAnswer} -> ${target.correct}`);
console.log(`          ${ABSORB.note}`);

const kept = [];
const dropped = [];
for (const q of questions) {
  if (REMOVE[q.id]) dropped.push(q);
  else kept.push(q);
}

const notFound = Object.keys(REMOVE).filter((id) => !dropped.some((q) => q.id === id));
if (notFound.length) {
  console.error(`\nIds to remove not found: ${notFound.join(', ')}`);
  process.exit(1);
}

console.log('');
for (const q of dropped) console.log(`removed   ${q.id}  ${REMOVE[q.id]}`);

if (!DRY) {
  let out = JSON.stringify(kept, null, 2) + '\n';
  if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(FILE, out, 'utf8');
}

console.log(`\n${DRY ? '[dry run] ' : ''}${before} -> ${kept.length} questions (${dropped.length} removed).`);
