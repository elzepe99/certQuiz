// Independent re-classification of the data_cloud_consultant_questions deck against the
// OFFICIAL exam outline, assigned by reading each question's stem + keyed option.
//
// THE PRODUCT AND THE EXAM HAVE BOTH BEEN RENAMED. Salesforce rebranded Data Cloud to
// **Data 360** on 14 October 2025, and the certification became the **Salesforce Certified
// Data 360 Consultant** on 27 March 2026 (exam code still Data-Con-101). All 100 stems and
// option sets deliberately keep the pre-rename vocabulary -- that is a settled repo
// decision, recorded under "Old product names" in CLAUDE.md -- so the current names live in
// the study guide and in the explanations, never in the options.
//
// The deck's own six `_cat` tags (Data Ingestion and Modeling, Segmentation and Insights,
// Act on Data, Data Cloud Overview, Data Cloud Setup and Administration, Identity
// Resolution) are the OLD outline. The current one has six domains with different
// boundaries -- notably it splits analysis and enrichment away from segmentation, which is
// what exposes this deck's real imbalance.
//
//   https://help.salesforce.com/s/articleView?id=005298940&type=1&language=en_US
//   read 2026-09-26; 60 scored questions, 105 minutes, 70% to pass, Spring '26 alignment
//
//   POS    Solution Positioning (14%)                    - terminology and business value,
//                                                          the foundational role in
//                                                          generative and predictive AI,
//                                                          initial use cases, data ethics
//   ADMIN  Setup and Administration (13%)                - permissions and permission sets,
//                                                          org-wide settings, data spaces,
//                                                          governance applied to config,
//                                                          dev lifecycle tooling, diagnosis
//   ING    Data Source Connection and Ingestion (18%)    - connectors and bundles, stream
//                                                          categories, refresh behaviour,
//                                                          formulas and transforms, keys,
//                                                          data collaboration and Zero-Copy
//   UNIF   Harmonization and Unification (17%)           - identity resolution, match and
//                                                          reconciliation rules, the data
//                                                          model, DMOs and relationships
//   ENH    Data Enhancements, Sharing, Analysis (18%)    - calculated and streaming
//                                                          insights, reports and
//                                                          dashboards, referencing Data 360
//                                                          from other systems, AI tooling
//   ACT    Data Activations and Utilization (20%)        - segments and containers,
//                                                          activations and targets, consent,
//                                                          publish schedules, Salesforce flows
//
// ONE BOUNDARY RULE, stated so the next reader can reproduce the calls: a question whose
// discriminator is a calculated or streaming INSIGHT is ENH, even when the scenario is a
// segment; a question whose discriminator is the segment, container, activation or flow is
// ACT. Without that split the two domains blur and the deck's 32-question activation block
// looks like balanced coverage rather than the overweight it is.
//
//   node study-guides/reclassify-data-cloud.mjs      prints the exam-vs-deck table

export const CALLS = {

  // --- POS (7)
  '3ce5cecc':'POS', '84996fff':'POS', '87c989ff':'POS', '9b1101be':'POS', 'a6d82413':'POS',
  'b2861a64':'POS', 'c50c16e0':'POS',

  // --- ADMIN (9)
  'aa78cb1b':'ADMIN', '480f5379':'ADMIN', '860708a5':'ADMIN', 'ddf8624d':'ADMIN', '1d6366ff':'ADMIN',
  '3e489c6f':'ADMIN', '3b0c0a4e':'ADMIN', 'ff10adbd':'ADMIN', '0a109a96':'ADMIN',

  // --- ING (23)
  'dab6989b':'ING', '6c28ea56':'ING', '086bbfd8':'ING', '575074ec':'ING', '3128d558':'ING',
  'a0813551':'ING', 'd45cb02d':'ING', '8fb738c4':'ING', '746c2926':'ING', '4dea9b59':'ING',
  '8446b713':'ING', '57588274':'ING', '214e0fc6':'ING', '159e1391':'ING', '74955e95':'ING',
  '062012ec':'ING', '485c7063':'ING', '008f7008':'ING', '7539b43f':'ING', '98eda96e':'ING',
  '282c475b':'ING', '4a344343':'ING', '4ea7fff4':'ING',

  // --- UNIF (16)
  'a82aca1f':'UNIF', '6c5846b5':'UNIF', 'd0a0a5f3':'UNIF', 'a76eedab':'UNIF', '859419eb':'UNIF',
  '53f152a2':'UNIF', 'd0755ebe':'UNIF', '704331e8':'UNIF', '31242001':'UNIF', '73954651':'UNIF',
  'a8a68101':'UNIF', 'ab4092db':'UNIF', 'ffde1996':'UNIF', '64df83e0':'UNIF', 'caf7811f':'UNIF',
  '579f07b4':'UNIF',

  // --- ENH (13)
  '056ea0e6':'ENH', 'd9f0e781':'ENH', 'e64df7b2':'ENH', '0b702723':'ENH', 'a032b276':'ENH',
  'b0006afc':'ENH', '98a2f67b':'ENH', 'ce553d2c':'ENH', '537887b3':'ENH', 'a40ce191':'ENH',
  'de949f0f':'ENH', '01c4c7ad':'ENH', '0e845e09':'ENH',

  // --- ACT (32)
  '7fc59544':'ACT', 'dc2c1055':'ACT', '0c1d58b4':'ACT', '9d9d4efd':'ACT', 'b35887c5':'ACT',
  '1148d70c':'ACT', 'e80443fb':'ACT', '29f828ca':'ACT', '884376a2':'ACT', '8f5494a9':'ACT',
  '0b277734':'ACT', '5ce00e3e':'ACT', 'b16bbc31':'ACT', '7001f646':'ACT', '625b0134':'ACT',
  '8a1c3eba':'ACT', '0147d0c4':'ACT', 'f3b19bee':'ACT', 'a0c8b14c':'ACT', '2646b393':'ACT',
  '17b95a6b':'ACT', 'e362f29c':'ACT', 'd917a833':'ACT', '4caa9078':'ACT', '300d941c':'ACT',
  'ee3e98b9':'ACT', 'b985f235':'ACT', 'e652607d':'ACT', 'f687a6b9':'ACT', 'e99bd25d':'ACT',
  '49ee75cb':'ACT', '4627a1a2':'ACT',
};

export const EXAM = { POS:14, ADMIN:13, ING:18, UNIF:17, ENH:18, ACT:20 };
export const NAMES = {
  POS:'Solution Positioning',
  ADMIN:'Setup and Administration',
  ING:'Data Source Connection and Ingestion',
  UNIF:'Harmonization and Unification',
  ENH:'Data Enhancements, Sharing, Analysis',
  ACT:'Data Activations and Utilization',
};

// Sub-objectives named in the exam guide with NO deck item, found by reading all 100
// against the outline and confirmed by keyword sweep over stems, options and explanations
// on 2026-09-26.
export const UNCOVERED = [
  'Zero-Copy and data collaboration. "Describe Data 360 data collaboration capabilities, INCLUDING ZERO-COPY" is a named ING bullet. "Zero-Copy" returns 0 hits anywhere in the deck, as do Snowflake, BigQuery, Databricks, Redshift, "data share" and "federat". An entire named capability is missing, not merely thin.',
  'The foundational role in generative and predictive AI (a named POS bullet). "generative" 0, "predictive" 0, "prediction" 0. The deck never connects Data 360 to grounding, prompts or agents.',
  'Predictive and generative AI tooling applied to customer scenarios (a named ENH bullet). Einstein Studio 0, Model Builder 0. The single "Einstein" hit (e64df7b2) is a distractor in a Tableau question.',
  'Data graphs. They appear once (8a1c3eba) and only as a WRONG answer, so no question teaches what they are or when to use one -- despite being the standard way to serve unified data to Agentforce and to APIs at low latency.',
  'Agentforce / prompt grounding from Data 360. 0 hits for Agentforce, Copilot or prompt. This is the whole reason Data 360 is positioned as it now is, and the deck predates it.',
  'Retrieval-augmented grounding -- retrievers, search indexes, vector search, chunking. 0 real hits (the three keyword matches are the substring "rag" inside "storage").',
  'Reports and dashboards ON Data 360 data (a named ENH bullet). One item (b0006afc) names Dashboard and Report as answers to a monitoring question; none asks the reader to build reporting over a DMO.',
  'Referencing Data 360 data from other systems (a named ENH bullet). One item (0e845e09, Profile API + LWC). No question covers the Connect/Query API surface for an external consumer.',
  'Development lifecycle tooling (a named ADMIN bullet). One item (aa78cb1b, data kits). No packaging, no sandbox-to-production promotion, no metadata deployment.',
  'The renamed permission sets. The four option sets naming them use the pre-September-2025 labels -- Data Cloud Admin, Marketing Specialist, Marketing Manager, "for Marketing Data Aware Specialist" -- and the current names (Data Cloud Architect, Activation Specialist, Activation Manager, Data Cloud Data Aware Specialist) appear only in explanations. Learn both; answer with the deck.',
];

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/data_cloud_consultant_questions.json', 'utf8'));
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
      `${NAMES[d].padEnd(38)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d] * 0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100 * c / n).toFixed(1).padStart(5)}%`,
    );
  }
  console.log(`\n${UNCOVERED.length} sub-objectives with no deck item.`);
}
