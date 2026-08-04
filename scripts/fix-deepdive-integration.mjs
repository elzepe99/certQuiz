/**
 * Findings from a full read of all 137 Integration Architect questions.
 *
 * Q50 reverts a change made earlier in this repo. The deck holds the same
 * org-merge item twice (Q22 and Q50) and both scrapes keyed Named Credentials
 * plus Composite REST. An earlier pass moved Q50 to the plain REST insert on
 * the reasoning that Composite is "more work", which both contradicted Q22 and
 * got the trade-off backwards: Salesforce documents composite resources as
 * simplifying code and counting the whole series as one call against API
 * limits, which is what makes it the low-effort choice at form-submission
 * volume.
 *
 * Q83 and Q102 are new findings, reasoned rather than documented — see notes.
 * Q124 fixes a term in an option that inverted its meaning.
 *
 *   node scripts/fix-deepdive-integration.mjs [--dry]
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

const ORIGINAL_ANSWER = {
  c7d46b81: 'B,C',
  '8b442951': 'A,B',
  '0e17efb1': 'B,C',
  '8d786996': 'A',
};

const FIXES = {
  c7d46b81: {
    note: 'Q50 B,C -> B,D, reverting an earlier change in this repo. Its twin Q22 keys Named Credentials plus Composite REST, and Salesforce documents composite resources as simplifying code and consuming one API call for the whole series.',
    set: {
      correct: 'B,D',
      explanation:
        'Both orgs are Salesforce, so the retiring org needs only somewhere to authenticate and a way to move the records. Named Credentials supply the target org\'s authentication declaratively, with no credential handling in code (B). Composite REST then carries many leads in a single call: Salesforce documents the composite resources as simplifying code and reducing network overhead, and the whole series counts as one call against API limits — which matters when several public web forms are feeding leads continuously and they must all arrive within 30 minutes (D). Posting each lead individually to the standard sObject endpoint (C) works, but it needs loop, batching and per-record error handling that Composite gives you for free. The Tooling API (A) addresses metadata and developer tooling rather than record CRUD.',
    },
  },
  '8b442951': {
    note: 'Q83 A,B -> A,D. Remote Site Settings is a prerequisite for raw callouts, not a way to absorb an endpoint change; Named Credentials and an ESB both externalise the URL from code, which is what shortens the outage.',
    set: {
      correct: 'A,D',
      explanation:
        'What shortens the outage is having the endpoint live somewhere other than compiled code. A Named Credential holds the URL and its authentication as configuration, so a changed endpoint is a field edit that takes effect immediately with no deployment (A). An enterprise service bus goes further: Salesforce calls the bus, and the new provider URL is repointed in middleware without Salesforce changing at all, which also shields the other consumers of that exchange-rate feed (D). Remote Site Settings (B) is only an allow-list that callouts must satisfy — updating it is necessary if you are calling a raw URL, but it does not remove the hardcoded endpoint from Apex, so a deployment is still needed and the downtime stands. Note also that a callout through a Named Credential does not consult Remote Site Settings at all. CSP Trusted Sites (C) governs browser-side requests from Lightning components, not Apex callouts.',
    },
  },
  '0e17efb1': {
    note: 'Q102 B,C -> B,D. The stem asks for approaches that match the Salesforce UI; an iframe hosting a .NET application is precisely what does not.',
    set: {
      correct: 'B,D',
      explanation:
        'The stem sets two tests: the data must not persist in Salesforce, and the result must match the Salesforce UI. A Visualforce page inherits the platform styling and chrome, so it passes on both counts whether the external call is made server-side from its controller (B) or client-side from JavaScript on the page (D) — the two genuinely different implementations offered here. An iframe embedding a custom .NET application (C) renders that application\'s own interface inside Salesforce, which is the opposite of matching the Salesforce UI however convenient it is to build. Middleware continuously persisting the data into Salesforce (A) fails the other test, since the company has said it needs the data for nothing else. Lightning Experience being switched off is what makes Visualforce, rather than a Lightning component, the vehicle.',
    },
  },
  '8d786996': {
    answerMoved: false,
    note: 'Q124 option A read "Data Visualization", which names a different concept entirely. The pattern is Data Virtualization; the answer was always A.',
    set: {
      optionA: 'Data Virtualization',
      explanation:
        'Sales representatives need to read and write live order data that must never be copied into Salesforce, which is the definition of Data Virtualization: Salesforce Connect exposes the remote orders as external objects, queried on demand and written straight back to the source, with nothing stored locally (A). Data Synchronization (B) and Batch Processing (D) both work by landing copies in Salesforce, which the requirement forbids, and Process Orchestration (C) coordinates multi-step processes across systems rather than surfacing a remote record for viewing and editing.',
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
    via: 'validation',
    note: fix.note,
    from: fix.answerMoved === false ? undefined : before,
  });
  console.log(`Q${String(number).padStart(3)}  ${id}  ${fix.answerMoved === false ? `answer ${q.correct} unchanged` : `${before} -> ${q.correct}`}`);
  console.log(`      ${fix.note}`);
  applied++;
}

if (!DRY) {
  let out = JSON.stringify(questions, null, 2) + '\n';
  if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(FILE, out, 'utf8');
}
console.log(`\n${DRY ? '[dry run] ' : ''}${applied} questions updated.`);
