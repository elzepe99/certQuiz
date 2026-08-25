// Independent re-classification of the integration deck against the OFFICIAL exam
// sub-objectives, assigned by reading each question's stem + option shape, NOT its _cat.
//
// Rubric (from the Platform Integration Architect exam guide):
//   L  Evaluate the Current System Landscape  - stem gives a system inventory; answer is a LIST OF SYSTEMS
//                                               to retire/integrate, or auth needs implied by the landscape
//   B  Evaluate Business Needs                - functional/non-functional requirements, data classification,
//                                               CRM success factors, growth/regulatory factors
//   T  Translate Needs to Integration Reqs    - what QUESTIONS to ask, what CONSTRAINTS to weigh, what DETAILS
//                                               to seek; options are considerations, not mechanisms
//   D  Design Integration Solutions           - which PATTERN / API / component; trade-offs; options are named
//                                               Salesforce capabilities
//   BS Build Solution                         - how to build/secure/scale it correctly; governor limits, error
//                                               handling, security implementation, test structure
//   M  Maintain Integration                   - a DEPLOYED integration being monitored, diagnosed, or recovered

export const CALLS = {
  // --- Design: pattern / API / mechanism selection -------------------------
  '3d8a6297':'D',  'fe6198ea':'D',  '204ecb7b':'D',  'c2f4de00':'D',  'cb33e302':'D',
  'bc4bd1c3':'D',  '7f8a6c4e':'D',  '0e24fe32':'D',  'f2f7e142':'D',  '4d0a8a2a':'D',
  '8b27f5cc':'D',  '66d6b4eb':'D',  'c4dea8e8':'D',  'fe31411d':'D',  'a0aede13':'D',
  'dfa1d6c3':'D',  '2d2847f9':'D',  '9c3563f9':'D',  '0aaa7b8e':'D',  '48dad154':'D',
  '29162f65':'D',  '64dbac17':'D',  '330133aa':'D',  '08387003':'D',  '1036ee6a':'D',
  'f27c80d0':'D',  '3e9c0602':'D',  '43c0f907':'D',  'c19a756b':'D',  '8e017d58':'D',
  '96db0af1':'D',  'c882d9d5':'D',  '06618d19':'D',  '27622822':'D',  'af38a65b':'D',
  '7df8a821':'D',  '4c463020':'D',  'd574fe9c':'D',  '9a718961':'D',  '066e5671':'D',
  '56b435be':'D',  '7e16054b':'D',  'cb609eba':'D',  'e5bf3115':'D',  'a132a2e6':'D',
  '7ccaaecd':'D',  'f83fef34':'D',  '467325f3':'D',  '30cfd44f':'D',  'c0703b46':'D',
  '94661057':'D',  'ca753119':'D',  '26690927':'D',  '0e17efb1':'D',  '98f55ac4':'D',
  '99cc8731':'D',  '7e0c9929':'D',  '8d52ccea':'D',  '51a18ab5':'D',  'ee41dd0d':'D',
  '6b00132e':'D',  '88260398':'D',  '8d786996':'D',  'd22573a6':'D',  '647f738a':'D',
  '172d35f9':'D',  '86b274f6':'D',

  // --- Build: implementation, limits, security, testing --------------------
  '462a24a7':'BS', '28cdff31':'BS', 'ce532d8e':'BS', '18073510':'BS', 'c5ef5da1':'BS',
  'c89951d6':'BS', '0c6b4514':'BS', 'f144dbbc':'BS', '0d07fbc6':'BS', '94c766ff':'BS',
  'e78d808e':'BS', 'c7d46b81':'BS', '96f938f3':'BS', '5f85d419':'BS', '5d6070eb':'BS',
  'ff6c0296':'BS', 'ebe2fbcc':'BS', 'b054672a':'BS', 'a5e8cb1c':'BS', '0f33e5ce':'BS',
  'c513d76c':'BS', '8b442951':'BS', '5f1013c3':'BS', '5a22406b':'BS', 'b05b0107':'BS',
  'c9390cba':'BS', '319a83b2':'BS', 'a1c7d77e':'BS', '2c39808a':'BS', '9dedc460':'BS',
  '9d80d87e':'BS', '3f678446':'BS', '96f3d6af':'BS', '8c231548':'BS', 'dcb49378':'BS',
  'db10108a':'BS', '1412cc42':'BS', '033b5964':'BS',

  // --- Maintain: deployed integration being monitored / recovered ----------
  '1e727a0e':'M',  '1c4425e4':'M',  '693cc93a':'M',  'a5560b30':'M',  '5291b286':'M',
  '55f0a2a3':'M',  'a9229c4d':'M',  '34ad5dd6':'M',  '0ae13744':'M',  '546064d6':'M',
  '96a75e6e':'M',  'b9ee192e':'M',  'd258eebd':'M',  'fc23a0ff':'M',

  // --- Translate: what to ask / what constraints to weigh ------------------
  'a2ae17cb':'T',  '9fa544c5':'T',  '643dff95':'T',  '3e6653bd':'T',  'dc227c12':'T',
  '21e6ad5a':'T',  '998dcfd8':'T',

  // --- Landscape: which systems to retire / integrate ----------------------
  '73466e15':'L',  '47d1f854':'L',  '3262c8d0':'L',  '9870fd76':'L',

  // --- Business needs ------------------------------------------------------
  '8e4c29b5':'B',  '2924d322':'B',  '46d002e1':'B',
};

// The most generous reading of the Translate objective, which includes
// "identify performance needs (volumes, response times, latency) and PROPOSE
// APPROPRIATE INTEGRATION SOLUTIONS". These Design questions are solution
// proposals driven entirely by a stated volume/latency figure, so a Salesforce
// item writer could plausibly file them under Translate instead.
export const STEELMAN_T = [
  '330133aa', // 10M financial transactions/day -> Salesforce Connect
  '9a718961', // 20M+ historical records -> Data Virtualization
  'cb609eba', // 2M records/day one-way -> Bulk API endpoint
  '647f738a', // 90s responses, 9s gateway timeout, 3000 concurrent users
  'ee41dd0d', // 2M accounts / 5.5M contacts initial load -> API set
  '7e16054b', // thousands of catalog changes/day -> nightly ETL
  '8b27f5cc', // surge of registration requests -> Request and Reply
  'c2f4de00', // gateway takes >30s -> Continuation
  'c19a756b', // 7-12s per query -> Outbound Message w/ callback
  '0aaa7b8e', // multi-source aggregation latency -> Continuation
];

export const EXAM = { L:8, B:11, T:22, D:28, BS:23, M:8 };
export const NAMES = {
  L:'Evaluate the Current System Landscape',
  B:'Evaluate Business Needs',
  T:'Translate Needs to Integration Requirements',
  D:'Design Integration Solutions',
  BS:'Build Solution',
  M:'Maintain Integration',
};
