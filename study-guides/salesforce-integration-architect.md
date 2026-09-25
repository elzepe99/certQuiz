# Salesforce Certified Platform Integration Architect — Study Guide

**Built from the 146 questions in `integration_architect_questions_corrected.json`, cross-checked
against the official exam outline and the documentation those questions cite.**

Every fact below traces to a rendered Salesforce page (see [Sources](#16-sources)) or to this
deck's own fact-check pass. Where the exam's expected answer and today's platform disagree,
that is called out explicitly in [§13 Answers that are right for the exam and wrong for
production](#13-answers-that-are-right-for-the-exam-and-wrong-for-production) — do not skip that
section, it is the most likely place to lose a point you thought you had.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Salesforce Certified **Platform** Integration Architect |
| Exam code | Plat-Arch-204 |
| Content | **60 scored** multiple-choice questions + up to 5 unscored |
| Time | **105 minutes** (~1 min 45 s per question) |
| Passing score | **67%** → you need **41 of 60** |
| Prerequisite | None |
| Fee | US$400 (retake US$200) |
| **Release alignment** | **Summer '23** |

**That last row is the single most useful fact on this page.** The item bank is pinned to Summer
'23, so features Salesforce has since retired, restricted, or renamed are still tested the old
way. This is why §13 exists and why "but that changed last year" is not a reason to move your
answer. Answer as of Summer '23.

Pacing: 105 minutes for 60 questions, and this exam's stems are long — several run to a numbered
list of six business requirements. Budget ~90 seconds for the pattern-recognition questions so
you bank time for the scenario monsters.

---

## 2. Where the points actually are

Official outline weightings, and what they translate to in raw question count:

| Domain | Weight | ≈ Questions | Deck coverage | Verdict |
|---|---:|---:|---:|---|
| Evaluate the Current System Landscape | 8% | ~5 | 4 (2.7%) | **under-trained** |
| Evaluate Business Needs | 11% | ~7 | 4 (2.7%) | **under-trained** |
| Translate Needs to Integration Requirements | 22% | ~13 | 7 (4.8%) | **badly under-trained** |
| Design Integration Solutions | 28% | ~17 | 75 (51.4%) | over-represented |
| Build Solution | 23% | ~14 | 39 (26.7%) | about right |
| Maintain Integration | 8% | ~5 | 17 (11.6%) | over-represented |

### The gap you need to close

The first three domains are **41% of the exam — roughly 25 of your 60 questions — and only 10.3%
of the deck.** If you drill the deck to 100% and walk in, you have thoroughly rehearsed the
pattern-picking half of the exam and barely touched the requirements-gathering half.

Those 25 questions are not about APIs. They are about *what an architect does before choosing an
API*. [§12](#12-the-under-trained-41-requirements-before-solutions) is written specifically to
cover that ground, because the deck can't.

### "Isn't this just bad tagging?" — tested, and no

The deck's domain tags came in with the scrape, so the obvious objection is that the skew is a
labelling artifact rather than a real content gap. It was worth checking, and the tags *are*
unreliable per-question: `18073510` and `c7d46b81` are the same lead-migration question tagged
**Build** and **Design**; `ff6c0296` and `b054672a` are the same batch-size question tagged
**Maintain** and **Build**.

But re-classifying all 146 questions independently — by what each one actually tests, ignoring
`_cat` — lands on the same distribution. (Re-measured 2026-09-25, after the 2026-08-25
loose-question import added 8 and the 2026-09-11 branch recovery added 5. Of those 13, seven
landed in Design and three in Build, so the imports moved the gap the wrong way rather than the
right one.)

| Domain | Exam | Deck tag | Independent re-tag | Steelman |
|---|---:|---:|---:|---:|
| Evaluate the Current System Landscape | 8% | 2.7% | 3.4% | 3.4% |
| Evaluate Business Needs | 11% | 2.7% | 2.1% | 2.1% |
| Translate Needs to Integration Requirements | 22% | 4.8% | 5.5% | 12.3% |
| Design Integration Solutions | 28% | 51.4% | 50.7% | 43.8% |
| Build Solution | 23% | 26.7% | 28.1% | 28.1% |
| Maintain Integration | 8% | 11.6% | 10.3% | 10.3% |
| **Requirements domains (L+B+T)** | **41%** | **10.3%** | **11.0%** | **17.8%** |

Only **8 of 146** re-tags disagreed with the deck, and six of the eight shuffled between
Design / Build / Maintain — all three already over-weighted. Two did move into the requirements
domains (`998dcfd8` Business Needs → Translate, `7b684ea4` Design → Landscape), for a net gain of
**one question**: 15 by the deck's tags against 16 by independent re-tag. The mis-tagging is
essentially lateral, so it cannot close the gap.

The **Steelman** column applies the most generous possible reading: the Translate objective says
"identify performance needs (volumes, response times, latency) **and propose appropriate
integration solutions**", which genuinely overlaps Design — so it moves the 10 Design questions
that are pure volume/latency-driven proposals (10M transactions/day, 20M records, the
90s-vs-9s-gateway item) into Translate. Even then the requirements domains reach 18%, not 41%.

**The fair reframing:** the gap is more in question *form* than in knowledge. Someone who has
worked 74 Design questions has absorbed much of the underlying judgment. What they have not
rehearsed is the distinctive *shape* of a Translate item — every option a consideration rather
than a product, and the right answer "evaluate current and future data usage" over "explore
out-of-the-box connectors." The deck has 8 of those. The exam will have about 13.

---

## 3. The pattern spine

Everything on this exam hangs off six patterns from Salesforce's [Integration Patterns and
Practices](https://architect.salesforce.com/docs/architect/fundamentals/guide/integration-patterns.html)
guide. Learn this table cold; roughly a third of the exam is recognising which one a stem
describes.

| Pattern | Direction | Timing | The one-line test |
|---|---|---|---|
| **Remote Process Invocation — Request and Reply** | SF → remote | Synchronous | The user is **waiting for the answer** and can't continue without it |
| **Remote Process Invocation — Fire and Forget** | SF → remote | Asynchronous | SF publishes and moves on; **no reply is expected** |
| **Batch Data Synchronization** | Either | Scheduled bulk | "Nightly", "by next business day", high volume, latency tolerated |
| **Remote Call-In** | Remote → SF | Either | The **external system initiates**; SF is the provider |
| **UI Update Based on Data Changes** | SF → SF UI | Push | A **screen must refresh** when data changes elsewhere |
| **Data Virtualization** | SF → remote | On demand | Data is **read/written live and never persisted** in Salesforce |

### Signal words that decide it

| The stem says… | The pattern is… |
|---|---|
| "agent must confirm before…", "receive the generated ID", "in real time so they can retry" | Request and Reply |
| "subscribes to the platform event", "notify the downstream system", "no response needed" | Fire and Forget |
| "nightly", "thousands of changes per day", "must take effect by the next business day" | Batch Data Synchronization |
| "the external system calls into Salesforce", "callback into Salesforce", "expose to N apps" | Remote Call-In |
| "dashboard updates without refreshing", "notify all reps when…" | UI Update Based on Data Changes |
| "data must only persist in the external system", "20M records and growing", "system of record stays external" | Data Virtualization |

### Combinations are fair game

Question 91 in the deck pairs **Fire and Forget + UI Update Based on Data Changes**: the engineer
fires an on-demand status request the remote system can't answer immediately, and the dashboard
refreshes when the answer eventually lands. If a stem has both "trigger a request" and "the screen
updates later", expect a two-pattern answer.

---

## 4. Pattern → mechanism

The pattern is the *what*; this table is the *how*. Exam questions frequently give you the pattern
and ask for the mechanism, or vice versa.

| Pattern | Declarative mechanism | Programmatic mechanism |
|---|---|---|
| Request and Reply | Enhanced External Services (Flow), Salesforce Connect writes | Apex callout; **Continuation** for long/slow ones |
| Fire and Forget | **Outbound Message** (SOAP), Platform Event, Flow HTTP Callout | `@future` / Queueable callout, Apex-published Platform Event |
| Batch Data Synchronization | ETL tool on a schedule | Batch Apex + callout, Bulk API |
| Remote Call-In | REST API, SOAP API, Bulk API | **Apex REST** / Apex SOAP web service |
| UI Update Based on Data Changes | PushTopic / CDC + `empApi` in LWC | Streaming API (CometD) client |
| Data Virtualization | **Salesforce Connect + OData** external objects | Apex Connector Framework (custom adapter) |

### Three mechanism traps worth memorising

- **A trigger cannot make a callout directly.** Pending DML in the transaction blocks it. It must
  hand off to `@future(callout=true)` or Queueable — which makes it asynchronous. This is why a
  stem demanding "synchronous" *and* "automatic on record change" is usually describing something
  no option can actually deliver (deck Q94).
- **Outbound Messaging carries one object.** Its WSDL is generated from a single object, so it
  cannot ship an Opportunity *and* its line items in one message. That limitation is a recurring
  answer.
- **Process Builder cannot send an outbound message.** Outbound message actions belong to
  **flows, workflow rules, approval processes, and entitlement processes**. Process Builder is not
  on that list.

---

## 5. Picking the API

| API | Use it when | The distractor it beats |
|---|---|---|
| **REST API** | General record CRUD, mobile, lightweight clients; supports OAuth | Not for Chatter, not for metadata |
| **SOAP API** | Strongly typed enterprise clients; supports WS-Security | 200-record ceiling per call |
| **Bulk API** | 100k+ records, async, parallel batches, job monitoring in Setup | Not for real-time |
| **Streaming API (CometD)** | Subscribing to events — PushTopic, Platform Events, CDC | Cannot do CRUD |
| **Composite REST** | Up to **25 subrequests in one call**, counts as **one** API call | Cuts both API usage and orchestration code |
| **User Interface API** | A native app that **recreates the Lightning UI** — returns records *plus* layouts, picklists, theming | REST API returns raw data with no layout metadata |
| **Connect REST API** | Chatter, feeds, communities, mentions, rich-body parsing | REST API treats `FeedItem` as a plain sObject |
| **Tooling API** | Code coverage, test results, developer metadata (`ApexCodeCoverage`, `ApexTestResult`) | Not record CRUD; not deployment |
| **Metadata API** | Deploy/retrieve metadata | Does **not** expose code-coverage telemetry |
| **Analytics REST API / External Data API** | CRM Analytics dataflows, recipes, data syncs | Not general reporting |
| **Apex REST / Apex SOAP** | Exposing **custom business logic** securely to external callers | Requires code + tests; not declarative |

**Enterprise vs Partner WSDL** — asked repeatedly, and always the same discriminator:

| | Enterprise WSDL | Partner WSDL |
|---|---|---|
| Typing | **Strongly** typed | **Loosely** typed (name/value pairs) |
| Bound to | One org's specific metadata | Any org |
| Use when | One known org, want compile-time type safety | **Multiple orgs**, or field names inspected **at runtime** |
| Breaks when | The org's metadata changes | Rarely |

---

## 6. Picking the event type

| Event type | Retention | Replay | Origin | Respects sharing? |
|---|---|---|---|---|
| **Platform Event** (high-volume) | **72 h** | Yes, by ReplayId | **You publish it** — Apex, Flow, API | Object perms: Create to publish, Read to subscribe |
| **Change Data Capture** | **72 h** | Yes, by ReplayId | **Automatic** on record change | **Ignores sharing** — sends all records. Still enforces **FLS** |
| **PushTopic** | **24 h** | Limited | SOQL query you define | **Yes, respects sharing rules** |
| **Generic Event** | **24 h** | Limited | Arbitrary payload you post | No record context at all |

### The discriminators the exam actually tests

- **CDC vs Platform Event is *not* about retention.** Both are 72 hours. The difference is
  **origin**: change events are generated automatically from record changes with no code; platform
  events must be defined and published deliberately. A stem saying "notifications stored for up to
  three days if replication fails" *and* "syncs record data changes" is CDC.
- **PushTopic vs CDC** is about **scope**. PushTopic is defined by a SOQL query, so it can watch
  exactly the records that matter (closed Cases) — good for driving a **UI counter**. CDC emits
  *every* change on the object with no criteria — built for **replicating to an external system**.
  This is why two similar-looking deck questions resolve in opposite directions.
- **Surviving a multi-day disconnect** → the two types with 72-hour retention and ReplayId: **CDC
  and high-volume Platform Events**.
- **ReplayId values**: `-1` = new events from now on. `-2` = **all events still in retention**
  (the backfill-after-outage answer). A specific ReplayId = resume from there.
- **Platform Events are handed off, not guaranteed end-to-end.** Once published, Salesforce
  considers the event delivered to the bus and does not retry per subscriber. **The subscriber owns
  retry and error handling.**
- **BatchApexErrorEvent** is the standard platform event the platform fires automatically on an
  unhandled Batch Apex exception (the class must implement `Database.RaisesPlatformEvents`). It is
  the answer for "make a scheduled batch job resilient" — you cannot catch the failure inside the
  job that just died.

---

## 7. Numbers to memorise

The highest-yield facts on the exam, because they are unambiguous and they are where fabricated
distractors live.

### Callouts and Apex

| Limit | Value |
|---|---|
| Apex callout timeout | **10 s default — not a ceiling.** `setTimeout()` raises it to **120 s** |
| Cumulative callout time per transaction | **120 s** |
| Callouts per Apex transaction | **100** |
| Concurrent long-running request limit | A synchronous request over **5 seconds** counts against it — **usually the real constraint**, not the timeout |
| Continuation: parallel callouts | **3** |
| Continuation: timeout | **120 s** |
| Continuation: max HTTP response | **1 MB** |
| Callouts and pending DML | **You cannot call out with pending DML in the same transaction** |

> **The 10-second trap.** Multiple deck explanations had to be repaired because they taught "the
> Apex callout limit is 10 seconds, so use X". It is the *default*. When a stem says a service takes
> 7–12 seconds or 30+ seconds, the reason not to call it synchronously is that it **burns the
> transaction's callout budget and trips the >5-second concurrent request limit** — not that the
> platform refuses.

### Data loads

| Limit | Value |
|---|---|
| SOAP API `create()`/`update()`/`upsert()` | **200 records** per call |
| Bulk API batch allocation | **15,000 batches** per rolling 24 hours |
| Bulk API default mode | **Parallel** (the fast path). Serial exists only to dodge lock contention |
| Composite REST | **25 subrequests**, one API call, max 5 of them queries/collections |
| Data Loader ceiling | **150,000,000** records per CSV |
| Data Import Wizard ceiling | **50,000** records |

### Events and messaging

| Limit | Value |
|---|---|
| High-volume Platform Event / CDC retention | **72 hours** |
| PushTopic / generic event retention | **24 hours** |
| Outbound Message retry window | **24 hours**, then dropped from the queue |
| Outbound Message per-message timeout | **60 seconds** |

### Storage

| Limit | Value |
|---|---|
| Salesforce Files max upload | **10 GB** (Files home, libraries, record Files related list) |
| Chatter post/comment upload | **2 GB** — this is the *only* place the 2 GB number applies |

---

## 8. Security and authentication

### The four things that are constantly confused

| Feature | Governs | Direction |
|---|---|---|
| **Remote Site Settings** | Apex HTTP callouts | Outbound |
| **CSP Trusted Sites / Trusted URLs** | Browser-side `fetch` from LWC/Aura | Outbound, from the browser |
| **CORS** | External pages calling **into** Salesforce from a browser | Inbound |
| **Connected App** | OAuth: which app may connect, with what scopes | Inbound |

> A failing **LWC** callout is a **CSP Trusted Sites** problem — the browser blocks it before it
> ever leaves. Remote Site Settings would not help; that is for Apex.
>
> And note: **a callout through a Named Credential does not consult Remote Site Settings at all.**

### Named Credentials — the default answer for outbound auth

Named Credentials hold the endpoint URL *and* the authentication protocol as **configuration**, so
Apex never touches a secret and the platform attaches the auth header automatically.

| Identity Type | Meaning | Use when |
|---|---|---|
| **Named Principal** | One shared service account for all users | The external system uses a single system credential |
| **Per User** | Each user supplies their own external credentials | "Each user has their own username/password for the external system" |

Two bonus reasons Named Credentials show up as an answer:
- **The endpoint lives in configuration, not code.** When an external URL changes without notice,
  the fix is a field edit, not a deployment — that is a downtime-minimisation answer.
- It works for Salesforce-to-Salesforce org integrations, removing hand-rolled OAuth token refresh.

### Where secrets may and may not live

| Store | Verdict |
|---|---|
| Named Credentials | ✅ Recommended — encrypted, never in debug logs |
| **Protected Custom Metadata Types** (in a namespaced managed package) | ✅ Hidden even from admins/subscribers |
| Protected Custom Settings | ⚠️ Works, but current guidance prefers protected custom metadata |
| Custom settings (unprotected), static resources, hardcoded in Apex | ❌ Readable by anyone with metadata access |
| Encrypted Custom Fields | ❌ Intended for PII like SSNs, not credentials |

### Integration users

**One dedicated integration user per external system.** That is what delivers *both* least
privilege (via profile/permission sets) and per-system audit attribution (`LastModifiedBy`, login
history, field history).

A Connected App governs **OAuth scope, not data access** — three Connected Apps all authenticating
as one shared user still grants each system the union of that user's permissions and blurs every
record's attribution. That distinction is a deck question and a very plausible exam question.

Also: creating a service user with a **System Administrator** profile is a security defect on two
counts — the stored credential inherits full admin access if leaked, and every back-end system
gets uncontrolled access to all org data. (A password reset breaking the integration is a real
risk but an *availability* problem, not a security one — watch for that distinction in the stem.)

### Transport and perimeter

- **Mutual TLS / two-way SSL** — both ends present certificates. The answer for securing a link to
  an external API gateway, and for "all integrations must use mutual authentication".
- Enforcing it inbound requires the **"Enforce SSL/TLS Mutual Authentication"** user permission
  (port 8443). Generating a certificate is a prerequisite, **not** the enforcement.
- **Reverse proxy in the DMZ + mutual SSL**, plus **IP allow-listing of Salesforce ranges** on the
  firewall — the standard pair when security forbids Salesforce calling a back-end directly.
- **Login IP Ranges on the profile** is what actually denies a login by source IP. A Connected
  App's "Trusted IP Range for OAuth Web Server Flow" is scoped to that flow by its own name.
- **Shield Platform Encryption** encrypts at rest and preserves platform features (workflow rules,
  validation rules) on supported fields. **Classic Encryption** is custom text fields only and
  breaks workflow. **Data Mask** is for sandboxes.

### SSO and self-registration — the pairing trap

| Protocol | Provisioning mechanism |
|---|---|
| **OpenID Connect / social Auth Provider** | **Registration Handler** |
| **SAML** | **Just-in-Time (JIT) provisioning** |

Crossing the pairs ("SAML + Registration Handler", "OIDC + JIT") is the standard distractor.

### OAuth flows

- **Mobile app reading/writing Salesforce** → the flow that keeps the password out of the app.
  Given the usual options, that is the **User-Agent flow** (access token + refresh token).
- Salesforce now recommends the **web server flow with PKCE** instead. If PKCE appears as an
  option, it wins; if it doesn't, user-agent is the intended answer. See §13.
- **Never**: embedding a shared integration user's credentials in app code, or the
  username-password flow.

---

## 9. Data volume, loads, and locking

### Bulk API vs SOAP API

| | Bulk API | SOAP API |
|---|---|---|
| Mode | Asynchronous, batched | Synchronous |
| Batch size | Up to 10,000 (2,000 typical) | **≤ 200 records per call** |
| Job monitoring in Setup | ✅ "Bulk Data Load Jobs" | ❌ |
| Lock contention on master-detail parents | ⚠️ **High** in parallel mode | ✅ Avoids it (small serial transactions) |
| Multiple attachments in one ZIP | ✅ (with a `request.txt` manifest) | ❌ |
| Automatic retry of failed records | ✅ (serial or parallel) | ❌ |

### Parallel vs serial

- **Parallel is the default and the throughput answer** for a migration.
- **Serial** exists for exactly one reason: **avoiding record-lock contention**, at a maximum
  parallelism of 1.
- **Lock contention is not caused by batch size.** It is caused by *detail records sharing a
  parent* landing in **separate parallel batches** — batch 1 takes the lock on the parent, batch 2
  can't. The documented remedies are **sorting/grouping input by parent ID**, or serial mode.
- **Reducing batch size to fix "Max CPU time exceeded" has two costs**: the same volume spread over
  more batches takes **longer end to end** (per-batch overhead), and with unsorted data a parent's
  children are **more likely to straddle concurrent batches**, so locking gets *worse*. Smaller
  batches do **not** cause "too many concurrent batches" or API-limit errors — those come from
  parallel-mode scheduling.

### Making a load faster

- Store the **Salesforce record ID in the source system** so the load can UPDATE by ID instead of
  paying UPSERT/External-ID matching overhead.
- **Pre-process the data** so workflow rules and triggers aren't needed during the load.
- Use **Bulk API** for UPDATE/UPSERT at volume.
- You **cannot** turn off validation rules via a SOAP header, and Salesforce will not disable
  record locking on request. Both appear as distractors.

### Deduplicating on load

- **ETL matching on a business key** (e.g. email), or **Data Loader `upsert` against a custom
  External ID field** holding that key. External IDs create an index; mark it Unique to prevent
  duplicates.
- Matching on **Salesforce ID** fails for records that don't have one yet.
- **Insert-then-native-dedupe** still creates the duplicates first.

### Making a SOQL-driven integration faster

Add **selective, indexed criteria** to the filter, and **remove sharing restrictions** that force
the optimizer to evaluate sharing per row. Adding non-selective filters or removing filters
entirely makes it worse.

---

## 10. Choosing where the logic lives

A large family of questions reduces to: *Salesforce, middleware, or the remote system?*

### Middleware (ESB/ETL) is the answer when the stem mentions any of these

- **Complex transformation** or protocol translation
- Routing to **multiple similar-but-different services** (regional shipping carriers, N agencies)
- **Orchestration** across systems, or a **multi-day** waiting state
- **Queuing/buffering** while a downstream is offline for **hours or days**
- **Centralised logging, monitoring, alerting, audit** — especially "regulated industry",
  "mission-critical", "reliability and monitoring required"
- Decoupling **point-to-point spaghetti** (`@future` callouts fanned out to N systems)
- Keeping external **credentials out of Salesforce entirely**
- Reaching **on-premise** systems from the cloud through a **secure API gateway** in the DMZ

Middleware is *not* the answer when the stem says the requirement is simple and the constraint is
"least development effort" — then it is Named Credentials + Composite REST, a Flow HTTP Callout, or
Outbound Messaging.

> **The 24-hour line.** Outbound Messaging retries for **up to 24 hours**. If the stem says the
> downstream is offline for **"several days"** or **"3–4 hours for month-end"** — anything past 24
> hours — the durable answer is a **middleware queue**, not Outbound Messaging. At or under 24
> hours, Outbound Messaging's built-in queue is a legitimate answer and appears as one.

### MuleSoft API-led connectivity

Three layers: **System → Process → Experience.**

- **System APIs** — unlock data in the systems of record.
- **Process APIs** — business logic, aggregation, orchestration.
- **Experience APIs** — **tailor format and security per consuming channel** (mobile, web,
  Salesforce). This is the layer that answers "return data in different formats while enforcing
  different security protocols".

### Surfacing external data in the Salesforce UI

| Requirement | Answer |
|---|---|
| Live external records, never persisted, queryable in reports/global search, related lists | **Salesforce Connect + OData** external objects |
| Embed an **external web app's own UI** inside Salesforce | **Canvas** |
| Match the **Salesforce** UI, no persistence, Lightning Experience **off** | **Visualforce page** (server-side controller callout *or* client-side JS callout) |
| Invoke a REST **action** declaratively from Flow, OpenAPI-described | **Enhanced External Services** |
| Large binary files mastered on-premise | **Store the location URL and redirect** — don't copy the blob |

**Salesforce Connect considerations that get tested:** it fits when users need global search and
reports over external data, the data set is large and shouldn't be copied, and only small amounts
are fetched on demand. It does **not** support **master-detail** relationships to external objects,
and it is **real-time virtualization, not a scheduled refresh**. Its authorization boundary is the
**Identity Type** setting (Named Principal vs Per User).

---

## 11. Error handling, resilience, and monitoring

The Maintain domain is only 8%, but its content also shows up inside Build and Design questions.

### Monitoring, by mechanism

| Integration | How you monitor it |
|---|---|
| Bulk API load | **"Bulk Data Load Jobs"** in Setup (zero code) + `getBatchInfo` from the client |
| Platform Events | **Hourly publish/delivery allocations** — exceeding them silently stops downstream triggers |
| Inbound REST | **Workbench** — execute calls, inspect requests and responses |
| Batch Apex failures | **BatchApexErrorEvent** |
| Everything, centrally | Middleware's logging/alerting layer |

Debug logs are a development tool, **not a production monitoring strategy** — that is a recurring
wrong answer.

### Testing vocabulary (it does get asked)

| Symptom | Testing type |
|---|---|
| "New releases break existing functionality" | **Regression testing** |
| "Meets requirements but is too slow / not usable" | **Performance testing** + **User Acceptance Testing** |
| Component correctness in isolation | Unit testing |

### Idempotency and loops

- **A globally unique identifier minted at the entry point** is what lets a downstream process a
  request **exactly once**. Whether the remote system can **participate in idempotent design** is a
  system-constraint question you should ask during design.
- **Automatic retry without idempotency makes things worse** — it multiplies duplicate processing
  and update contention. Get exactly-once and coordination in place first.
- **The write-back loop**: middleware writes an ID back to the record, which re-fires the workflow
  rule, which sends another outbound message. Fix it by narrowing **the rule's conditions** —
  exclude the field the integration writes, and exclude the **integration user**. Changing the
  outbound message itself is wrong: the message defines *what* is sent, not *when* it fires.

### Apex test structure for callouts

**DML outside `Test.startTest()`/`stopTest()`; the callout inside.** You cannot call out with
pending DML. `Test.setMock()` must come after `Test.startTest()`. And `Test.startTest()`
**commits nothing** — it opens a fresh governor-limit context.

For contract testing against a spec (RAML/OpenAPI): implement **`HttpCalloutMock` returning
spec-shaped responses**, and invoke the client **in a test context with the mock registered**. The
mock is a separate class the production client never references.

---

## 12. The under-trained 41% — requirements before solutions

This is the material the deck barely covers and the exam weights at 41%. There are no clever
mechanisms here. There is one habit, one ranking rule, and two question shapes.

### The habit: never solution ahead of analysis

When a stem describes a business situation and asks "what should the architect do **first**" or
"what should the architect **consider**", the answer is almost always the option that **establishes
the requirement**, not the option that names a technology.

Worked examples from the deck:

| Stem | Wrong instinct | Correct answer |
|---|---|---|
| CRM program with ERP, Marketing, Outlook in the landscape | "Explore out-of-the-box connectors" | **Evaluate current and future data/system usage, then identify integration requirements** |
| Prevent deactivated HR users from accessing Salesforce | "Determine inbound integration requirements" | **Determine what "prevent access" means, then how fast it must propagate** |
| Service needs API access | "Create a System Administrator user" | **Create a dedicated least-privilege integration user** |

Note the shape of the second one: jumping to "inbound integration requirements" **presumes an
integration is the answer** before the requirement is known. That is the trap.

### The ranking ladder — how to choose between plausible considerations

The habit above tells you what to avoid. It does not help on the hard version of these items,
where a choose-3 gives you five options that are *all* things a sensible architect would think
about. `a2ae17cb`, `9fa544c5`, `21e6ad5a` and `998dcfd8` all have that shape, and eliminating on
"is this reasonable?" fails on every one of them — because they are all reasonable.

Rank the options instead. Apply in order and stop at the first rule that separates them:

1. **Altitude.** Does the option stay at the level the verb asked for? "Consider" and "determine"
   want a *question to answer*, not a decision already taken. Anything naming a product, a
   connector, or a middleware vendor drops out here — even when it is the thing you would
   eventually build. This kills "explore out-of-the-box connectors" and "propose a middleware
   system" in `2924d322`.
2. **Measurable.** Between two options at the right altitude, prefer the one whose answer is a
   number, a direction, or an enumerable list. *Data volume and processing volume* beats
   *reporting and usability requirements* in `dc227c12` for exactly this reason — one has an
   answer, the other has an opinion.
3. **Drives the design.** Prefer the consideration that would *change the integration pattern* if
   the answer came back differently. Latency, volume, directionality and idempotency all flip the
   pattern; multi-currency and license choice do not. This is the rule that settles `9fa544c5`.
4. **In scope for the integration architect.** Program governance, SME availability and
   integration skills are real project risks and belong to someone else's exam. If an option is
   about *staffing or running the project* rather than about the interface, drop it.

Rules 1 and 4 are pure elimination and remove about half the option set on sight. Rules 2 and 3
are what actually pick between the survivors.

### What to ask — the integration requirements checklist

These are the answer options that score in the Translate domain:

**Functional / structural**
- Source and target system, and **directionality**
- **Data volume** and **processing volume** — the single biggest driver of pattern choice
- **Transformation complexity**
- Existing **middleware** that can be leveraged
- **System/interface types** available — APIs, file systems, email
- **Integration style** — process-based, data-based, or virtual

**Non-functional**
- **Timing**: real-time / near-real-time (sync or async), batch, update frequency
- **Latency** acceptable for the message to arrive
- **Volumes and response times**
- **Error-handling** mechanisms each interface requires
- **Idempotency** — can the remote system deduplicate, or must the integration?
- **Contract-first capability** — can the remote system consume a WSDL?
- **Callback capability** — can the remote system call into Salesforce?

**Security / auth**
- Enterprise security needs for each back-end (encryption, IP allow-listing, audit)
- **Seamless authentication** into back-ends without re-entering credentials (SAML/OAuth)
- **Context-driven authorization** — scope the call to the record the agent is already on
- Data classification: **Confidential / Secure / Public**

**Privacy, retention and deletion**

A stem that mentions expanding into a new jurisdiction, GDPR-style regulation, or a *right to be
forgotten* is asking about deletion as an integration requirement. The considerations that score:

- **Can personal data actually be deleted in every system it reached?** An integration that copies
  a customer record into four systems has created four deletion obligations. The one that cannot
  comply is usually a legacy or mainframe system, or an analytics store nobody thinks of as a
  system of record.
- **What breaks when the record goes?** Downstream functionality, aggregate reporting and
  referential integrity all depend on records that erasure will remove.
- **Which steps must be manual?** Systems due for decommissioning rarely get a deletion API. An
  honest requirements list includes the manual procedure.

What does **not** score: *restoring* deleted records. It reads like prudent backup practice and is
the direct opposite of what a deletion-on-demand requirement asks for. Also out: keeping a
360-degree customer view, which is a benefit of the integration, not a requirement of the erasure.

### What is *not* an integration requirement

These appear as distractors and are consistently wrong:
- Multi-language and multi-currency requirements
- Reporting and usability requirements
- Integration skills, SME availability, program governance
- License choices and UX design
- Whether to **migrate** the external system into Salesforce

### The "why bother with middleware" shape

A recurring Translate item puts a sceptical CIO in the stem: *if we have to write custom code
anyway, why buy middleware?* (`21e6ad5a`). The trap is that the tempting answers — **bulkification**
and **performance** — are things you can achieve perfectly well in hand-written Apex. They are not
arguments for middleware.

What middleware buys that per-integration custom code does not:

- **Orchestration** — sequencing calls across several systems, with state, in one place
- **Error handling** — one consistent retry/dead-letter policy instead of many bespoke ones
- **Logging and monitoring** — a single audit trail across every interface

The general form: **argue from what centralising gives you, not from what the code can do.**
Anything a competent developer could hand-roll per interface is not a reason to buy a platform.
See [§10](#10-choosing-where-the-logic-lives) for when middleware is the answer to a *design*
question.

### System of record reasoning

**The system of record is the one whose users perform the daily lifecycle work on that entity.**

- Sales and service associates work in Salesforce → **Salesforce owns customer/prospect**, while
  ERP keeps invoices/orders and Marketing keeps campaigns.
- If the stem *names* an MDM as the system of record for customers, Salesforce cannot own it, and
  the MDM **must be in the integration list**.
- A system whose capability Salesforce natively replaces gets **retired, not integrated** — a
  legacy Case Management System goes away under Service Cloud; a legacy Email Marketing system goes
  away under Marketing Cloud.
- A system the business explicitly says it wants to **reuse** (Quoting, Order Management) stays and
  gets integrated.

### Landscape triage — the method

"Which systems should be retired / which should be integrated" is ~5 questions of your exam and is
fully mechanical. Do not reason about it in prose. Build the table:

**One row per system in the landscape. One column: does Salesforce natively replace it?**

Then apply, in order:

1. **The stem's explicit keeps win over everything.** If a numbered requirement says "reuse
   enterprise capabilities for Quoting and Order Management", those two are integrated no matter
   how well Salesforce could replace them. This single clause decides `73466e15`: Salesforce
   *could* do quoting, but goal (3) says reuse it, so Quoting and OMS survive and the answer is
   the other three.
2. **A named system of record is never retired.** `3262c8d0` says MDM is the system of record for
   customers and ERP for pricing — so both are in the integration list, and options offering a
   separate *Inventory* or *Pricing Engine* are wrong because the stem already told you those
   facts live in ERP.
3. **Integrate with the data store, not the tool sitting on it.** Both landscape items in the deck
   turn on this. `47d1f854` and `3262c8d0` each include the **Data Warehouse** and exclude the
   **BI/Analytics tool** it feeds — you integrate with where the data is, and the dashboard
   downstream comes along for free. An option naming the BI tool is a reliable wrong answer.
4. **Only then, retire what Salesforce natively covers.** Case Management → Service Cloud. Email
   Marketing → Marketing Cloud. Sales Activity → Sales Cloud.

Note the ordering: rules 1–3 are all *read the stem more carefully*, and they decide the question
before native capability ever comes up. The instinct to start at rule 4 is what makes these
items feel ambiguous when they are not.

### Drills

The deck cannot give you reps here, so generate your own. These are reasoning drills, not
questions — do them out loud.

1. **Reconstruct the checklist cold.** Write the three requirement groups above from memory. Then
   check. Anything you missed is what you will miss on the exam.
2. **Re-rank a Design question.** Take any deck question that names a pattern in its answer, and
   ask: *what would I have had to find out to arrive at that pattern?* Write the three questions.
   That is the Translate item hiding behind every Design item, and it is the cheapest way to turn
   the deck's over-representation into practice you actually need.
3. **Run the landscape table.** For `73466e15`, `47d1f854` and `3262c8d0`, build the table and
   apply the four rules in order. You should reach the key without weighing options against each
   other.
4. **Argue the CIO both ways.** Justify middleware to a sceptic in three bullets, then justify
   skipping it. Notice which arguments survive rule 1 of the ranking ladder.

---

## 13. Answers that are right for the exam and wrong for production

The exam is pinned to **Summer '23**. These items are keyed to platform behaviour that has since
changed. **Answer them the exam's way.** They are listed here so you recognise them and don't
talk yourself out of a correct answer.

| Topic | Exam's answer (Summer '23) | Reality now |
|---|---|---|
| **Outbound Messaging provides a session ID** | ✅ Listed as a capability | **Removed week of 23 Feb 2026.** No checkbox, `IncludeSessionId` forced FALSE, no `<sessionID>` in the payload. Callbacks must use OAuth 2.0 |
| **Process Builder** as an automation answer | ✅ Correct | **End of support 31 Dec 2025.** Existing processes still run and can be edited — this is retirement of *support*, not removal. Flow is what you'd build today |
| **Workflow Rules** (incl. outbound messaging) | ✅ Correct | Same end-of-support date, same reasoning |
| **PushTopic** for a real-time UI counter | ✅ Correct | Labelled **legacy**; Salesforce steers new work to CDC |
| **User-Agent OAuth flow** for mobile | ✅ Best of the options offered | Salesforce recommends **web server flow with PKCE**; user-agent uses the implicit grant and can leak the token via the redirect URL. Admins can block it |
| **OAuth username-password flow** | Appears in stems | **Being retired** for connected apps. Replacements: client credentials (server-to-server), web server + PKCE (end user) |
| **Connected Apps** | ✅ Correct | **Creation restricted as of Spring '26** — external client apps are the recommendation. Existing apps keep working |
| **Wave / Einstein Analytics** naming | Appears as "Wave" | Now **CRM Analytics**. Same product, same answers |
| **Apex REST runs in system context** | — | ❌ **This was never true.** Apex REST runs in **user mode by default**; bypassing FLS needs explicit `WITH SYSTEM_MODE` / system-mode DML plus `without sharing` |

That last row is not a staleness issue — it's a widely repeated falsehood. Know it properly: an
Apex REST service *can* be made to write a field the running user cannot write, but only by
deliberate opt-in.

---

## 14. Distractor tells

Patterns in how this exam writes wrong answers.

1. **A fabricated limit stated confidently.** "The 10-second callout ceiling", "@future is limited
   to 50 records per method call", "Salesforce Files max is 2 GB". If an option turns on a number,
   check whether that number exists.
2. **A default described as a ceiling.** The 10-second timeout again. Also: parallel is the Bulk
   API *default*, not a special mode.
3. **A fabricated absence.** An option asserting a capability *doesn't* exist — it reads as
   appropriately strict and is often false. Check the denials, not just the claims.
4. **Direction reversed.** "Remote Call-In" offered when the stem is Salesforce→remote. "The
   mobile device receives an Apex callout" when the device is the one writing data in. CORS offered
   for an outbound problem.
5. **A prerequisite offered as the solution.** "Generate a CA-signed certificate" when the question
   asks how to *enforce* mutual auth. Certificates enable it; the user permission enforces it.
6. **The right technology for the wrong job.** Tooling API for record CRUD. Metadata API for code
   coverage. Connect REST API for anything non-Chatter. Salesforce Connect for file blobs.
7. **Solutioning ahead of analysis.** Any option naming a product when the question asks what to
   determine first.
8. **An implementation choice dressed as a requirement.** "Maintain the back-end credentials in
   Salesforce" is a *how*, offered where the question asks *what to consider*.
9. **"Choose 2/3" where one option contains two things.** Read the option, not the count.
10. **The prudent-sounding opposite.** An option describing good general practice that is the
    *inverse* of what this stem asked for — "feasibility to restore deleted records" against a
    right-to-erasure requirement, "keep the systems in sync on a schedule" against a real-time
    need. Backups and syncing are virtues in the abstract, which is what makes them work as
    distractors. Check the option against the stem's actual goal, not against good practice.

### Read the question's own verb

- **"…require the least amount of development effort"** → declarative, Named Credentials,
  Composite, pre-built connectors. Not "write a custom service".
- **"…what should be considered"** → constraints and non-functionals, not mechanisms.
- **"…which two security issues"** → confidentiality/access, **not** availability. A password reset
  breaking an integration is an operational risk, not a security issue.
- **"…first"** → requirements, or least-privilege setup, before anything else.
- **"…to maximize declarative configuration"** → Salesforce Connect / Flow / Outbound Messaging over
  Apex.

---

## 15. Two-week revision plan

Weighted toward where the points are, not where the deck is.

| Day | Focus |
|---|---|
| 1–2 | §3 patterns + §4 mechanisms until the signal-word table is automatic. Drill the deck's Design questions |
| 3 | §5 API picker + Enterprise/Partner WSDL. Drill Design questions again |
| 4 | §6 events. Write out the retention/replay table from memory |
| 5 | §7 numbers. Cover the tables and reproduce them |
| 6–7 | §8 security. Drill the deck's Build questions |
| 8 | §9 data loads and locking |
| 9 | §10 middleware vs Salesforce; §11 error handling and monitoring. Drill Maintain questions |
| **10** | **§12 — the under-trained 41%.** Requirements checklist until you can produce it unprompted, then the ranking ladder. Do drills 1 and 2. Your highest-yield day |
| **11** | **§12 continued** — landscape triage on all three deck items until the four rules are automatic; the middleware and privacy shapes. Do drills 3 and 4 |
| 12 | §13 stale answers + §14 distractor tells |
| 13 | Full deck run, timed at 90 s/question |
| 14 | Re-read §12 and §13. Rest |

---

## 16. Sources

Every URL below was rendered and title-checked during this repo's fact-check work.

**Patterns and architecture**
- [Integration Patterns and Practices](https://architect.salesforce.com/docs/architect/fundamentals/guide/integration-patterns.html) — all six patterns with a selection matrix. The single most important page for this exam.
- [Understanding API-Led Connectivity (Trailhead)](https://trailhead.salesforce.com/content/learn/modules/application-networks-and-api-led-connectivity-in-mulesoft/explore-api-led-connectivity) — System / Process / Experience layers.
- [Official exam guide](https://help.salesforce.com/s/articleView?id=005298980&type=1&language=en_US)

**Callouts and limits**
- [Callout Limits and Limitations](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_callouts_timeouts.htm) — 100 callouts/transaction and the 10 s *default*, in one place.
- [Execution Governors and Limits](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm)
- [Make Long-Running Callouts with Continuations](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_continuation_overview.htm)
- [Asynchronous Callout Limits](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_continuation_limits.htm) — 3 parallel, 120 s, 1 MB.
- [Avoiding the Concurrent Request Limit](https://developer.salesforce.com/blogs/engineering/2015/11/avoiding-the-concurrent-request-limit-via-synchronous-callout-optimization) — why >5 s bites first.

**APIs**
- [Using the Partner WSDL](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_partner.htm) — contrasts both WSDLs on one page.
- [Send Multiple Requests Using Composite](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_composite_post.htm)
- [Get Started with User Interface API](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started.htm)
- [When to Use Connect REST API](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/intro_using_chatter_connect.htm)
- [Exposing Data with Apex REST Web Service Methods](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_exposing_data.htm) — the user-mode-by-default statement.

**Events and streaming**
- [Event Message Durability](https://developer.salesforce.com/docs/platform/pub-sub-api/guide/event-message-durability.html) — 72 hours.
- [Streaming API Message Durability](https://developer.salesforce.com/docs/atlas.en-us.api_streaming.meta/api_streaming/using_streaming_api_durability.htm) — "PushTopic events, generic events, and standard-volume events for 24 hours and high-volume events for 72 hours."
- [Change Event Storage and Delivery](https://developer.salesforce.com/docs/atlas.en-us.change_data_capture.meta/change_data_capture/cdc_subscribe_delivery.htm)
- [CDC Security Considerations](https://developer.salesforce.com/docs/atlas.en-us.change_data_capture.meta/change_data_capture/cdc_security_considerations.htm) — ignores sharing, respects FLS.
- [PushTopic Events (Legacy)](https://developer.salesforce.com/docs/atlas.en-us.api_streaming.meta/api_streaming/pushtopic_events_intro.htm)
- [Platform Event Allocations](https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_event_limits.htm)
- [Considerations for Outbound Messages](https://help.salesforce.com/s/articleView?id=sf.workflow_om_considerations.htm&language=en_US&type=5) — 24-hour queue, 60 s timeout.
- [Outbound Message Actions](https://help.salesforce.com/s/articleView?id=platform.workflow_managing_outbound_messages.htm&language=en_US&type=5) — which tools can send one.
- [Security Updates to Outbound Messages](https://help.salesforce.com/s/articleView?id=005232763&language=en_US&type=1) — the session-ID removal.

**Security and identity**
- [Named Credentials](https://help.salesforce.com/s/articleView?language=en_US&id=sf.named_credentials_about.htm&type=5)
- [Identity Type for External Data Sources](https://help.salesforce.com/s/articleView?language=en_US&id=sf.platform_connect_identity_type.htm&type=5)
- [Storing Sensitive Data (Secure Coding Guide)](https://developer.salesforce.com/docs/atlas.en-us.secure_coding_guide.meta/secure_coding_guide/secure_coding_storing_sensitive_data.htm)
- [Give Integration Users API Only Access](https://help.salesforce.com/s/articleView?language=en_US&id=sf.integration_user.htm&type=5) — one user per integration.
- [Restrict Login IP Addresses in Profiles](https://help.salesforce.com/s/articleView?id=platform.login_ip_ranges.htm&language=en_US&type=5)
- [Manage Trusted URLs](https://help.salesforce.com/s/articleView?id=sf.security_trusted_urls_manage.htm&language=en_US&type=5) — CSP vs Remote Site Settings.
- [Just-in-Time Provisioning for SAML](https://help.salesforce.com/s/articleView?id=sf.sso_jit_about.htm&language=en_US&type=5)
- [Configure an Auth Provider Using OpenID Connect](https://help.salesforce.com/s/articleView?id=xcloud.sso_provider_openid_connect.htm&language=en_US&type=5)

**External data**
- [Access External Data With Salesforce Connect](https://help.salesforce.com/s/articleView?id=platform.salesforce_connect.htm&language=en_US&type=5)
- [OData Adapters for Salesforce Connect](https://help.salesforce.com/s/articleView?id=platform.salesforce_connect_odata.htm&language=en_US&type=5)
- [Introducing Canvas](https://developer.salesforce.com/docs/atlas.en-us.platform_connect.meta/platform_connect/canvas_framework_intro.htm)

**Data loads**
- [General Guidelines for Data Loads](https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/asynch_api_planning_guidelines.htm) — parallel default, serial for locking.
- [Managing Task Locks in Data Loads](https://developer.salesforce.com/blogs/engineering/2014/08/managing-task-locks-data-loads) — what actually causes contention.
- [Bulk API Limits and Allocations](https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet/salesforce_app_limits_platform_bulkapi.htm)
- [update() (SOAP API)](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_calls_update.htm) — the 200-record ceiling.
- [Load Binary Attachments (Bulk API)](https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/binary_intro.htm)

**Testing**
- [Testing HTTP Callouts (HttpCalloutMock)](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_restful_http_testing.htm)

---

## 17. Using this with NotebookLM

Upload **this file** as a source. Markdown ingests cleanly and the headings become NotebookLM's
navigation.

Worth adding as additional sources:
- The [Integration Patterns guide](https://architect.salesforce.com/docs/architect/fundamentals/guide/integration-patterns.html) URL — it's the spine of the exam and NotebookLM can ingest it directly.
- The [official exam guide](https://help.salesforce.com/s/articleView?id=005298980&type=1&language=en_US) URL.

**Prompts that produce useful study media:**

- *"Generate an Audio Overview focused only on sections 3, 4 and 6 — the integration patterns, their
  mechanisms, and the event types. Have the hosts quiz each other on which pattern a scenario
  describes."*
- *"I have two weeks. Using section 12, drill me on requirements-gathering questions: give me a
  business scenario with a system landscape and ask what an architect should determine first. Don't
  give me the answer until I try."*
- *"Turn section 7 into flashcards — one number per card, the limit on the front and the value plus
  the trap on the back."*
- *"Using section 13, explain each case where the exam's expected answer differs from current
  Salesforce behaviour, and why the exam still keys the old answer."*
- *"Build a study guide for section 14 — for each distractor pattern, write three fresh example
  options that would be wrong for that reason."*

For the Audio Overview specifically, sections 3, 6, 12 and 13 are the ones that reward listening —
they're conceptual and comparative. Sections 7 and 16 are lookup tables and won't survive being
read aloud.

---

*Generated from the 146-question integration deck, the official exam guide (read 2026-08-24), and
the verified documentation set in `.claude/skills/factcheck-deck/references/verified-docs.md`.*
