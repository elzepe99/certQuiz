// Independent re-classification of the salesforce-revenue-cloud deck against the OFFICIAL
// exam outline, assigned by reading each question's stem + keyed option.
//
// THE EXAM HAS BEEN RENAMED. The deck, its manifest entry and all 135 stems say "Revenue
// Cloud". The certification is now the **Salesforce Certified Agentforce Revenue Management
// Consultant**, and the outline below was rebuilt with it -- seven domains that do not line
// up with the deck's own nine `_cat` tags (Product Catalog, Pricing & Discounts,
// Subscriptions, Configuration, Quote & Order, Billing & Invoicing, Context Service,
// General, Integration & API). That is why this file exists.
//
//   https://help.salesforce.com/s/articleView?id=005298978&type=1&language=en_US
//   read 2026-09-26; 60 scored questions, 105 minutes, 63% to pass, Summer '25 alignment
//
//   RCPC   Platform Concepts (18%)        - foundational config (flows, Lightning page
//                                           components, PSLs, permission sets), Context
//                                           Service, Omnistudio, Business Rules Engine,
//                                           APIs, dashboards and KPIs, core objects
//   RCIR   Implementation Readiness (14%) - licences, prerequisite feature toggles,
//                                           stakeholder roles, scope of work and project
//                                           plan, driving build/test/deploy/adopt
//   RCCAT  Catalog Management (16%)       - catalog structure, classifications, attributes,
//                                           bundles and cardinality, selling models,
//                                           eligibility, product discovery and search
//   RCCPQ  Configure, Price, Quote (18%)  - Product Configurator and CML, pricing
//                                           procedures and elements, decision tables,
//                                           discounts, the Transaction Line Editor
//   RCCO   Contracts and Orders (11%)     - Salesforce Contracts and CLM, Order Management,
//                                           DRO, decomposition, technical products
//   RCAM   Asset Management (16%)         - assetization, Asset State Periods, amend /
//                                           renew / cancel, Managed Assets, ramps
//   RCIM   Invoice Management (7%)        - billing schedules, invoice runs, credit memos,
//                                           tax, payment timing, usage rating
//
// TWO BOUNDARY RULES, stated so the next reader can reproduce the calls:
//   1. A question asking WHICH permission set or PSL unlocks a feature is RCPC
//      (configuration). RCIR is reserved for project-lifecycle, methodology, stakeholder
//      and deployment questions. Without this split RCIR would absorb every access
//      question and hide how thin the deck's project-readiness coverage really is.
//   2. Everything about usage -- rate cards and tier rate entries, Usage Management
//      ingestion, Usage Entitlement / Wallet -- is RCIM, because in Salesforce's own
//      documentation usage rating sits in the billing arc that ends at an invoice line.
//
//   node study-guides/reclassify-revenue-cloud.mjs      prints the exam-vs-deck table

export const CALLS = {

  // --- RCPC (18)
  'd672ec2a':'RCPC', 'bcf374b6':'RCPC', '464876c9':'RCPC', '2a61d2aa':'RCPC', '94a4585c':'RCPC',
  '894e7d14':'RCPC', 'b1cfb9c8':'RCPC', '9bac03e6':'RCPC', '25acadca':'RCPC', 'ea8501f7':'RCPC',
  '5ebe00f0':'RCPC', '38db2a91':'RCPC', '0b7cd50b':'RCPC', 'e02f90f5':'RCPC', '910c3b97':'RCPC',
  '42d9581e':'RCPC', 'b47e1bc8':'RCPC', 'df8f0748':'RCPC',

  // --- RCIR (8)
  '355a06ae':'RCIR', 'df252b03':'RCIR', 'a6b4c0e0':'RCIR', '6d2955d5':'RCIR', '11baead8':'RCIR',
  'd232fef5':'RCIR', '41493562':'RCIR', '2fd9af4b':'RCIR',

  // --- RCCAT (22)
  'ef770e8b':'RCCAT', '4b7a292c':'RCCAT', '43661ef6':'RCCAT', '32f0b06f':'RCCAT', '21608eee':'RCCAT',
  'c3716756':'RCCAT', '03439ed7':'RCCAT', '995de54c':'RCCAT', '231e4a3f':'RCCAT', '09695b88':'RCCAT',
  '05d04dbc':'RCCAT', 'a98e5518':'RCCAT', 'bc9001d5':'RCCAT', '69e0bfd0':'RCCAT', '32b73310':'RCCAT',
  'f769f864':'RCCAT', 'da605d37':'RCCAT', 'df19fa7d':'RCCAT', '0010599f':'RCCAT', 'cc6acf9f':'RCCAT',
  'c59aa725':'RCCAT', 'a1290dae':'RCCAT',

  // --- RCCPQ (25)
  '1ba9f913':'RCCPQ', 'fc7a413b':'RCCPQ', '2f16d956':'RCCPQ', '394bdad2':'RCCPQ', '244c6aa0':'RCCPQ',
  'f6c30064':'RCCPQ', '89816cb1':'RCCPQ', 'e2f73f23':'RCCPQ', 'e3a70193':'RCCPQ', 'b45b5d01':'RCCPQ',
  '015f552d':'RCCPQ', 'eac1d453':'RCCPQ', 'ca1076cd':'RCCPQ', '122cab6a':'RCCPQ', '747d4014':'RCCPQ',
  'cd2224b8':'RCCPQ', 'a152b80a':'RCCPQ', 'a5f8cfae':'RCCPQ', 'abd04873':'RCCPQ', '66577d14':'RCCPQ',
  '0821ddcd':'RCCPQ', '43e0f10a':'RCCPQ', '9de3e0b9':'RCCPQ', '4c19bd08':'RCCPQ', 'a4b16e2c':'RCCPQ',

  // --- RCCO (19)
  '747e0c6b':'RCCO', '37ee4c5f':'RCCO', '92f06ccd':'RCCO', 'd815a350':'RCCO', '86417498':'RCCO',
  'db199ded':'RCCO', '17453798':'RCCO', '3764c8f5':'RCCO', '3655d2ba':'RCCO', 'ef6c3e48':'RCCO',
  'a49cf7c1':'RCCO', 'd38922f8':'RCCO', '2a788a0c':'RCCO', '6f59e427':'RCCO', 'db7c75c3':'RCCO',
  '6f99fe4e':'RCCO', '1742b9ef':'RCCO', 'cdfa1139':'RCCO', '832c6c98':'RCCO',

  // --- RCAM (29)
  '4b342cdb':'RCAM', '0fc81879':'RCAM', 'c41101a6':'RCAM', '5b126341':'RCAM', '2cdbec2b':'RCAM',
  'fddbd719':'RCAM', 'f63e3f43':'RCAM', '74259f96':'RCAM', 'c74d7076':'RCAM', '435f2087':'RCAM',
  '6243552e':'RCAM', '6f6cf302':'RCAM', '39a152e8':'RCAM', '3d12dbca':'RCAM', 'b0621262':'RCAM',
  '6d3a68c2':'RCAM', 'f92918e7':'RCAM', '87836da2':'RCAM', 'f12dffa3':'RCAM', 'e7f19278':'RCAM',
  '1b631e67':'RCAM', '1092afe5':'RCAM', 'c60cb035':'RCAM', 'c9a0acc7':'RCAM', '36c657a7':'RCAM',
  '6f5c6ce5':'RCAM', '9bb4967d':'RCAM', '2a7b5f37':'RCAM', 'e242341d':'RCAM',

  // --- RCIM (14)
  '6a9ce9dd':'RCIM', 'ab527e42':'RCIM', 'ba4a4163':'RCIM', '826bd7e2':'RCIM', '234fe505':'RCIM',
  '9462b116':'RCIM', '287332c0':'RCIM', '0ff325db':'RCIM', 'ab6a9e3d':'RCIM', '1ab5f73e':'RCIM',
  '841f964e':'RCIM', '99592626':'RCIM', 'bac3a61d':'RCIM', '2ec8b053':'RCIM',
};

export const EXAM = { RCPC:18, RCIR:14, RCCAT:16, RCCPQ:18, RCCO:11, RCAM:16, RCIM:7 };
export const NAMES = {
  RCPC:'Platform Concepts',
  RCIR:'Implementation Readiness',
  RCCAT:'Catalog Management',
  RCCPQ:'Configure, Price, Quote',
  RCCO:'Contracts and Orders',
  RCAM:'Asset Management',
  RCIM:'Invoice Management',
};

// Sub-objectives named in the exam guide with NO deck item, found by reading all 135
// against the outline and confirmed by keyword sweep over stems, options and explanations
// on 2026-09-26. The count after each term is stems+options / stems+options+explanations.
export const UNCOVERED = [
  'Agentforce itself. "Given a set of customer requirements, INCLUDING USING AGENTFORCE, configure and generate an accurate pricing quote" is a named RCCPQ bullet, and the word Agentforce appears in 0 of 135 stems or option sets (2 explanations). On an exam now named after it, this is the single largest gap in the deck.',
  'Business Rules Engine (BRE). Named explicitly in the RCPC bullet beside Context Service, Omnistudio and APIs; 0 stems, 0 options, 0 explanations. Expression sets and decision matrices are never tested, though the deck does test decision TABLES twice.',
  'Scope of work and project plan (RCIR). The phrases return 0 hits anywhere in the deck. The whole 14% Implementation Readiness domain rests on 8 deck questions, and none of them is about producing a scoped plan.',
  'Prerequisite feature toggles (RCIR). 0 stems and 0 options; the two explanation hits are incidental. No question asks which toggles must be switched on before an ARM capability appears.',
  'Dashboards and KPIs built with native reporting (RCPC). "KPI" returns 0 anywhere. The two dashboard items name a packaged analytics app (0b7cd50b) or an intelligence setup step (b1cfb9c8); neither asks the reader to design a report or a metric.',
  'Omnistudio beyond document generation. Both hits (38db2a91, 832c6c98) are Document Generation. No OmniScript, FlexCard, Integration Procedure or DataRaptor question exists, though Omnistudio is named in the RCPC bullet.',
  'Stakeholder roles for CROSS-PRODUCT execution (RCIR). One item (6d2955d5) splits Catalog Administrator from Product Designer, which is catalog governance rather than the cross-product project roles the bullet describes.',
  'The renamed product surface. 66 of 135 stems say "Revenue Cloud"; "Agentforce Revenue Management" appears 0 times. Every Setup node, permission set and doc title a learner will meet now carries the new name.',
];

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/salesforce-revenue-cloud.json', 'utf8'));
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
      `${NAMES[d].padEnd(26)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d] * 0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100 * c / n).toFixed(1).padStart(5)}%`,
    );
  }
  console.log(`\n${UNCOVERED.length} sub-objectives with no deck item.`);
}
