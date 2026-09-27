// Independent re-classification of the agentforce_specialist_questions deck against the
// OFFICIAL exam outline, assigned by reading each question's stem + keyed option.
//
// There is nothing to re-classify FROM: all 227 questions (121 until the 2026-09-26 import) carry the single tag "Salesforce
// Agentforce Specialist". The deck has no domain structure at all, so the table this file
// prints is the only view of where its weight actually sits.
//
// THE OUTLINE WAS REBUILT FOR SPRING '26 and it is a different exam from the one this deck
// was scraped against. Six domains now, and three of them -- Data 360 Fundamentals,
// Governance and Observability, Multi-Agent Orchestration -- did not exist as separate
// domains before. The authoring model changed too: the guide now names Agent Script,
// next-generation authoring (NGA), hybrid reasoning, and the Canvas and Script View, none of
// which appears anywhere in the deck.
//
//   https://help.salesforce.com/s/articleView?id=005298924&type=1&language=en_US
//   read 2026-09-26; 60 scored questions, 105 minutes, 72% to pass, Spring '26 alignment
//
//   PROMPT  Prompt Engineering (20%)            - when to use Prompt Builder, template
//                                                types, grounding technique, access
//                                                controls, the Trust Layer, model
//                                                management and BYO-LLM
//   D360    Data 360 Fundamentals (20%)         - the Agentforce Data Library, chunking,
//                                                indexing, retrievers, unstructured
//                                                sources, Model Builder
//   AGENT   AI Agents (35%)                     - how an agent reasons, Agent Script
//                                                building blocks, topics and actions,
//                                                deterministic behaviour via filters and
//                                                variables, channels, security context,
//                                                Employee vs Service agent, Agent API
//   TDM     Testing, Deployment, Maintenance    - Testing Center and its evaluations,
//           (10%)                                deploying agents and templates from
//                                                sandbox to production
//   GOV     Governance and Observability (10%)  - managing and monitoring agents, agent
//                                                analytics, agent optimization
//   MULTI   Multi-Agent Orchestration (5%)      - when a multi-agent architecture is
//                                                appropriate, MCP and A2A
//
// TWO BOUNDARY RULES, stated so the next reader can reproduce the calls:
//   1. Trust Layer CAPABILITIES -- masking, toxicity, prompt defense, dynamic grounding,
//      the audit trail -- are PROMPT, because the guide lists them under a Prompt
//      Engineering bullet. GOV is reserved for agent-level monitoring: Session Tracing,
//      utterance dashboards, analytics and optimization. Collapsing the two would hide
//      that GOV is a 10% domain resting on 2 deck questions.
//   2. The deck's eight Einstein-for-Service questions (Service Replies, Work Summaries,
//      Call Insights, Service AI Grounding: a5c36a06, 7fcd0d22, d7a65539, 03dbb7ca,
//      7b9b6189, 4f60aa61, f1ad48dc, 432e6ed5) map to NO current sub-objective. They are
//      filed under AGENT as the nearest domain rather than given an escape-hatch bucket,
//      and the study guide names them as the deck's stalest block.
//
//   node study-guides/reclassify-agentforce.mjs      prints the exam-vs-deck table

export const CALLS = {

  // --- PROMPT (46)
  'e3b0fcb4':'PROMPT', '65e4e8f4':'PROMPT', '683fdd78':'PROMPT', '4311b31c':'PROMPT', '3e120a2b':'PROMPT',
  'bbe307d2':'PROMPT', '2aaa194d':'PROMPT', 'f1260f25':'PROMPT', '5fc6ac13':'PROMPT', '02699cee':'PROMPT',
  '7d3ec7b7':'PROMPT', 'e6352f25':'PROMPT', '8669895d':'PROMPT', 'f36d01cc':'PROMPT', '0b77359c':'PROMPT',
  'c86206a7':'PROMPT', '66246094':'PROMPT', 'b7737952':'PROMPT', '66ad7b37':'PROMPT', '41b8067f':'PROMPT',
  'a18a8ddd':'PROMPT', '5f227c57':'PROMPT', 'fde9ef6d':'PROMPT', 'ddb9a877':'PROMPT', 'a8c6ed93':'PROMPT',
  'e58a492d':'PROMPT', '6e599964':'PROMPT', '80590e97':'PROMPT', '7173932f':'PROMPT', 'cd9ab1cf':'PROMPT',
  'e199bbfa':'PROMPT', '432e6ed5':'PROMPT', 'db26fe88':'PROMPT', '3c312af3':'PROMPT', 'af0f9726':'PROMPT',
  '2814c093':'PROMPT', '410726e6':'PROMPT', '8230cd22':'PROMPT', '994e8165':'PROMPT', 'eba7605b':'PROMPT',
  '5e73a591':'PROMPT', '7604dc8f':'PROMPT', '3c41e65a':'PROMPT', '370396f2':'PROMPT', '05f6c2b3':'PROMPT',
  '3011c45c':'PROMPT',

  // --- D360 (19)
  '06dc0bbf':'D360', '11676c36':'D360', 'e699b633':'D360', 'a11274ab':'D360', 'ce534337':'D360',
  '9c22a0d8':'D360', '606f05b2':'D360', 'bdc1f672':'D360', '42129525':'D360', '381ae8be':'D360',
  '3224ed4d':'D360', '1a438749':'D360', '2c9175ff':'D360', '8b365e6c':'D360', '223dd5bd':'D360',
  '6baf71a9':'D360', '5cf8d8af':'D360', 'c7919e17':'D360', '5697b1fb':'D360',

  // --- AGENT (42)
  'acc14d39':'AGENT', '6a1ae055':'AGENT', 'ec7f56b9':'AGENT', '2de3ea26':'AGENT', 'ec49a7e9':'AGENT',
  '67ac4dbb':'AGENT', 'a5c36a06':'AGENT', '28b3a429':'AGENT', '31068c78':'AGENT', '0160ee78':'AGENT',
  '7fcd0d22':'AGENT', 'c7094780':'AGENT', 'd7a65539':'AGENT', 'a623ffd0':'AGENT', '281cd372':'AGENT',
  '014997d2':'AGENT', '03dbb7ca':'AGENT', '79b1b8b1':'AGENT', '7b9b6189':'AGENT', 'd58f1670':'AGENT',
  '0e61252b':'AGENT', '797bec34':'AGENT', '1a055309':'AGENT', '0b45cf29':'AGENT', 'c15ac147':'AGENT',
  '6366295a':'AGENT', '668d6ff3':'AGENT', '78924287':'AGENT', 'e68a8732':'AGENT', 'a5e3e038':'AGENT',
  '0ea26bd8':'AGENT', '4f60aa61':'AGENT', 'f1ad48dc':'AGENT', '48997a5e':'AGENT', 'b02b7fbe':'AGENT',
  '1b821f4b':'AGENT', '177ef534':'AGENT', 'f02b7e14':'AGENT', '81823826':'AGENT', '1c4982a0':'AGENT',
  '52194fa8':'AGENT', '16abd9cf':'AGENT',

  // --- TDM (11)
  'e6949181':'TDM', 'a44b4810':'TDM', '456918e7':'TDM', 'b37ea07b':'TDM', '0dd5d1d6':'TDM',
  '8ad060ca':'TDM', '63afa960':'TDM', '818da706':'TDM', '54b6a45e':'TDM', 'b2206ef2':'TDM',
  '52a560b9':'TDM',

  // --- GOV (2)
  'f97b4b49':'GOV', 'f5501338':'GOV',

  // --- MULTI (1)
  'db66ac22':'MULTI',
  // --- 2026-09-26 import: 106 questions from the v2026-08-19 dump, called by the same rules
  // PROMPT (+34)
  '99c2546e':'PROMPT', '99b042b3':'PROMPT', '0289c710':'PROMPT', '91a40a4b':'PROMPT', '612eaa5c':'PROMPT',
  '28fd0a5e':'PROMPT', '34335501':'PROMPT', '937a6e43':'PROMPT', 'e4dbb0be':'PROMPT', '8fd31b1d':'PROMPT',
  'dd8cce0f':'PROMPT', 'b60aba06':'PROMPT', '54af4b28':'PROMPT', '84a2d57a':'PROMPT', '6b4ee217':'PROMPT',
  'ce5fa288':'PROMPT', 'b3fba281':'PROMPT', '8fd58175':'PROMPT', '69b6ec7d':'PROMPT', 'eb9f3369':'PROMPT',
  'e06e1688':'PROMPT', '01776739':'PROMPT', '0ec1e97a':'PROMPT', '9352ea5f':'PROMPT', 'b95f0351':'PROMPT',
  'e84c4bab':'PROMPT', 'e7a4ae4d':'PROMPT', '934a80a2':'PROMPT', 'e9fcbcbc':'PROMPT', 'b7235ace':'PROMPT',
  'f5285b77':'PROMPT', '91eceaaf':'PROMPT', '6e2e159c':'PROMPT', '21476283':'PROMPT',
  // D360 (+20)
  '6808979b':'D360', '1a925829':'D360', '63a974c4':'D360', 'ebc354d1':'D360', 'bd5a62cb':'D360',
  '5cbefbee':'D360', 'e38eec6a':'D360', '99cb6909':'D360', '3f486e60':'D360', '119c02e9':'D360',
  'ae9f4816':'D360', 'bcdba8b9':'D360', 'cddc1715':'D360', '502244f6':'D360', 'a74a21c6':'D360',
  'dc4850e9':'D360', 'fb24d431':'D360', '66aab7c1':'D360', '0912d189':'D360', '3ab24f47':'D360',
  // AGENT (+33)
  '1445442b':'AGENT', '0cdd5e59':'AGENT', 'e0390194':'AGENT', 'adc9eb42':'AGENT', '3641dfeb':'AGENT',
  '8fc464d2':'AGENT', '924940af':'AGENT', '361ad781':'AGENT', 'b2a77f20':'AGENT', '1f4db906':'AGENT',
  '8f6695af':'AGENT', '84eea5a1':'AGENT', 'fb587b25':'AGENT', 'bf1df653':'AGENT', 'b0079191':'AGENT',
  '1859bf70':'AGENT', '2e050c26':'AGENT', 'f2bd41ad':'AGENT', 'c6ff24aa':'AGENT', 'cfb28ed5':'AGENT',
  '6fb289fc':'AGENT', '853a9381':'AGENT', '73f6b1a2':'AGENT', '23d1457b':'AGENT', 'e6327216':'AGENT',
  'bb71fb2f':'AGENT', '94da16ff':'AGENT', 'b13d8bdb':'AGENT', 'dc3d23e2':'AGENT', 'b82f8c77':'AGENT',
  '8c4cb037':'AGENT', 'c530da02':'AGENT', '6e6b152c':'AGENT',
  // TDM (+8)
  '9446e711':'TDM', '3733cf83':'TDM', 'a0031bf9':'TDM', '8a75d4ac':'TDM', '8796d3a5':'TDM',
  'b66538d2':'TDM', '2d41f91f':'TDM', '7f39af7b':'TDM',
  // GOV (+6)
  '1ee2da69':'GOV', '8ea3652a':'GOV', '2c497408':'GOV', '2dbc88a4':'GOV', '2e95acca':'GOV',
  '5e3a00f5':'GOV',
  // MULTI (+5)
  'bf884682':'MULTI', '173480bc':'MULTI', '2f3c2e1b':'MULTI', '96f5ba24':'MULTI', '7482dc59':'MULTI',
};

export const EXAM = { PROMPT:20, D360:20, AGENT:35, TDM:10, GOV:10, MULTI:5 };
export const NAMES = {
  PROMPT:'Prompt Engineering',
  D360:'Data 360 Fundamentals',
  AGENT:'AI Agents',
  TDM:'Testing, Deployment, Maintenance',
  GOV:'Governance and Observability',
  MULTI:'Multi-Agent Orchestration',
};

// Sub-objectives named in the Spring '26 exam guide with NO keyed deck item. First found by
// reading all 121 against the outline on 2026-09-26; re-swept over stems, options and keyed
// answers after the same day's 106-question import (227 questions). Seven of the original
// twelve were closed by that import -- see CLOSED_2026_09_26 below.
export const UNCOVERED = [
  'Next-generation authoring (NGA). Named in the guide audience description as the way candidates are expected to engineer agents; still 0 hits in the deck after the 2026-09-26 import.',
  'Template expressions as a determinism mechanism. The AGENT bullet names "filters, variables, and template expressions". Filters and variables are now well covered, including Agent Script\'s available when and mutable, but template expressions appear once, only as a DISTRACTOR (8f6695af).',
  'Agent Script in Canvas and Script View. Hybrid reasoning is now keyed (b0079191, 1859bf70), but Canvas View and Script View appear only as distractors in those same two items, so the deck never teaches what each view is for.',
  'The Voice channel. The AGENT bullet names "digital experience, email, voice, and Slack". The two "voice" hits are sales call recordings (Einstein Conversation Insights), not an agent deployed on a voice channel. Email (1b821f4b) and Slack (1c4982a0, and the 2026-09-26 Slack item) are covered.',
  'Standard topics. The AGENT bullet pairs "standard topics, custom topics, standard Agent actions, and custom Agent actions"; "standard topic" and "standard subagent" still return 0. The deck only ever configures custom ones.',
  'The renamed data platform, partly. Before the import "Data 360" appeared in 0 option sets; seven stems or option sets now use it, but the older items still say "Data Cloud" as scraped, per the standing product-rename decision.',
];

// Closed by the 2026-09-26 import, each by at least one KEYED item (not a distractor):
export const CLOSED_2026_09_26 = [
  'Agent Script and its building blocks: run versus reasoning.actions (1445442b), mutable (0cdd5e59), before_reasoning (e0390194), available when gating (8f6695af, cfb28ed5, e6327216), run ordering (6e6b152c).',
  'Hybrid reasoning: b0079191, 1859bf70.',
  'Multi-Agent architecture: SOMA with an orchestrator (7482dc59).',
  'The A2A protocol as a keyed answer: bf884682, 2f3c2e1b, 96f5ba24. MCP gains a keyed scenario too (173480bc).',
  'Agent analytics and agent optimization: Agent Analytics (1ee2da69, 8ea3652a), agent inspection (2dbc88a4).',
  'Managing and monitoring agents: enhanced event logs (2c497408, 5e3a00f5), consumption in Digital Wallet (2e95acca).',
  'How Testing Center evaluations work: coherence (8a75d4ac), custom LLM-judge scorers (b66538d2), action assertion (7f39af7b).',
];

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/agentforce_specialist_questions.json', 'utf8'));
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
      `${NAMES[d].padEnd(32)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d] * 0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100 * c / n).toFixed(1).padStart(5)}%`,
    );
  }
  console.log(`\n${UNCOVERED.length} sub-objectives with no keyed deck item (${CLOSED_2026_09_26.length} closed by the 2026-09-26 import).`);
}
