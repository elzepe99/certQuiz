/**
 * Resolve the three Integration Architect questions that pit PushTopic against
 * Change Data Capture, and which had comments sitting on them with no visible
 * outcome either way.
 *
 * Q44/Q49 flip to the CDC statement. Salesforce's Change Data Capture security
 * documentation says outright that CDC "ignores sharing settings and sends
 * change events for all records of a Salesforce object", which makes "CDC does
 * not have record access support" straightforwardly true. The PushTopic option
 * is also defensible -- its payload is shaped by the SOQL SELECT -- so the item
 * really does carry two true statements. The CDC one is the claim the docs
 * state in as many words, so it wins.
 *
 * Q71 is upheld: it asks which event type suits a query-scoped dashboard
 * counter, which is what PushTopic exists for, so the answer stands and the
 * question is stamped as reviewed rather than corrected.
 *
 *   node scripts/fix-streaming-questions.mjs [--dry]
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

const ORIGINAL_ANSWER = { '29162f65': 'A', '7b5ecf20': 'B', '7df8a821': 'A' };

const FIXES = {
  '29162f65': {
    note: 'Q44 A->B. Salesforce documents that CDC ignores sharing settings and sends change events for all records, so "CDC does not have record access support" is the doc-backed true statement.',
    set: {
      correct: 'B',
      explanation:
        'Salesforce states plainly that Change Data Capture ignores sharing settings and delivers change events for all records of an object — so "Change Data Capture does not have record access support" is true, and it is the statement the documentation makes in as many words (B). Note that CDC does still enforce field-level security: a subscriber receives every record\'s change, but only the fields they are permitted to see. Option C is false, since CDC events are generated automatically from record changes rather than published from Apex, and D is false because Apex triggers can subscribe to platform events and change events but not to generic events. Option A deserves an honest caveat: a PushTopic payload is shaped by its SOQL SELECT clause, so it is customisable in a limited sense, which makes this a weak item with two arguably true statements. The CDC claim is the one to pick, because "custom payload" describes generic streaming — where you post an arbitrary body — far better than it describes choosing fields from a single queried object.',
    },
  },
  '7b5ecf20': {
    note: 'Q49 B->A. Same reasoning as its twin Q44: the CDC record-access statement is the documented one.',
    set: {
      correct: 'A',
      explanation:
        'The three-option variant of the same item, and it resolves the same way. Change Data Capture ignores sharing settings and sends change events for every record of an object, so it has no record-level access support (A) — though it does respect field-level security, delivering only the fields the subscriber may view. Change events are generated automatically from record changes and cannot be published from Apex, so C is false. Option B, that PushTopic events can define a custom payload, is not simply wrong — the SOQL SELECT clause determines which fields appear — but it is the softer claim, since the payload is confined to fields of the queried object rather than an arbitrary schema. Pick the CDC statement, which the documentation asserts directly.',
    },
  },
  '7df8a821': {
    upheld: true,
    note: 'Reviewed against the comment suggesting Change Data Capture. The answer stands: this asks for a query-scoped counter feeding a dashboard, which is what PushTopic is for. Note the opposite call on Q93, deliberately — CDC there, PushTopic here.',
    set: {
      explanation:
        'A PushTopic is defined by a SOQL query, so it can watch precisely the records that matter — closed Cases — and notify the dashboard component as records start matching, which is exactly the shape of this requirement (A). Change Data Capture would also surface the changes, but it emits every change on the object with no query criteria, leaving the component to filter the stream itself; it is built for replicating data to an external system rather than driving a UI counter. That is the distinction worth carrying into the exam, and it is why this question and the LMS-synchronisation question resolve in opposite directions. Platform and generic events (C and D) are custom message channels that are not raised by record changes at all. One caveat: Salesforce now labels PushTopic events legacy and steers new work toward CDC, so expect the real-world answer to drift even though it remains the intended one here.',
    },
  },
};

const raw = readFileSync(FILE, 'utf8');
const questions = JSON.parse(raw);
const byId = new Map(questions.map((q, i) => [q.id, { q, number: i + 1 }]));

let applied = 0;
for (const [id, fix] of Object.entries(FIXES)) {
  const hit = byId.get(id);
  if (!hit) {
    console.error(`Id not found: ${id}`);
    process.exit(1);
  }
  const { q, number } = hit;
  const before = ORIGINAL_ANSWER[id] ?? q.correct;
  Object.assign(q, fix.set);
  stampCorrection(q, {
    via: 'comments',
    note: fix.note,
    from: fix.upheld ? undefined : before,
  });
  if (fix.upheld) q.corrected.upheld = true;

  console.log(
    `Q${String(number).padStart(3)}  ${id}  ${fix.upheld ? `answer ${q.correct} upheld` : `${before} -> ${q.correct}`}`,
  );
  console.log(`      ${fix.note}`);
  applied++;
}

if (!DRY) {
  let out = JSON.stringify(questions, null, 2) + '\n';
  if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(FILE, out, 'utf8');
}
console.log(`\n${DRY ? '[dry run] ' : ''}${applied} questions resolved.`);
