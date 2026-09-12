// Independent re-classification of the Identity and Access Management Architect deck
// against the OFFICIAL exam outline (Summer '23 alignment, six domains), assigned by
// reading each question's stem + option shape, NOT its _cat.
//
// The scrape's six tags ("Single Sign-On", "Integration with IdPs", "Identity
// Governance", "Salesforce Identity and CIAM", ...) do not map onto the outline's six
// domains, so the deck's own tags cannot be compared with the weights. Rubric:
//
//   CON  Identity Management Concepts (17%)       - auth patterns, AuthN/AuthZ/accountability,
//                                                   trust & certificates, provisioning methods in
//                                                   general, troubleshooting SSO failures, roles
//   ACC  Accepting Third-Party Identity (21%)     - Salesforce as SP: SAML settings, auth providers,
//                                                   delegated auth, JIT/SCIM from identity stores
//   IDP  Salesforce as an Identity Provider (17%) - OAuth flows, scopes, tokens, connected app
//                                                   OAuth config, SAML IdP, App Launcher, Canvas,
//                                                   outbound user provisioning
//   AMB  Access Management Best Practices (15%)   - MFA & session levels, login flows, assigning
//                                                   profiles/permission sets via SSO, audit tools,
//                                                   connected app policies
//   SFI  Salesforce Identity (12%)                - Identity Connect, Customer 360 Identity,
//                                                   license types
//   COM  Community (Partner and Customer) (18%)   - Experience Cloud login UX, external IdPs on
//                                                   sites, user/contact model, External Identity
//                                                   licence, embedded login
//
//   node study-guides/reclassify-iam.mjs      prints the exam-vs-deck table

export const CALLS = {
  // --- Identity Management Concepts -------------------------------------------
  'd8945628':'CON', '9c41e964':'CON', 'f66f3e91':'CON', 'c69d99c7':'CON', 'd182829d':'CON',
  '5e7db9c7':'CON', '2dfae498':'CON', '2af83e4d':'CON', '215bb6ba':'CON', 'ebadac3e':'CON',
  '7d8397bd':'CON', '6849d97f':'CON',

  // --- Accepting Third-Party Identity -------------------------------------------
  '334e7d60':'ACC', '0c8ef9d4':'ACC', 'c18bee92':'ACC', '1d59298d':'ACC', 'ce735840':'ACC',
  'a496a22b':'ACC', '81c2687b':'ACC', 'b6778f32':'ACC', '1084f821':'ACC', '29405f7c':'ACC',
  'e9b93b97':'ACC', '7fbbab5d':'ACC', '4b2727c1':'ACC', '59e63d81':'ACC', '337c210b':'ACC',
  '7cad7778':'ACC', '691dfc4d':'ACC', '363a20ab':'ACC', 'cadf3745':'ACC', 'e683c669':'ACC',
  'cee7f38e':'ACC', 'd204351d':'ACC', 'f92fcf74':'ACC', '7d27f534':'ACC',

  // --- Salesforce as an Identity Provider ---------------------------------------
  '714b577a':'IDP', 'fc878c46':'IDP', '156efedb':'IDP', '4ab56a8c':'IDP', '15899789':'IDP',
  'bd39ceda':'IDP', '0757243f':'IDP', 'cfcdee5c':'IDP', 'bd00c8e7':'IDP', '69fa254e':'IDP',
  '1dc68b52':'IDP', '4e82a592':'IDP', '8e61f426':'IDP', 'd605bce8':'IDP', '5c79dca8':'IDP',
  '69ba67ca':'IDP', '22e3dd32':'IDP', 'fcbec1e9':'IDP', '40262389':'IDP', '3fc81d5f':'IDP',
  '717f2404':'IDP', 'f2d065ed':'IDP', '9d91e5a2':'IDP', 'ee7f18ad':'IDP', 'b491280a':'IDP',
  '29476674':'IDP', '0901e6fc':'IDP', '545c4607':'IDP', 'bd3a96b8':'IDP', '17eafc8b':'IDP',
  '1fb58f49':'IDP', 'f351e88a':'IDP', 'eeb5dece':'IDP', '1e135665':'IDP', '5b30e615':'IDP',

  // --- Access Management Best Practices ---------------------------------------
  'f568388f':'AMB', '119806fb':'AMB', 'f5a4335a':'AMB', '9f08f844':'AMB', '8e6a6eab':'AMB',
  'efc3d13e':'AMB', 'c9f1c673':'AMB', '718a5942':'AMB', '0b12745c':'AMB', '8eb5fd50':'AMB',
  '7168b6c2':'AMB', '46545053':'AMB', 'b7fca343':'AMB', '2a790f16':'AMB', '504cf5e3':'AMB',
  '69c81641':'AMB', '387fb895':'AMB', '5a7927de':'AMB',

  // --- Salesforce Identity ------------------------------------------------------------
  '15e77a5d':'SFI', '26865975':'SFI', 'aaa8689c':'SFI', '8a87ff0b':'SFI', '0cb04857':'SFI',
  'f68f7018':'SFI', '76d8034d':'SFI', '3c32a06f':'SFI', '85a253b5':'SFI',

  // --- Community (Partner and Customer) -----------------------------------------
  'b9b88960':'COM', '41b2e0a5':'COM', 'cab60f07':'COM', 'cb1525b3':'COM', '2350f422':'COM',
  'b7a788a9':'COM', '5a50aa0b':'COM', 'c89c6e3d':'COM', '43c8e969':'COM', '09873c13':'COM',
  '340019b3':'COM', 'cf2e4959':'COM', 'd193c7d6':'COM', 'e178d75d':'COM', '2f0c70a9':'COM',
  '9f507c0e':'COM', '4549ec9c':'COM', 'cd584102':'COM',
};

export const EXAM = { CON:17, ACC:21, IDP:17, AMB:15, SFI:12, COM:18 };
export const NAMES = {
  CON:'Identity Management Concepts',
  ACC:'Accepting Third-Party Identity in Salesforce',
  IDP:'Salesforce as an Identity Provider',
  AMB:'Access Management Best Practices',
  SFI:'Salesforce Identity',
  COM:'Community (Partner and Customer)',
};

// Sub-objectives with no deck item, found by reading all 116 against the outline.
export const UNCOVERED = [
  'Embedded Login: what it is and when to use it (a named Community objective)',
  'Salesforce as an OpenID Connect provider: openid scope, id_token, UserInfo, identity URL, discovery',
  'OAuth 2.0 client credentials flow and PKCE on the web server flow',
  'MFA verification methods and which are NOT MFA (email/SMS codes)',
  'SSO troubleshooting tools: SAML Assertion Validator, Login History SSO error codes, Identity Provider Event Log',
  'Event Monitoring / Real-Time Event Monitoring as audit approaches beyond Login History and Login Forensics',
  'External Identity licence limits (10 custom objects, 10M logins/month) and complimentary Identity Only licences',
  'SAML SSO settings as a whole (identity type, identity location, request binding, JIT flags) rather than one field at a time',
];

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/salesforce_iam_architect_questions_corrected.json', 'utf8'));
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
      `${NAMES[d].padEnd(46)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d]*0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100*c/n).toFixed(1).padStart(5)}%`,
    );
  }
}
