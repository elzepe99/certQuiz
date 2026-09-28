// Independent re-classification of the sharing_visibility_questions_corrected deck against
// the OFFICIAL exam outline, assigned by reading each question's stem + keyed option.
//
// THIS DECK'S `_cat` TAGS USE THE CURRENT DOMAIN NAMES, and the re-reading agreed with
// them on 129 of 136. The seven disagreements, all deliberate:
//   af9c0811  Records -> Implications   a licence choice for 1M distributor users is a
//                                       named "license limitations" bullet
//   5314dea1  Records -> Other Data     a file posted to Chatter; its own variant 7afcfb38
//                                       is already tagged Other Data, so the pair now agree
//   c095ab36  Permissions -> Implications  keys runAs + `with sharing` as the way to TEST
//                                       Apex managed sharing; its twin b3eeee28 is tagged
//                                       Implications, so the pair now agree
//   0da8893e, d2ab6b1e, b53a73d3
//            Permissions -> Other Data  where to keep an encryption key, a partner's
//                                       private key, and callout credentials: protected
//                                       custom metadata, named credentials, encrypted
//                                       fields. None is a standard or custom object record,
//                                       which is exactly what "Access to Other Data" names
//   d2a77885  Other Data -> Records     price book sharing is an OWD plus manual sharing on
//                                       a standard object -- a record-access question
//
// The exam is old: it aligns to Winter '23 and has not been rebuilt. That matters here
// more than on any other deck in the batch, because Apex's security defaults moved after
// it -- see the guide's section 11 on runAs and user mode.
//
//   https://help.salesforce.com/s/articleView?id=005298977&type=1&language=en_US
//   read 2026-09-28; 60 scored questions, 120 minutes, 58% to pass, Winter '23 alignment
//
//   PERM   Permissions to Standard Objects, Custom Objects, and Fields (27%)
//          - object and field permissions; hiding data in the UI; protecting sensitive data
//            (PCI, PII, HIPAA); programmatic enforcement of security settings
//   REC    Access to Records (39%)
//          - OWDs; role hierarchy; sharing rules; groups; teams; object relationships;
//            programmatic sharing; external users; record access overrides
//   OTHER  Access to Other Data (16%)
//          - access control for data that is NOT a standard or custom object record:
//            files, reports and folders, list views, external objects, secrets
//   IMPL   Implications of Security Model Choice (18%)
//          - scalability of the sharing solution; licence limitations; testing the model
//
// ONE BOUNDARY RULE, stated so the next reader can reproduce the calls: a question whose
// discriminator is HOW TO TEST OR REVIEW the model (runAs, Login As, exporting AccountShare,
// the Sharing button as a troubleshooting tool) is IMPL, even when the mechanism under test
// is Apex managed sharing. A question that asks which mechanism GRANTS the access is REC.
//
//   node study-guides/reclassify-sharing-visibility.mjs      prints the exam-vs-deck table

export const CALLS = {

  // --- PERM (22)
  '43c201b6':'PERM', '5511f656':'PERM', '6449a136':'PERM', '28b6b693':'PERM', '67edf27b':'PERM',
  'c46ab0fb':'PERM', '89980a66':'PERM', '7f7fa913':'PERM', 'f5aa4d62':'PERM', '0f59fb2a':'PERM',
  'f06ffe05':'PERM', '719e1654':'PERM', 'cf36748a':'PERM', 'abd2e57b':'PERM', '6a078f90':'PERM',
  'c9f8748f':'PERM', '2da3072b':'PERM', '5cb48d4c':'PERM', 'ced866bb':'PERM', '43b7241d':'PERM',
  '79d8546f':'PERM', '2f29255d':'PERM',

  // --- REC (75)
  '68234b0a':'REC', 'ec162781':'REC', '437bd895':'REC', '96a7a404':'REC', 'ecf35f6a':'REC',
  '2832551d':'REC', '7fa7594e':'REC', '921e28b3':'REC', 'dd4f428b':'REC', '1b589ed2':'REC',
  '13e3a0cb':'REC', 'f1429a6d':'REC', '16f36e7f':'REC', '741614b9':'REC', 'b893344a':'REC',
  '6da44329':'REC', '3f6904d6':'REC', '4f9508a6':'REC', '618edffa':'REC', 'a6f0638d':'REC',
  '0b41ca5b':'REC', '22d45cc8':'REC', 'f3efd3c8':'REC', '24abccb1':'REC', '117ae517':'REC',
  '4bea0db4':'REC', '9c505fbc':'REC', '46cf2c6f':'REC', 'db6b37d7':'REC', '42ccc679':'REC',
  'a83888b8':'REC', '9e11ff8d':'REC', 'ee79628f':'REC', '6d1a5b71':'REC', '3f1bd5c8':'REC',
  '194620fe':'REC', '4e0dddf6':'REC', '681f22f4':'REC', 'd7d3c195':'REC', '983d7217':'REC',
  '422ad2b2':'REC', '3f1c2bdd':'REC', '8ae19d48':'REC', 'cb6172cb':'REC', 'cdd5ba1f':'REC',
  '3b49876e':'REC', 'fb42a7b6':'REC', '30e22baa':'REC', '74a0ea4f':'REC', '276034b7':'REC',
  '09e21052':'REC', 'c0ec1bcc':'REC', '4b9d4422':'REC', 'ca3ab1d9':'REC', '1ef169fc':'REC',
  'fa10f587':'REC', 'fe00eb7f':'REC', '60dad09b':'REC', '2b38c47f':'REC', 'd2a77885':'REC',
  '95971092':'REC', '32ca6c0b':'REC', '60ea3a4c':'REC', '06f9e603':'REC', 'b3fc0de1':'REC',
  '33731b3c':'REC', 'b90e1a88':'REC', '1cb4aa5f':'REC', '5a108e57':'REC', '7d2c8e5f':'REC',
  'fe13cd62':'REC', '843915dd':'REC', '5766ea42':'REC', 'e53d2012':'REC', '2606e3be':'REC',

  // --- OTHER (17)
  '42219114':'OTHER', '0da8893e':'OTHER', 'e39a74a8':'OTHER', '11c6463d':'OTHER', 'ea780ddf':'OTHER',
  '5314dea1':'OTHER', 'd40bd22a':'OTHER', '7afcfb38':'OTHER', 'd2ab6b1e':'OTHER', '19b83d4f':'OTHER',
  'b1f7ddb3':'OTHER', 'f8cfaa5e':'OTHER', '0fa57dbd':'OTHER', '83bc5172':'OTHER', 'b53a73d3':'OTHER',
  'e4ff9eb3':'OTHER', '36f6a143':'OTHER',

  // --- IMPL (22)
  '57e4ff8c':'IMPL', 'af9c0811':'IMPL', '5982cba0':'IMPL', '09876cfd':'IMPL', '57ea8ddf':'IMPL',
  'd8e912b9':'IMPL', '80e1fa53':'IMPL', 'b3eeee28':'IMPL', 'a8ae2576':'IMPL', 'e4de4c7a':'IMPL',
  '9dde825b':'IMPL', 'd603efad':'IMPL', 'ebfaa49e':'IMPL', 'd91acca1':'IMPL', 'b9762333':'IMPL',
  'ffc0447d':'IMPL', '094a753b':'IMPL', '43e1b231':'IMPL', 'c095ab36':'IMPL', '32457136':'IMPL',
  '53a40bfb':'IMPL', 'b26eae84':'IMPL',
};

export const EXAM = { PERM:27, REC:39, OTHER:16, IMPL:18 };
export const NAMES = {
  PERM:'Permissions to Objects and Fields',
  REC:'Access to Records',
  OTHER:'Access to Other Data',
  IMPL:'Implications of Security Model Choice',
};

// Sub-objectives named in the exam guide with NO deck item, found by reading all 136
// against the outline and confirmed by keyword sweep over stems, options and explanations
// on 2026-09-28. Each is taught in the guide section named, except the last.
export const UNCOVERED = [
  'Programmatic enforcement the modern way: WITH USER_MODE, `as user` DML, AccessLevel, stripInaccessible, WITH SECURITY_ENFORCED. All 0 hits. The deck teaches only isAccessible() (43c201b6, abd2e57b) and sharing keywords. Guide s3.',
  'Permission set groups and muting permission sets. 0 hits in the object-permissions domain. Guide s3.',
  'Scoping rules, and that they do not restrict access. 0 hits. Guide s3.',
  'Regulated data (PCI, PII, HIPAA) named as a requirement -- a PERM bullet. 0 hits for all three; Event Monitoring and Transaction Security also 0. Six encryption items exist. Guide s3.',
  'Restriction rules -- the one mechanism that narrows access after sharing grants it. 0 hits. Guide s4.',
  'Manager groups (under the REC "groups" bullet). 0 hits. Guide s4.',
  'The external OWD ceiling -- external access cannot be more permissive than internal. External OWDs appear (42ccc679) but the rule is stated nowhere. Guide s4.',
  'Guest users and Knowledge article visibility. 0 hits for either. Named in the guide as gaps but NOT taught: no documentation was rendered for them in this pass.',
];

const { pathToFileURL } = await import('node:url');
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/sharing_visibility_questions_corrected.json', 'utf8'));
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
