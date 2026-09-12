// Independent re-classification of the Salesforce Administrator deck against the
// OFFICIAL Platform Administrator exam outline (Summer '25 alignment, eight domains),
// assigned by reading each question's stem + option shape, NOT its _cat.
//
// The scrape's seven tags are the OLD outline: "Workflow and Process Automation" is
// now "Automation", and there is no Agentforce tag at all even though the deck holds
// seven Agentforce items (filed under Service). Rubric:
//
//   CFG  Configuration and Setup (15%)               - company settings, declarative UI, user
//                                                      setup & licences, org security controls,
//                                                      sharing model, profiles / permission sets
//   OM   Object Manager & Lightning App Builder (15%) - object architecture & relationships, fields
//                                                      & page layouts, record types, Lightning pages,
//                                                      quick / global actions
//   SM   Sales and Marketing Applications (10%)       - sales process, opportunity tools, leads,
//                                                      campaigns, forecasting, territories, Einstein
//   SS   Service and Support Applications (10%)       - case management and its automation
//   PC   Productivity and Collaboration (10%)         - activities, Chatter, mobile app, AppExchange
//   DA   Data and Analytics Management (17%)          - import/export/backup, validation tools
//                                                      (validation rules, duplicate rules), reports,
//                                                      report types, dashboards, sharing on reports
//   AUT  Automation (15%)                             - tool selection, Flow, approval processes
//   AF   Agentforce (8%)                              - agents, Agent Builder, prompts, permissions
//
//   node study-guides/reclassify-admin.mjs      prints the exam-vs-deck table

export const CALLS = {
  // --- Configuration and Setup ---------------------------------------------------
  '98a15ab1':'CFG', 'ce311cff':'CFG', '177095a2':'CFG', 'cea6caee':'CFG', '154ff957':'CFG',
  '1ae04c79':'CFG', '75a6edb8':'CFG', '2085c46e':'CFG', 'c6364b77':'CFG', '9f08b9dc':'CFG',
  'b7e12d88':'CFG', 'a72edbf1':'CFG', '0eb39a7c':'CFG', 'bd1a9ddf':'CFG', '6caa5c2f':'CFG',
  'c39b0409':'CFG', 'a8d31e32':'CFG', 'ab489b08':'CFG', '14bbd3a3':'CFG', 'e713e780':'CFG',
  '59a0fdfe':'CFG', '532479a7':'CFG', 'be16cc1a':'CFG', '76248f85':'CFG', '3615e19f':'CFG',
  '67375ad1':'CFG', 'cbd180d3':'CFG', '242c27b9':'CFG', 'c4eb0512':'CFG', '51f47a9e':'CFG',
  'b0427160':'CFG', '4d52ce6a':'CFG', 'eb7e2558':'CFG',

  // --- Object Manager and Lightning App Builder ---------------------------------------
  '50404cc9':'OM', '0cadd1e2':'OM', 'b8b50c29':'OM', '061bd870':'OM', '532d0949':'OM',
  '225ec7dd':'OM', '9881d4a4':'OM', '4faeff3d':'OM', '57a9f154':'OM', 'ee4f3d4e':'OM',
  'b26213ef':'OM', '3bdb4138':'OM', 'f467f78f':'OM', '1c029e7f':'OM', 'c9181352':'OM',
  '4d0aaac5':'OM', '3bc13244':'OM', 'be02a4c2':'OM', 'b77f33bd':'OM', '2ffa1825':'OM',
  '9938615c':'OM', '1d05b596':'OM', '84fac1dc':'OM', '6c8c7013':'OM', '9149fd05':'OM',
  '2dda7a31':'OM', '28e4d309':'OM',

  // --- Sales and Marketing Applications ----------------------------------------------
  '036bd684':'SM', '7a1ab0a9':'SM', '53e999c6':'SM', '24d30683':'SM', '3bf6aa88':'SM',
  'd9be4b44':'SM', 'c09761e4':'SM', '72a0b976':'SM', 'ee07bdba':'SM', 'b3aeaf96':'SM',
  '0d87e06c':'SM', '4063708c':'SM', 'c2a95184':'SM', 'dcc3ab15':'SM', '1fa46a19':'SM',
  '3b28d8c6':'SM', '0aa33a5b':'SM', '0e3ab3e8':'SM',

  // --- Service and Support Applications -----------------------------------------------
  '39ebd532':'SS', '8b0dd43b':'SS', '8b250773':'SS', '0a88ffb9':'SS', '0408c3f8':'SS',
  '3d646528':'SS', 'ebcb1c79':'SS', '87b1a995':'SS', '4bf824b6':'SS', '8d3dc667':'SS',
  '3561a6c6':'SS', 'c191e454':'SS', '08eab7c6':'SS', 'e8d13165':'SS', '34290bc6':'SS',

  // --- Productivity and Collaboration ------------------------------------------------
  '981a6656':'PC', '98f643f0':'PC', '3a88eed3':'PC', '45a096bd':'PC', 'dbe75d48':'PC',
  '4dc33121':'PC', 'a5ce7184':'PC', 'fbfd7a7a':'PC',

  // --- Data and Analytics Management ---------------------------------------------------
  '73169c29':'DA', '57f8b23a':'DA', '75de9c35':'DA', 'bb27462f':'DA', '6e12dd2e':'DA',
  '78b894fb':'DA', '8a82b5df':'DA', '2b6f1886':'DA', 'da7f0e3d':'DA', '75278521':'DA',
  'fdfedecb':'DA', '307b7189':'DA', 'dea1e510':'DA', '045926e2':'DA', '91817bb4':'DA',
  '82b23e87':'DA', '0424bfcc':'DA',

  // --- Automation ---------------------------------------------------------------------------
  '3037b817':'AUT', '32afb676':'AUT', '5ca89056':'AUT', '48ce1490':'AUT', '9d407d53':'AUT',
  '8058ccdf':'AUT', 'f7935d50':'AUT', '26d0b0b1':'AUT', '7bbd2652':'AUT', 'f8bb917c':'AUT',
  '8aea4354':'AUT', '4419a83a':'AUT', '2915050c':'AUT', 'c1c37914':'AUT', '952b907a':'AUT',
  'f2231f7b':'AUT', '86a0ffaa':'AUT', '0eeaeebf':'AUT', '4c6f4b49':'AUT', 'ff68f441':'AUT',
  '9b03a10e':'AUT', '8dfcba92':'AUT', 'e0ca62a8':'AUT', '24bc315d':'AUT', '9dfd991f':'AUT',
  'fd10e166':'AUT', '1be375ea':'AUT', '00548807':'AUT', 'b38545fa':'AUT',

  // --- Agentforce ---------------------------------------------------------------------------
  'a63b1272':'AF', '7856a477':'AF', '0049d522':'AF', '1f67bbf5':'AF', '0cbd5323':'AF',
  '644fe387':'AF', 'd6f431f5':'AF',
};

export const EXAM = { CFG:15, OM:15, SM:10, SS:10, PC:10, DA:17, AUT:15, AF:8 };
export const NAMES = {
  CFG:'Configuration and Setup',
  OM:'Object Manager and Lightning App Builder',
  SM:'Sales and Marketing Applications',
  SS:'Service and Support Applications',
  PC:'Productivity and Collaboration',
  DA:'Data and Analytics Management',
  AUT:'Automation',
  AF:'Agentforce',
};

// Sub-objectives with no deck item, found by reading all 154 against the outline.
export const UNCOVERED = [
  'Duplicate rules and matching rules (named under Data and Analytics)',
  'Data Export / backup and archival',
  'Report types (with / without related records, renaming fields), joined reports, cross filters',
  'Dashboard options beyond running user and filters: subscriptions, scheduled refresh, org limits, View Dashboard As',
  'Territory management, forecasting mechanics, Einstein for Sales beyond Opportunity Scoring',
  'The default workflow (automation) user',
  'Schema Builder and the implications of deleting fields',
  'Agentforce security, agent permissions troubleshooting, installing prompts, conversation preview testing',
  'Campaign management mechanics (member statuses, hierarchies)',
  'Salesforce mobile app branding and the app menu',
];

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/salesforce_admin_questions.json', 'utf8'));
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
      `${NAMES[d].padEnd(44)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d]*0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100*c/n).toFixed(1).padStart(5)}%`,
    );
  }
}
