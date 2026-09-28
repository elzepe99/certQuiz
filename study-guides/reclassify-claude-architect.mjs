// Independent re-classification of the claude_architect_foundations deck against the
// OFFICIAL exam blueprint, assigned by reading each question's stem + keyed option.
//
// The deck's own _cat tags (Tool Design, Prompt Engineering, MCP, Agent SDK & Multi-Agent
// Systems, Context Management, Claude Code, Agent Behavior, Guardrails & Enforcement, API
// Fundamentals) are nine topic labels written by whoever authored the deck. None of them is
// an exam domain, so the table this file prints is the only view of where its weight sits.
//
// THE OUTLINE IS A PDF, NOT A WEB PAGE. The certification page on Anthropic's Skilljar
// academy carries the five domain weights, the item count, the time limit and the fee as
// plain text, and links an exam guide PDF on an S3 bucket. The PDF holds the 30 task
// statements, which are what UNCOVERED below diffs against:
//
//   https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request
//     (redirects to anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification)
//   "Claude Certified Architect - Foundations Exam Guide", Version 1.0, effective July 2026,
//   exam code CCAR-F; fetched with curl and extracted with pdfminer on 2026-09-28.
//   60 items, 120 minutes, scaled 720 of 1,000 to pass, US$125, 4 scenarios drawn from 6.
//
//   ARCH   Agentic Architecture & Orchestration (27%)  - 1.1 agentic loops and stop_reason,
//                                                        1.2 coordinator-subagent, 1.3 subagent
//                                                        invocation and context passing, 1.4
//                                                        enforcement and handoff, 1.5 SDK hooks,
//                                                        1.6 task decomposition, 1.7 sessions
//   TOOLS  Tool Design & MCP Integration (18%)         - 2.1 tool interfaces and descriptions,
//                                                        2.2 structured MCP errors, 2.3 tool
//                                                        distribution and tool_choice, 2.4 MCP
//                                                        servers in Claude Code, 2.5 built-in tools
//   CODE   Claude Code Configuration & Workflows (20%) - 3.1 CLAUDE.md hierarchy, 3.2 commands and
//                                                        skills, 3.3 path-specific rules, 3.4 plan
//                                                        mode, 3.5 iterative refinement, 3.6 CI/CD
//   PROMPT Prompt Engineering & Structured Output (20%)- 4.1 explicit criteria, 4.2 few-shot, 4.3
//                                                        tool_use + JSON schema, 4.4 validation and
//                                                        retry, 4.5 batch processing, 4.6
//                                                        multi-instance review
//   CTX    Context Management & Reliability (15%)      - 5.1 long-conversation context, 5.2
//                                                        escalation, 5.3 error propagation, 5.4
//                                                        large-codebase exploration, 5.5 human
//                                                        review and calibration, 5.6 provenance
//
// Boundary rules, so the next import is classified the same way:
//   - A STRUCTURED ERROR RESPONSE from a single tool (isError, errorCategory, retryable) is
//     TOOLS (2.2). How a SUBAGENT reports failure to its COORDINATOR is CTX (5.3). The deck
//     has five of the first and none of the second.
//   - A HOOK that blocks a tool call is ARCH (1.5), not a guardrail bucket of its own.
//   - Whether to split or consolidate tools is TOOLS (2.1) whichever way the item keys it.
//   - Escalation and frustration handling is CTX (5.2), even though the deck tags it "Agent
//     Behavior".
//   - Spawning subagents TO RELIEVE CONTEXT during exploration is CTX (5.4); spawning them
//     for PARALLELISM is ARCH (1.3).
//   - Generic prompt hygiene with no task statement behind it -- temperature, Markdown table
//     columns, section headings, "put the role in the system prompt" -- is filed under PROMPT
//     as the nearest domain. OFF_OUTLINE names them; there is no escape-hatch code.

export const CALLS = {
  // ARCH (2)
  'd7436e92':'ARCH', // 1.3 parallel subagents: two Agent (formerly Task) calls in one response
  '17865baf':'ARCH', // 1.5 hook blocks refunds over $500 -- the exam's own example
  // TOOLS (12)
  '4d183e4f':'TOOLS', // 2.1 composite discover_and_analyze tool
  'b091b723':'TOOLS', // 2.1 confirmation shows the full tool input
  '36351fa3':'TOOLS', // 2.1 consolidate semantically overlapping tools
  '92663975':'TOOLS', // 2.1 split a unified tool for parameter accuracy
  '06907581':'TOOLS', // 2.1 accept property_id, resolve the address internally
  '16885805':'TOOLS', // 2.1 parameter descriptions over schema constraints
  'bfe8ab8d':'TOOLS', // 2.2 retriable:false for business errors
  '76ecf70b':'TOOLS', // 2.2 structured error as normal tool output
  '4cd0dc5e':'TOOLS', // 2.2 errorCategory + isRetryable -- the exam's own field names
  '17dbb318':'TOOLS', // 2.2 isError in the tool result
  '9bdf39a6':'TOOLS', // 2.2 JSON-RPC protocol error vs isError tool result
  'ecb1b560':'TOOLS', // 2.4 use the existing Jira MCP server
  // CODE (2)
  '0c6bd014':'CODE', // 3.2 project skill in .claude/skills/, committed
  '8c9e856e':'CODE', // 3.6 --bare plus --append-system-prompt-file in CI
  // PROMPT (6)
  '2a123dd1':'PROMPT', // 4.2 few-shot examples to cut false positives
  '63976ace':'PROMPT', // 4.3 specify the JSON schema
  'f77a79ec':'PROMPT', // off-outline: role in the system prompt
  '5b0490ba':'PROMPT', // off-outline: exact Markdown column names
  '4a3ae657':'PROMPT', // off-outline: headings for maintainability
  '8248aea1':'PROMPT', // off-outline: lower temperature
  // CTX (6)
  'e5bbf3a3':'CTX', // 5.1 structured issue data in a separate context layer
  '9de1fc0a':'CTX', // 5.2 acknowledge frustration, offer to resolve
  'a517cd7f':'CTX', // 5.2 escalation triggers
  'c720d4bb':'CTX', // 5.4 subagents for specific questions during exploration
  'e9f005d6':'CTX', // 5.6 publication dates in structured output
  '5eb4dfc6':'CTX', // 5.6 claim-to-source index through synthesis
};

export const EXAM = { ARCH:27, TOOLS:18, CODE:20, PROMPT:20, CTX:15 };
export const NAMES = {
  ARCH:'Agentic Architecture & Orchestration',
  TOOLS:'Tool Design & MCP Integration',
  CODE:'Claude Code Configuration & Workflows',
  PROMPT:'Prompt Engineering & Structured Output',
  CTX:'Context Management & Reliability',
};

// Deck items that map to no task statement in the v1.0 exam guide. Filed under PROMPT as the
// nearest domain; they buy practice on things the exam does not list. System prompts do
// appear in the guide's appendix of technologies, so f77a79ec is the weakest case of the four.
export const OFF_OUTLINE = ['5b0490ba', '4a3ae657', '8248aea1', 'f77a79ec'];

// The four items CLAUDE.md records as "agent-design judgment no vendor page settles". The
// exam guide's own task statements state each keyed answer almost word for word, so on THIS
// exam they are settled by the blueprint, even though no product documentation page is.
export const JUDGMENT_SETTLED_BY_BLUEPRINT = {
  'e9f005d6':'5.6 "Requiring subagents to include publication or data collection dates in structured outputs"',
  '5eb4dfc6':'5.6 "Requiring subagents to output structured claim-source mappings ... that downstream agents preserve through synthesis"',
  '9de1fc0a':'5.2 "Acknowledging frustration while offering resolution when the issue is within the agent\'s capability"',
  'a517cd7f':'5.2 "customer requests for a human, policy exceptions/gaps (not just complex cases), and inability to make meaningful progress"',
};

// Task statements in the v1.0 exam guide with NO keyed deck item. Read against all 28 on
// 2026-09-28, then confirmed with a keyword sweep over stems and options; every nonzero hit
// was read (Grep and Glob appear only as distractors in c720d4bb; "coordinator" only in
// scenario boilerplate and in 5.6 items; "plan mode" only in 0c6bd014's scenario text).
export const UNCOVERED = [
  '1.1 The agentic loop: continue on stop_reason "tool_use", stop on "end_turn", and the three anti-patterns (parsing text, iteration caps, checking for text). "stop_reason" returns 0.',
  '1.2 Coordinator design: dynamic subagent selection, partitioning scope, iterative refinement, and the too-narrow decomposition failure. "decompos" returns 0.',
  '1.4 Programmatic prerequisites (block process_refund until get_customer verified) and structured handoff summaries. "prerequisite" and "handoff" return 0.',
  '1.6 Prompt chaining versus dynamic decomposition, and per-file plus cross-file review passes.',
  '1.7 Sessions: --resume with a name, fork_session, and starting fresh with a summary when tool results are stale. "resume" and "fork" return 0.',
  '2.3 Tool distribution across agents (4-5 per agent, not 18) and tool_choice "auto" / "any" / forced. "tool_choice" returns 0.',
  '2.5 Built-in tool selection: Grep for content, Glob for paths, Edit with Read+Write as the fallback. Grep and Glob appear only as distractors.',
  '3.1 CLAUDE.md hierarchy (user / project / directory), @import, .claude/rules/, /memory. "@import" and ".claude/rules" return 0.',
  '3.3 Path-specific rules: paths: frontmatter with globs, and why they beat subdirectory CLAUDE.md files.',
  '3.4 Plan mode versus direct execution, and the Explore subagent. No keyed item.',
  '3.5 Iterative refinement: I/O examples, test-driven iteration, the interview pattern, one message versus sequential fixes.',
  '4.1 Explicit review criteria over "be conservative", and disabling high false-positive categories.',
  '4.4 Validation-retry loops, and when a retry cannot help because the information is absent.',
  '4.5 The Message Batches API: 50% cost, 24-hour window, no multi-turn tool use, custom_id. "Batch" and "custom_id" return 0.',
  '4.6 Independent review instances over self-review, and multi-pass review.',
  '5.3 Error propagation from subagent to coordinator: failure type, attempted query, partial results; access failure versus a valid empty result.',
  '5.5 Human review workflows: stratified sampling, field-level confidence calibrated on labelled data, accuracy by document type. "confidence" and "calibrat" return 0.',
];

const { pathToFileURL } = await import('node:url');
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/claude_architect_foundations.json', 'utf8'));
  const ids = new Set(deck.map(q => q.id));
  const missing = deck.filter(q => !(q.id in CALLS)).map(q => q.id);
  const stale = Object.keys(CALLS).filter(id => !ids.has(id));
  if (missing.length || stale.length) console.log('unclassified:', missing, 'stale:', stale);
  const n = deck.length;
  const counts = {};
  for (const q of deck) counts[CALLS[q.id]] = (counts[CALLS[q.id]] || 0) + 1;
  console.log(`deck ${n} questions  |  exam 60 items`);
  for (const d of Object.keys(EXAM)) {
    const c = counts[d] || 0;
    console.log(
      `${NAMES[d].padEnd(40)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d] * 0.6).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100 * c / n).toFixed(1).padStart(5)}%`,
    );
  }
  console.log(`\n${UNCOVERED.length} of 30 task statements with no keyed deck item; ${OFF_OUTLINE.length} deck items map to no task statement.`);
}
