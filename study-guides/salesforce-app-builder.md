# Salesforce Certified Platform App Builder — Study Guide

**Built from the 222 questions in `salesforce_app_builder_questions_corrected.json`,
cross-checked against the official exam outline and the documentation those questions cite.**

Every fact below traces to a rendered Salesforce page (see [Sources](#13-sources)) or to this
deck's fact-check passes. The exam is aligned to **Summer '26** — the most current of any deck
in this repo — so the risk runs the same way as the Administrator guide: not that the exam
tests retired features, but that **the deck still keys some**. [§11 Where the deck is older
than the exam](#11-where-the-deck-is-older-than-the-exam) lists all ten.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Salesforce Certified Platform App Builder |
| Content | **60 scored** multiple-choice / multiple-select questions + up to 5 unscored |
| Time | **105 minutes** (1 min 45 s per question) |
| Passing score | **73%** → you need **44 of 60** — the highest pass mark in this repo |
| Prerequisite | None |
| Fee | US$200 (retake US$100) |
| **Release alignment** | **Summer '26** |

**Two things the alignment row changes.** First, the outline is written in current vocabulary:
its Business Logic domain names **Flow Approval Processes** and **Agentforce**, its Fundamentals
domain names **AgentExchange**, and Workflow Rules and Process Builder appear nowhere. A deck
item that keys Process Builder is keyed to a feature whose support ended on 31 Dec 2025; on the
exam the same stem keys **Flow**. Second, **Business Logic and Process Automation is 32% of the
exam** — nearly a third — and a 73% pass mark leaves room for only 16 wrong answers. Get the
automation domain right and the rest can absorb the mistakes.

The questions are short scenario stems — a company, a requirement, four features. The
recurring skill is knowing **which relationship, field or automation type carries a stated
implication**: cascade delete, inherited sharing, a roll-up, a value that must not change, a
field that must be conditionally required.

---

## 2. Where the points actually are

Official outline weightings against the deck. The deck's five tags are close to the outline
but not the same — the outline folds security and sharing into *Fundamentals* alongside
AppExchange and reporting, and its automation domain is far larger — so the column below is an
independent re-classification of all 222 questions (`study-guides/reclassify-app-builder.mjs`).

| Domain | Weight | ≈ Questions | Deck | Verdict |
|---|---:|---:|---:|---|
| Salesforce Fundamentals | 18% | ~11 | 41 (18.5%) | about right |
| Data Modeling and Management | 20% | ~12 | 44 (19.8%) | about right |
| Business Logic and Process Automation | 32% | ~19 | 66 (29.7%) | about right |
| User Interface | 17% | ~10 | 49 (22.1%) | slightly over |
| App Deployment | 13% | ~8 | 22 (9.9%) | **slightly under** |

### The gap you need to close

**This is the best-balanced deck in the repo** — every domain is within five points of the
outline — so the counts are not the story. The gap is **currency**. Reading all 222 against the
Summer '26 sub-objectives, **seven have no deck item**, and all seven are the objectives added
or reworded in the last two years:

1. **AgentExchange** as a way to extend an org — a named Fundamentals objective; the deck
   knows only AppExchange.
2. **Flow Approval Processes** — named; the deck has classic approval processes only.
3. **Agentforce** as a way to automate business processes — named.
4. **Maintaining, monitoring and troubleshooting flows** — error emails, the Automation app's
   Monitor tab, debugging.
5. **Dashboard capabilities** beyond folder access — dynamic dashboards, filters, subscriptions.
6. A **deployment plan** as a sequence — order, validation, testing, back-out.
7. **External data sources** beyond one indirect-lookup item — Salesforce Connect adapters and
   external-object limits.

And in the other direction, **ten deck items key Workflow Rules or Process Builder** — 4.5% of
the deck on features the outline has dropped (§11).

[§6](#6-flow-approvals-and-agentforce--the-32-domain) and [§9](#9-app-deployment) carry the
uncovered objectives from the documentation.

### What the deck's 222 do rehearse well

Relationship selection and its implications (24 items — the single strongest area), roll-up
summaries and their limits (14), validation-rule formulas (12), sharing and access (30),
Lightning App Builder components and visibility (20), and sandbox and change-set mechanics
(18). Someone who can explain *why* each of those is keyed has most of the exam.

---

## 3. Salesforce Fundamentals

### Where declarative stops and programmatic begins

| Requirement | Declarative answer | When it becomes code |
|---|---|---|
| Summarise child records on a parent | Roll-up summary — **master-detail only** (`f0fcecae`, `dca21cdc`) | Across a **lookup**: a record-triggered flow that counts and writes (`2607cf61`), an AppExchange roll-up app, or Apex (`7fa13400`) |
| Block a save conditionally | Validation rule | **Block a delete** — validation rules never run on delete; a before-delete Apex trigger does (`e1e7a031`) |
| Show live external data (a stock price) on a record | An **AppExchange** solution (`600c8f44`) | A custom Lightning web component calling an API |
| A custom component in 4 weeks with no developers | AppExchange (`cebb2770`); an unmanaged package to customise (`3075c7b3`) | In-house LWC |
| Read business cards into Contacts | AppExchange data-enrichment apps (`15f5f364`) | — |
| Migrate Classic → Lightning, drive adoption | AppExchange readiness apps and partners (`4ad9910b`) | — |

The tell in the stem: "quickly", "no developers", "prebuilt", "minimize maintenance" → a
**managed package** from AppExchange (`a0324c31`); "fully customise" → **unmanaged**.

### AgentExchange — the objective the deck never asks

**AgentExchange** is the marketplace for Agentforce: agent templates, **topics**, **actions**
and **prompt templates** published by Salesforce and partners, installed into an org as
packages and then adapted in Agent Builder and Prompt Builder. The use-case shape is the same
as AppExchange's — "we need an agent that does X and have no time to build one" — and the
answer pattern is the same: install the closest template, then edit its instructions rather
than write them from scratch.

### Object, record and field access — the layers

1. **Object permissions** (profile or permission set): Create, Read, Edit, Delete, View All,
   Modify All. A Schema-Builder-created object is invisible to users until a permission set
   grants it (`8f327859`); a new field is visible and editable to **internal profiles** by
   default (`e0015d94`).
2. **Field-level security** hides or locks a field for everyone who can see the record —
   the only tool that hides a field (`bd6ef1b0`, `31d03e0b`, `1e4e783a`); grant one user
   read on a finance field with a **permission set**, not a profile edit (`513fdca2`).
3. **Record types** on a profile or permission set decide which record types a user can
   *create*; removing Bronze from the support profile stops new Bronze cases (`eb42de9c`);
   a permission set with the Salary record type limits who creates salary applicants
   (`b873fb5f`). Record type + page layout + FLS together make fields read-only after close
   (`1dd6fc7f`).
4. **Permission set groups** bundle the sets a department always needs; add individual sets on
   top for senior staff (`f64f3731`); a **muting** set removes permissions from a group.

### Sharing — who sees which record

| Mechanism | Opens | Deck |
|---|---|---|
| **Organization-wide defaults** | The floor per object — Private, Public Read Only, Public Read/Write; **tighten first, then open** (`7ee5407d`, `ac554cce`) | |
| **Role hierarchy** | Upward — put the reviewer *above* the technicians for broad, regional edit access (`d1692d01`); disable **Grant Access Using Hierarchies** on a custom object so managers do not inherit reviews about themselves (`3094912f`) | |
| **Sharing rules** — owner-based or criteria-based | Sideways, to groups, roles, roles and subordinates; **criteria-based** when the record's own field decides (`98a52146`, `7ee5407d`); owner-based between branches of the hierarchy (`5f869bc9`); rules can only *open* access (`2acc4e50`) | |
| **Manual sharing** | One record, by the owner or above, to **users, public groups, roles, roles and subordinates**, manager groups (`3179a16e`) | |
| **Teams** | Account, opportunity, case teams — one of three reasons a peer sees a record you cannot (`2be541c8`) | |
| **View All / Modify All** on the object | Everything, ignoring sharing — the permission-set answer for a team that must read and write all opportunities under a private model (`7bf2a1a0`, `f0d2a336`) | |
| **Master-detail inheritance** | A detail record has **no owner and no sharing of its own**; share the **master** (`d36e669a`, `ff970202`); a junction record needs **Read on both masters** (`dec9a6b4`, `c308ee99`, `6e71484d`) | |

**Troubleshooting "user can't see the contact"** (`8048d229`): the parent Account's sharing, whether
the contact has an account at all (private contacts are owner-only), and Read on Contact. In
Lightning, **Sharing Hierarchy** on the action menu shows who has access and why (`9ba9345d`).

### Reports, report types, dashboards

- **Report types** define the objects and fields. A master-detail relationship auto-creates a
  standard **"A with B"** type (`12796130`); converting it to a lookup makes reports on that
  type **unusable, not deleted** (`eca96cec`). A **custom report type** is the only way to get
  **"with or without"** (outer-join) reports (`7a5c4bb0`, `8fa11113`); its **primary object is
  locked** after save; new fields reach it only if **Auto add to custom report type** is on
  (`e7e093e4`) — otherwise add them to the field layout (`aa446baa`).
- **Formats**: tabular, summary (row groups), matrix (rows × columns — status by priority,
  `71a617ac`), joined. **Charts need groupings** — a tabular report cannot be charted or
  embedded on a record page (`5feb8608`). Bucket columns categorise without a field.
- **Folders** control who opens a report or dashboard; share the dashboard folder with roles and
  subordinates and the *source report* folder more narrowly to let people see the chart but
  not the data (`e2c4f8aa`).
- **Dashboards** — the part the deck skips: each chart or table has one source report; up to
  25 widgets; **dashboard filters** (up to 5); the **running user** decides whose data everyone
  sees, and **run as logged-in user** makes it a **dynamic dashboard** (5 / 10 / 3 per org by
  edition, no private folder, no scheduled refresh, no subscription); **subscriptions** email a
  refresh on a schedule; feed tracking posts widgets to Chatter.

---

## 4. Data Modeling and Management

### Relationships — the implications the exam tests

| Type | Access | User interface | Reporting | Deletion | Pick it when |
|---|---|---|---|---|---|
| **Lookup** | Independent owner and sharing | Related list on the parent (`108817b2`); on delete: clear the value, block the delete, or (custom objects) cascade | Custom report type for "with or without" | Child survives | The child must outlive the parent (`df028304` Contact side) |
| **Master-detail** | Detail **inherits the master's owner and sharing** (`ff970202`, `6be00595`); the field's sharing setting decides whether Read or Read/Write on the master is needed to edit children (`6e71484d`) | Required field; **Allow Reparenting** off by default — the parent cannot be changed once set (`cfee0562`, `ecc2f2d1`) | Auto "A with B" report type | **Cascade delete** (`f275115f`, `df028304`) | Roll-ups, cascade delete, inherited visibility; up to **2** per object (`6e5ebb2c`); detail must be custom |
| **Junction** (2 × master-detail) | Read needed on **both** masters | Two related lists | | Deleting either master deletes the junction record | Many-to-many (`80cdeade`, `6d288fc9`) |
| **Hierarchical** | — | User only | | | Manager-style self-reference |
| **External lookup / indirect lookup** | Follows the external object | Related list of external records | Report on external objects | | Salesforce Connect; **indirect lookup needs an External ID + Unique field on the Salesforce parent** (`f1910535`) |

**Converting**: lookup → master-detail requires **every** child to have the lookup populated
and no more than one existing master-detail (`2b41b228`); master-detail → lookup requires the
**roll-up summary fields to be deleted first** (`99028ce3`). Modelling customers and dealers who
each have their own rep and bill: **separate accounts in an account hierarchy** (`c5f11c84`). A
customer-service manager per account: a **lookup to User** (`92ce68b5`).

### Field types and what changing them does

- Coordinates → **Geolocation** (`696e6048`); descriptions with images and links → **Rich Text
  Area** (`448050ab`); a yes/no fact you will report on → **Checkbox** (`c0a59efc`); a system
  key that must survive migration and stay unique → **Text, Unique, External ID** (`dbc50a1e`);
  values shared across objects → a **global value set** (`5bc838e7`); up to **25 external ID
  fields per object**, auto-number included (`4442bb62`).
- **Dependent picklists**: custom picklists can be controlling or dependent; multi-select can be
  dependent but not controlling; checkboxes can control but not depend (`59cb33df`).
- **Changing a type**: Long Text Area → Text **truncates to 255** (`c2379d8e`); Date ↔ Date/Time
  is on the documented **data-loss** list (`e680953f`); Number → Text is **refused** while Apex,
  Visualforce or a formula references the field (`8393698f`); auto-number → text keeps values;
  the conversion runs **in the background** and can delay a change set (`238aaeb2`). Too many
  inactive picklist values: set an **upper bound** in Picklist Settings (`728103c0`).
- **Schema Builder** views and creates objects, fields and relationships in one canvas
  (`ea9c253d`, `82f377a0`) but **does not add fields to page layouts** (`2fac7b8c`); **Lightning
  Object Creator** builds an object *and* loads its rows from a spreadsheet (`de845c25`).

### Importing, exporting, external data

| Need | Tool | Facts |
|---|---|---|
| ≤ 50,000 accounts, contacts, leads, solutions, campaign members, custom objects, with dedupe | **Data Import Wizard** (`192da39e`, `124809ca`) | Matching on name/email/ID/external ID; **ignores blank cells** — it cannot clear a field |
| 60,000+ records, any object, delete, export, or clearing fields | **Data Loader** (`9c4d665b`) | Insert / update / **upsert on an external ID** (`4183da4a`) / delete / hard delete / export; **Insert Null Values** to blank fields (`2a1d9baf`) |
| Spreadsheet → new object + data | **Lightning Object Creator** | |
| Backup | **Data Export Service** — weekly (Enterprise+) or monthly (`f9e7f3dd`) | |
| Archive but keep reporting | **Big objects** and **external objects** (`e2e924df`) | Neither counts against data storage |
| Live data that stays outside Salesforce | **Salesforce Connect** — OData 2.0/4.0, cross-org, or custom Apex adapters; external objects (`__x`) support lookup, external lookup and indirect lookup; reports and list views but no triggers or roll-ups | |
| Stop duplicates | **Duplicate rules** — **Block on Create**, and **Bypass Sharing Rules** so a private OWD does not hide the matches (`daa8e06c`) | |

---

## 5. Business logic: formulas, roll-ups, validation rules

### Formula fields

- **Cross-object formulas** read *up* — parent fields through lookups and master-detail, several
  levels deep (`2268b774`, `eae6a2e7`, `9b38319e`, `8f4d4727`); they **cannot reference child
  records** (`f8150bea`). `TEXT(picklist)` shows a parent's picklist value; `ISPICKVAL` returns
  a Boolean.
- **Functions the exam names**: `TODAY()` returns a Date, `NOW()` a Date/Time — subtract dates
  for whole days (`b4a0859a`); `IMAGE()` for colour indicators (`52bee9cd`); `HYPERLINK()` for
  a link to a grandparent (`2268b774`); `PRIORVALUE`, `ISCHANGED`, `ISNEW` in validation rules.
- A formula recalculates on every read — the wrong tool for a value that must be **frozen at
  creation** (`39919e32`: copy it once with automation). It cannot output rich text. Roll-ups
  cannot reference a formula that uses `NOW`, `TODAY`, `$User` or a **cross-object** field
  (`c3ed7893`).

### Roll-up summary fields

- **Master-detail only** — plus the built-in Account ← Opportunity case (`759295bd`,
  `82c18788`). Types: **COUNT, SUM, MIN, MAX**; on number, currency and percent (all four) and
  on date/date-time (**MIN and MAX**) (`e187aca4`, `93fc7f11`, `d4dfeb80`, `a2b1cdb4`).
  **AVG does not exist** (`f0fcecae`).
- **25 per object** (raisable), with filters (won only, closed within a year).
- **Advanced Currency Management blocks currency roll-ups from Opportunity to Account**
  (`db1a97a8`).
- Across a lookup: a flow, an AppExchange roll-up app, or Apex — or convert the relationship
  (`a51f3d87`, `dca21cdc`).

### Validation rules

- A rule **fires when its formula is TRUE** — write the *forbidden* condition (`bb35f81f`:
  `NOT(ISBLANK(Job_Accepted__c)) && ISCHANGED(Hire_Date__c)`).
- **Conditional requirements** are theirs alone: a field required only for a record type
  (`2583af7a`), only when the parent is High Priority (`b2ad3559`), only at a stage
  (`f2171f7e`), only when Closed Won and more than 14 days out (`b6e70e00`). Layout-required is
  unconditional.
- `PRIORVALUE` stops a value increasing (`48077126`) or a status going backwards (`ec780513`);
  `$UserRole.Name` / `$Profile.Name` gate who may set a value (`a7066a29`); `Owner:Queue.Id`
  tells a queue-owned lead from a user-owned one (`df7e220e`).
- They **do not run on delete** (`e1e7a031`), are **skipped on lead conversion** unless *Require
  Validation for Converted Leads* is on (`e7674bf2`), and are **not re-run by workflow field
  updates** (`2b895c9b`).

---

## 6. Flow, approvals, and Agentforce — the 32% domain

### Choosing the flow type

| Type | Use it when | Deck |
|---|---|---|
| **Screen flow** | A user answers prompts — a call script (`5eb59bb7`), a popup of questions from a button before approval (`d8a40894`), a guided step in the Actions & Recommendations component (`047f35ce`) | |
| **Record-triggered, before save** ("Fast Field Updates") | Set fields on the triggering record only — cannot submit for approval or touch other records (`5b81e447`) | |
| **Record-triggered, after save** ("Actions and Related Records") | Create the renewal opportunity and notify (`c3dbacf5`), update contacts when the account changes (`5af0a805`), update the parent when a lookup child is deleted (`b26ceb79`), reach an external SOAP endpoint (`4b57de62`), assign a permission set on user creation (`e4b4892c`), submit for approval automatically (`aae29b1e`, `9183e3e5`), email one person and create a task for another with a Decision (`fedd4d8c`), delete rejected quotes (`f305b0dc`), post to Chatter (`42ba8f21`); **scheduled paths** for "after four business hours" (`a58ee5df`) | |
| **Schedule-triggered** | Sweep a set of records on a schedule | |
| **Autolaunched** | Invoked by a button, another flow, Apex or an agent action | |
| **Flow Approval Process** | Multi-stage, multi-user, multi-system approvals — below | |

**Best practice**: one record-triggered flow **per object per trigger context** (`5c35d629`);
avoid the infinite loop where an after-save update re-fires the same flow; combine actions
(`3231e6c1` says it for Process Builder — the principle survives the tool).

### Classic approval processes — still on the outline as "approval process"

- **Entry criteria** decide what enters; the record is **locked** while pending; **Submit for
  Approval** is manual unless a **flow submits it** (`aae29b1e`, `1e4a7642`, `9183e3e5`).
- **Steps** route to a user, a **queue** — the answer for "any member of the department"
  (`8d4883ca`) — the **Manager** field via *Next Automated Approver Determined By*, or an approval
  hierarchy; a second step with `Amount > 10,000` routes larger contracts to a director
  (`62635d92`); **unanimous** approval when both the manager and the VP must sign (`9183e3e5`);
  a **delegated approver** covers vacations (`6ee193c4`).
- **Actions** — exactly four types: **email alert, task, field update, outbound message**
  (`70d99691`). An approval cannot create a record or delete one — gating a delete needs the
  approval plus a flow (`c25d186f`).
- Approve from **Chatter** (Chatter Settings → Allow Approvals, `455b9add`) and from the mobile
  app via **in-app notifications and the record** (`d07b1682`).

### Flow Approval Processes — the objective the deck skips

The current form, documented as **"multi-step processes that interact with multiple users and
systems"**. A flow approval process is a sequence of **stages**, each made of **approval steps**
(which assign an **approval work item** to a user, group or queue) and **background steps**
(actions with no human), with **Decision** elements choosing the path. Before activating one,
place the **Orchestration Work Guide** component on the record page; approvers get an email
link to the record and act in the Work Guide, or **reply to the email with keywords**. Use it
when a review is "multilevel, multiuser, multisystem", needs input from outside the company, or
must call external systems — the cases a single classic approval process cannot model.

### Maintaining, monitoring and troubleshooting flows — the objective the deck skips

- **Error emails**: when a flow interview fails, a detailed email goes to the **user who last
  modified the flow** — or, via Process Automation Settings → *Send Process or Flow Error Email
  to*, to the **Apex Exception Email recipients**. The email carries the interview's data and a
  link that opens the failed path in Flow Builder.
- **The Automation app → Monitor tab** lists every **failed and paused** interview with its error
  details; open one to see the debug run, **resume** a paused interview.
- **Debug** in Flow Builder: run as another user, with rollback, watching each element's inputs
  and outputs; **fault connectors** route errors to a friendly screen.
- **Versions**: one active at a time; a change set deploys a flow **inactive** unless the org
  allows active deployment — which requires **Apex test coverage** for the flow (`aead4086`).
- **Order of execution** for record-triggered flows: before-save flows → validation → after
  triggers → assignment/auto-response/workflow/escalation → after-save flows → roll-ups →
  commit → scheduled paths and email.

### Agentforce as automation — the objective the deck skips

An **agent** reasons over natural-language requests and calls **actions**; the actions an app
builder supplies are **autolaunched flows**, **prompt templates** and Apex, each with plain
instructions on what it does and when to use it. Flow also reaches the other way: a
**prompt template action** in a flow generates text from record data (Case Summary, Sales
Email, Field Generation and other template types). The use-case shape: a repeatable,
conversational task with clear guardrails — summarise, draft, look up, update within limits —
with escalation to a person. Agents run **as a user**, so the flow's run mode and the agent
user's permissions decide what they can touch.

---

## 7. User Interface

### Lightning App Builder

- **Page types**: record, app and home pages; templates **adapt to the device** — one page, not
  one per device (`de4b2606`). **Activation**: org default, **app default**, or **app + record
  type + profile** — never by role or permission set (`9e57b515`).
- **Component visibility** by field value — including a *parent's* field (`2ebcd70e`) — by
  user profile (`5134cf87`), by **device** for mobile-only components (`2fc4a493`), or by a
  scheduled showing (`9bb789da`). **Dynamic Forms** put fields on the page with visibility rules
  (`3f3c54da`); **Dynamic Actions** make the Convert button appear only when Status is Qualified
  (`fb8423b6`).
- **Standard components** (`ffadd965`): Record Detail (all layout fields, `a50d3615`),
  **Highlights Panel** (up to 12 key fields, `ba782585`; it also carries the layout's mobile and
  Lightning actions, `a0daae5d`), **Related Record** (edit a parent in place with an Update
  action, `c1eb9ac9`), **Related List** — **Enhanced List** for up to 10 columns, sorting and
  wrapping (`db67d315`), **Tabs** and **Accordion** for 100 fields (`cf57c925`), **Rich Text**,
  List View, Recent Items, **Path**, **Chatter** (needs feed tracking, `61c9d73b`), Report
  Chart, Flow, **Activities** (where a New Task action surfaces, `78e7b0b9`), Actions &
  Recommendations, Twitter (`c4104391`).
- **Custom components** come from **Lightning Components in Setup** and **AppExchange**
  (`e787099c`, `17a46fdf`), and are dragged onto a page in App Builder (`6963ca79`). A
  component appears only where its **targets** say — record page, home page, app page,
  **utility bar** (`cf83a80b`, `9b791b13`) — and only on the **form factors** it declares
  (`afe2479b`). Under the hood: Aura or LWC bundles with a `js-meta.xml` declaring targets and
  supported form factors.

### Buttons, links, actions

| | Custom button / link | Object-specific quick action | Global action |
|---|---|---|---|
| Lives on | Page layout buttons | The object's layout, **Mobile & Lightning Actions** section | Global publisher layout; almost any page that supports actions (`f9226263`) |
| Does | Opens a URL, a Visualforce page, or a flow (`d8a40894`) | **Create a Record** (with **predefined field values** and its own field layout — `1b17f56d`, `c73b8857`, `12cbcf1f`), **Update a Record** (`25f618fa`), Log a Call, Send Email, custom Lightning component or flow | Create a record *not* related to the current one, log a call, send email, custom |
| Shows in | Record header / list view | Highlights panel, Activities, Chatter publisher | Global actions menu, mobile action bar, feeds, groups |

### The mobile app

- **Navigation** comes from **Lightning apps** assigned to profiles (`a73d0a3c`); the Mobile Only
  navigation menu lists Groups beside Chatter (`194683e0`).
- **Compact layouts** put key fields at the top of a record (`f5d30d69`); global actions make
  vital tasks one tap away and a create-contact action with few fields lets reps add now and
  finish later (`b5e68679`, `d3acc683`); keep formula and lookup fields few for load time.
- Components render on phone only if they declare the form factor; **offline create, edit and
  delete** keeps data flowing when there is no signal (`7babd714`).

### Other UI facts the deck tests

- **Path** guides but does not enforce (`298e3056`, `3e1b0e81`, `a8a96dba`) — a validation rule
  enforces (`f2171f7e`).
- Record types give a short create form first and a fuller layout after (`2c33c2c4`).
- **Search layouts** decide the columns and filter fields users see (`d9d254c2`).
- **Inline editing** is off for list views spanning more than one record type and for Recently
  Viewed (`044ba50f`).
- **Feed tracking** posts field changes to Chatter (`f9f539f1`, `8e82f823`); **streams** combine
  chosen records' feeds; **Out of Office** shows availability (`6f868a8f`, `c0ddc67d`).
- The **utility bar** — edited in **App Manager**, not App Builder — keeps tools docked on every
  page (`e8227b30`, `19c14a90`).

---

## 8. Numbers to memorise

| Item | Value |
|---|---|
| Exam | 60 scored + up to 5 unscored; **105 min**; **73%** = 44 of 60; **Summer '26**; no prerequisite |
| Domain weights | Fundamentals 18 · Data Modeling 20 · **Business Logic 32** · UI 17 · Deployment 13 |
| Master-detail relationships per object | **2** |
| Roll-up summary fields per object | **25** (raisable) |
| Roll-up types | COUNT, SUM, MIN, MAX — **no AVG** |
| External ID fields per object | **25** |
| Approval action types | **4** — email alert, task, field update, outbound message |
| Text field maximum | 255 characters (Long Text Area truncates to it on conversion) |
| Data Import Wizard | **50,000** records |
| Highlights Panel | up to **12** key fields |
| Enhanced related list | up to **10** columns |
| Dashboard filters / dynamic dashboards | 5 per dashboard / **5 · 10 · 3** per org (Enterprise · Unlimited & Performance · Developer) |
| Sandboxes | Developer **200 MB**, refresh **1 day**; Developer Pro **1 GB**, 1 day; Partial Copy **5 GB**, **5 days**, template; Full — production copy, **29 days** |
| Sandbox preview lead | about 6 weeks ahead of production |
| Namespace | 1–15 characters |
| Apex coverage to deploy to production | 75% |

---

## 9. App Deployment

### Application lifecycle and sandboxes

| Need | Sandbox | Deck |
|---|---|---|
| One person's small project, refreshed at will, metadata only | **Developer** — 200 MB, 1-day refresh | `9e5ca684` |
| ~0.5 GB of test data, refreshed after each 3-day sprint | **Developer Pro** — 1 GB, 1-day refresh | `89710d72` |
| A slice of production data under 5 GB, refreshed weekly, some objects excluded | **Partial Copy** with a **sandbox template** — 5-day refresh | `41de0feb`, `ffab0ef2` |
| Everything, for staging and performance | **Full** — 29-day refresh | |
| 20 sandboxes with the same base configuration and data | **Sandbox cloning** | `b0d92c09` |

Releases are classed **patch** (bug fixes, simple changes), **minor**, **major** (`d683ac97`).
A **preview sandbox** runs the next release ~6 weeks early — a change set using a feature
that only exists there **fails** against production (`99abaa00`). Set a sandbox's email
deliverability to **No access** to stop test emails (`441636d1`).

### Change sets — mechanics and troubleshooting

- Outbound from the source, inbound to the target, over a **deployment connection**. **Validate
  the inbound change set** in production before the window (`ff1a414f`). An uploaded change set
  is **frozen** — to add or fix components, **clone it** (`d84d4c97`).
- **Include the dependencies**: a layout needs its custom fields and custom actions
  (`a56ee547`); deployed **custom tabs are hidden until profiles arrive** (`8d0b35d5`); reports
  must sit in a **public folder** (`c8e73298`). Custom objects, fields and Apex classes deploy;
  Web-to-Lead settings and standard fields do not (`ecea7391`).
- **Not everything is a change-set component** — expect manual steps in the target
  (`7d962a18`); a failed deployment **rolls back** entirely. A **field type change** in the set
  runs a background data conversion and can make the deployment slow (`238aaeb2`).
- Active flows deploy **inactive** unless the org allows active deployment with test coverage
  (`aead4086`); Apex in a package or change set runs the org's tests and needs **75%** in
  production (`07e3af03`).

### Packages

| | Managed | Unmanaged |
|---|---|---|
| Namespace | Required, 1–15 characters, prevents collisions (`116a14c0`) | None |
| After install | Components locked; publisher **upgrades** it — least maintenance (`a0324c31`) | Components editable; **cannot be upgraded** — uninstall and reinstall (`e12c8221`); best when you must customise fast (`3075c7b3`) |
| Install options | Admins only / all users / specific profiles; in a sandbox the URL uses `test.salesforce.com` | Same |

### The deployment plan — the objective the deck skips

1. **Inventory** what changed and its dependencies (objects → fields → layouts, record types and
   page assignments → profiles / permission sets → automation → reports and dashboards); note
   what change sets cannot carry.
2. **Build and validate** the change set (or package) against the target; fix missing
   dependencies; confirm Apex coverage.
3. **Schedule** a window; freeze conflicting changes; communicate.
4. **Deploy**, then do the **manual steps** — profile tab visibility, activations, settings.
5. **Test** in production with a defined script; **activate** flows and pages.
6. **Back-out plan**: a deployment that fails rolls back on its own; a deployment that
   succeeds and misbehaves needs the previous versions or a reversing change set ready.

---

## 10. Distractor tells

Patterns in how this exam writes wrong answers, from the deck's 222 and its fact-check.

1. **The relationship that does the opposite.** Master-detail where the child must survive
   (`df028304`), lookup where a roll-up or cascade is required (`dca21cdc`, `f275115f`),
   master-detail on the *wrong* side (`c5f11c84`, `92ce68b5`).
2. **A roll-up across a lookup.** Any option that summarises through a lookup, uses AVG, or
   rolls up a formula with `TODAY()` in it.
3. **A formula for a value that must not change** (`39919e32`) — or a formula that reads child
   records (`f8150bea`).
4. **Required in the wrong place.** Layout-required for a conditional requirement; a validation
   rule for a delete (`e1e7a031`).
5. **Retired automation offered as current.** Workflow Rules and Process Builder in a Summer
   '26 option set are distractors; Flow is the answer (§11). "Before-save flow" for anything
   beyond the triggering record's fields (`5b81e447`, `4b57de62`).
6. **Approval process capabilities invented.** "Automatic submission in the entry criteria"
   (`1e4a7642`), creating or deleting records as an approval action (`70d99691`, `c25d186f`).
7. **Access one layer off.** A sharing rule for a field (`31d03e0b`); FLS for a component
   (`5134cf87`); a permission set for a *default* record type; sharing the detail instead of the
   master (`d36e669a`); OWD Public when the aim is restriction.
8. **Profile edit for one user.** A permission set is always the answer for one person's extra
   access (`513fdca2`).
9. **The wrong builder.** Page Layout editor for a Lightning component (`6963ca79`); App Builder
   for the utility bar (`e8227b30`); Schema Builder for page layouts (`2fac7b8c`).
10. **Import Wizard beyond its limits.** More than 50,000 records (`9c4d665b`), or clearing a
    field (`2a1d9baf`).
11. **Change set myths.** "Rename and redeploy" (`d84d4c97`); "reports are not supported"
    (`c8e73298`); "all users must log out" (`7d962a18`); an unmanaged package that "updates"
    (`e12c8221`).
12. **Custom code on a declarative exam.** Apex, Visualforce or an LWC when an AppExchange
    solution, a flow or a formula is offered — except where the docs say only code works
    (deleting with a condition, `e1e7a031`).

### Read the question's own verb

- **"unable to be moved" / "cannot be reparented"** → master-detail with Allow Reparenting off.
- **"deleted along with"** → master-detail; **"should remain"** → lookup.
- **"total / count / earliest / highest of related records"** → roll-up (master-detail) or a
  flow across a lookup.
- **"stay in sync" / "real-time value of the parent's field"** → cross-object formula.
- **"copied once and never changes"** → automation that writes on create, not a formula.
- **"only when…" / "cannot be reverted"** → validation rule.
- **"without the rep needing to take action"** → a flow that submits for approval.
- **"sign-off" / "approve"** → approval process; **"multilevel, multiuser, multisystem"** →
  Flow Approval Process.
- **"quickly" / "no developers" / "prebuilt"** → AppExchange (or AgentExchange for agents).
- **"refreshed every week" + "under 5 GB"** → Partial Copy; **"metadata only, 1-day refresh"** →
  Developer / Developer Pro.

---

## 11. Where the deck is older than the exam

The exam is aligned to **Summer '26**; the outline's Business Logic domain lists flows, Flow
Approval Processes, approval processes and Agentforce — **not** Workflow Rules or Process
Builder, whose support ended on 31 Dec 2025. Ten deck items still key them. **On the exam,
answer the Summer '26 way.** In the deck these stay keyed as scraped, and their explanations
say so.

| Deck item | Keyed as | Summer '26 answer |
|---|---|---|
| Copy Account Billing State to an Opportunity once, at creation (`39919e32`) | Workflow rule with a field update on create | A **record-triggered flow** on create that sets the field once |
| Notify a web service when an Opportunity is won (`392c6b99`) | Workflow + outbound message; process + Apex | A **flow** with an **outbound message** action (or an HTTP callout action) |
| Auto-submit deals over 40% discount for approval (`1e4a7642`) | A process with Submit for Approval; a flow | The **flow** half only |
| Set Status to Working when a user takes a lead from a queue (`0c8f84d5`) | Process Builder criteria `BEGINS([Lead].OwnerId, '005')` | The same test in a record-triggered flow's entry condition |
| Process Builder capabilities (`ff959d2d`), recursion (`5e649731`), considerations (`3231e6c1`) | Process Builder | The principles — avoid loops, combine actions, one automation per context — apply to **Flow**; the tool itself is retired |
| Workflow rule limits and re-evaluation loops (`8d600172`) | Workflow rules | Same shape in flows: entry conditions and *run only when a record is updated to meet the condition* |
| Workflow field update vs validation rule (`2b895c9b`), what field updates ignore (`12fa9e7e`) | Workflow field updates | Field updates in **flows** behave the same way in the save order |
| Classic approval processes (many items) | Still correct | The outline keeps "approval process" and adds **Flow Approval Processes** for multi-stage, multi-system reviews (§6) |

Not stale, but flagged in their own explanations: `194683e0` (the mobile navigation item
wording), `15524fc6` (Schema Builder "editing custom settings"), `d07b1682` (approval delivery
methods), `12fa9e7e` (decimal places and character limits), `99abaa00` and `d683ac97` (cited as
orienting only).

---

## 12. Two-week revision plan

| Day | Focus |
|---|---|
| 1 | §4 relationships table until every row's implications are automatic; conversions. Drill data-modeling items |
| 2 | §4 field types and type changes; import/export; Salesforce Connect. Drill the rest of the domain |
| 3 | §3 access layers and the sharing table; troubleshoot "who can see what" from the deck |
| 4 | §3 report types, formats, dashboards — the dynamic-dashboard limits from memory |
| **5** | **§5 formulas, roll-ups, validation rules** — write the roll-up rules and the validation-rule truth table from memory |
| **6** | **§6 flow types and the after-save catalogue**; re-answer every Process Builder item the Flow way |
| **7** | **§6 approvals — classic and Flow Approval Processes; monitoring and troubleshooting; Agentforce** |
| 8 | §7 App Builder components, visibility, activation. Drill UI items |
| 9 | §7 buttons, actions, mobile; the utility bar. Drill again |
| **10** | **§9 deployment** — the sandbox table, change-set rules, packages, and the deployment plan from memory |
| 11 | §8 numbers (cover and reproduce); §11 the deck-older-than-exam list |
| 12 | §10 tells; re-drill every item you missed |
| 13 | Full deck run, timed at 105 seconds a question — 222 items is two sittings |
| 14 | Re-read §6 and §11. Rest |

---

## 13. Sources

Every URL below was rendered and title-checked during this repo's fact-check work or while
writing this guide.

**The exam**
- [Salesforce Certified Platform App Builder Exam Guide](https://help.salesforce.com/s/articleView?id=005298964&type=1&language=en_US) — outline, weights, Summer '26 alignment.

**Fundamentals — access, sharing, reporting**
- [Organization-Wide Sharing Defaults](https://help.salesforce.com/s/articleView?id=sf.security_sharing_owd_about.htm&language=en_US&type=5), [Sharing Rules](https://help.salesforce.com/s/articleView?id=sf.security_about_sharing_rules.htm&language=en_US&type=5), [Control Access Using Hierarchies](https://help.salesforce.com/s/articleView?id=sf.security_controlling_access_using_hierarchies.htm&language=en_US&type=5), [Permission Set Groups](https://help.salesforce.com/s/articleView?id=platform.perm_set_groups.htm&language=en_US&type=5)
- [Who Has Access to Account Records?](https://help.salesforce.com/s/articleView?id=platform.faq_record_access.htm&language=en_US&type=5) — the Sharing Hierarchy action.
- [Install a Package](https://help.salesforce.com/s/articleView?id=sf.distribution_installing_packages.htm&language=en_US&type=5)
- [Reports and Dashboards Limits and Allocations](https://help.salesforce.com/s/articleView?id=analytics.rd_reports_dashboards_limits.htm&language=en_US&type=5) and [Dynamic Dashboards](https://help.salesforce.com/s/articleView?id=analytics.dashboards_dynamic_overview.htm&language=en_US&type=5)
- [Hide Report Types](https://help.salesforce.com/s/articleView?id=sf.reports_hide_report_types.htm&language=en_US&type=5) and [Report and Dashboard Folder Sharing Permissions](https://help.salesforce.com/s/articleView?id=analytics.analytics_sharing_permissions.htm&language=en_US&type=5)

**Data modeling**
- [Object Relationships Overview](https://help.salesforce.com/s/articleView?id=platform.overview_of_custom_object_relationships.htm&language=en_US&type=5), [Considerations for Relationships](https://help.salesforce.com/s/articleView?id=platform.relationships_considerations.htm&language=en_US&type=5), [Roll-Up Summary Fields](https://help.salesforce.com/s/articleView?id=platform.fields_about_roll_up_summary_fields.htm&language=en_US&type=5)
- [Considerations for Converting the Field Type of a Custom Field](https://help.salesforce.com/s/articleView?id=platform.notes_on_changing_custom_field_types.htm&language=en_US&type=5) and [Custom Metadata Types](https://help.salesforce.com/s/articleView?id=platform.custommetadatatypes_overview.htm&language=en_US&type=5)
- [Export Backup Data from Salesforce](https://help.salesforce.com/s/articleView?id=xcloud.admin_exportdata.htm&language=en_US&type=5), [Things to Know About Duplicate Rules](https://help.salesforce.com/s/articleView?id=sf.duplicate_rules_overview.htm&language=en_US&type=5)
- [Access External Data With Salesforce Connect](https://help.salesforce.com/s/articleView?id=platform.salesforce_connect.htm&language=en_US&type=5) and [External Object Relationships](https://help.salesforce.com/s/articleView?id=platform.external_object_relationships.htm&language=en_US&type=5)
- [About Advanced Currency Management](https://help.salesforce.com/s/articleView?id=sf.administration_about_advanced_currency_management.htm&language=en_US&type=5) — the Opportunity → Account roll-up block.

**Business logic and automation**
- [Triggers and Order of Execution](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm)
- [Flow Types](https://help.salesforce.com/s/articleView?id=platform.flow_concepts_type.htm&language=en_US&type=5), [Record-Triggered Flows](https://help.salesforce.com/s/articleView?id=platform.flow_concepts_trigger_record.htm&language=en_US&type=5), [Flow Global Variables](https://help.salesforce.com/s/articleView?id=platform.flow_ref_resources_global_variables.htm&language=en_US&type=5)
- [Automate Your Approvals with Flow Approval Processes](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals.htm&language=en_US&type=5) — stages, steps, work items, the Work Guide.
- [Limits and Considerations for Classic Approval Processes](https://help.salesforce.com/s/articleView?id=platform.approvals_considerations.htm&language=en_US&type=5) and [Troubleshoot Approval Processes](https://help.salesforce.com/s/articleView?id=platform.approvals_troubleshoot.htm&language=en_US&type=5)
- [Select Flow and Process Error Email Recipients](https://help.salesforce.com/s/articleView?id=sf.flow_troubleshoot_error_email.htm&language=en_US&type=5), [Monitoring and Managing Paused and Failed Flow Interviews](https://help.salesforce.com/s/articleView?id=platform.automate_ala_monitor.htm&language=en_US&type=5), [Troubleshooting Flow Run Time Errors](https://help.salesforce.com/s/articleView?id=sf.flow_troubleshoot_email.htm&language=en_US&type=5)
- [Process Automation Settings](https://help.salesforce.com/s/articleView?id=platform.automation_about_settings.htm&language=en_US&type=5)
- [Design and Implement Agents](https://help.salesforce.com/s/articleView?id=ai.copilot_intro.htm&language=en_US&type=5), [Write Instructions for Actions](https://help.salesforce.com/s/articleView?id=ai.copilot_actions_instructions.htm&language=en_US&type=5), [Prompt Template Types](https://help.salesforce.com/s/articleView?id=ai.prompt_builder_standard_template_types.htm&language=en_US&type=5)

**User interface**
- [Lightning Page Types](https://help.salesforce.com/s/articleView?id=platform.lightning_page_types.htm&language=en_US&type=5), [Activate Lightning Record Pages](https://help.salesforce.com/s/articleView?id=platform.lightning_app_builder_customize_lex_pages_activate.htm&language=en_US&type=5)
- [Configure Components for Lightning App Builder (Aura)](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/components_config_for_app_builder.htm) — targets and form factors.
- [Customize the Mobile Navigation Menu](https://help.salesforce.com/s/articleView?id=xcloud.salesforce_app_customize_nav_menu.htm&language=en_US&type=5)

**Deployment**
- [Continuous Integration (Salesforce DX Developer Guide)](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ci.htm)
- [Install a Managed Package](https://help.salesforce.com/s/articleView?id=sf.distribution_installing_packages.htm&language=en_US&type=5)

---

## 14. Using this with NotebookLM

Upload **this file** as a source. Markdown ingests cleanly and the headings become NotebookLM's
navigation.

Worth adding as additional sources:
- The [official exam guide](https://help.salesforce.com/s/articleView?id=005298964&type=1&language=en_US) URL.
- [Considerations for Relationships](https://help.salesforce.com/s/articleView?id=platform.relationships_considerations.htm&language=en_US&type=5) and [Automate Your Approvals with Flow Approval Processes](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals.htm&language=en_US&type=5) — the page behind the deck's strongest area and the page behind its biggest gap.

**Prompts that produce useful study media:**

- *"Generate an Audio Overview of section 4. Have the hosts describe a data requirement —
  cascade delete, inherited sharing, a total on the parent, a child that must survive — and
  argue over lookup versus master-detail versus junction each time."*
- *"Using section 6, drill me on flow type selection: give me a requirement and ask whether it
  is a screen flow, a before-save flow, an after-save flow, a scheduled flow, a classic approval
  or a Flow Approval Process. Don't give me the answer until I try."*
- *"Turn section 8 into flashcards — one number per card."*
- *"Using section 11, quiz me on each deck item that keys Process Builder or a workflow rule,
  and make me give the Flow answer instead."*
- *"Using section 9, walk me through a deployment plan for a change that includes a new object,
  a page layout, a flow and a report, and ask me what could go wrong at each step."*

For the Audio Overview, sections 4, 6 and 10 reward listening — they are decision tables
argued out loud. Sections 8 and 13 are lookups and will not survive being read aloud.
