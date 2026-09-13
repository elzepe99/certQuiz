// Independent re-classification of the Platform App Builder deck against the OFFICIAL
// exam outline (Summer '26 alignment, five domains), assigned by reading each question's
// stem + option shape, NOT its _cat.
//
// The scrape's five tags ("Security", "Business Logic", "Deployment", ...) are close to the
// outline but not the same: the outline folds security and sharing into "Salesforce
// Fundamentals" alongside AppExchange/AgentExchange and reporting, and its Business Logic
// domain is 32% and includes formulas, roll-ups, validation rules, Flow, Flow Approval
// Processes and Agentforce. Rubric:
//
//   FUN  Salesforce Fundamentals (18%)              - declarative vs programmatic boundary,
//                                                     AppExchange/AgentExchange, object/record/
//                                                     field access, sharing solutions, reports,
//                                                     report types, dashboards
//   DM   Data Modeling and Management (20%)         - data model, relationship types and their
//                                                     implications, field data types and changes,
//                                                     import/export, external data sources
//   BL   Business Logic and Process Automation (32%)- formulas, roll-ups, validation rules, Flow
//                                                     Builder, approval processes, flow type
//                                                     selection, flow monitoring, Agentforce
//   UI   User Interface (17%)                       - UI customization, buttons/links/actions,
//                                                     App Builder components, custom Lightning
//                                                     components, mobile layouts and actions
//   DEP  App Deployment (13%)                       - ALM and sandboxes, change sets, packages,
//                                                     deployment plans
//
//   node study-guides/reclassify-app-builder.mjs      prints the exam-vs-deck table

export const CALLS = {
  // --- Salesforce Fundamentals -----------------------------------------------------
  'e2c4f8aa':'FUN', 'aa446baa':'FUN', '2acc4e50':'FUN', '71a617ac':'FUN', '9ba9345d':'FUN',
  '5feb8608':'FUN', '600c8f44':'FUN', '98a52146':'FUN', 'f64f3731':'FUN', 'eb42de9c':'FUN',
  '1dd6fc7f':'FUN', 'd1692d01':'FUN', 'd36e669a':'FUN', '7ee5407d':'FUN', '2be541c8':'FUN',
  '8048d229':'FUN', 'bd6ef1b0':'FUN', '8f327859':'FUN', 'f0d2a336':'FUN', 'e1e7a031':'FUN',
  '7fa13400':'FUN', '15f5f364':'FUN', 'b873fb5f':'FUN', '4ad9910b':'FUN', '6e71484d':'FUN',
  'c308ee99':'FUN', 'cebb2770':'FUN', '5f869bc9':'FUN', 'e7e093e4':'FUN', '3179a16e':'FUN',
  '7a5c4bb0':'FUN', 'e0015d94':'FUN', '513fdca2':'FUN', '31d03e0b':'FUN', '3094912f':'FUN',
  'ac554cce':'FUN', '1e4e783a':'FUN', 'c7518e63':'FUN', 'aa47c883':'FUN', '7bf2a1a0':'FUN',
  '8fa11113':'FUN',

  // --- Data Modeling and Management ------------------------------------------------
  'ecc2f2d1':'DM', 'c2379d8e':'DM', 'd0441ea2':'DM', '696e6048':'DM', '5bc838e7':'DM',
  'ff970202':'DM', '2a1d9baf':'DM', '99028ce3':'DM', 'dec9a6b4':'DM', '192da39e':'DM',
  '8393698f':'DM', 'f1910535':'DM', 'e2e924df':'DM', 'f275115f':'DM', 'de845c25':'DM',
  'df028304':'DM', 'c5f11c84':'DM', '108817b2':'DM', '9c4d665b':'DM', 'cfee0562':'DM',
  '12796130':'DM', '4183da4a':'DM', '2fac7b8c':'DM', '728103c0':'DM', 'ea9c253d':'DM',
  'dca21cdc':'DM', '448050ab':'DM', 'daa8e06c':'DM', 'eca96cec':'DM', '80cdeade':'DM',
  '82f377a0':'DM', 'f9e7f3dd':'DM', '4442bb62':'DM', '2b41b228':'DM', '6e5ebb2c':'DM',
  '92ce68b5':'DM', 'e680953f':'DM', '6be00595':'DM', '124809ca':'DM', '59cb33df':'DM',
  '15524fc6':'DM', 'dbc50a1e':'DM', '6d288fc9':'DM', 'c0a59efc':'DM',

  // --- Business Logic and Process Automation ----------------------------------------
  'e187aca4':'BL', 'df7e220e':'BL', '82c18788':'BL', 'aae29b1e':'BL', 'ec780513':'BL',
  'f0fcecae':'BL', '50298114':'BL', 'b4a0859a':'BL', '2607cf61':'BL', '4b57de62':'BL',
  'a2b1cdb4':'BL', '93fc7f11':'BL', '9fbef4f6':'BL', 'c3dbacf5':'BL', '70d99691':'BL',
  '39919e32':'BL', 'e7674bf2':'BL', '455b9add':'BL', 'aeb59023':'BL', '52bee9cd':'BL',
  '43e6003e':'BL', '2268b774':'BL', 'eae6a2e7':'BL', '5e649731':'BL', '9183e3e5':'BL',
  'fa0eefaa':'BL', 'ff959d2d':'BL', 'c25d186f':'BL', '5af0a805':'BL', '6ee193c4':'BL',
  '8d600172':'BL', '363942d9':'BL', 'b2ad3559':'BL', '2b895c9b':'BL', 'a7066a29':'BL',
  'bb35f81f':'BL', '759295bd':'BL', '5b81e447':'BL', '5c35d629':'BL', 'b6e70e00':'BL',
  '0c8f84d5':'BL', 'a51f3d87':'BL', 'a58ee5df':'BL', '42ba8f21':'BL', '8f4d4727':'BL',
  '48077126':'BL', '9982debb':'BL', 'f2171f7e':'BL', 'b26ceb79':'BL', 'db1a97a8':'BL',
  'd07b1682':'BL', 'f305b0dc':'BL', 'fedd4d8c':'BL', '392c6b99':'BL', '8d4883ca':'BL',
  '1e4a7642':'BL', '12fa9e7e':'BL', 'f8150bea':'BL', 'd4dfeb80':'BL', '5eb59bb7':'BL',
  '9b38319e':'BL', '2583af7a':'BL', 'e4b4892c':'BL', '62635d92':'BL', '3231e6c1':'BL',
  'c3ed7893':'BL',

  // --- User Interface ------------------------------------------------------------------
  'db67d315':'UI', '2ebcd70e':'UI', 'cf57c925':'UI', 'cf83a80b':'UI', 'a73d0a3c':'UI',
  '194683e0':'UI', 'f9f539f1':'UI', 'c4104391':'UI', '298e3056':'UI', 'a50d3615':'UI',
  'fb8423b6':'UI', 'f9226263':'UI', 'de4b2606':'UI', 'b5e68679':'UI', '9b791b13':'UI',
  'c73b8857':'UI', 'a0daae5d':'UI', 'e787099c':'UI', '9bb789da':'UI', '9e57b515':'UI',
  '17a46fdf':'UI', '2fc4a493':'UI', '5134cf87':'UI', '3f3c54da':'UI', 'e8227b30':'UI',
  'd8a40894':'UI', '25f618fa':'UI', '6963ca79':'UI', 'ba782585':'UI', '61c9d73b':'UI',
  '6f868a8f':'UI', 'c1eb9ac9':'UI', '8e82f823':'UI', '3e1b0e81':'UI', 'f5d30d69':'UI',
  'ffadd965':'UI', 'd9d254c2':'UI', 'd3acc683':'UI', 'afe2479b':'UI', '047f35ce':'UI',
  '19c14a90':'UI', '7babd714':'UI', '2c33c2c4':'UI', '78e7b0b9':'UI', '12cbcf1f':'UI',
  'a8a96dba':'UI', '044ba50f':'UI', '1b17f56d':'UI', 'c0ddc67d':'UI',

  // --- App Deployment ----------------------------------------------------------------
  'e12c8221':'DEP', 'b0d92c09':'DEP', 'c8e73298':'DEP', '41de0feb':'DEP', 'a56ee547':'DEP',
  'aead4086':'DEP', 'ecea7391':'DEP', '9e5ca684':'DEP', '7d962a18':'DEP', '238aaeb2':'DEP',
  '3075c7b3':'DEP', 'd683ac97':'DEP', 'ff1a414f':'DEP', 'a0324c31':'DEP', 'd84d4c97':'DEP',
  '8d0b35d5':'DEP', '07e3af03':'DEP', 'ffab0ef2':'DEP', '89710d72':'DEP', '116a14c0':'DEP',
  '441636d1':'DEP', '99abaa00':'DEP',
};

export const EXAM = { FUN:18, DM:20, BL:32, UI:17, DEP:13 };
export const NAMES = {
  FUN:'Salesforce Fundamentals',
  DM:'Data Modeling and Management',
  BL:'Business Logic and Process Automation',
  UI:'User Interface',
  DEP:'App Deployment',
};

// Sub-objectives with no deck item, found by reading all 222 against the outline.
export const UNCOVERED = [
  'AgentExchange as a way to extend an org (a named Fundamentals objective)',
  'Flow Approval Processes (named; the deck has only classic approval processes)',
  'Agentforce as a way to automate business processes (named)',
  'Maintaining, monitoring and troubleshooting flows (error emails, the Automation app Monitor tab, debug)',
  'Dashboard capabilities beyond folder access (dynamic dashboards, filters, subscriptions)',
  'A deployment plan as a sequence (order, validation, test, back-out)',
  'External data sources beyond the indirect lookup item (Salesforce Connect adapters, external object limits)',
];

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/salesforce_app_builder_questions_corrected.json', 'utf8'));
  const ids = new Set(deck.map(q => q.id));
  const missing = deck.filter(q => !(q.id in CALLS)).map(q => q.id);
  const stale = Object.keys(CALLS).filter(id => !ids.has(id));
  if (missing.length || stale.length) console.log('unclassified:', missing, 'stale:', stale);
  const n = deck.length;
  const counts = {};
  for (const q of deck) counts[CALLS[q.id]] = (counts[CALLS[q.id]] || 0) + 1;
  console.log(`deck ${n} questions`);
  for (const d of Object.keys(EXAM)) {
    const c = counts[d] || 0;
    console.log(
      `${NAMES[d].padEnd(42)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d]*0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100*c/n).toFixed(1).padStart(5)}%`,
    );
  }
}
