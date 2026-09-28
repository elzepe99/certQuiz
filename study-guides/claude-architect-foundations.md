# Claude Architect Field Guide

Built from the 28 questions in the practice deck, measured against Anthropic's own exam
guide and the documentation those questions cite, on 2026-09-28.

**This is the only deck in the repo that was written rather than scraped, and it shows.**
Thirteen of its keyed answers restate a bullet from the exam guide almost word for word, and
its fact-check moved only one key. The problem is not accuracy, it is reach: **17 of the
exam's 30 task statements have no deck question at all**, the exam's largest domain gets
two, and **12 of the 28 are tool design** — a domain worth 18%.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Claude Certified Architect – Foundations |
| Exam code | `CCAR-F` |
| Items | **60**, multiple choice and multiple response; each item says how many to pick |
| Structure | **4 scenarios**, drawn at random from a published bank of **6** |
| Time | **120 minutes** (~135 minutes of seat time) |
| Passing score | **720** on a scaled 100–1,000; criterion-referenced, not curved |
| Fee | US$125 per attempt |
| Validity | **12 months**; on-time renewal is a free, unproctored assessment |
| Retakes | Wait **14, then 30, then 90 days**; at most **4 attempts** in a rolling 12 months |
| Delivery | Pearson VUE, online proctored or test centre |
| Exam guide | Version 1.0, effective **July 2026** — a PDF |

**A small, accurate deck for a wide exam.** One key moved in the fact-check, one more was
caught at import, and where the deck teaches it teaches the exam's own phrasing. But 28
questions cannot cover 30 task statements, and they do not try evenly: tool design has
twelve, Claude Code has two, agentic architecture has two. Treat §3, §5, §6 and §7 as the
main course.

### How the outline was found — the part that generalises

Anthropic publishes the outline in the open, the way Databricks does. The certification page
on the Anthropic Academy (a Skilljar site) carries the five domain weights, the item count,
the time, the fee and the pass mark as plain text, and links an **exam guide PDF** hosted on
S3. The PDF is the one that matters: it holds the **30 task statements**, each split into
"Knowledge of" and "Skills in" bullets, plus the six scenarios, twelve sample questions, and
an explicit in-scope and out-of-scope list. It will not render in the browser pane; fetch it
with `curl` and extract with `pdfminer`.

### The six scenarios — the exam picks four

| # | Scenario | Primary domains | Deck items |
|---|---|---|---:|
| 1 | Customer Support Resolution Agent | 1, 2, 5 | 1 + many unlabelled |
| 2 | Code Generation with Claude Code | 3, 5 | 1 |
| 3 | Multi-Agent Research System | 1, 2, 5 | 3 |
| 4 | Developer Productivity with Claude | 2, 3, 1 | 2 |
| 5 | Claude Code for Continuous Integration | 3, 4 | 1 |
| 6 | **Structured Data Extraction** | 4, 5 | **0** |

"Deck items" counts stems that open with the scenario's published preamble; many more
customer-support items sit inside Scenario 1 without it. **Scenario 6 has nothing**, and with
four of six drawn it appears on two exams in three. §6 and §7 cover what it tests.

**The out-of-scope list is a distractor filter.** These will not appear: fine-tuning, API
authentication and billing, deploying or hosting MCP servers, Claude's internals or training,
embeddings and vector databases, computer use, vision, streaming, rate limits and pricing,
OAuth, cloud provider configuration, benchmarks, prompt-caching details and tokenisation. An
option leaning on any of those is wrong by construction — and one deck item, temperature
(`8248aea1`), sits close to that line.

---

## 2. Where the points actually are

The deck's nine `_cat` tags ("Tool Design", "Agent Behavior", "Guardrails & Enforcement"…)
are topic labels, not exam domains. The deck column is an independent re-classification
against the five domains and 30 task statements
(`study-guides/reclassify-claude-architect.mjs`).

| Domain | Exam | ≈ Qs | Deck | Verdict |
|---|---:|---:|---:|---|
| Agentic Architecture & Orchestration | 27% | ~16 | 2 · 7.1% | **badly under** |
| Tool Design & MCP Integration | 18% | ~11 | 12 · 42.9% | over-drilled |
| Claude Code Configuration & Workflows | 20% | ~12 | 2 · 7.1% | **badly under** |
| Prompt Engineering & Structured Output | 20% | ~12 | 6 · 21.4% | right share, wrong content |
| Context Management & Reliability | 15% | ~9 | 6 · 21.4% | about right |

**The two biggest gaps are 47% of the exam.** Agentic Architecture and Claude Code are about
28 of 60 questions, and the deck has four items between them. The agentic loop, coordinator
design, handoffs, decomposition, sessions, the CLAUDE.md hierarchy, path rules, plan mode and
iterative refinement are all missing.

**Prompt Engineering has the right count and the wrong questions.** Four of its six — the
role goes in the system prompt (`f77a79ec`), exact Markdown column names (`5b0490ba`),
headings for maintainability (`4a3ae657`), lower temperature (`8248aea1`) — map to **no task
statement**. The two that do (`2a123dd1` few-shot, `63976ace` JSON schema) leave explicit
criteria, validation-retry, batches and multi-instance review untouched.

### Task statements with no keyed deck item — 17 of 30

| Domain | Uncovered task statements | Where |
|---|---|---|
| 1 · Architecture | 1.1 agentic loop · 1.2 coordinator design · 1.4 enforcement and handoff · 1.6 decomposition · 1.7 sessions | §3 |
| 2 · Tools and MCP | 2.3 tool distribution and `tool_choice` · 2.5 built-in tools | §4 |
| 3 · Claude Code | 3.1 CLAUDE.md hierarchy · 3.3 path rules · 3.4 plan mode · 3.5 iterative refinement | §5 |
| 4 · Prompting | 4.1 explicit criteria · 4.4 validation and retry · 4.5 batches · 4.6 multi-instance review | §6 |
| 5 · Context | 5.3 error propagation · 5.5 human review and calibration | §7 |

Each was confirmed with a keyword sweep over stems and options — `stop_reason`,
`tool_choice`, `@import`, `.claude/rules`, "batch", "confidence", "resume", "fork" all return
zero — and every nonzero hit was read. `Grep` and `Glob` appear only as distractors; "plan
mode" appears only inside Scenario 2's boilerplate.

---

## 3. Agentic Architecture & Orchestration

**27% of the exam — about 16 questions — and two deck items**: parallel subagents
(`d7436e92`) and a hook that blocks refunds over $500 (`17865baf`). Everything else here is
new.

### 1.1 · The agentic loop

Send the request; read `stop_reason`. If it is **`tool_use`**, run the tool, append the
`tool_result` to the conversation, and call again. If it is **`end_turn`**, Claude has
finished — use the response. The Stop reasons page lists these alongside `max_tokens`,
`stop_sequence`, `pause_turn` (a server-tool loop hit its iteration limit; send the content
back to continue) and `refusal`.

**The three anti-patterns the guide names:** deciding the loop is done by **parsing Claude's
text**; using an **iteration cap as the primary stop**; and treating **the presence of
assistant text** as completion. A response can carry text *and* a `tool_use` block.

### 1.2 · Coordinator and subagents

- **Hub and spoke.** All inter-subagent traffic, error handling and routing go through the
  coordinator.
- **Subagents do not inherit the coordinator's history.** "Each subagent runs in its own
  conversation, which starts fresh." Whatever it needs goes into its prompt.
- **Pick subagents per query** rather than always running the full pipeline, and
  **partition scope** to avoid duplication.
- **Iterate**: check synthesis for gaps, re-delegate targeted queries, re-run synthesis.

**The failure the exam loves: decomposition too narrow.** Sample question 7: every subagent
succeeds, yet a report on "AI in creative industries" covers only visual arts, and the
coordinator's log shows three visual-arts subtasks. **The root cause is the coordinator's
decomposition.** When the logs show the plan, blame the plan.

### 1.3 · Spawning and context passing — the deck's one item

Subagents are spawned through a tool the exam guide calls **Task** and the current SDK calls
**Agent** (§11). The coordinator's allowed tools must include it. To run two subagents in
parallel, **emit both calls in one response** (`d7436e92`); consecutive turns serialise them.
Pass prior findings **in the prompt**, as structured data that separates content from
metadata, and give the coordinator goals and quality criteria rather than a procedure.
`AgentDefinition` holds each subagent's description, prompt and tool list.

### 1.4 · Enforcement and handoff

When ordering matters for money or identity, **prompt instructions have a non-zero failure
rate**. Make it programmatic: block `process_refund` until `get_customer` has returned a
verified id (sample question 1). When escalating to a human who **cannot see the
transcript**, send a structured handoff: customer id, root cause, amount, recommended action.

### 1.5 · Hooks

**`PreToolUse`** fires before a tool runs and can block it with `permissionDecision: "deny"`
— the $500 refund rule (`17865baf`). **`PostToolUse`** fires after a tool returns and can
rewrite the result before Claude sees it — normalising Unix timestamps, ISO 8601 and numeric
status codes into one shape. "Guaranteed" or "must" in a stem wants a hook.

### 1.6 · Decomposition

| Pattern | Use it when |
|---|---|
| **Prompt chaining** (fixed sequence) | The steps are predictable — review each file, then one cross-file pass |
| **Dynamic decomposition** | The work is open-ended — map structure, find high-impact areas, plan, adapt |

### 1.7 · Sessions

- **`--resume`** continues a named prior session; **`--fork-session`** (or
  `fork_session=True` in the SDK) branches it under a new id.
- **Resume when prior context is valid; start fresh with an injected summary when tool
  results are stale.** If files changed, tell the resumed session which ones.

---

## 4. Tool Design & MCP Integration

**18% of the exam — about 11 questions — and 12 deck items, the deck's home ground.** 2.1 and
2.2 are drilled thoroughly; 2.3 and 2.5 are not drilled at all.

### 2.1 · Descriptions are the selection mechanism

"Provide extremely detailed descriptions. This is by far the most important factor in tool
performance." Include input formats, example queries, edge cases, and when to use this tool
rather than its neighbour. Deck: `16885805`, `06907581`, `4d183e4f`, `b091b723`. Splitting
and consolidating have a section of their own (§8).

**Check the system prompt, not just the tools.** The guide names keyword-sensitive wording in
the system prompt that pulls the model toward the wrong tool. When descriptions are good and
selection is still wrong, read the system prompt.

### 2.2 · Structured errors — five deck items

Return the failure **as a tool result with `isError: true`** (`17dbb318`), carrying an
`errorCategory` (transient / validation / permission / business), an `isRetryable` flag and a
readable message (`4cd0dc5e`, `76ecf70b`, `bfe8ab8d`). MCP separates a **malformed request**
(a JSON-RPC protocol error) from an **API failure or business rule** (a tool result with
`isError`) — `9bdf39a6`. **A valid empty result is not an error.**

### 2.3 · How many tools, and `tool_choice` — not in the deck

- **Scope tools by role.** The guide's number: **18 tools instead of 4–5** degrades
  selection. Give a narrow cross-role tool for the frequent case (`verify_fact` for
  synthesis, sample question 9) and route the rest through the coordinator.
- **Replace generic tools with constrained ones** — `load_document` that validates URLs
  instead of a bare `fetch_url`.

| `tool_choice` | Effect |
|---|---|
| `auto` | May call a tool or answer in text. Default when tools are provided |
| `any` | **Must** call a tool, chooses which — guarantees structured output when the document type is unknown |
| `{"type":"tool","name":…}` | Must call **that** tool — forcing `extract_metadata` first |
| `none` | No tools. Default when none are provided |

Forced modes are not supported with manual extended thinking; `auto` and `none` still work.

### 2.4 · MCP servers in Claude Code

Shared team servers go in **`.mcp.json` at the project root**, committed, with secrets as
`${GITHUB_TOKEN}`-style expansion. Personal servers go in **`~/.claude.json`**. Every
configured server's tools are available at once. Prefer an **existing community server** for
a standard integration like Jira (`ecb1b560`); expose catalogues as **MCP resources**; and if
the agent prefers `Grep` over your better MCP tool, fix the MCP tool's description.

### 2.5 · Built-in tools

| Tool | For |
|---|---|
| `Grep` | Searching file **contents** |
| `Glob` | Finding files by **path pattern** — `**/*.test.tsx` |
| `Read` / `Write` | Whole files. **Read + Write is the fallback when `Edit` cannot find a unique anchor** |
| `Edit` | Targeted change by unique text match |

Build understanding incrementally: Grep for the entry point, Read to follow imports.

---

## 5. Claude Code Configuration & Workflows

**20% of the exam — about 12 questions — and two deck items**: a project skill (`0c6bd014`)
and `--bare` in CI (`8c9e856e`). Four of the six task statements have nothing.

### 3.1 · The CLAUDE.md hierarchy

| Level | Location | Shared with |
|---|---|---|
| User | `~/.claude/CLAUDE.md` | **Just you**, all projects |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | The team, via version control |
| Directory | a `CLAUDE.md` in a subdirectory | The team; loads for that subtree |

The diagnosis the exam wants: **a new team member is not getting the instructions because
they live in someone's user-level file.** Keep it modular with **`@path/to/file` imports**
or topic files under **`.claude/rules/`**. Use **`/memory`** to see what loaded. (The docs
add a managed policy level and `CLAUDE.local.md`, which the exam does not ask about.)

### 3.2 · Commands and skills

- **Project** commands in `.claude/commands/` and skills in `.claude/skills/<name>/SKILL.md`
  are shared through the repo; **user** versions live under `~/.claude/`. Sample question 4:
  a team `/review` command goes in the project's `.claude/commands/`.
- **Frontmatter**: `context: fork` runs the skill in its own subagent context;
  `allowed-tools` governs tools during the skill (see §11); `argument-hint` prompts for the
  argument.
- **Skill versus CLAUDE.md**: on-demand task versus always-loaded standard.

### 3.3 · Path-specific rules

A file in `.claude/rules/` with a `paths:` list of globs loads **only when Claude works on
matching files**. That beats a subdirectory CLAUDE.md whenever the files are scattered — test
files next to their code (sample question 6).

### 3.4 · Plan mode or direct execution

Plan mode "tells Claude to research and propose changes without making them"; edits stay
blocked until you approve the plan. Use it for **architectural** work, **many files**, or
**several valid approaches**. Use direct execution for a well-scoped change. Sample question
5 rejects "start direct and switch if it gets complicated" — the complexity was stated up
front. The **Explore** subagent keeps verbose discovery out of the main context.

### 3.5 · Iterative refinement

- **2–3 concrete input/output examples** when prose is read inconsistently.
- **Test-driven iteration**: tests first, then feed the failures.
- **The interview pattern**: Claude asks you questions first.
- **Interacting problems in one message; independent ones one at a time.**

### 3.6 · CI/CD — one deck item, and the flags it does not use

| Flag | Why CI needs it |
|---|---|
| `-p` / `--print` | Non-interactive; without it the job **hangs** (sample question 10). `CLAUDE_HEADLESS` and `--batch` do not exist |
| `--output-format json` | Machine-readable output |
| `--json-schema` | Validated JSON matching a schema — postable as inline PR comments |
| `--bare` | Skips discovery of hooks, skills, plugins, MCP servers and CLAUDE.md; pair with `--append-system-prompt-file` (`8c9e856e`) |

In the exam guide's model, **CLAUDE.md is how CI-invoked Claude Code gets project context**.
`--bare` is newer than that model; if a stem has no startup-time problem, CLAUDE.md is the
answer. On a re-run, include prior findings and ask only for new issues; give test
generation the existing tests.

---

## 6. Prompt Engineering & Structured Output

**20% of the exam — about 12 questions.** The deck's two on-outline items are `2a123dd1`
(few-shot) and `63976ace` (JSON schema). Scenario 6, which the deck never uses, does most of
its asking here.

### 4.1 · Explicit criteria beat "be careful"

"Flag a comment only when its claimed behaviour contradicts the code" works; "only report
high-confidence findings" does not. When one category floods developers with false
positives, **turn it off** while you fix it.

### 4.2 · Few-shot

"The most effective technique" when instructions alone are inconsistent. **2–4 targeted
examples** for the ambiguous cases, each showing why one action beat the alternative.
Anthropic's prompting page says 3–5 — the same advice at a slightly different count.

### 4.3 · Structured output with `tool_use`

- **A tool whose input schema is the output you want** is the most reliable route to
  schema-compliant JSON. It removes **syntax** errors, not **semantic** ones.
- Make a field **optional or nullable** when the source may lack it, or the model invents a
  value.
- An enum with `"other"` plus a detail string; `"unclear"` for ambiguous input.

### 4.4 · Validation and retry

Send back **the document, the failed extraction and the specific error**. That fixes format
and structure. **It cannot fix absence.** For self-checks, extract `calculated_total` beside
`stated_total` and add a `conflict_detected` flag.

### 4.5 · The Message Batches API

| | |
|---|---|
| Cost | **50%** of standard |
| Latency | Most finish within an hour; **no SLA**; expires if not done in **24 hours** |
| Size | Up to **100,000** requests or **256 MB** |
| Results | Kept **29 days**; correlate by `custom_id` (1–64 characters) |
| Cannot | Run **multi-turn tool calling** inside one request |

**Overnight reports yes, blocking pre-merge checks no** (sample question 11). Resubmit only
failed `custom_id`s. For a 30-hour SLA with a 24-hour window, submit every 4 hours.

### 4.6 · Multi-instance review

A model reviewing its own output in the same session rarely questions it. An **independent
instance** catches more. For a large PR: per-file passes plus one integration pass (sample
question 12); a bigger context window does not fix attention dilution.

---

## 7. Context Management & Reliability

**15% of the exam — about 9 questions — and six deck items.** It is also where four items
the repo had called "judgment no page settles" turn out to be settled by the exam guide.

**Four "unsettleable" items, settled by the blueprint.** The fact-check marked `e9f005d6`,
`5eb4dfc6`, `9de1fc0a` and `a517cd7f` as agent-design judgment no product page decides. True
of the documentation — but **the exam guide states each keyed answer almost verbatim**: 5.6
"requiring subagents to include publication or data collection dates" and "structured
claim-source mappings"; 5.2 "acknowledging frustration while offering resolution" and
escalation on "customer requests for a human, policy exceptions/gaps… and inability to make
meaningful progress". On this exam, those four are fact.

### 5.1 · Long conversations

Keep a **"case facts" block** outside the summarised history (`e5bbf3a3`). Trim tool
results to the fields you need. Put key findings **first** — the middle is where models lose
things.

### 5.2 · Escalation

- **Escalate** on a request for a human, a policy gap or exception, or no progress
  (`a517cd7f`).
- **An explicit demand for a human is honoured immediately. Frustration is not a demand**:
  acknowledge it, offer the resolution, escalate if they ask again (`9de1fc0a` sits on this
  line and keys the second).
- **Several matching customers**: ask for another identifier.
- **Sentiment and self-reported confidence are poor proxies** (sample question 3).

### 5.3 · Error propagation between agents — not in the deck

A failing subagent hands the coordinator **the failure type, what it tried, partial results,
and alternatives** (sample question 8), after retrying transient failures itself. **An empty
result marked as success** and **killing the whole workflow** are both wrong.

### 5.4 · Big codebases

Delegate specific questions to subagents (`c720d4bb`), keep a scratchpad file, summarise a
phase before the next, export state to a manifest for crash recovery, `/compact` when
discovery fills the window.

### 5.5 · Human review and calibration — not in the deck

**97% overall can hide a document type at 60%.** Measure by document type and field before
cutting review. Keep a **stratified random sample** of high-confidence extractions under
review. Have the model emit **field-level confidence**, then set thresholds on a **labelled
validation set**.

### 5.6 · Provenance

Carry claim-to-source mappings (`5eb4dfc6`); require dates (`e9f005d6`); keep conflicting
values **with attribution**; render financial data as tables, news as prose.

---

## 8. Split or consolidate: the tension in the guidance

Two deck items key opposite moves on tool count, and **both are correct**. The exam lists
"splitting vs consolidating tools" as an in-scope topic by name.

| | `92663975` — split | `36351fa3` — consolidate |
|---|---|---|
| Symptom | One tool for refund / cancel / reship; the agent **omits required parameters** | Ten tools; the agent **picks the wrong one** between near-synonyms |
| Key | Three tools, each with only its own parameters | Merge overlapping pairs behind an action parameter |
| Buys | **Parameter accuracy** | **Selection accuracy** |
| Guidance | "Make sure each tool you build has a clear, distinct purpose" (Writing tools for agents) | "Fewer, more capable tools reduce selection ambiguity" (Define tools) |

**The rule: read the symptom.** Wrong or missing arguments → split. Wrong tool among
overlapping ones → consolidate or rename. An option is only wrong if it claims one move buys
both — the overclaim `92663975`'s explanation had to have removed.

**But "first step" changes the answer.** The exam guide's sample question 2 is a selection
problem between two tools with minimal descriptions, and keys **better descriptions**,
calling consolidation "a valid architectural choice" that "requires more effort than a first
step warrants". Task statement 2.1 also names **renaming** as the fix for overlap. So
consolidation wins when the stem asks what *structurally eliminates* overlap; descriptions
win when it asks for the *first* step and the descriptions are thin.

`4d183e4f` makes the same point from another angle: merge discovery and analysis, keep
"add to collection" separate. Consolidate the mechanics; leave the judgment callable.

---

## 9. Numbers to memorise

| Number | What it is |
|---|---|
| **60 / 120 / 720** | Items, minutes, scaled pass mark out of 1,000 |
| **27 / 18 / 20 / 20 / 15** | Domain weights in outline order |
| **4 of 6** | Scenarios per sitting |
| **30** | Task statements; 17 have no deck question |
| **14 / 30 / 90 days, 4 a year** | Retake waits, and the annual cap |
| **12 months** | Credential validity |
| **4–5 tools, not 18** | The exam's per-agent scoping example |
| **30–50 tools** | Where the docs say selection degrades |
| **2–3 / 2–4** | I/O examples for refinement; few-shot examples |
| **50% / 24 h / 29 days** | Batch discount, expiry, results retention |
| **100,000 or 256 MB** | Batch size limit |
| **1–64** | Characters in a `custom_id` |
| **$500** | The exam's refund threshold for a blocking hook |
| **v2.1.63** | Where the Task tool became Agent in `tool_use` blocks |

---

## 10. Distractor tells

**Read the question's own verb.** "Most effective **first step**" wants the cheap,
proportionate fix before a classifier or new infrastructure. "**Guarantee**" or "**must**"
wants code: a hook, a gate, forced `tool_choice`. "**Root cause**" wants the component whose
logs show the fault.

- **Prompt-only enforcement of a money or identity rule.** Always the distractor when a hook
  or gate is offered.
- **Over-engineering** — a routing classifier, a trained model, a sentiment pipeline.
- **"Bigger context window."** Never fixes attention dilution.
- **Self-reported confidence as a router.** Wrong for escalation; right only as field-level
  confidence calibrated on labelled data.
- **Swallowing an error**, or **aborting everything** on one failure.
- **A flag that does not exist** — `CLAUDE_HEADLESS`, `--batch`, a `.claude/config.json`
  commands array.
- **User-level configuration for a team problem.**

---

## 11. Where the exam and the product disagree

The deck is new, so it is not "older than the exam" the way scraped decks are. But the exam
guide was frozen in July 2026 and Claude Code ships weekly, so **the exam and the current
docs already disagree in five places**. None moves a deck key.

| Topic | The exam guide says | The docs now say |
|---|---|---|
| Spawning subagents | The **Task** tool; `allowedTools` must include `"Task"` | The **Agent** tool since Claude Code v2.1.63; the `system:init` list still says Task |
| Skill `allowed-tools` | Restricts tool access during the skill | Tools Claude may use **without asking** — a pre-approval. Removing tools is `disallowed-tools` |
| Commands | `.claude/commands/` and skills as separate things | "Custom commands have been merged into skills"; old files still work |
| MCP scopes | Two: project (`.mcp.json`) and user (`~/.claude.json`) | Three: **local** is the default, in `~/.claude.json` under the project path |
| Too many tools | 18 instead of 4–5, per agent | Degrades past 30–50 available tools |

**The last row is two different questions.** The exam's 4–5 is **role scoping**; the docs'
30–50 is **catalogue size**. `36351fa3` uses the second correctly to reject tool search for a
ten-tool agent.

**Exam-right, product-wrong: `allowed-tools`.** If an exam item asks how to stop a skill
running destructive commands, the intended answer is `allowed-tools`. In a current Claude
Code that field **grants** tools for the turn; `disallowed-tools` **removes** them.

**For whoever maintains this deck:** no deck key is contradicted by the exam guide or the
docs checked for this guide. `d7436e92` already says "Agent tool calls – formerly Task tool
calls", and the four items in §7 could now cite the exam guide as a decisive source.

---

## 12. Two-week revision plan

The deck takes an hour, so it cannot anchor two weeks. The plan follows the exam's weights
and uses the deck twice. The Exercises in section 8 of the exam guide are the best practice
material that exists — build them.

**Week 1 — the half of the exam the deck does not reach**

1. **Day 1 · Diagnostic.** Read the exam guide's sections 4–6. Do all 28 deck questions and
   all 12 sample questions.
2. **Day 2–3 · Agentic architecture.** §3. Write an agentic loop by hand. Build Exercise 1.
3. **Day 4–5 · Claude Code.** §5. Exercise 2 on a real repo.
4. **Day 6 · Structured extraction.** §6. Exercise 3. This is Scenario 6.
5. **Day 7 · Consolidate.** §9 and §10.

**Week 2 — the rest, then the deck again**

8. **Day 8 · Multi-agent research.** Exercise 4.
9. **Day 9 · Context and reliability.** §7, especially 5.3 and 5.5.
10. **Day 10 · Tool design.** §4 and §8.
11. **Day 11 · §11**, and the out-of-scope list in §1.
12. **Day 12 · Sample questions again**, reading only the wrong-option explanations.
13. **Day 13 · Full deck in Blitz mode**, options read aloud off.
14. **Day 14 · Only the misses**, with §2's uncovered-task table as a checklist.

---

## 13. Sources

The exam guide PDF was fetched and extracted on 2026-09-28; every other page was rendered in
the browser the same day and grepped for the fact it is cited for. `check-urls.mjs` reports
every `code.claude.com` page as dead — a false positive.

- [Claude Certified Architect – Foundations (Anthropic Academy)](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request) — weights, item count, time, fee, pass mark, and the PDF link.
- [Exam Guide v1.0, July 2026 (PDF)](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf) — the 30 task statements, scenarios, sample questions, scope lists.
- [Stop reasons and fallback](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) — the agentic loop.
- [Define tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools) — descriptions, consolidation, `tool_choice`.
- [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing) — 50%, 24 h, limits, `custom_id`.
- [Subagents in the SDK](https://code.claude.com/docs/en/agent-sdk/subagents) — fresh context, parallelism, Task → Agent.
- [Hooks in the Agent SDK](https://code.claude.com/docs/en/agent-sdk/hooks) — `PreToolUse` deny, `PostToolUse` replacement.
- [Work with sessions](https://code.claude.com/docs/en/agent-sdk/sessions) — resume and `fork_session`.
- [How Claude remembers your project](https://code.claude.com/docs/en/memory) — CLAUDE.md hierarchy, imports, rules.
- [Extend Claude with skills](https://code.claude.com/docs/en/skills) — frontmatter, `allowed-tools` today.
- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp) — scopes and `.mcp.json`.
- [CLI reference](https://code.claude.com/docs/en/cli-reference) — `-p`, `--output-format`, `--json-schema`, `--bare`.
- [Choose a permission mode](https://code.claude.com/docs/en/permission-modes) — plan mode.
- [Writing effective tools for AI agents](https://www.anthropic.com/engineering/writing-tools-for-agents) — "a clear, distinct purpose".

Per-question citations live in the deck itself: every one of the 28 explanations ends in a
`References:` block with at least one rendered URL.

---

## 14. Using this with NotebookLM

Upload this file, and the exam guide PDF alongside it — the PDF's sample questions are the
best seed for generated ones.

- *Using the exam guide PDF, list the 30 task statements. For each, tell me whether section 2
  of the field guide says the deck covers it, and quiz me on the uncovered ones first.*
- *Write ten scenario questions in the style of the exam guide's samples for Scenario 6,
  Structured Data Extraction, which the practice deck never uses.*
- *Give me five tool-design scenarios and make me say whether to split, consolidate, rename,
  or rewrite descriptions — using the rule in section 8.*
- *Drill me on section 11: for each row, ask what the exam wants and what a current Claude
  Code does.*
- *Quiz me on the Claude Code configuration hierarchy: which file, which directory, shared or
  personal, for twelve situations.*
- *I have one week, not two. Compress section 12, keeping the exercises.*

*Measured 2026-09-28 against `public/decks/claude_architect_foundations.json` and the Claude
Certified Architect – Foundations Exam Guide v1.0. Re-run
`node study-guides/reclassify-claude-architect.mjs` before trusting §2.*
