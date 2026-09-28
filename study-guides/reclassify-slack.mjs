// Independent re-classification of the Salesforce_Slack_Consultant_Questions deck against the
// OFFICIAL exam outline, assigned by reading each question's stem + keyed option.
//
// The deck's own _cat tags (Compliance & Data Governance, Analytics & Reporting, Discovery &
// Consulting, Enterprise Grid & Channel Design, Channel Management, Security & Identity
// Management, Slack Connect & Security, Training & Enablement, Migration, Administration
// Roles, Troubleshooting) are eleven topic labels. Several split what the outline treats as
// one domain -- analytics, identity, compliance, app approval and channel-management settings
// are ALL "Policies and Settings" -- so the table below is the only view of where the weight
// actually sits.
//
// THE OUTLINE IS A SALESFORCE HELP ARTICLE, NOT A SLACK PAGE. Slack's consultant credential
// is now "Salesforce Certified Slack Consultant" and its guide sits in the same 0052989xx
// block as the other Salesforce certifications, next to Slack Developer (005298987) and Slack
// Administrator (005298990):
//
//   https://help.salesforce.com/s/articleView?id=005298991&type=1&language=en_US
//   read 2026-09-28; 60 scored + up to 5 unscored, 90 minutes, 67% to pass, Summer '24
//   alignment, US$200. Found by WebSearch on help.salesforce.com, whose top hit was
//   trailhead.salesforce.com/help?article=Salesforce-Certified-Slack-Consultant-Exam-Guide --
//   a NAMED redirect that lands on the numeric id, worth trying first on any Salesforce exam.
//
//   DM     Delivery and Migration (17%)             - delivery best practices, Slack / Partner /
//                                                    client roles, the end-to-end migration,
//                                                    pre-migration activities, executing one
//   DISC   Discovery (10%)                          - articulate value, research the client, ask
//                                                    about goals, vision statement and success
//                                                    metrics, ask about security and policy
//   GRID   Grid Design (15%)                        - discovery outputs into a design, best
//                                                    practices, feasible options, sign-off
//   POL    Policies and Settings (22%)              - stakeholders agree settings, admin roles
//                                                    and their permissions, analytics dashboard,
//                                                    identity management, org-level security,
//                                                    compliance, channel-management settings,
//                                                    Slack Connect settings, app approval
//   CHAN   Channel Strategy (10%)                   - channel basics, naming conventions, use
//                                                    cases, workflows (onboarding, standup)
//   GOV    Governance Structure (8%)                - the governance team and role assignment,
//                                                    the admin support model, admin processes
//                                                    that can move into Slack
//   LEARN  Learning and Enablement (18%)             - experiential learning, admin and user
//                                                    curricula, materials, live sessions,
//                                                    troubleshooting, rollout comms plan
//
// Boundary rules, so the next import is classified the same way:
//   - "Which ROLE can do X without billing access" is POL (the roles-and-permissions bullet).
//     "WHO SHOULD BE ASSIGNED the top role" is GOV (identify the governance team and assign
//     roles). The two twin pairs split cleanly on that line: cb206cbe / 60708c05 are POL,
//     1d57f94c / ff8a88a6 are GOV.
//   - WHO MAY CREATE CHANNELS is a channel-management SETTING, so POL, not CHAN. CHAN is
//     naming, use cases, basics and workflows.
//   - Troubleshooting a user's audio or connection is LEARN -- the outline puts "Troubleshoot
//     common Slack issues for users" under Learning and Enablement.
//   - "Global settings with regional adjustments" (c2a30421) is GRID: it is an org-versus-
//     workspace design question, which is what an Enterprise Grid design decides.

export const CALLS = {
  // DM (3)
  '96be8a94':'DM', '663ae7a0':'DM', '6b9124ed':'DM',
  // DISC (4)
  '70cfc31f':'DISC', '4c998d54':'DISC', 'a401a105':'DISC', '4953a8af':'DISC',
  // GRID (2)
  'a0bf9e87':'GRID', 'c2a30421':'GRID',
  // POL (13)
  '296ced65':'POL', '535baa2b':'POL', '6b1ec162':'POL', 'd1ec6012':'POL', 'd1458b4b':'POL',
  '10bdf793':'POL', '2169924a':'POL', '989f370e':'POL', '47e8ec41':'POL', '60708c05':'POL',
  'cb206cbe':'POL', '6bfcfbed':'POL', '79e98f8f':'POL',
  // CHAN (3)
  'ad687de6':'CHAN', '016036e7':'CHAN', '6febbd25':'CHAN',
  // GOV (2)
  '1d57f94c':'GOV', 'ff8a88a6':'GOV',
  // LEARN (10)
  '7cdb2278':'LEARN', '20885bb7':'LEARN', '9f6ca95b':'LEARN', '0609296f':'LEARN',
  '24d2ac86':'LEARN', 'eaa94ffb':'LEARN', 'bd98bac0':'LEARN', '0c94d85c':'LEARN',
  'e50e9a46':'LEARN', 'd7360bcf':'LEARN',
};

export const EXAM = { DM:17, DISC:10, GRID:15, POL:22, CHAN:10, GOV:8, LEARN:18 };
export const NAMES = {
  DM:'Delivery and Migration',
  DISC:'Discovery',
  GRID:'Grid Design',
  POL:'Policies and Settings',
  CHAN:'Channel Strategy',
  GOV:'Governance Structure',
  LEARN:'Learning and Enablement',
};

// How much of each answer any Slack page can actually decide. Reconstructed from the
// 2026-08-18 fact-check (findings-slack-b1.json and -b2.json, commits 96ac855 and 451b766):
//   DECISIVE  a rendered Slack page states the fact the key turns on (or, for 296ced65,
//             states that the real answer is missing from the options)
//   SUPPORTED a Slack page supports the key's direction, but the choice between options
//             is still best practice -- naming conventions, project channels, grid design
//   JUDGMENT  consulting or training advice against strawman distractors; the only citation
//             is orienting (Slack's "launching Slack" admin resource or a migration blog)
export const TIER = {
  DECISIVE: ['296ced65', 'd1ec6012', 'd1458b4b', '10bdf793', '2169924a', '1d57f94c', 'e50e9a46',
    '989f370e', 'd7360bcf', '60708c05', '47e8ec41', '6bfcfbed', 'cb206cbe', 'ff8a88a6', '79e98f8f'],
  SUPPORTED: ['535baa2b', '6b1ec162', 'a0bf9e87', 'ad687de6', '016036e7', '6febbd25', '4953a8af',
    '6b9124ed', '96be8a94', 'c2a30421'],
  JUDGMENT: ['70cfc31f', '4c998d54', '7cdb2278', '20885bb7', '9f6ca95b', '0609296f', '24d2ac86',
    'a401a105', '663ae7a0', 'eaa94ffb', 'bd98bac0', '0c94d85c'],
};

// Five reworded pairs the fact-check found, each asking the same thing with the same keyed
// answer. Both copies are correct; they are redundancy, not error, and find-duplicates.mjs
// cannot see them (stem Jaccard 0.13-0.32).
export const REWORDED_PAIRS = [
  ['1d57f94c', 'ff8a88a6'], // Org Owner
  ['60708c05', 'cb206cbe'], // Workspace Admin
  ['ad687de6', '016036e7'], // channel naming conventions
  ['7cdb2278', '0609296f'], // hands-on workshop
  ['535baa2b', '6b1ec162'], // channel-activity analytics
];

// Outline bullets with NO keyed deck item. Read against all 37 on 2026-09-28, then confirmed
// with a keyword sweep over stems and options; every nonzero hit was read.
export const UNCOVERED = [
  'DM: pre-migration activities -- scheduling, user cleanup, comms. "schedul" and "cleanup" return 0.',
  'DM: executing a migration -- status, issues, coordination with the client and Slack. The deck has a first step (96be8a94), a contact rule (663ae7a0) and an after-care step (6b9124ed), and nothing in between.',
  'DM: the import and export tools themselves. "import" appears once, in an unrelated stem.',
  'DISC: researching the client before the first meeting, and asking about existing security and policy.',
  'DISC: success metrics alongside the vision statement. "success metric" returns 0.',
  'GRID: turning discovery outputs into options, and grid design sign-off. "sign-off" returns 0; the domain has two deck items for 15% of the exam.',
  'POL: SSO / SAML. "SSO" and "SAML" return 0; the one identity item (d1ec6012) is SCIM provisioning.',
  'POL: org-level security settings -- session duration, 2FA enforcement, EKM. 2FA appears only as a distractor.',
  'POL: Slack Connect configuration beyond DLP -- who may send and accept invitations, approval, external org policies.',
  'POL: enabling org and workspace stakeholders to agree settings.',
  'CHAN: workflows -- the outline names the onboarding workflow and the standup workflow. "Workflow Builder", "onboarding" and "standup" return 0 in stems and options.',
  'GOV: the admin support model -- request, help and approval process flows. 0 keyed items.',
  'GOV: admin processes and workflows that can be migrated into Slack. 0 keyed items.',
  'LEARN: creating learning materials. "materials" returns 0.',
  'LEARN: the rollout communication plan. "rollout" and "communication plan" return 0 in stems and options.',
];

const { pathToFileURL } = await import('node:url');
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/Salesforce_Slack_Consultant_Questions.json', 'utf8'));
  const ids = new Set(deck.map(q => q.id));
  const missing = deck.filter(q => !(q.id in CALLS)).map(q => q.id);
  const stale = Object.keys(CALLS).filter(id => !ids.has(id));
  const tiered = new Set(Object.values(TIER).flat());
  const untiered = deck.filter(q => !tiered.has(q.id)).map(q => q.id);
  if (missing.length || stale.length || untiered.length) console.log('unclassified:', missing, 'stale:', stale, 'untiered:', untiered);
  const n = deck.length;
  const counts = {};
  const judg = {};
  for (const q of deck) {
    const d = CALLS[q.id];
    counts[d] = (counts[d] || 0) + 1;
    if (TIER.JUDGMENT.includes(q.id)) judg[d] = (judg[d] || 0) + 1;
  }
  console.log(`deck ${n} questions  |  exam 60 scored questions`);
  for (const d of Object.keys(EXAM)) {
    const c = counts[d] || 0;
    console.log(
      `${NAMES[d].padEnd(26)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d] * 0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100 * c / n).toFixed(1).padStart(5)}%   judgment ${judg[d] || 0}`,
    );
  }
  console.log(`\ntiers: decisive ${TIER.DECISIVE.length}, supported ${TIER.SUPPORTED.length}, judgment ${TIER.JUDGMENT.length}`);
  console.log(`${UNCOVERED.length} outline bullets with no keyed deck item.`);
}
