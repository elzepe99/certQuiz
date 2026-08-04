/**
 * Corrections to the Integration Architect deck, from the questions flagged via
 * in-app comments. Keyed on each question's permanent `id`, so this stays
 * correct regardless of deck order.
 *
 *   node scripts/fix-integration-architect.mjs [--dry]
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

const DIAGRAM_122 =
  ' [Diagram — sequence. User -> UI Component: 1: onClick. UI Component -> Middleware: 2: getSummary (leg A). ' +
  'Middleware -> On-Premise System: 2.1: getSummary (leg B); On-Premise System -> itself: 2.1.1: consolidateInfo (leg C); ' +
  'returns 2.1.2: summary info. Middleware -> 3rd Party System: 2.2: getSummary (leg D); 3rd Party System -> itself: ' +
  '2.2.1: consolidateInfo (leg E); returns 2.2.2: summary info. Middleware -> On-Premise System: 2.3: startAsyncProcess ' +
  '(leg F); On-Premise System -> itself: 2.3.1: process (leg G) — asynchronous, continues after the reply is sent. ' +
  'Middleware -> UI Component: 2.4: consolidated summary, which closes leg A. UI Component -> itself: 3: render (leg H).]';

const DIAGRAM_140 =
  ' [Diagram — sequence. Event1 -> Data Entry Point: 1: start. Data Entry Point -> Middleware: 2: request. ' +
  'Middleware -> Payment System: 2.1: send, marked "fire and forget"; Payment System -> itself: 2.1.1: enqueue. ' +
  'Middleware -> Data Entry Point: 2.2: reply, returned immediately without waiting for processing. ' +
  'Payment System -> itself: 3: process upon dequeue. Separately, Event2 -> Payment System: 4: start; ' +
  'Payment System -> Middleware: 4.1: request; Middleware -> Data Entry Point: 4.1.1: request; ' +
  'Data Entry Point -> Middleware: 4.1.2: reply; Middleware -> Payment System: 4.2: reply.]';

/**
 * The answer each question carried *before* any of this ran. Pinned here rather
 * than read from the file, so re-running the script cannot lose the original —
 * on a second pass the file already holds the corrected value.
 */
const ORIGINAL_ANSWER = {
  '0aaa7b8e': 'D',
  '3262c8d0': 'B',
  cb609eba: 'A',
  f83fef34: 'D',
  '998dcfd8': 'A,D,E',
  a5560b30: 'A,D',
  '319a83b2': 'A,C,E',
  '1412cc42': 'C',
  '46d002e1': 'B',
  '62f27ce6': 'B,D',
  a1c7d77e: 'E',
  '34ad5dd6': 'B',
  fc23a0ff: 'C',
};

/** id -> mutation. `set` overwrites fields; `note` is why (for the run log). */
const FIXES = {
  // ── Wrong answers ────────────────────────────────────────────────────────
  '0aaa7b8e': {
    note: 'Q42 D->A. Its twin Q86 answers Continuation for the identical stem; the deck contradicted itself.',
    set: {
      correct: 'A',
      explanation:
        "The custom Transaction object is incomplete by design between syncs, so the LWC must reach the middleware's Enterprise APIs at view time. Continuation (A) is the platform's mechanism for exactly that: it issues the callout asynchronously and resumes in a callback, so a slow multi-source aggregation doesn't block the request thread or hit the synchronous callout ceiling. Calling the APIs straight from LWC JavaScript (D) pushes endpoint credentials and CSP Trusted Site configuration into the browser and bypasses Apex entirely. Publishing a Platform Event to trigger a sync (B) still leaves a staleness window, and Lightning Data Service (C) can only ever show what the partially-populated custom object holds.",
    },
  },
  '3262c8d0': {
    note: 'Q62 B->A. Requirement 5 names MDM as system of record for customers; option B omits it and invents a Pricing Engine.',
    set: {
      correct: 'A',
      explanation:
        'Requirement 5 names the MDM as the system of record for customers and prospects, so Salesforce cannot own that data and MDM must be integrated — which rules out option B, whose list drops MDM entirely and adds a standalone "Pricing Engine" that appears nowhere in the landscape (requirement 2 makes the ERP the pricing system of record). Option A covers the ERP (pricing for quotes, and the inventory consultants need), the MDM (customer master), the Invoices system (requirement 6), and the Data Warehouse that feeds the BI dashboards in requirement 4.',
    },
  },
  'cb609eba': {
    note: 'Q84 A->D. Target sits behind a firewall, so the external system must initiate; Bulk API fits 2M/day one-way.',
    set: {
      correct: 'D',
      explanation:
        'The destination is a home-grown system behind a corporate firewall, so Salesforce cannot push into it — the external system has to initiate the connection outbound from its own network and pull. At roughly 2 million records per day, one-way and with no real-time requirement, the Bulk API REST endpoint is the interface built for that profile: asynchronous, batched, and governed by limits sized for data loads rather than transactional traffic (D). A third-party staging tool (A) may be convenient but is not required, and the remaining options describe real-time REST patterns that do not fit the volume or the latency tolerance.',
    },
  },
  'f83fef34': {
    note: 'Q93 D->A. Keeping an external system in sync with record changes is CDC\'s purpose; PushTopic is for UI.',
    set: {
      correct: 'A',
      explanation:
        'Keeping the LMS continuously in step with course-registration records is a data-replication requirement, which is what Change Data Capture is built for: it emits create/update/delete/undelete events carrying changed field values, and retains them for 72 hours so a subscriber that drops offline can resume from its ReplayId without losing updates (A). PushTopic-style Streaming API notifications are aimed at refreshing user interfaces rather than reliably synchronising an external datastore, and Outbound Messaging targets a fixed SOAP endpoint rather than a subscribing client.',
    },
  },
  '998dcfd8': {
    note: 'Q95 A,D,E->B,C,D. Requirement 1 forces an external IdP, so "Salesforce native for all" fails; custom auth is an anti-pattern.',
    set: {
      correct: 'B,C,D',
      explanation:
        "Requirement 1 puts internal authentication in each country's local Active Directory, so a Salesforce-native mechanism cannot cover every population (A fails), and hand-building an authentication mechanism per country (E) is an anti-pattern an architect should reject rather than evaluate. What genuinely needs weighing is a split model — Salesforce handling customers and partners while a third-party IdP handles internal users (B) — against a single third-party SSO covering all populations including customers and partners (C), plus the security posture of each internal system and the integration method that satisfies it (D), which is what requirements 4 and 5 demand.",
    },
  },
  'a5560b30': {
    note: 'Q96 A,D->A,B. Declarative/packaged over custom Apex; C is manual.',
    set: {
      correct: 'A,B',
      explanation:
        'Duplicate Management (matching and duplicate rules) stops duplicates at the point of entry declaratively (A), and a proven AppExchange data-management tool handles the bulk merge of the duplicates already in the org (B). Assigning new contacts to a review queue (C) is explicitly manual, and writing a Batch Apex deduplication job (D) means building and maintaining custom merge logic when a packaged solution already covers it — the kind of trade-off an architect is expected to decide against.',
    },
  },
  '319a83b2': {
    note: 'Q112 A,C,E->B,C,E. Bulk ZIP attachment loading is documented; option A\'s wording is not defensible.',
    set: {
      correct: 'B,C,E',
      explanation:
        'Three statements hold up. The Bulk API accepts multiple binary attachments in a single ZIP accompanied by a request.txt manifest (B). The Bulk API processes large batches in parallel, which can produce record-locking contention on the parent of a master-detail relationship when children of the same parent land in different batches (E), while the SOAP API\'s smaller synchronous transactions avoid that contention (C). Option D is backwards — job monitoring in Setup is a Bulk API feature, not SOAP. Option A ("DML limits on Bulk are not governed on Salesforce servers") is the weakest of the set: Bulk operations are still governed, just under asynchronous limits rather than synchronous ones.',
    },
  },
  '1412cc42': {
    note: 'Q131 C->D. Least privilege and audit attribution come from distinct users, not from Connected Apps.',
    set: {
      correct: 'D',
      explanation:
        "Least privilege is enforced through the profile and permission sets of the identity a callout runs as, and the audit trail (LastModifiedBy, field history, login history) records that user — so giving each external system its own integration user is what actually satisfies both requirements (D). A Connected App governs OAuth: which app may connect and with what scopes. Three Connected Apps that all authenticate as one shared user would still grant each system the union of that user's permissions and would blur every record's attribution, which is why C falls short of the stated requirements.",
    },
  },
  '46d002e1': {
    note: 'Q139 B->D. Establish the access-prevention requirement first, then how fast it must propagate.',
    set: {
      correct: 'D',
      explanation:
        'The architect has to pin down what "prevent access" actually means before designing anything — freezing the user, deactivating them, stripping permission sets, and how in-flight sessions are handled all imply different solutions — and then establish how quickly a deactivation in the HR system must take effect in Salesforce (D). That frequency is what decides between event-driven propagation and a scheduled sync. Jumping straight to inbound integration requirements (B) presumes an integration is the answer before the requirement it must satisfy is known.',
    },
  },

  // ── Structural repairs ───────────────────────────────────────────────────
  '330133aa': {
    note: 'Q47 option B was a verbatim copy of option A; restored the intended distractor.',
    set: {
      optionB: 'Replicate the financial transactions into Salesforce nightly using an ETL tool.',
      correct: 'A',
      explanation:
        'Salesforce Connect with an OData adapter surfaces the core banking transactions as external objects, so community users read live data without a single row being copied into Salesforce (A) — decisive when the source produces 10 million transactions a day and the bank must remain the system of record. Replicating that volume nightly via ETL (B) inflates storage, adds sync lag, and duplicates regulated financial data. External Services (C) is for invoking REST actions declaratively from Flow, not for browsing transaction lists, and an iframe (D) sidesteps the platform\'s authentication and sharing model altogether.',
    },
  },
  '62f27ce6': {
    note: 'Q137 B,D->B,C. Composite REST adds work; Named Credentials + a standard REST insert is the least-effort pair, and matches twin Q51.',
    set: {
      correct: 'B,C',
      explanation:
        'Both orgs are Salesforce, so the retiring org only needs somewhere to authenticate and a standard endpoint to call: Named Credentials in the source org supply the target-org authentication declaratively, with no credential handling in code (B), and the standard REST API sObject insert accepts the Lead payload as-is (C). Composite REST (D) exists to batch several subrequests into one call — real work to build for no benefit against a 30-minute SLA on individual form submissions — and the Tooling API (A) addresses metadata and developer tooling rather than record CRUD.',
    },
  },
  'a1c7d77e': {
    note: 'Q115 options B and D were identical and only one answer was marked on a two-answer question; collapsed to four options, answer C,D.',
    set: {
      optionA: 'Store the username/hashed password in a private Static Resource, allowing the Apex callout to read it.',
      optionB: 'Use custom settings to store the username and password allowing the Apex callout to read it.',
      optionC: 'Fire outbound messages to a middleware that stores the credentials instead of an Apex callout.',
      optionD: 'Set up a Named Credential with a Named Principal Identity Type allowing the Apex callout to use it.',
      optionE: '',
      correct: 'C,D',
      explanation:
        'Both recommended options keep the ERP credential out of anything a Salesforce user or developer can read. A Named Credential with a Named Principal identity type stores the system username and password in the platform\'s protected credential store and injects them into the callout at runtime, so the secret never appears in Apex (D). Delegating the call to middleware that holds the credential achieves the same separation, leaving Salesforce with no copy of it at all (C). Static resources (A) and custom settings (B) both leave the password readable to anyone with access to the metadata or the record, which is why neither is acceptable from a security standpoint.',
    },
  },
  fc23a0ff: {
    note: 'Q141 options B and E were identical and only one answer was marked on a two-answer question; deduped, answer B,C. (Found by validation, not by a comment.)',
    set: {
      optionA: 'Write an Apex trigger to send an outbound message to ESB.',
      optionB: 'Update workflow rule conditions to exclude the ERP Order Number field update.',
      optionC: 'Update workflow rule conditions to exclude the Integration User.',
      optionD: 'Update the outbound message to exclude the Integration User.',
      optionE: '',
      correct: 'B,C',
      explanation:
        "The loop exists because the ESB's write-back of the Order Number is itself an Order update, which re-satisfies the workflow rule and fires another outbound message. Both fixes narrow the rule so that write-back no longer qualifies: excluding the ERP Order Number field update means the rule ignores the one field the ESB sets (B), and excluding the Integration User means it ignores anything that identity does (C). Together they close the loop from both directions. Option D misplaces the filter — the outbound message defines what is sent, not when it fires — and option A (A) rebuilds the same trigger condition in Apex without removing the recursion.",
    },
  },
  '34ad5dd6': {
    note: 'Q117 had two options merged into one string ("Unit Testing C .Regression Testing"); split into four distinct options.',
    set: {
      optionA: 'User Acceptance Testing',
      optionB: 'Unit Testing',
      optionC: 'Regression Testing',
      optionD: 'Performance Testing',
      optionE: '',
      correct: 'C',
      explanation:
        'Users reporting that newly released changes break functionality that previously worked is the definition of a regression, and Regression Testing is the program that re-verifies existing behaviour after every change (C). Unit tests (B) validate individual components in isolation and routinely pass while cross-component behaviour breaks; User Acceptance Testing (A) confirms new features meet requirements rather than systematically re-checking old ones; and Performance Testing (D) measures speed and scale, not functional correctness.',
    },
  },

  // ── Diagram questions: answers already correct, stems made self-contained ─
  '0ae13744': {
    note: 'Q122 answer B confirmed against the diagram; embedded a textual rendering so the item is answerable without the image.',
    append: { question: DIAGRAM_122 },
    set: {
      correct: 'B',
      explanation:
        'Leg A is the UI Component\'s call to the Middleware, and it does not close until 2.4 returns the consolidated summary — so legs B through F all run inside A and are already counted by it. Leg G is the asynchronous process started at 2.3, which continues after the Middleware has replied and therefore never delays the user. What remains is leg H, the render. End-to-end perceived time is A + H (B): summing A to H double-counts the nested legs and adds work the user never waits on, and the other options either stop before the render or fold in the async process.',
    },
  },
  'd258eebd': {
    note: 'Q140 answer A,D confirmed against the diagram; embedded a textual rendering so the item is answerable without the image.',
    append: { question: DIAGRAM_140 },
    set: {
      correct: 'A,D',
      explanation:
        'The globally unique identifier minted at the Data Entry Point is what lets the Payment System recognise a request it has already handled and process it exactly once, which is what keeps the SLA intact without duplicate payments (A). The concurrent-update errors come from the fire-and-forget hop at 2.1 leaving no single component in charge of ordering, so having the Middleware coordinate delivery and processing serialises the writes to a given Payment Request record (D). Automatic retries (B and C) resend requests that may already be in flight — without idempotency and coordination in place first, they multiply both the duplicate processing and the update contention.',
    },
  },

  // ── Answers confirmed correct; explanations sharpened to address the note ─
  'ebe2fbcc': {
    note: 'Q66 B,D confirmed. Explanation now says why A is an availability problem rather than a security one.',
    set: {
      explanation:
        'The question asks specifically for security issues. Credentials that must be stored somewhere to be replayed are exposed to whoever can read that store, and an attacker who obtains them inherits a System Administrator session (B); and because the profile is System Administrator, every back-end system using it can reach all data rather than the narrow slice it needs (D). Option A is a genuine risk, but it is an availability and operational-continuity problem — a password reset breaks the integration, it does not expose anything — which is why it falls outside what this question asks for. Option C describes normal platform behaviour rather than a flaw of this approach.',
    },
  },
  'c19a756b': {
    note: 'Q61 A confirmed. Explanation now addresses why D does not fit.',
    set: {
      explanation:
        "A 7-12 second lookup sits beyond the 10-second synchronous Apex callout ceiling, yet the address has to be confirmed before the order can proceed. Workflow-driven Outbound Messaging fires asynchronously with guaranteed delivery and retry for up to 24 hours, and the callback returns the validation result into Salesforce without holding a user thread open (A). Middleware-initiated Remote Invocation (D) inverts the trigger — the legacy system would have to know when a Salesforce address needs checking — which does not fit a validation that must happen on demand at order entry. A nightly batch (B) is far too slow, and an @Future callout (C) still offers no delivery guarantee back into the record.",
    },
  },
  'ca753119': {
    note: 'Q100 D confirmed. Explanation now addresses the A/B/C reasoning in the note.',
    set: {
      explanation:
        'Process Builder invoking an Apex proxy class is the supported path for firing a callout automatically when the Opportunity reaches Closed/Won with products attached (D). The note in the comment is right that A and B are both asynchronous — Apex cannot make a callout directly from a trigger, so option A necessarily defers to @future or Queueable, and the batch job in B runs hourly by definition. Option C does perform a genuinely synchronous callout, but it only runs when a user clicks a button, which does not satisfy a requirement stated in terms of the status changing.',
    },
  },
  '3f678446': {
    note: 'Q123 B,C confirmed. Explanation now addresses why D is excluded.',
    set: {
      explanation:
        'A Per-User Named Credential only helps where the callout executes in the context of an identifiable running user. Process Builder invoking an invocable or @future Apex callout preserves that context when the Order status changes (B), and Salesforce Connect with OData 2.0 supports per-user identity for external object reads and writes (C). Option D is worth pausing on: a Visualforce page with an Apex callout genuinely can use a per-user Named Credential, so the security setup is not the problem — it fails because the requirement is that order information be sent when the status changes to Confirmed, and a Visualforce page requires a user to navigate to it. Outbound messaging (A) runs as the automated process user, which defeats per-user identity entirely.',
    },
  },
  '172d35f9': {
    note: 'Q134 B,C confirmed. Explanation now addresses why A is not the answer.',
    set: {
      explanation:
        'The question asks what these two components must be able to do. The Community portal cannot hold identifiable prescriptions, so it needs callouts to the secure system\'s RESTful services to retrieve them on demand for an authorised user (C), and Einstein Analytics needs de-identified data bulk-loaded for the small analyst group (B). Encryption in transit and at rest (A) is certainly required, but policy 1 already imposes it on the secure system, and it is a baseline control rather than a capability the portal or Analytics has to provide. Storing identity tokens (D) would place identifiable material outside the secure database, breaking policy 1 outright.',
    },
  },
  '86b274f6': {
    note: 'Q138 A,B,D confirmed. Explanation now walks every option, per the "feels incomplete" note.',
    set: {
      explanation:
        'The requirement is an inbound, SOAP-based update of the Salesforce Account whenever the financial system changes, and three capabilities follow from it. The Enterprise WSDL provides a strongly-typed, org-specific SOAP contract (A). The Partner WSDL provides a loosely-typed SOAP contract that works across orgs (B). The Partner WSDL is also what allows field names to be inspected at runtime rather than compiled in, which matters when the financial system\'s payload varies (D). The two rejected options misattribute a capability to the wrong technology: the Partner WSDL is SOAP, not REST (C), and the Streaming API pushes change notifications outward rather than supporting runtime field inspection (E).',
    },
  },
  'a2ae17cb': {
    note: 'Q15 A,C,E confirmed. Explanation now engages with the Named Credentials point in the note.',
    set: {
      explanation:
        'Context-driven authorisation (A) scopes the call to the customer the agent is already servicing, so no broader search or access is needed. Enterprise security needs (C) capture the encryption, IP allow-listing, and audit obligations that apply to billing data. Seamless authentication into both back-ends (E) removes per-system credentials, typically via SAML or OAuth. Option B deserves the scrutiny it got in the comment: Named Credentials genuinely are how you hold DMS and EBS authentication in Salesforce, and they are often what makes E achievable. It is marked incorrect here because the question asks what to consider about authorisation and authentication needs, and B jumps to maintaining credential details in Salesforce — an implementation choice, and one that sits awkwardly with least privilege when the back-ends already restrict access per user. Treat it as a soft distractor rather than a clear falsehood. Option D is a migration decision, not an auth concern.',
    },
  },
};

const questions = JSON.parse(readFileSync(FILE, 'utf8'));
const byId = new Map(questions.map((q, i) => [q.id, { q, number: i + 1 }]));

let applied = 0;
const missing = [];

for (const [id, fix] of Object.entries(FIXES)) {
  const hit = byId.get(id);
  if (!hit) {
    missing.push(id);
    continue;
  }
  const { q, number } = hit;
  const before = ORIGINAL_ANSWER[id] ?? q.correct;

  if (fix.append) {
    for (const [k, v] of Object.entries(fix.append)) {
      if (!q[k].includes(v.trim().slice(0, 40))) q[k] = q[k] + v;
    }
  }
  if (fix.set) Object.assign(q, fix.set);

  // Q141 surfaced from the deck validator rather than from a reader's comment.
  const via = /Found by validation/i.test(fix.note) ? 'validation' : 'comments';
  stampCorrection(q, { via, note: fix.note, from: before });

  const after = q.correct;
  const change = before === after ? `answer ${after} (unchanged)` : `answer ${before} -> ${after}`;
  console.log(`Q${String(number).padStart(3)}  ${id}  ${change}`);
  console.log(`      ${fix.note}`);
  applied++;
}

if (missing.length) {
  console.error(`\nIds not found in deck: ${missing.join(', ')}`);
  process.exit(1);
}

if (!DRY) {
  const raw = readFileSync(FILE, 'utf8');
  let out = JSON.stringify(questions, null, 2) + '\n';
  if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(FILE, out, 'utf8');
}

console.log(`\n${DRY ? '[dry run] ' : ''}${applied} questions updated.`);
