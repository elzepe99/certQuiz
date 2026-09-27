# Agentforce Specialist Field Guide

Built from the 121 questions in the practice deck, cross-checked against the official exam
outline and the documentation those questions cite. Measured 2026-09-26.

**Read this first: this is the deck in this repo whose exam has changed most, and the change
is structural rather than cosmetic.** The Spring '26 outline has **six domains, three of
which did not previously exist as domains** — Data 360 Fundamentals, Governance and
Observability, and Multi-Agent Orchestration. The authoring model changed too: the guide now
expects you to engineer agents with **next-generation authoring (NGA)** using **Agent
Script**, in a **Canvas** or **Script view**, with **hybrid reasoning**. None of those five
terms appears anywhere in the deck — not in a stem, not in an option, not in an explanation.

That is not a criticism of the deck. It moved 16 keys in its own fact-check, the most of any
Salesforce deck here, and its retriever and Data Library material is genuinely strong. But
you cannot pass this exam on the deck alone, and §11 is the section that tells you why.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Salesforce Certified Agentforce Specialist |
| Content | **60 scored** multiple-choice questions, plus up to 5 unscored |
| Time | **105 minutes** |
| Passing score | **72%** — 44 of 60. The highest bar of the three consultant/specialist decks |
| Prerequisite | None |
| Fee | US$200, retake US$100 |
| Languages | English, French, Japanese |
| Aligned to | **Spring '26** |
| Exam guide | Help article `005298924` — note this sits *below* the main certification block, not with it |

**What the guide says a candidate can do** — this list is the fastest way to see the gap:

1. Engineer Agentforce agents using **next-generation authoring (NGA)**.
2. Manage the agent and prompt template lifecycle: ideation, building, testing, deployment,
   **observation**.
3. Implement grounding using Data 360 concepts such as **chunking, indexing, and
   retrievers**.
4. Maintain governance with the Trust Layer and **manage specific model access**.
5. Orchestrate systems using **open standard multi-agent protocols including MCP and A2A**.
6. Determine architectures such as **Multi Agent** for scalability and control.

**What a candidate is explicitly *not* expected to know:** LLM fine-tuning, Apex or Python
basics, external AI tools, transformer architecture, ROI or white-space analysis, or
Marketing Cloud / Heroku / Agentforce Commerce / MuleSoft / Tableau / Slack / Quip /
Industries. That exclusion list is useful: it tells you an option leaning on transformer
internals or a fine-tuning workflow is a distractor.

---

## 2. Where the points actually are

There is nothing to re-classify *from*: all 121 questions carry the single tag "Salesforce
Agentforce Specialist", so the deck has no domain structure at all. The deck column is an
independent re-classification of all 121 against the six current domains
(`study-guides/reclassify-agentforce.mjs`).

| Domain | Exam | ≈ Qs | Deck | Verdict |
|---|---:|---:|---:|---|
| **Prompt Engineering** | 20% | ~12 | **46 · 38.0%** | **badly over** |
| Data 360 Fundamentals | 20% | ~12 | 19 · 15.7% | under |
| AI Agents | 35% | ~21 | 42 · 34.7% | about right by volume |
| Testing, Deployment, Maintenance | 10% | ~6 | 11 · 9.1% | about right |
| **Governance and Observability** | **10%** | **~6** | **2 · 1.7%** | **badly under** |
| **Multi-Agent Orchestration** | **5%** | **~3** | **1 · 0.8%** | **badly under** |

Three things to read off that table.

**Prompt Engineering is nearly double-weighted in the deck.** 46 questions for about twelve
real ones. Prompt template types, grounding, the Trust Layer and Model Playground are the
deck's comfort zone, and you will over-prepare them without noticing.

**Governance and Observability plus Multi-Agent Orchestration are 15% of the exam — about
nine questions — and 3 deck questions between them.** That is the single largest
proportional gap in any guide in this repo. §7 and §8 exist entirely to close it.

**AI Agents looks well matched and is not.** 34.7% against 35% by volume, but the *content*
is the old authoring model: topics and actions, planner and reasoning engine. The current
bullet asks for Agent Script's building blocks, hybrid reasoning, Canvas and Script view, and
template expressions. See §5.

Two boundary rules were applied consistently:

1. **Trust Layer capabilities** — masking, toxicity, prompt defense, dynamic grounding, the
   audit trail — are **Prompt Engineering**, because the guide lists them under a Prompt
   Engineering bullet. **Governance and Observability** is reserved for *agent-level*
   monitoring: Session Tracing, utterance dashboards, analytics, optimization. Collapsing the
   two would hide that a 10% domain rests on two questions.
2. The deck's **eight Einstein-for-Service questions** (`a5c36a06`, `7fcd0d22`, `d7a65539`,
   `03dbb7ca`, `7b9b6189`, `4f60aa61`, `f1ad48dc`, `432e6ed5`) map to **no current
   sub-objective**. They are filed under AI Agents as the nearest domain rather than put in an
   escape-hatch bucket, and §11 names them as the deck's stalest block.

---

## 3. Prompt Engineering

20% of the exam, 46 deck questions. Over-drilled — so this section is a checklist to confirm,
not material to learn, with two exceptions flagged at the end.

### Template types — the most reliable marks on the exam

| Type | When | Deck items |
|---|---|---|
| **Field Generation** | Populate a field with generated output | `ddb9a877`, `e6352f25`, `5e73a591`, `7604dc8f`, `410726e6` |
| **Flex** | Multiple unrelated objects as inputs, or a fully custom shape | `683fdd78`, `6e599964`, `1a055309`, `af0f9726` |
| **Sales Email** | A personalised email; merge objects are Recipient, Sender, **Recipient Account** | `f36d01cc`, `66246094`, `41b8067f` |
| **Record Summary** | Customise a standard summary, e.g. for Case | `b7ffd87e` |

Three mechanics that recur:

- **Field Generation requires Dynamic Forms.** The Lightning page must be upgraded to Dynamic
  Forms before you can attach the template to a field (`e6352f25`), you expose it by
  associating the template with the form field on the page (`5e73a591`), and on mobile you
  must also **enable Dynamic Forms on Mobile** (`3c41e65a`).
- **Flex templates take five unrelated objects as inputs** — that is the discriminator against
  Record Summary (`683fdd78`).
- **Token limit failures on a Field Generation template are random by design**: the number of
  tokens the dynamic prompt generates varies by record (`410726e6`).

### Grounding

- **Merge fields** reference a default related list, e.g. opportunities on an Account
  (`54b6a45e`). But the **Activities related list is not supported** because it is a
  polymorphic field (`fde9ef6d`) — a favourite exam trap.
- **Dynamic grounding with secure data retrieval** is the Trust Layer component that brings
  org data into the prompt (`3e120a2b`, `eba7605b`).
- Ground on **CRM and Data Cloud data using standard foundation models** when the requirement
  is no-code (`a8c6ed93`).
- Reach Data 360 from Prompt Builder by **accessing DMOs directly in Flex templates, using
  Data Cloud related lists**, and via retrievers (`bdc1f672`).
- Bring a REST callout's response into a template with the **Add Prompt Instructions** flow
  element (`7173932f`, `af0f9726`), in a **template-triggered prompt flow** (`8669895d`).
- Use an existing template inside automation with a **Flow action** (`c86206a7`).
- Bad summaries are usually **incorrect or incomplete grounding data**, not a bad prompt
  (`2c9175ff`); and the fix for mismatched generated content is concise, clear, consistent
  templates with effective grounding and contextual role-play (`4311b31c`).

### The Trust Layer

| Feature | What it does | Deck item |
|---|---|---|
| **Data Masking** | You configure the **privacy data entities** to be masked | `5f227c57` |
| **Prompt Defense** | Minimises jailbreaking and prompt injection | `e58a492d` |
| **Dynamic Grounding** | Brings org data into the prompt securely | `eba7605b` |
| **Audit trail** | Shows prompt sent, masking applied, masked response | `e3b0fcb4`, `e68a8732` |
| **Toxicity detection** | A Trust Layer audit report in Data Cloud with a toxicity detector filter | `f1260f25` |

One limitation worth memorising: **creating or updating a prompt template is *not* recorded in
the Setup Audit Trail** (`80590e97`).

### Models and access control

- **Model Builder** accesses an externally hosted model — an LLM on AWS (`2aaa194d`), or a
  Databricks serving endpoint for an XGBoost classifier (`c7919e17`).
- **BYO-LLM** lives in Einstein Studio — now **AI Models** (`5fc6ac13`).
- **Model Playground** creates a model configuration with specified parameters (`41b8067f`),
  and the hyperparameters you can change on a Salesforce-enabled foundation model are
  **Temperature, Frequency Penalty, Presence Penalty** (`2814c093`). **Temperature** is the one
  that balances consistency against randomness (`3011c45c`).
- **Access controls**: **Prompt Template Manager** to create, **Prompt Template User** to
  execute (`8230cd22`, `370396f2`). A data scientist needing both Einstein Studio and Prompt
  Builder gets **Data Cloud Admin and Prompt Template Manager** (`65e4e8f4`).
- A prompt template version is **immutable**: once activated, no further changes can be saved
  to that version (`223dd5bd`).

### The two things to actually learn here

The outline's bullet "**explain how to manage and prevent specific models from being
accessed**" is only half covered — the deck teaches how to *add* a model (Model Builder,
BYO-LLM) but never how to *block* one. And the preview pane's two outputs, **Resolution** and
**Response**, are worth understanding rather than memorising: the Resolution shows the full
text sent to the Trust Layer (`02699cee`).

---

## 4. Data 360 Fundamentals

20% of the exam, 19 deck questions — under-weighted but the deck's material here is its best.
Note the domain name: **Data 360**, not Data Cloud. The deck says Data Cloud in 15 stems and
Data 360 in none.

### The Agentforce Data Library

- A Data Library **automates the ingestion and indexing of data and creates a default
  retriever** to be used in prompts (`11676c36`).
- **An agent can have only one data library assigned to it** (`e699b633`). Clean, memorable,
  exam-shaped.
- Upload PDFs sitting outside Salesforce as a **File source in the Data Library**, which builds
  a **Search Index** — the clicks-only route (`5cf8d8af`, `1a438749`, `9c22a0d8`).
- Restrict indexing to publicly available knowledge articles via **Knowledge Settings → Use
  Public Knowledge Article** in the data library settings (`ce534337`).
- Knowledge articles with critical PDF attachments → **Data Cloud's "Include Attachments"
  option plus the `ContentDocumentVersion` unstructured data model object** (`a11274ab`).
- To make product tutorials and guides answerable, **publish them as Knowledge articles**
  (`78924287`).

### Chunking, indexing, retrievers

The deck teaches the pipeline correctly. **Data preparation involves loading, chunking,
vectorizing, and storing content in a search-optimised way** (`3224ed4d`) — that four-stage
phrase is worth memorising verbatim.

- **Rebuild the search index** to keep retrieval accurate as documentation changes
  (`06dc0bbf`).
- A **custom retriever** in Einstein Studio (now AI Models) with **filters and recency
  ranking** is the answer for filterable, freshness-ranked results (`606f05b2`, `3c312af3`).
- An **individual retriever's advantage over the default** is that you configure **filters,
  specified fields, and how many results are returned** (`6baf71a9`).
- Too many irrelevant results → **define filters to narrow the search** (`381ae8be`). Latency
  too high → **the same answer**: filters limit the scope of each search (`5697b1fb`).
- Outdated articles being surfaced → add a **ranking factor for recency based on
  `LastModifiedDate`** (`42129525`).

### What the deck does not have, and the exam may

Three retriever shapes the deck never mentions, all of them current:

- An **ensemble retriever** is a collection of individual retrievers: it runs them all,
  combines the results into one list, **reranks by relevance**, and returns only the most
  relevant. It does not support retrievers of type Code, and cannot include individual
  retrievers with dynamic filters.
- A **dynamic retriever** uses placeholders that take run-time values from the prompt template.
- The **Retriever Playground** configures pre-filters, selects test data and adjusts result
  parameters before you deploy. Ensembles with custom SQL retrievers cannot be tested there.

Two more: **citations** are enabled in AI Models at the individual-retriever level and link a
response to its source so a user can spot a hallucination; and **image processing** can be
enabled on unstructured-DMO search indexes so documents with images, tables and flow charts
are handled.

---

## 5. AI Agents

35% of the exam — the heaviest domain — and 42 deck questions. **Matched by volume, mismatched
in content.** Everything the deck teaches here is true; a third of what the outline asks for
is missing.

### Agent Script — the gap that defines this deck

The first bullet of the heaviest domain reads: "Explain how an agent works and its **basic
building blocks of agent script**." **"Agent Script" returns zero hits in the deck.** So does
"hybrid reasoning", "Script View", "template expression" and "next-generation authoring".
Learn it from the developer guide:

**Agent Script is the language for building agents in Agentforce Builder.** It combines the
flexibility of natural-language instructions for conversational tasks with the reliability of
programmatic expressions for business rules. In script you write expressions to define if/else
conditions and transitions, set and compare variables, and select subagents and actions.

**Three ways to author it**, and the exam can ask which is which:

1. **Chat with Agentforce** in natural language — "if the order total is over $100, offer free
   shipping" — and it converts your request into subagents, actions, instructions and
   expressions.
2. **Canvas view** — Agent Script summarised into expandable blocks. Type **`/`** to add
   expressions for common patterns like if/else, and **`@`** to add resources (subagents,
   actions, variables).
3. **Script view** — direct editing with syntax highlighting, autocompletion and validation.

Developers can also use **Agentforce DX** to pull a script file into a local Salesforce DX
project and edit it in VS Code.

**The blocks** you will recognise in a script: `system` (instructions, welcome and error
messages), `config` (agent name), `access` (default agent user), `language` (default and
additional locales), `variables`, and `start_agent`.

**The two symbols that are the whole of hybrid reasoning:**

- **`->`** introduces deterministic conditional logic.
- **`|`** introduces the LLM prompt text.

A reasoning instruction that mixes them — `if @variables.isPremiumUser:` then `| ask the user
if they want to redeem their Premium points` — is deterministic control wrapped around LLM
creativity. That is what "hybrid reasoning" means, and it is the single most likely new exam
concept.

Variables are declared with a type, a mutability and a description — `isPremiumUser: mutable
boolean = False` — and referenced as `@variables.isPremiumUser`. They exist so agent state
lives somewhere reliable **rather than relying on LLM context memory**.

What Agent Script lets you define, in the guide's own terms: areas where the LLM is free to
reason; areas where the agent must execute deterministically; variables for state; conditional
expressions controlling the execution path *or* the agent's utterances; and the conditions for
transitioning to a new subagent — either deterministically, or by exposing the transition to
the LLM as a tool. Running actions in a set sequence is called **action chaining**.

### Topics are now called subagents

**"Beginning in April 2026, agent topics are now called subagents. There are no changes to
functionality."** That is the developer guide's own note, and the Testing Center documentation
has already followed it — its default evaluation is named **Subagent Assertion**.

**The exam guide has not.** The Spring '26 outline still says "standard topics, custom topics,
standard Agent actions, and custom Agent actions". So: **answer "topic" on the exam, expect
"subagent" in the product and in every current doc page.** This is the cleanest
exam-versus-product split in any guide in this repo.

### How an agent reasons — what the deck does teach

- The **planner service** / **reasoning engine** identifies the topics and actions that respond
  to a user utterance (`67ac4dbb`, `281cd372`, `79b1b8b1`).
- **The LLM selects the right topic and action if they exist**; if there is no match it falls
  back (`d58f1670`), and the agent responds **with a general message asking the user to
  rephrase** (`797bec34`).
- **Action instructions help the reasoning engine decide which action to use** (`05f6c2b3`), so
  write them concisely and test in Agentforce Builder (`81823826`).
- The core component of a Custom Agent Action is its **Instructions** (`cd9ab1cf`).
- Topic setup is judged on **Topic Name and Classification Description** (`db26fe88`).
- **There is no standard Delete Record action** (`0b45cf29`).

### Determinism: filters and variables

The outline names "**filters, variables, and template expressions**". The deck covers the first
two well and the third not at all.

- Gate sensitive data behind verification: create a **custom variable** set by a verification
  action, then apply a **conditional filter** (`c7094780`, `f02b7e14`).
- Gate an action on a field value: a **context variable mapped to the membership tier**, then a
  conditional filter (`b02b7fbe`).

### Agent types and channels

- **Employee Agent** for internal productivity — a marketing team finding campaign data and
  generating content (`014997d2`).
- **Service Agent** for customer-facing resolution: a partner portal on Experience Cloud
  (`31068c78`), end-to-end case resolution (`28b3a429`), guest complaints with a Flex prompt
  template (`1a055309`).
- **SDR Agent**: **only works in the Email channel** (`6a1ae055`) and **only with the standard
  Lead object** (`c15ac147`). Two hard constraints, both exam-shaped.
- **Sales Coach** for objection handling and negotiation practice (`177ef534`).
- **Channels**: an **Email Configuration** connects a template to a Service Agent
  (`1b821f4b`); a **connection between Salesforce and the Slack workspace** connects an
  Employee Agent to Slack (`1c4982a0`); the **Route Work Action** connects an Omni-Channel Flow
  to the agent (`52194fa8`).
- **The Voice channel is named in the outline and returns zero hits in the deck.** Know that
  voice is one of the four channels — digital experience, email, voice, Slack.

### Security context — the deck's strongest cluster

Five items, all the same lesson: **an agent acts as its agent user, and that user needs
explicit permission.**

- A Service Agent not answering knowledge questions → the agent user lacks **Allow View
  Knowledge** (`2de3ea26`).
- An agent unable to help with a new custom object → its permission set needs **Read** on that
  object (`0e61252b`).
- An agent unable to run a new flow-based action → assign **Run Flows** to the agent user
  (`668d6ff3`).
- A custom action calling a flow **adheres to the permissions, field-level security and sharing
  settings** configured for the running user (`a623ffd0`).
- Sensitive medical research → **follow least privilege and do not grant the agent permission
  to view the object** (`0160ee78`).

### Agent API

**"Identify when it's appropriate to use Agent API"** is a named bullet with one deck item, and
it is a good one: to pass a verified customer ID between agents in different orgs, **use the
Agent API to start the downstream agent's session and pass the ID as a read-only context
variable**, so the LLM cannot modify it (`ec7f56b9`).

---

## 6. Testing, Deployment and Maintenance

10% of the exam, 11 deck questions — well matched, with one named bullet under-covered.

### Testing Center mechanics — what the deck teaches

- **Upload a structured CSV test template and run batch test cases** (`0dd5d1d6`, `b2206ef2`).
- **Structured batch testing with validation per test utterance** gives consistent pass/fail
  logic (`818da706`).
- **Use Testing Center only in a sandbox** (`a44b4810`), because **running tests risks modifying
  CRM data in a production environment** (`456918e7`). Those two are the same fact from both
  sides, and it is the most likely Testing Center question on the exam.
- To evaluate whether an action is selected for realistic utterances, use **Testing Center**
  (`63afa960`) — or, where the option set omits it, **Agent Builder**, whose Preview panel shows
  which subagents were selected and why (`e6949181`). Those two items are near-twins with
  different option sets; both keys are right.

### How evaluations work — the under-covered bullet

"Explain how Testing Center **evaluations** work" is a named bullet, and the deck has six
Testing Center items none of which covers scoring. The documentation is precise:

**Three default evaluations, always run:**

| Evaluation | What it does |
|---|---|
| **Response Evaluation** | The utterance goes to the agent, the response is recorded, and **an LLM judge** determines the expected response, compares, and assigns a score |
| **Subagent Assertion** | Checks the agent selected the correct subagents for the utterance |
| **Action Assertion** | Checks the agent selected the right actions, and **all** of the expected ones |

**Five optional Response Quality Metrics:** **Completeness** (did it cover the expected
information), **Coherence** (grammatical, conversational language rather than raw JSON out of a
Salesforce object), **Conciseness** (short but accurate), **Latency** (execution time in
milliseconds), **Instruction Adherence** (how well it follows the subagent instructions).

The three quality criteria those metrics serve: **accuracy** (correct information),
**relevance** (addresses intent and context), and **voice and tone** (style and brand
alignment).

**The documented trap:** the Expected Response field must hold **the response you expect**, not
instructions about it. Writing "the agent should mention the order number and be polite"
produces inaccurate scores. If an option describes the Expected Response as a rubric, it is
wrong.

Two more facts: **generating tests consumes credits**, and test generation covers Account,
Lead, Opportunity and Contact out of the box — custom objects and the Answer Questions with
Knowledge action need explicit instructions in the description. Also note the scope: the
evaluations article covers the **legacy Testing Center in Setup**, not the **new Testing Center
in Agentforce Studio (Beta)**.

### Deployment

- The metadata type for topics, instructions and actions deployed via the CLI is
  **`genAiPlannerBundle`** (`b37ea07b`).
- **Apex invoked by an Agent Action needs at least 75% code coverage** and all dependencies
  present (`8ad060ca`).
- **An agent must be manually activated in production regardless of its sandbox status**
  (`52a560b9`). The commonest "why doesn't it work" answer.
- A prompt template that behaves differently after deployment → **the name of the LLM does not
  match between sandbox and production** (`8b365e6c`).

---

## 7. Governance and Observability

**10% of the exam — about six questions — and 2 deck questions.** Along with §8, this is the
biggest proportional gap in any guide in this repo. Everything below is from the documentation.

The deck's two items are both correct and both worth keeping:

- **Agentforce Session Tracing** captures detailed interaction data and gives a full view of
  agent behaviour start to finish (`f97b4b49`).
- The **User Utterances dashboard** is where you analyse inputs, requests and queries to find
  patterns and trends (`f5501338`).

### Agentforce Observability

**Observability has exactly two use cases, and the exam can ask you to separate them:**

| Use case | What it is for |
|---|---|
| **Agent Optimization** | Dive into **unresolved interactions**, identify **knowledge gaps**, analyse sessions deeply via the **Session Tracing Data Model** |
| **Agent Analytics** | Analyse agent topics, average feedback, and effectiveness metrics such as **escalation rate, deflection rate, abandoned sessions** |

The mechanism underneath is three things: **tagging, moments, and quality scores**.
Observability flags low-performing topics by quality score, surfaces agent misinterpretations,
and points at configuration gaps. Session Tracing lets you drill from a trend to a specific
moment in a specific conversation.

**Refresh cadences — the most memorisable facts in this domain:**

| Data | Refresh |
|---|---|
| Session Tracing Data Model | approximately every **30 minutes** |
| Agent analytics metrics | every **45–60 minutes** |
| Moments and quality scores | **daily** |
| Tags | **weekly** |

**Two scope limits worth knowing:**

- **Observability monitors Agentforce agents only**, not external AI agents. An option offering
  it as a way to watch a third-party agent is wrong.
- Support is uneven by agent type: **ASA** and **Employee Agent** get both analytics and
  optimization; **Default Agent** gets **optimization only**; **SDR** gets **analytics only**.

**Setup and extension:** enable it at **Setup → Einstein Audit, Analytics, and Monitoring
Setup → Agentforce Session Tracing and Data Model**. Out-of-the-box metrics and dashboards
ship, and the underlying data can be reported on in **Data Cloud** or in **Tableau** with a
Tableau Plus licence.

---

## 8. Multi-Agent Orchestration

**5% of the exam — about three questions — and one deck question.** The deck's single item
(`db66ac22`) keys **Model Context Protocol (MCP)** for consuming an external product
recommendation engine, and offers **A2A as a distractor**. So the deck never teaches what A2A
is for, and never mentions multi-agent architecture at all.

### The five-term map

Salesforce's own framing, which is the clearest way to hold this: **SOMA and MOMA are *where*
agents live, MCP and A2A are *how* they talk, and Agent Gateway is the *gatekeeper* that
governs all of it.**

| Term | Category | What it is |
|---|---|---|
| **MCP** | Protocol | Agent ↔ **tool**. Vertical |
| **A2A** | Protocol | Agent ↔ **agent**. Horizontal |
| **SOMA** | Architecture | Multiple agents, **one org** |
| **MOMA** | Architecture | Multiple agents, **multiple orgs** |
| **Agent Gateway** | Governance | The control plane over both protocols |

### When is a multi-agent architecture appropriate

This is the exam bullet, and the documentation gives a number:

> once an agent is responsible for more than **~8–10 well-scoped topics / nano-agents**, it
> starts carrying too much concurrent intent — which increases reasoning load and leads to
> **drift, confusion, or hallucination**.

Multi-agent becomes essential with **topic overload, cross-org boundaries, or a
concierge-style front-door interaction model**. And the sentence that makes it a real
discriminator: **hybrid reasoning fixes drop-off and gives deterministic control, but it does
not remove the limit on how much parallel intent a single agent can reliably hold.** So an
option claiming hybrid reasoning removes the need for multi-agent is wrong.

### MCP

- An open, **vendor-neutral** standard, originally created by **Anthropic**. Often described as
  the "USB port for AI agents."
- **Client-server**: an **MCP Server** exposes **tools, resources and prompts**; the Agentforce
  **MCP Client** connects to it, and the LLM picks the right tool via natural language.
- The setup fact to remember: **register an MCP server in Setup and all its tools automatically
  appear as invocable actions in Agent Builder.** No custom code.
- MCP Client reached **GA at TDX, April 2026**.

### A2A

- An open protocol for **agent-to-agent** communication across vendors and platforms.
  Salesforce was a **founding member alongside Google, Microsoft, SAP and AWS**.
- Agents publish **Agent Cards** — machine-readable descriptions of their capabilities. Other
  agents discover the cards, then communicate in LLM-native unstructured dialogue over
  **OAuth 2.0 and HTTP/JSON**.
- **Two patterns, and the naming is counter-intuitive:** *Inbound* (**Client Agent**) is a
  third-party agent delegating a task **to** Agentforce; *Outbound* (**Server Agent**) is an
  Agentforce agent calling **out** to a third-party agent.
- A2A Inbound entered **Pilot in March 2026**.

### SOMA and MOMA

- **SOMA** (Single-Org Multi-Agent): a **Superagent**, also called the Parent Planner, owns the
  conversation with the end user and delegates to specialist child agents. All agents live in
  the same org, so there is no cross-org trust complexity. It uses the **Agent Graph** model and
  **`GenAiPlannerDefinition`** to define parent-child relationships.
- **MOMA** (Multi-Org Multi-Agent): the same model extended across orgs within the same Data
  Cloud trust boundary. One unified answer, **no org-switching, no re-auth, no lost context**.
  Trust is enforced at both org and agent level, and **no agent can act outside its trust
  boundary or elevate privileges beyond the initiating user**.

### Agent Gateway

The governance layer inside Agentforce Studio, covering both MCP and A2A. What it does:
a unified **MCP Server Registry** (MuleSoft, Heroku, external); **per-agent policy
enforcement**; security controls including **JWT/OAuth, rate limiting, quota management and
ABAC**; **schema validation** of MCP and A2A messages; **observability** via session-level
traces logged to Data Cloud; **rug-pull detection**, which blocks MCP servers that change their
tool descriptions after registration; and **Trust Layer integration** for prompt-injection
scanning. It is configured through the UI with no code, and reached **GA in Spring '26**.

### The decision rule

Start with **SOMA** when all your agents are in one org. Graduate to **MOMA** when multiple
Salesforce orgs need to collaborate. Use **A2A** to interoperate with agents on Google,
Microsoft or any A2A-compliant platform. Use **MCP** any time an agent needs to call an
external tool or API — regardless of which architecture you are in.

**One caveat about exam scope.** SOMA is in Pilot with GA estimated June '26 and MOMA is
targeted for the same window, while the exam aligns to Spring '26. So the two bullets the exam
actually states are the *purpose* of MCP and A2A, and *when* a multi-agent architecture is
appropriate. Learn those two cold; treat the SOMA/MOMA/Agent Gateway detail as context that
makes them make sense.

---

## 9. Numbers to memorise

| Number | What it is |
|---|---|
| **60 / 105 / 72%** | Scored questions, minutes, pass mark. 44 of 60 to pass |
| **20 / 20 / 35 / 10 / 10 / 5** | Domain weights in outline order. They sum to 100 |
| **Spring '26** | Exam alignment |
| **~8–10 topics** | Where one agent's concurrent intent breaks down and multi-agent becomes necessary |
| **3 default evaluations** | Response Evaluation, Subagent Assertion, Action Assertion |
| **5 quality metrics** | Completeness, Coherence, Conciseness, Latency, Instruction Adherence |
| **30 min / 45–60 min / daily / weekly** | Observability refresh: session tracing, analytics, moments and quality scores, tags |
| **75%** | Apex code coverage needed for Apex invoked by an Agent Action |
| **1 data library** | Per agent. Not two |
| **1 active version** | Of an individual retriever |
| **4 stages** | Retrieval data prep: loading, chunking, vectorizing, storing |
| **3 hyperparameters** | Temperature, Frequency Penalty, Presence Penalty |
| **4 channels** | Digital experience, email, voice, Slack |
| **April 2026** | Topics became subagents in the documentation — but not in the exam guide |

---

## 10. Distractor tells

**Read the question's own verb.** "Which **permission set**" wants a permission set, not a
profile. "What is the **cause**" wants the diagnosis. "Which **feature**" wants a named
product capability, and this product has a lot of similarly named ones.

Patterns that recur in this deck's wrong answers:

- **The plausible-but-absent capability.** This deck's fact-check moved 16 keys, and several
  were invented settings. If an option names an Agentforce toggle you cannot picture in Setup,
  distrust it.
- **Agent Builder versus Testing Center.** Both evaluate utterance handling. Agent Builder's
  Preview is interactive and single-shot; Testing Center is batch, CSV-driven and scored. The
  deck has a near-twin pair (`e6949181`, `63afa960`) that differ only in whether Testing Center
  is on the option list.
- **Employee Agent versus Service Agent.** Internal productivity versus customer-facing
  resolution. Getting this wrong is the fastest way to lose an easy mark.
- **Permission on the *agent user*, not the running human.** Five deck items hinge on this.
- **Prompt Builder versus an Einstein feature.** Prompt Builder makes reusable templates;
  Service Replies, Work Summaries and Call Insights are packaged features you switch on. An
  option offering Prompt Builder where a packaged feature exists — or vice versa — is the
  discriminator in at least eight deck items.
- **A fine-tuning or transformer-internals option.** The exam guide explicitly says candidates
  are not expected to know these. That makes such options distractors by construction.
- **"Hybrid reasoning solves it."** It solves drop-off and gives deterministic control; it does
  not remove the concurrent-intent ceiling that multi-agent exists for.

---

## 11. Where the deck is older than the exam

This deck moved **16 keys in its own fact-check — the most of any Salesforce deck in this
repo** — so the answers you have are the corrected ones. What follows is about the *exam*
having moved, not about the deck being wrong.

### The renames

| The deck says | Salesforce now says | Note |
|---|---|---|
| Data Cloud (15 stems) | **Data 360** | Appears in 21 explanations and 0 option sets |
| Einstein Studio (6 items) | **AI Models** | "AI Models (formerly Einstein Studio)" |
| topic / topics (8 items) | **subagent** | Since April 2026 — **but the exam guide still says topics** |

**The subagent rename is the cleanest exam-versus-product split in this repo.** The developer
guide states it plainly: "Beginning in April 2026, agent topics are now called subagents. There
are no changes to functionality." The Testing Center docs have followed — the evaluation is
called **Subagent Assertion**. The Spring '26 exam outline has not: it still says "standard
topics, custom topics". **Answer "topic"; expect "subagent" everywhere else.**

### Five concepts the exam names and the deck does not contain

| Concept | Deck hits | Where to learn it |
|---|---:|---|
| **Agent Script** and its building blocks | 0 | §5 |
| **Hybrid reasoning**, Canvas and Script view | 0 | §5 |
| **Next-generation authoring (NGA)** | 0 | §5 |
| **Template expressions** as a determinism mechanism | 0 | §5 |
| **Multi-Agent architecture** | 0 | §8 |

Plus three near-zeros: **A2A** appears only as a distractor, the **Voice channel** returns zero
stems and options, and **"standard topics"** returns zero — the deck only ever configures
custom ones.

### The deck's stalest block: eight Einstein-for-Service items

`a5c36a06`, `7fcd0d22`, `d7a65539`, `03dbb7ca`, `7b9b6189`, `4f60aa61`, `f1ad48dc` and
`432e6ed5` test **Service Replies, Einstein Work Summaries, Call Insights and Service AI
Grounding**. These map to **no sub-objective in the Spring '26 outline.** They are not wrong —
the features exist and the keys are right — but they are about 6.6% of your revision time
buying zero marks. Recognise them and move past them:

- **Service Replies** for quick grounded chat responses (`7fcd0d22`, `4f60aa61`).
- **Einstein Work Summaries** for handover summaries, producing **Issue and Resolution**
  (`d7a65539`, `7b9b6189`), grounded with **conversation context, Knowledge articles and
  cases** (`f1ad48dc`).
- **Call Insights** for post-call competitor and product mentions (`03dbb7ca`).
- **Service Replies + Service AI Grounding + Grounding with Knowledge** switched on together
  (`a5c36a06`).

### Exam-right, production-wrong

**`a5e3e038`** is the clean worked example, and the deck already handles it well. It asks what
is automatically created when a custom search index is created, and keys "a retriever that
shares the name of the custom search index." Salesforce's current documentation says the
opposite: **"Data 360 no longer creates a default Retriever automatically when you create a
search index. Previously, when you created a search index in Data 360, a default retriever was
created automatically."** Existing default retrievers still work. The deck's explanation already
records the retirement, so **answer the deck's key and know it describes retired behaviour.**

One knock-on: `6baf71a9` contrasts an individual retriever with "the default retriever". The
contrast is still meaningful for orgs holding legacy defaults, but on a new org you create
individual retrievers because there is nothing else.

### Its 27 in-app comments are already resolved — do not re-triage them

This deck carries **27 in-app comments**, the largest comment set in the repo, and they read
like open disputes — "It is B", "Might be D". **They were worked through on 2026-08-17 and the
repo owner confirmed they were addressed.** If you are studying, treat them as settled history
rather than a list of contested answers. If you are maintaining the deck, the same: they are
not new signal.

### How to verify any of this yourself

The Agentforce documentation lives in two places and they behave differently:

- The **Agentforce Developer Guide** on `developer.salesforce.com` renders directly and is where
  Agent Script, hybrid reasoning and the DX workflow are documented. This is the better source for
  the §5 gap, and it returns a real page body without any polling tricks.
- **`help.salesforce.com`** is a single-page app that answers **every** article id with HTTP
  200, so a status check proves nothing. Render it and read `document.title`; a dead id gives
  the generic `Salesforce Help | Article` plus "We looked high and low but couldn't find that
  page." Poll for a real title **and** a body over ~1,500 characters.

`WebFetch` does **not** resolve `help.salesforce.com` from a cloud container — it returns the
SPA's "CSS Error" shell for real and invented ids alike, re-confirmed 2026-09-26. Two of the
best sources for this guide are Help *knowledge* articles rather than product docs
(`005317683` for multi-agent, `005226932` for observability), and those are only reachable that
way.

---

## 12. Two-week revision plan

Set by one fact above all: **15% of the exam sits in two domains the deck covers with three
questions.** Week 1 is almost entirely outside the deck.

**Week 1 — the exam the deck does not test.**

1. **Day 1–2 · Agent Script.** Read the Agentforce Developer Guide's Agent Script pages: Get
   Started, Language Characteristics, Agent Script Blocks, Flow of Control. Write a short script
   by hand with a variable, an if/else on `->`, an LLM instruction on `|`, and a subagent
   transition. This is the heaviest domain's newest material.
2. **Day 3 · Multi-Agent Orchestration.** Read the SOMA/MCP knowledge article end to end. Learn
   the five-term map, the ~8–10 topic threshold, Agent Cards, and inbound-versus-outbound A2A.
   Three exam questions, currently one deck question.
3. **Day 4 · Governance and Observability.** Read the Observability articles. Memorise the two
   use cases, the effectiveness metrics, the four refresh cadences and the agent-type support
   matrix. Six exam questions, currently two deck questions.
4. **Day 5 · Testing Center evaluations.** Read *Choose Evaluations*. Three defaults, five
   quality metrics, the LLM judge, and the Expected Response trap.
5. **Day 6 · Retriever shapes the deck lacks.** Ensemble, dynamic, the Playground, citations,
   image processing. Then work the deck's 19 Data 360 items.
6. **Day 7 · Consolidate week 1.** Re-read your Agent Script notes and §8's decision rule.

**Week 2 — the deck.**

7. **Day 8–9 · AI Agents.** The deck's 42 items. Pay most attention to the five security-context
   items and the agent-type constraints; skim the eight Einstein-for-Service ones, which buy
   nothing.
8. **Day 10 · Prompt Engineering, once.** 46 items in one sitting. It is 20% of the exam and 38%
   of the deck — if you score above 85%, do not return to it.
9. **Day 11 · Testing and deployment.** The deck's 11 items, then re-read Day 5.
10. **Day 12 · §11 in full.** The three renames, the five missing concepts, the eight stale
    items, and `a5e3e038`.
11. **Day 13 · full deck in Blitz mode**, options read aloud off. Note every miss.
12. **Day 14 · only the misses**, plus §8's five-term map and §7's cadence table.

---

## 13. Sources

Every URL below was rendered in a browser on 2026-09-26 and its title confirmed.

**The exam itself**

- [Salesforce Certified Agentforce Specialist Exam Guide](https://help.salesforce.com/s/articleView?id=005298924&type=1&language=en_US)
  — the six-domain outline, the weights, the Spring '26 alignment, the 72% pass mark, and the
  "not expected to know" list.

**Agent Script, NGA and hybrid reasoning** (zero deck questions)

- [Get Started with Agent Script](https://developer.salesforce.com/docs/ai/agentforce/guide/agent-script.html)
  — the language, the three authoring routes, the blocks, the `->` and `|` syntax, and the note
  that agent topics are now called subagents.

**Multi-agent orchestration** (one deck question)

- [Learn about Agentforce SOMA Orchestration and MCP](https://help.salesforce.com/s/articleView?id=005317683&type=1&language=en_US)
  — the SOMA/MOMA/MCP/A2A/Agent Gateway map, the ~8–10 topic threshold, Agent Cards, inbound
  versus outbound, rug-pull detection.

**Governance and observability** (two deck questions)

- [Learn About Agentforce Observability](https://help.salesforce.com/s/articleView?id=005226932&type=1&language=en_US)
  — the two use cases, the effectiveness metrics, the four refresh cadences, the agent-type
  support matrix.

**Testing Center evaluations** (the under-covered bullet)

- [Choose Evaluations](https://help.salesforce.com/s/articleView?id=ai.agent_testing_center_evaluations.htm&type=5&language=en_US)
  — the three defaults, the five quality metrics, the LLM judge, and the Expected Response trap.

**Retrievers and search indexes**

- [Retrieve Data](https://help.salesforce.com/s/articleView?id=data.c360_a_ai_retriever.htm&type=5&language=en_US)
  — individual, ensemble and dynamic retrievers, the Playground, citations, and the retirement
  of the automatic default retriever.

Per-question citations live in the deck itself: every one of the 121 explanations ends in a
`References:` block with at least one rendered URL.

---

## 14. Using this with NotebookLM

Upload this file. Prompts that have produced useful output from the other guides in this repo:

- "Quiz me only on Agent Script, multi-agent orchestration, and observability. All three are
  named exam objectives with almost no practice questions, so generate the questions from
  sections 5, 8 and 7."
- "Teach me Agent Script from section 5 as if I know Flow but not any scripting language. Then
  give me five snippets and ask me what each one does."
- "Give me the five-term map in section 8 as flashcards, and then three scenarios where I have
  to choose between MCP, A2A, SOMA and MOMA."
- "List everything in this guide where the exam and the current product disagree. For each,
  tell me what to answer on the exam and what is true in a current org."
- "I have eight days. Compress the plan in section 12, keeping the principle that week 1 covers
  what the deck cannot."
- "Which parts of the practice deck are worth the least revision time, and why? Quote the
  reasoning from sections 2 and 11."
