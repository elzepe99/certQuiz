// Independent re-classification of the questions_data_architect_merged deck against the
// OFFICIAL exam outline, assigned by reading each question's stem + keyed option.
//
// UNLIKE MOST DECKS IN THIS REPO, THIS ONE'S `_cat` TAGS USE THE CURRENT DOMAIN NAMES.
// The six names match the published outline exactly. They were still not trusted: every
// item was re-read and placed on its own merits, and the table the runner prints is that
// re-reading, not the tags. The two agree on 122 of 135 (measured 2026-09-28); the 13
// disagreements are scattered across boundaries and move no domain by more than 3 items.
// NONE of them touches MDM, so the deck's 14 MDM items against a 5% domain are the deck's
// own weighting, not a tagging artefact.
//
// The exam is old: it aligns to Spring '23 and has not been rebuilt. Several of the
// deck's retired-product items (Data.com Clean, Async SOQL) are therefore what the exam
// still tests, not what the deck got wrong -- see the guide's section 11.
//
//   https://help.salesforce.com/s/articleView?id=005298972&type=1&language=en_US
//   read 2026-09-28; 60 scored questions, 105 minutes, 58% to pass, Spring '23 alignment
//
//   MOD   Data Modeling/Database Design (25%)   - objects, fields, relationships; a data
//                                                model that obeys sharing; business and
//                                                technical metadata; big objects vs
//                                                custom objects; AVOIDING DATA SKEW
//   MDM   Master Data Management (5%)           - implementation styles, survivorship,
//                                                enrichment from reference data; golden
//                                                record; winning attributes; traceability
//   SDM   Salesforce Data Management (25%)      - license types; data persisted
//                                                consistently; a single view of the
//                                                customer; data across multiple orgs
//   GOV   Data Governance (10%)                 - GDPR-compliant data model; classifying
//                                                and protecting personal data; enterprise
//                                                data governance programme
//   LDV   Large Data Volume Considerations (20%) - an LDV-scale data model; archiving and
//                                                purging; virtualised data
//   MIG   Data Migration (15%)                  - data quality at load time; LDV load
//                                                performance; exporting data
//
// FOUR BOUNDARY RULES, stated so the next reader can reproduce the calls:
//   1. Ownership and lookup SKEW and record locking as a property of the MODEL (a dummy
//      user owning everything, granular locking) is MOD, because "avoid data skew" is a
//      named MOD bullet. Locking that happens DURING A LOAD (sort children by parent,
//      serial mode, defer sharing) is MIG.
//   2. A big object chosen AS AN ARCHIVE is LDV (archiving and purging); a big object
//      chosen as the right home for a new data set is MOD.
//   3. PREVENTING duplicates as data is entered (duplicate and matching rules, validation)
//      is SDM "persisted in a consistent manner"; cleaning data BEFORE a load is MIG;
//      MEASURING data quality (completeness dashboards, quality standards) is GOV;
//      deciding the SYSTEM OF RECORD, or enriching from external reference data, is MDM.
//   4. External objects, Salesforce Connect, mashups and OData limits are LDV
//      ("virtualised data options"), whatever the stem's business framing.
//
//   node study-guides/reclassify-data-architect.mjs      prints the exam-vs-deck table

export const CALLS = {

  // --- MOD
  '72d0a97f':'MOD', '02273426':'MOD', '0fc4b859':'MOD', 'f545ffaf':'MOD', 'c36f8114':'MOD',
  '9af89c4a':'MOD', '83a2f38e':'MOD', '198da736':'MOD', 'e022ee79':'MOD', 'd48ebc5a':'MOD',
  '5634ebf7':'MOD', '0f2b2edb':'MOD', '4f297682':'MOD', 'fe70ca10':'MOD', '23b3dd3a':'MOD',
  '490f04a3':'MOD', 'ca99247f':'MOD', '9f7c2858':'MOD', '7363aa33':'MOD', '6d6fb137':'MOD',
  '660b65ef':'MOD', 'bc116afe':'MOD', '6cea8580':'MOD', 'b8dcc15e':'MOD', '04d735c5':'MOD',
  '32554451':'MOD', 'a248c5b4':'MOD', '94c7d168':'MOD', '5f012203':'MOD',

  // --- MDM
  '21f0d218':'MDM', 'e45b6fef':'MDM', '494f56e1':'MDM', 'bc6a239c':'MDM', '7320edf2':'MDM',
  '32c1152d':'MDM', '64fb7668':'MDM', 'f2c6a011':'MDM', '0799aef6':'MDM', 'b6e90eb0':'MDM',
  '7242428e':'MDM', 'd3d324d1':'MDM', '228d9ec1':'MDM', 'c04b9186':'MDM',

  // --- SDM
  '1dcb0fad':'SDM', 'e557d7c9':'SDM', '62d57046':'SDM', '03d3d67f':'SDM', 'a666ee8e':'SDM',
  '58b81f44':'SDM', 'bc9fbe75':'SDM', 'e1bb3531':'SDM', '653108ec':'SDM', 'fc881d63':'SDM',
  'dbda5ce8':'SDM', 'd944cd7b':'SDM', '1cead192':'SDM', '9a854137':'SDM', 'f033e669':'SDM',
  'd5dd4ffc':'SDM', '8a9dd0ab':'SDM', 'f0ec522a':'SDM', '1ec2a557':'SDM', '93c1c39f':'SDM',
  '82f8541b':'SDM', 'ce519e3c':'SDM',

  // --- GOV
  '2381fc3c':'GOV', '7864209e':'GOV', '3fa0d934':'GOV', '65d0445b':'GOV', 'fee3c3cb':'GOV',
  '4bce9573':'GOV', 'c3169fdf':'GOV', '917fdd2a':'GOV', '2720a20e':'GOV', '080ab665':'GOV',
  '62817718':'GOV', 'ba5e12d5':'GOV', '059c5083':'GOV', '7677c4b0':'GOV', '6aec9626':'GOV',

  // --- LDV
  '6c68223a':'LDV', '5e9beb7c':'LDV', '57575bec':'LDV', 'cd8a8399':'LDV', '2bc697cf':'LDV',
  'a53d5bba':'LDV', '3c855a77':'LDV', '835bdddc':'LDV', 'b335ae04':'LDV', 'f0db132b':'LDV',
  '0492a3b0':'LDV', '9463eb8c':'LDV', '37c626a7':'LDV', '75e5ce3f':'LDV', '5b6b6a9f':'LDV',
  '92c5ec17':'LDV', '4a391507':'LDV', '7aacafef':'LDV', '9c969490':'LDV', 'e3a36fd1':'LDV',
  '4c72af32':'LDV', '6df7398a':'LDV', 'c9b9df30':'LDV', '9ffe285d':'LDV', 'ec8bac62':'LDV',
  'd0fb5008':'LDV', 'ef7c3bbb':'LDV', '8240db57':'LDV', '086174ae':'LDV', 'c89f52dc':'LDV',

  // --- MIG
  '02d7d143':'MIG', '1829b7d4':'MIG', '87dfece5':'MIG', 'c18bcee7':'MIG', 'aacf221c':'MIG',
  'c99f1959':'MIG', '18c03f25':'MIG', '08d19a88':'MIG', 'bd39a845':'MIG', 'f7f8df0e':'MIG',
  '8060db43':'MIG', 'b2d96c78':'MIG', '46b07a60':'MIG', '50edde4f':'MIG', '22459270':'MIG',
  '49211aa0':'MIG', '1b5040e4':'MIG', '6a70c4d2':'MIG', 'cc82d27c':'MIG', '8a8b4d53':'MIG',
  'cef24a99':'MIG', '0fcda086':'MIG', '017a4f13':'MIG', 'b53c2dee':'MIG', '650e51cb':'MIG',
};

export const EXAM = { MOD:25, MDM:5, SDM:25, GOV:10, LDV:20, MIG:15 };
export const NAMES = {
  MOD:'Data Modeling/Database Design',
  MDM:'Master Data Management',
  SDM:'Salesforce Data Management',
  GOV:'Data Governance',
  LDV:'Large Data Volume Considerations',
  MIG:'Data Migration',
};

// Sub-objectives named in the exam guide with NO deck item, found by reading all 135
// against the outline and confirmed by keyword sweep over stems, options and explanations
// on 2026-09-28. Each is taught in the guide section named.
export const UNCOVERED = [
  'MDM implementation styles -- registry, consolidation, coexistence, centralised -- the first example the MDM bullet gives. 0 hits for registry, coexistence or "implementation style", despite 14 MDM items. Guide s4.',
  'Survivorship rules, thresholds and weights; canonical modelling; hierarchy management (all named in the MDM bullet). "canonical" and "hierarchy management" return 0; "survivorship" appears only inside explanations. Guide s4.',
  'Data lineage and taxonomy (named in the MOD metadata bullet). 0 hits. Dictionaries (c3169fdf, 6d6fb137) and classification (7864209e, 2381fc3c, 62817718) ARE covered. Guide s3.',
  'Consolidating or leveraging data across multiple Salesforce orgs -- its own SDM bullet, 2 items (1dcb0fad, e1bb3531). Guide s5.',
  'The erasure side of GDPR -- "Forget this individual", "Don\'t Process", anonymisation. 0 hits; consent (fee3c3cb, 080ab665) and classification are covered. Guide s6.',
  'Protecting personal data outside production. 0 hits for Data Mask; the DLD deck\'s 52e1dadf covers it. Guide s6.',
];

const { pathToFileURL } = await import('node:url');
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/questions_data_architect_merged.json', 'utf8'));
  const ids = new Set(deck.map(q => q.id));
  const missing = deck.filter(q => !(q.id in CALLS)).map(q => q.id);
  const stale = Object.keys(CALLS).filter(id => !ids.has(id));
  if (missing.length || stale.length) console.log('unclassified:', missing, 'stale:', stale);
  const n = deck.length;
  const counts = {};
  const tagged = {};
  for (const q of deck) {
    counts[CALLS[q.id]] = (counts[CALLS[q.id]] || 0) + 1;
    tagged[q._cat] = (tagged[q._cat] || 0) + 1;
  }
  console.log(`deck ${n} questions  |  exam 60 scored questions`);
  for (const d of Object.keys(EXAM)) {
    const c = counts[d] || 0;
    console.log(
      `${NAMES[d].padEnd(34)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d] * 0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100 * c / n).toFixed(1).padStart(5)}%   by tag ${String(tagged[NAMES[d]] || 0).padStart(3)}`,
    );
  }
  console.log(`\n${UNCOVERED.length} sub-objectives with no deck item.`);
}
