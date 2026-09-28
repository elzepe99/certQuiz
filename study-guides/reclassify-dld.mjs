// Independent re-classification of the salesforce_dld_questions_corrected deck against the
// OFFICIAL exam outline, assigned by reading each question's stem + keyed option.
//
// THE DECK'S FIVE `_cat` TAGS ARE AN OLDER OUTLINE. The deck files every item under
// Application Lifecycle Management, Project & Release Management, Development & Testing,
// Deployment or Environment Management. The published exam has EIGHT domains with
// different boundaries, and splits the deck's "Development & Testing" and "Environment
// Management" across four of them.
//
// The exam itself is also old: it aligns to Spring '23 and has not been rebuilt, unlike
// the three consultant/specialist exams guided on 2026-09-26. So the deck and the exam
// are roughly contemporary, and the gaps here are gaps in COVERAGE, not in currency.
//
//   https://help.salesforce.com/s/articleView?id=005298968&type=1&language=en_US
//   read 2026-09-28; 60 scored questions, 105 minutes, 65% to pass, Spring '23 alignment
//
//   ALM     Application Lifecycle Management (8%)  - development methodologies and their
//                                                    risks; governance strategy by maturity
//   PLAN    Planning (13%)                         - ALM maturity; people/technology/process;
//                                                    environment risks and mitigation;
//                                                    governance framework; seasonal releases
//   SYS     System Design (15%)                    - agile tools; org strategy; sandbox
//                                                    strategy; deployment tools compared
//   BUILD   Building (14%)                         - source control and branching; unit
//                                                    tests and test data; org vs package
//                                                    model, scratch orgs; code quality
//   DEPLOY  Deploying (14%)                        - Metadata and Tooling API; pre/post
//                                                    deployment steps; technical reference
//                                                    data (configuration stored as data)
//   TEST    Testing (13%)                          - testing methodology; test execution
//                                                    and coverage; unified secure test data
//   REL     Releasing (13%)                        - managed/unmanaged/unlocked packages;
//                                                    sandbox strategy mapped to a release
//                                                    plan incl. hotfixes; release strategy
//   OPS     Operating (10%)                        - changes made directly in production
//                                                    and bringing them into ALM; common
//                                                    release artifacts across many orgs
//
// FOUR BOUNDARY RULES, stated so the next reader can reproduce the calls:
//   1. Writing unit tests and building test data IN Apex is BUILD; choosing a testing
//      methodology (load, performance, regression automation, data-migration testing) is
//      TEST. Mocks are BUILD; "load testing" is TEST.
//   2. Choosing a sandbox TYPE or an environment layout is SYS; mapping sandboxes onto a
//      release plan -- hotfix lanes, UAT for major vs minor releases -- is REL.
//   3. Which deployment TOOL (change sets, Ant, CI server, third-party) is SYS; how the
//      Metadata API behaves once you use it -- test levels, quick deploy, locking,
//      destructiveChanges, API versions -- is DEPLOY. RunSpecifiedTests is DEPLOY both
//      times it appears (96a9af62, 051864d9).
//   4. A governance BODY (CoE, ARB, CCB, steering committee, executive sponsor) is PLAN,
//      except where the question is which METHODOLOGY to use, which is ALM.
//
//   node study-guides/reclassify-dld.mjs      prints the exam-vs-deck table

export const CALLS = {

  // --- ALM
  'bdae5231':'ALM', 'f3d07cd1':'ALM', 'cf2eecac':'ALM', '387dd40b':'ALM', 'bc9a1ad1':'ALM',
  '004b8e73':'ALM', '9c991e6c':'ALM', 'a0fc764b':'ALM', 'ece03577':'ALM', '1fca2746':'ALM',
  'ade048ca':'ALM',

  // --- PLAN
  '1371e84d':'PLAN', '9fd8746c':'PLAN', '02921bb0':'PLAN', '4f44277d':'PLAN', 'c5a6781c':'PLAN',
  '376e5852':'PLAN', '17935246':'PLAN', '631e1af5':'PLAN', '26ed97a3':'PLAN', '3639bf51':'PLAN',
  '70a0c1d5':'PLAN', 'd292fd5d':'PLAN', '2c90c553':'PLAN', '92fc13de':'PLAN', '2de25757':'PLAN',
  'cd632689':'PLAN', 'd7b0ee0b':'PLAN', '6a25c420':'PLAN', 'ef3368a2':'PLAN', 'b19ac21f':'PLAN',
  '7f719fb9':'PLAN',

  // --- SYS
  '4ebcf84d':'SYS', '93601ed1':'SYS', '28e4ec67':'SYS', '8846055b':'SYS', '3a0f40db':'SYS',
  '19382561':'SYS', 'e06083f5':'SYS', '1292cd74':'SYS', 'ef47a1bd':'SYS', 'c0976a29':'SYS',
  'c4030b0e':'SYS', '69a9ff36':'SYS', '711da2f7':'SYS', '3079812f':'SYS', '162eb8ef':'SYS',
  'c50db85c':'SYS', '96992a86':'SYS', '51fb3e72':'SYS', 'db8dd0f5':'SYS', '9ef00f77':'SYS',
  '5c2251da':'SYS', '3f3e8dd7':'SYS', '50c2ae4b':'SYS', '46cb24ed':'SYS', 'c4e0249f':'SYS',
  '227cab5e':'SYS', '0ab782ac':'SYS', 'cb26f076':'SYS', 'a2bf19b2':'SYS',

  // --- BUILD
  'daf3611e':'BUILD', '6e79fdb4':'BUILD', '1f8fa592':'BUILD', 'd1099662':'BUILD', 'bf46c00b':'BUILD',
  '106ad44b':'BUILD', 'c7cb14ef':'BUILD', '4c9df2a3':'BUILD', '21b6ccf3':'BUILD', '42760192':'BUILD',
  '0a6666e2':'BUILD', '2825c32c':'BUILD', 'ae8b6e7f':'BUILD', 'c4314d7d':'BUILD', '20a0373a':'BUILD',
  '0788a944':'BUILD', '1655aa24':'BUILD', 'c60fdc56':'BUILD',

  // --- DEPLOY
  '96a9af62':'DEPLOY', '63d84f51':'DEPLOY', '1e158c90':'DEPLOY', '46826f40':'DEPLOY', '82bf81bd':'DEPLOY',
  '27a5139f':'DEPLOY', '7e0cf4e3':'DEPLOY', '023258c0':'DEPLOY', 'f629a361':'DEPLOY', '60b6639e':'DEPLOY',
  '12f79a7f':'DEPLOY', '051864d9':'DEPLOY', '73b40778':'DEPLOY', '0b8c5d16':'DEPLOY', '45cad6f6':'DEPLOY',
  '47bcc6c5':'DEPLOY', 'acf27c9e':'DEPLOY', '821c2331':'DEPLOY',

  // --- TEST
  '4e87b7fd':'TEST', 'd6c3d18a':'TEST', 'a44349e1':'TEST', '52e1dadf':'TEST', '59848aee':'TEST',
  '19f08b3e':'TEST', '9cb20e73':'TEST', '6156a463':'TEST', '9845d66b':'TEST', 'feeeb5f2':'TEST',
  '91eb375c':'TEST', '6fcd633a':'TEST', '9164ffe1':'TEST', '11f1d00f':'TEST', '2d70511f':'TEST',
  '065657fa':'TEST', '34e34718':'TEST',

  // --- REL
  '5e784c10':'REL', '2b7730d8':'REL', '6d1e8ed6':'REL', 'edf98922':'REL', '91f88d7e':'REL',
  '7ae89b27':'REL', 'd1940574':'REL', 'b5cde063':'REL', '598ef283':'REL', '947a218f':'REL',
  '69e82cf5':'REL', '36974ea1':'REL', '7e6cdb08':'REL', 'd098ec60':'REL', '8d278dc8':'REL',
  '1e990e83':'REL',

  // --- OPS
  'b00849d8':'OPS', 'bc626241':'OPS', '716287d1':'OPS', '058e3da6':'OPS', '8771e8d4':'OPS',
  'b06f104c':'OPS', '41c787b2':'OPS',
};

export const EXAM = { ALM:8, PLAN:13, SYS:15, BUILD:14, DEPLOY:14, TEST:13, REL:13, OPS:10 };
export const NAMES = {
  ALM:'Application Lifecycle Management',
  PLAN:'Planning',
  SYS:'System Design',
  BUILD:'Building',
  DEPLOY:'Deploying',
  TEST:'Testing',
  REL:'Releasing',
  OPS:'Operating',
};

// Sub-objectives named in the exam guide with NO deck item, found by reading all 137
// against the outline and confirmed by keyword sweep over stems, options and explanations
// on 2026-09-28. Each is taught in the guide section named.
export const UNCOVERED = [
  'ALM maturity (ALM bullet "governance strategies based on the customer maturity"; PLAN bullet "assess ALM maturity"). "maturity" returns 0 hits in stems, options and explanations. Guide s3, s4.',
  'DevOps Center. 0 stems, 0 options; it appears only as a currency note in two explanations (ef47a1bd, 1fca2746). The native tool for the SYS "components and tools of a successful deployment strategy" bullet. Guide s5.',
  'Items not supported by the APIs, and the manual pre/post-deployment steps they force (a named DEPLOY bullet). No item teaches it; 41c787b2 touches it only as a distractor ("no manual steps at all"). Guide s7.',
  'Coverage requirements (a named TEST bullet). No item asks for the 75% rule; it is quoted only inside the explanations of 6fcd633a and 051864d9. Guide s8.',
  'Operating as a whole: 7 items (5.1%) against a 10% domain -- the old five-domain outline the deck was built on had no Operating domain. Guide s10.',
];

const { pathToFileURL } = await import('node:url');
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/salesforce_dld_questions_corrected.json', 'utf8'));
  const ids = new Set(deck.map(q => q.id));
  const missing = deck.filter(q => !(q.id in CALLS)).map(q => q.id);
  const stale = Object.keys(CALLS).filter(id => !ids.has(id));
  if (missing.length || stale.length) console.log('unclassified:', missing, 'stale:', stale);
  const n = deck.length;
  const counts = {};
  for (const q of deck) counts[CALLS[q.id]] = (counts[CALLS[q.id]] || 0) + 1;
  console.log(`deck ${n} questions  |  exam 60 scored questions`);
  for (const d of Object.keys(EXAM)) {
    const c = counts[d] || 0;
    console.log(
      `${NAMES[d].padEnd(34)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d] * 0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100 * c / n).toFixed(1).padStart(5)}%`,
    );
  }
  console.log(`\n${UNCOVERED.length} sub-objectives with no deck item.`);
}
