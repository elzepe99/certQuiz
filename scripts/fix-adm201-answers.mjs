/**
 * Correct wrong answers in the merged ADM-201 deck.
 *
 * Found by reading all 154 items against Salesforce behavior. Two signals did
 * most of the work:
 *
 *   - The explanation argues for a different option than `correct` names. These
 *     are the safest fixes: freecram's own prose contradicts its own answer key,
 *     so no outside judgement is needed to know one of them is wrong (#100,
 *     #113, #145).
 *   - The explanation and the answer agree, but both are factually wrong about
 *     Salesforce (#129, #140, #143, #147, #152). Each of those is spelled out
 *     below, because overriding a self-consistent source needs a stated reason.
 *
 * A second pass then took the five items that had been left as judgement calls —
 * #85, #97, #98, #119, #128 — and checked each against Salesforce's own
 * documentation rather than against intuition. All five turned out to be wrong,
 * which is worth remembering: "self-consistent with its explanation" is weak
 * evidence when the explanation was generated alongside the answer key. Each of
 * those entries cites the specific documented fact that settles it.
 *
 * #95 is a different kind of fix: the marked answer is the only defensible
 * option, but its text stated the wrong retention period, so the option itself
 * is corrected rather than the key.
 *
 *   node scripts/fix-adm201-answers.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stampCorrection } from './lib/corrections.mjs';

const FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'freecram-scraper',
  'questions_adm201_merged.json',
);
const DRY = process.argv.includes('--dry');

/** This review ran after the repo-wide CORRECTION_DATE, so it stamps its own. */
const REVIEWED = '2026-08-07';

/**
 * Documentation backing each correction, keyed by question number.
 *
 * EVERY URL BELOW WAS LOADED IN A BROWSER AND CONFIRMED TO RENDER THE EXPECTED
 * ARTICLE. That bar is not pedantry: a first draft cited the Spring '20 release
 * note for enhanced related lists at releasenotes.docs.salesforce.com, and both
 * it and its help.salesforce.com equivalent turned out to 404. Salesforce help
 * is a single-page app that answers every id — real or invented — with the same
 * 200 and the same shell, so neither an HTTP status nor a search-result listing
 * proves an article exists. Only rendering it does.
 *
 * Candidate URLs that were not confirmed this way have been dropped rather than
 * shipped on the assumption they resolve. Each question keeps at least one
 * verified link.
 *
 * The app splits these out of the explanation on a trailing "References:" line
 * and renders them as links, so they are appended rather than written into prose.
 */
const REFERENCES = {
  85: [
    'https://help.salesforce.com/s/articleView?id=platform.users_deactivate_considerations.htm&language=en_US&type=5',
    'https://help.salesforce.com/s/articleView?id=000386275&language=en_US&type=1',
  ],
  95: ['https://help.salesforce.com/s/articleView?id=sf.fields_managing_deleted_fields.htm&language=en_US&type=5'],
  97: ['https://help.salesforce.com/s/articleView?id=sf.workflow_time_dependent.htm&language=en_US&type=5'],
  98: ['https://help.salesforce.com/s/articleView?id=platform.lightning_app_builder_create_dynamic_related_list.htm&language=en_US&type=5'],
  100: ['https://help.salesforce.com/s/articleView?id=sales.faq_forecasts_category_mapping.htm&language=en_US&type=5'],
  113: ['https://help.salesforce.com/s/articleView?id=sf.distribution_installing_packages.htm&language=en_US&type=5'],
  119: ['https://help.salesforce.com/s/articleView?language=en_US&id=sf.security_require_2fa_api.htm&type=5'],
  128: ['https://trailhead.salesforce.com/content/learn/projects/build-a-discount-approval-process/prepare-your-org'],
  129: ['https://help.salesforce.com/s/articleView?id=sf.setting_the_fiscal_year.htm&language=en_US&type=5'],
  140: ['https://help.salesforce.com/s/articleView?language=en_US&id=sf.flow_considerations_trigger_record.htm&type=5'],
  143: ['https://help.salesforce.com/s/articleView?id=sf.security_sharing_rules_owner.htm&type=5&language=en_US'],
  145: ['https://help.salesforce.com/s/articleView?language=en_US&id=platform.lightning_page_types.htm&type=5'],
  147: ['https://help.salesforce.com/s/articleView?id=platform.flow_build_data_update.htm&language=en_US&type=5'],
  152: ['https://help.salesforce.com/s/articleView?language=en_US&id=platform.flow_considerations_feature_variable.htm&type=5'],
};

/**
 * Keyed by 1-based position in the merged file. `match` is a snippet of the stem
 * that must still be present — a guard so a reordered deck fails loudly instead
 * of rewriting the wrong question.
 */
const FIXES = [
  {
    n: 85,
    match: 'wants to deactivate a User who has left the company',
    to: 'B,C',
    explanation:
      "Salesforce's considerations for deactivating users name both of these. A user selected in a " +
      'custom hierarchy field cannot be deactivated — the save fails with "Cannot inactivate user ' +
      'that is the value of a hierarchy field" — and the block persists even if the field is ' +
      'deleted, until the field is permanently erased. A user who is the sole recipient of a ' +
      'workflow email alert is likewise blocked.\nTerritory assignment prevents nothing: ' +
      'deactivating a user removes them from their territories automatically. Being highest in the ' +
      'role hierarchy is no obstacle either — the role is simply left without an active user.',
    note:
      'Checked against the official considerations for deactivating users. A custom hierarchy field ' +
      'and a sole workflow-email-alert recipient are both documented blockers; territory membership ' +
      'is explicitly not one, since deactivation removes territory assignments by itself.',
  },
  {
    n: 95,
    match: 'decided to delete a custom field',
    to: 'A',
    setOptions: { optionA: 'The data in the field is stored for 15 days.' },
    explanation:
      'Deleting a custom field does not destroy its data straight away. The field and its contents ' +
      'move to the Deleted Fields list for that object and stay there for 15 days. During that ' +
      'window you can undelete the field, and its data returns with it, or erase it to hard-delete ' +
      'immediately. After 15 days Salesforce purges it permanently.\nTwo details worth holding on ' +
      'to: the field keeps counting against the object\'s custom field limit until it is purged, ' +
      'and it is the Deleted Fields list in Object Manager that holds it — not the record ' +
      'Recycle Bin.',
    note:
      'The answer was right but its text was not: Salesforce retains a deleted custom field and its ' +
      'data for 15 days, not 20, and recovery is from the Deleted Fields list in Object Manager ' +
      'rather than the Recycle Bin. The option and explanation are corrected; the key stays A.',
  },
  {
    n: 97,
    match: 'close an opportunity as won',
    to: 'A,B',
    explanation:
      'Both halves of the requirement are "create a task", and the two things here that can do that ' +
      'on a schedule are Process Builder and Workflow Rules. A workflow rule creates the immediate ' +
      'task when the stage becomes Closed Won, and a time trigger — an offset of up to 999 days ' +
      'from a date field on the record — creates the 60-day check-in. Process Builder achieves the ' +
      'same with immediate and scheduled actions on one criteria node.\nA Field Update is an action ' +
      'available inside those tools rather than a tool in its own right, and it can only overwrite ' +
      'a field; it cannot create a task. An Outbound Message sends data to an external endpoint.\n' +
      'Worth knowing in practice: Workflow Rules reached end of support on 31 December 2025, and ' +
      'new automation of this shape is built with scheduled paths in Flow Builder.',
    note:
      'A Field Update cannot create a task, so it can never satisfy a requirement whose every step ' +
      'is "create a task" — and it is an action inside an automation tool, not a tool. Process ' +
      'Builder and Workflow Rules are the two options that can create both the immediate and the ' +
      'time-delayed task.',
  },
  {
    n: 98,
    match: 'when referencing the contact record',
    to: 'C,D',
    explanation:
      'Two settings are involved, in two different places. The columns themselves come from the ' +
      'page layout editor: edit the Cases related list there and add Case ID, Customer Name, Case ' +
      'Reason and the rest. But a standard related list in Lightning Experience renders only four ' +
      'columns, so the six requested fields will not all appear. Setting the Related List ' +
      "component's Related List Type to Enhanced List in the Lightning App Builder raises the limit " +
      'to ten columns, and adds column resizing, sorting and text wrapping.\nLeaving the type as ' +
      'the plain Related List keeps the four-column cap, and the related list type cannot be set ' +
      'from the page layout editor at all.',
    note:
      'Six fields were requested, and a standard Lightning related list displays at most four ' +
      'columns; Enhanced List raises that to ten. The previously marked plain "Related List" type ' +
      'would silently drop two of the six fields.',
  },
  {
    n: 119,
    match: 'attempts to log in to Data Loader',
    to: 'A,C',
    explanation:
      'Requiring multi-factor authentication for API logins means the Data Loader sign-in now needs ' +
      'a verification code, and a user who has no registered method is walked through enrolling one ' +
      'on that first attempt. That is the two prompts: install a TOTP authenticator app on a mobile ' +
      'device, then connect it to the Salesforce account by scanning the QR code or pasting the ' +
      'security key shown during enrolment.\nCodes delivered by email or SMS are not accepted as ' +
      'Salesforce MFA verification methods, so no such prompt appears. A security token is a ' +
      'separate mechanism appended to the password for API access — it is emailed when reset rather ' +
      'than requested at login, so it is not one of the prompts either.',
    note:
      'Email and SMS codes are not valid Salesforce MFA verification methods, so the previously ' +
      'marked option cannot describe a real prompt. Enrolling a TOTP app is a two-step sequence — ' +
      'install the app, then connect it to the account — which is what the user is actually asked for.',
  },
  {
    n: 100,
    match: 'predict upcoming revenue',
    to: 'C,D',
    explanation:
      'Forecasting is the feature that projects revenue across future fiscal periods, which is what ' +
      'lets a sales director see what is expected to close in coming quarters and measure reps ' +
      'against it. Forecasting rests on Opportunity Stages: each stage carries a probability and ' +
      'maps to a forecast category, and that mapping is what turns an open pipeline into a revenue ' +
      'projection.\nSales Quotes are customer-facing pricing documents and project nothing (note ' +
      'that quotes are not the same thing as sales quotas). An Opportunity List View shows the ' +
      'records that exist today but makes no prediction about future quarters.',
    note:
      'The marked answer left out Forecasting entirely, which is the one feature that actually ' +
      'predicts revenue by fiscal quarter. Its own explanation argues for Forecasting and ' +
      'Opportunity Stages and never mentions the two options it had marked correct.',
  },
  {
    n: 113,
    match: 'installing a managed package in a sandbox',
    to: 'B,D',
    explanation:
      "A package's install URL points at login.salesforce.com, which resolves to production, so to " +
      'install into a sandbox the administrator replaces login with test in that URL. And because ' +
      'refreshing a sandbox rebuilds it from its source org, a package installed only in the ' +
      'sandbox disappears at the next refresh unless the source org carries it too.\n' +
      'Install for Admins Only is one of three install options — alongside Install for All Users ' +
      'and Install for Specific Profiles — not the only one available. Metadata changes made inside ' +
      'a sandbox do have to be reproduced in production, but that is true of any sandbox work and ' +
      'is not specific to installing a managed package.',
    note:
      'The explanation names the modified test.salesforce.com install link and the loss of the ' +
      'package on sandbox refresh — B and D. The answer key had C, which is simply false: ' +
      'Install for Admins Only is one of several install options, not the only one.',
  },
  {
    n: 128,
    match: 'opportunity discounts over 30%',
    to: 'A,B',
    explanation:
      'Both are prerequisites that must be in place before the process can be built. Discount is ' +
      'not a standard field on Opportunity, so a custom field has to exist to hold the percentage ' +
      'that the entry criteria and steps will test. And routing a step to "the user\'s manager" ' +
      'uses the Manager field on the submitter\'s user record — if that field is empty the approval ' +
      "has nowhere to go. Salesforce's own Build a Discount Approval Process walkthrough sets up " +
      'both before creating the process.\nTwo separate approval processes are not required: a ' +
      'single process with conditional steps covers both tiers, routing anything over 10% to the ' +
      'manager and escalating over 30% to the VP. Letting the submitter choose the approver by hand ' +
      'would defeat the point of routing by discount size.',
    note:
      'Routing to "the user\'s manager" only works if the Manager field on the user record is ' +
      'populated, which makes it a genuine prerequisite. Two separate approval processes are not ' +
      'one: a single process with conditional steps handles both the 10% and 30% tiers.',
  },
  {
    n: 129,
    match: 'Fiscal Year that starts on February 1',
    to: 'C',
    explanation:
      'Standard fiscal years in Salesforce follow the Gregorian calendar but may begin on the first ' +
      'day of any month, so a twelve-month year beginning 1 February is precisely a standard fiscal ' +
      'year with February chosen as the starting month.\nCustom fiscal years exist for structures ' +
      'that do not map onto calendar months at all — 4-4-5 period layouts, 13-period years, or ' +
      'quarters built from a set number of weeks. Choosing Custom here would mean defining every ' +
      'period by hand to reproduce what the standard setting already provides, and once a custom ' +
      'fiscal year is enabled the feature cannot be turned back off.',
    note:
      'A standard fiscal year in Salesforce may begin on the first day of ANY month, so a ' +
      '12-month year starting 1 February is exactly a standard fiscal year. Custom fiscal years ' +
      'exist for structures that do not follow calendar months (4-4-5, 13 periods). The ' +
      'explanation\'s claim that a standard year must start on January 1 is wrong.',
  },
  {
    n: 140,
    match: 'automatically create a renewal opportunity',
    to: 'B',
    setQuestion: (q) =>
      q.replace(/Which two automation tools should an administrator use/i, 'Which automation tool should an administrator use')
        .replace(/\s*Choose 2 answers\s*$/i, ''),
    explanation:
      'Creating a renewal opportunity means inserting a record, and Flow Builder is the only tool ' +
      'offered here that can do that: a record-triggered flow fires when the opportunity closes, and ' +
      'a Create Records element builds the renewal from the closing deal.\nA validation rule only ' +
      'blocks a save when a condition fails — it can never create anything. An approval process ' +
      'routes an existing record for sign-off, and a sharing rule governs who can see a record, ' +
      'neither of which produces a new opportunity.',
    note:
      'A validation rule cannot create a record, so it can never be half of the answer here. The ' +
      'explanation argues for "Flow Builder and Process Builder", but Process Builder is not among ' +
      'the options — the source lost it. Only Flow Builder is defensible, so the item is now a ' +
      'single-answer question rather than a "choose 2" with one impossible half.',
  },
  {
    n: 143,
    match: 'share records owned by sales team A',
    to: 'D',
    explanation:
      'An owner-based sharing rule shares records according to who owns them: set it to share the ' +
      'records owned by the Sales Team A role with the Sales Team B role, and every current and ' +
      'future record follows automatically.\nManual sharing grants access one record at a time and ' +
      'is performed by the record owner, so it neither scales to a whole team nor is something an ' +
      'administrator configures centrally. The role hierarchy only grants access upward, which is ' +
      'why the shared Manager role can see both teams\' records while the two peer roles still ' +
      'cannot see each other\'s. Criteria-based sharing keys off field values on the record rather ' +
      'than off its owner, so it does not express "owned by Sales Team A".',
    note:
      'Sharing the records owned by one role with another peer role is the textbook use of an ' +
      'owner-based sharing rule. Manual sharing is a per-record action taken by the owner, not ' +
      'something an administrator configures for a whole team.',
  },
  {
    n: 145,
    match: 'Lightning App Builder',
    to: 'C,D',
    explanation:
      'Lightning App Builder builds App pages, Home pages, Record pages and Email Application panes. ' +
      'The two that matter for the Salesforce mobile app are the App page — a custom page of ' +
      'components that appears as an item in the mobile navigation menu — and the Record page, which ' +
      'lays out an individual record for viewing and editing.\nThere is no User page or Dashboard ' +
      'page type in App Builder. Dashboards are built in the Reports and Dashboards tools and can ' +
      'only be surfaced on a Lightning page as a component.',
    note:
      'The explanation states outright that App page and Record page are the App Builder page ' +
      'types and that User page and Dashboard page are not — while the answer key marked the ' +
      'latter two.',
  },
  {
    n: 147,
    match: "status of the account to 'Audited'",
    to: 'C',
    explanation:
      'Recording the date a status changed means writing a value into the Audited Date field, and a ' +
      'record-triggered flow on Account does exactly that: when Status becomes "Audited", an Update ' +
      'Records element stamps the date into the field, where it then stays.\nA formula field fails ' +
      'here for two separate reasons. It is read-only and computes a value for display rather than ' +
      'storing one, so it cannot populate a different field. And a formula returning TODAY() ' +
      're-evaluates every day, so it would always show the current date rather than the day the ' +
      'account was audited.',
    note:
      'A formula field is read-only and cannot write a value into another field. It would also ' +
      'give the wrong result: TODAY() re-evaluates every day, so the stamp would drift instead of ' +
      'recording when the status changed. Writing a date on a field change needs Flow Builder.',
  },
  {
    n: 152,
    match: 'store the ID of record type',
    to: 'B',
    explanation:
      'Flow variable data types are Text, Number, Currency, Boolean, Date, Date/Time, Picklist, ' +
      'Multi-Select Picklist, Record and Apex-Defined. There is no ID type, so a record type id — an ' +
      '18-character string — is held in a Text variable.\nA Record variable stores a whole record ' +
      'and its fields rather than a single id value, and a Boolean holds only true or false.',
    note:
      'Flow has no ID data type. Its variable types are Text, Number, Currency, Boolean, Date, ' +
      'Date/Time, Picklist, Multi-Select Picklist, Record and Apex-Defined — a record type id is ' +
      'held in a Text variable.',
  },
];

const raw = readFileSync(FILE, 'utf8');
const questions = JSON.parse(raw);

let applied = 0;
for (const fix of FIXES) {
  const q = questions[fix.n - 1];
  if (!q) {
    console.error(`#${fix.n} is out of range (deck has ${questions.length}).`);
    process.exit(1);
  }
  if (!q.question.includes(fix.match)) {
    console.error(`#${fix.n} does not match guard ${JSON.stringify(fix.match)} — deck reordered?`);
    console.error(`  found: ${q.question.slice(0, 100)}`);
    process.exit(1);
  }

  const from = q.correct;
  q.correct = fix.to;
  if (fix.setQuestion) q.question = fix.setQuestion(q.question);

  // Used when the key is right but an option states something false, so the
  // option is what has to change rather than the answer.
  for (const [field, value] of Object.entries(fix.setOptions ?? {})) {
    if (!(field in q)) {
      console.error(`#${fix.n} has no field ${field}.`);
      process.exit(1);
    }
    q[field] = value;
  }

  // The scraped explanation argues for the answer that was just replaced, so
  // leaving it would put the prose in direct contradiction with the key the app
  // marks correct. Every fix therefore ships a replacement explanation.
  if (!fix.explanation) {
    console.error(`#${fix.n} changes the answer but supplies no replacement explanation.`);
    process.exit(1);
  }
  const refs = REFERENCES[fix.n];
  if (!refs?.length) {
    console.error(`#${fix.n} has no verified reference. Add one to REFERENCES or drop the fix.`);
    process.exit(1);
  }
  // The app splits on a trailing "References:" line and takes one URL per line.
  q.explanation = `${fix.explanation}\nReferences:\n${refs.join('\n')}`;

  stampCorrection(q, { via: 'validation', note: fix.note, from, date: REVIEWED });

  applied++;
  const move = from === q.correct ? `${from} (unchanged)` : `${from} -> ${q.correct}`;
  const opts = fix.setOptions ? `, ${Object.keys(fix.setOptions).join('/')} reworded` : '';
  console.log(
    `#${String(fix.n).padStart(3)}  ${move}  (explanation rewritten${opts}, ${refs.length} ref${refs.length > 1 ? 's' : ''})`,
  );
  console.log(`      ${q.question.slice(0, 96)}`);
}

if (!DRY) {
  let out = JSON.stringify(questions, null, 2) + '\n';
  if (raw.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  writeFileSync(FILE, out, 'utf8');
}

console.log(`\n${DRY ? '[dry run] ' : ''}${applied} answer(s) corrected across ${questions.length} questions.`);
