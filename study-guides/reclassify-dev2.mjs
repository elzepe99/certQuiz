// Independent re-classification of the Platform Developer II deck against the
// OFFICIAL exam outline (Winter '24 alignment, five domains), assigned by reading
// each question's stem + option shape, NOT its _cat.
//
// The scrape tagged the deck with four categories and no Performance bucket, so
// the deck's own tags cannot be compared to the outline at all. Rubric:
//
//   ADF  Advanced Developer Fundamentals (15%)     - localization / multi-currency, sharing
//                                                    objects & Apex managed sharing, custom
//                                                    metadata vs custom settings
//   PAL  Process Automation, Logic & Integration   - process interactions, declarative vs
//        (27%)                                       programmatic, trigger best practice, error
//                                                    handling / transactions, advanced SOQL,
//                                                    async Apex, dynamic Apex, platform events,
//                                                    inbound & outbound integration
//   UI   User Interface (20%)                      - LWC / Aura / Visualforce code & choice,
//                                                    events, errors, form factor, static resources
//   TDD  Testing, Debugging & Deployment (20%)     - Apex + Jest testing, mocks, debugging
//                                                    tools, source-driven deployment
//   PERF Performance (18%)                         - UI perf (view state, caching), query
//                                                    structure & LDV, async callouts, code
//                                                    reuse, spotting inefficiency
//
//   node study-guides/reclassify-dev2.mjs      prints the exam-vs-deck table

export const CALLS = {
  // --- Advanced Developer Fundamentals ---------------------------------------
  'e831eba6':'ADF', '380cc77c':'ADF', '1a279dfb':'ADF', 'a8b17c49':'ADF', 'c26371c1':'ADF',
  'e2a749f7':'ADF', 'f82f42e8':'ADF',

  // --- Performance --------------------------------------------------------------
  '12c11e51':'PERF', '44d8b26d':'PERF', 'afd20ee7':'PERF', '0d827147':'PERF', '2388fdd4':'PERF',
  'aa38d07c':'PERF', '6d242d63':'PERF', '738ade86':'PERF', '9e1c8386':'PERF', '87b506a2':'PERF',
  'b9fd412b':'PERF', '497c27b5':'PERF', 'ce2609d1':'PERF', '10197f02':'PERF',

  // --- Testing, Debugging & Deployment ----------------------------------------
  'a3252caa':'TDD', 'ad6dc9c9':'TDD', '3810d972':'TDD', 'be8e114a':'TDD', '5c94971b':'TDD',
  '3bbf155f':'TDD', 'b906dc2c':'TDD', 'd47df5e9':'TDD', '75e642fb':'TDD', 'dbe97ce5':'TDD',
  'e4d0d916':'TDD', '41c7ada5':'TDD', 'e6067a5f':'TDD', '3467c031':'TDD', 'c91ba2b8':'TDD',
  '9199fb45':'TDD', 'a7f95dd5':'TDD', '595ebc61':'TDD', '727db5f6':'TDD', '5be4b08d':'TDD',
  '6b4e2f7b':'TDD', 'ebb9f61a':'TDD', '4ccc3eda':'TDD', '788ce14e':'TDD', '42d0474c':'TDD',
  '614b99d9':'TDD', '7e99199d':'TDD',

  // --- User Interface -------------------------------------------------------------
  'fb30207f':'UI', '3598b33b':'UI', '95587f24':'UI', 'f9c8f7b9':'UI', 'b3a07999':'UI',
  '295b0c8b':'UI', '659c1a94':'UI', '1698e7ee':'UI', '8ae9f7e4':'UI', '92f1ec38':'UI',
  '69a6cded':'UI', '254644b6':'UI', '075e76d2':'UI', '17d8af13':'UI', 'c4cec291':'UI',
  '85a3fa6c':'UI', '9f8cdefa':'UI', '15dc7a90':'UI', 'c8de9a78':'UI', '6686c9b7':'UI',
  'b92420f4':'UI', '20c11a40':'UI', 'e2ba60ab':'UI', 'd5978be6':'UI', '4023a9a3':'UI',
  '1963db51':'UI', 'adfa5369':'UI', 'e9c97c99':'UI', '2f02cf00':'UI', '2ddd7bf6':'UI',
  '74efe37c':'UI', 'e91d90d4':'UI', '67563135':'UI', 'e9c0d546':'UI', 'e82a5694':'UI',
  '7d4b9c57':'UI', '5f4a5b96':'UI', '97dbf5bc':'UI', '49c5e8ad':'UI', '036f6646':'UI',
  '00016277':'UI', 'f84106f3':'UI', 'd50c6ceb':'UI', '020e43fb':'UI', 'b191ada7':'UI',

  // --- Process Automation, Logic & Integration ------------------------------------
  'cb0d4ef3':'PAL', 'f62513eb':'PAL', '6845ba58':'PAL', '59d5a8f8':'PAL', 'd6fe74e5':'PAL',
  '7675adce':'PAL', '53d0a7d2':'PAL', '264d0eab':'PAL', '082893f1':'PAL', 'e67f6bc8':'PAL',
  'ea09f5b0':'PAL', 'e92e64ee':'PAL', '017f2acb':'PAL', '0eac03b0':'PAL', '59f7360d':'PAL',
  '40004899':'PAL', 'a170139a':'PAL', 'c0bd95df':'PAL', '4f9da22c':'PAL', 'f3d819e3':'PAL',
  '62592f03':'PAL', 'caa4bfe8':'PAL', 'abea6c7c':'PAL', 'df3ee6db':'PAL', '218106b6':'PAL',
  '72374e4c':'PAL', '50c95d23':'PAL', 'a6345067':'PAL', 'f7fd9efb':'PAL', '9943756f':'PAL',
  '9e515004':'PAL', '3870d944':'PAL', '4c5d1329':'PAL', '9efee9d1':'PAL', '474e9918':'PAL',
  '7871e9fd':'PAL', '11d22bd9':'PAL', 'e2367a85':'PAL', 'b8c07851':'PAL', 'dba0fd10':'PAL',
  '9d81f45b':'PAL', 'd2a074ac':'PAL', '03fa7cee':'PAL', '95b3cb00':'PAL', '1b7b6b00':'PAL',
  '77c104fc':'PAL', 'fa810727':'PAL', '0a52f212':'PAL', 'f688895a':'PAL', 'd85ba695':'PAL',
  'fc0bc95b':'PAL', '2b360cbd':'PAL', 'af20c4c2':'PAL',
};

export const EXAM = { ADF:15, PAL:27, UI:20, TDD:20, PERF:18 };
export const NAMES = {
  ADF:'Advanced Developer Fundamentals',
  PAL:'Process Automation, Logic, and Integration',
  UI:'User Interface',
  TDD:'Testing, Debugging, and Deployment',
  PERF:'Performance',
};

// Sub-objectives of the outline that NO deck item exercises, found by reading all
// 146 against the outline. These are the topics the guide has to teach from the
// documentation rather than from the deck.
export const UNCOVERED = [
  'multi-currency: CurrencyIsoCode, convertCurrency(), dated exchange rates',
  'custom settings: list vs hierarchy, getInstance/getOrgDefaults, SeeAllData in tests',
  'sharing objects: __Share tables, RowCause, AccessLevel, recalculation',
  'asynchronous callouts: Continuation (Performance domain, "async callout")',
  'mocks and stubs: System.StubProvider / Test.createStub',
  'Platform Cache: session vs org cache, partitions, CacheBuilder',
  'Lightning Message Service: cross-DOM communication',
  'Transaction Finalizers on Queueable jobs',
  'Apex REST/SOAP service annotations (@RestResource, @HttpGet, webservice)',
  'save order of execution as a sequence (only re-fire effects are tested)',
  'scratch orgs, unlocked packages, test levels on deploy',
];

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/salesforce_questions_Dev2.json', 'utf8'));
  const ids = new Set(deck.map(q => q.id));
  const missing = deck.filter(q => !(q.id in CALLS)).map(q => q.id);
  const stale = Object.keys(CALLS).filter(id => !ids.has(id));
  if (missing.length || stale.length) {
    console.log('unclassified:', missing, 'stale:', stale);
  }
  const n = deck.length;
  const counts = {};
  for (const q of deck) counts[CALLS[q.id]] = (counts[CALLS[q.id]] || 0) + 1;
  console.log(`deck ${n} questions`);
  for (const d of Object.keys(EXAM)) {
    const c = counts[d] || 0;
    console.log(
      `${NAMES[d].padEnd(44)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d]*0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100*c/n).toFixed(1).padStart(5)}%`,
    );
  }
}
