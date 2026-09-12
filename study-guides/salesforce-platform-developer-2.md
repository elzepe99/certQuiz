# Salesforce Certified Platform Developer II — Study Guide

**Built from the 146 questions in `salesforce_questions_Dev2.json`, cross-checked against the
official exam outline and the documentation those questions cite.**

Every fact below traces to a rendered Salesforce page (see [Sources](#17-sources)) or to this
deck's own fact-check pass. Where the exam's expected answer and today's platform disagree, that
is called out in [§14 Answers that are right for the exam and wrong for
production](#14-answers-that-are-right-for-the-exam-and-wrong-for-production). Where the deck
does not cover an exam objective at all — and there are eleven such objectives — the section that
teaches it says so, because that is the material you have not rehearsed.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Salesforce Certified Platform Developer II |
| Content | **60 scored** multiple-choice / multiple-select questions + up to 5 unscored |
| Time | **120 minutes** (2 min per question) |
| Passing score | **70%** → you need **42 of 60** |
| Prerequisite | **Platform Developer I** — required, not recommended |
| Fee | US$200 (retake US$100) |
| **Release alignment** | **Winter '24** (API 59.0) |

**The alignment row is the one to remember.** The item bank is pinned to Winter '24, so anything
Salesforce has since retired, renamed or reversed is still tested the old way. Process Builder is
still a valid automation answer. `WITH SECURITY_ENFORCED` is still the security clause the exam
keys. Apex still "runs in system mode by default". §14 lists every case; answer as of Winter '24.

Pacing is generous compared with the architect exams — 2 minutes a question — but this exam
spends it differently: a third of the items are **code you have to read**, and several show a
class, a component and a test at once. Read the code before the options. The distractor
pattern on code items is a single wrong token (`tablet-device-size`, `@api` where `@wire`
belongs, `'this.passthrough'` in quotes), and you will only see it if you have already decided
what the correct line is.

---

## 2. Where the points actually are

Official outline weightings against the deck. The deck came tagged with **four** categories
and no Performance bucket, so its own tags cannot be compared with the outline at all; the
column below is an independent re-classification of all 146 questions against the five real
domains (`study-guides/reclassify-dev2.mjs` holds the per-question calls).

| Domain | Weight | ≈ Questions | Deck | Verdict |
|---|---:|---:|---:|---|
| Advanced Developer Fundamentals | 15% | ~9 | 7 (4.8%) | **badly under-trained** |
| Process Automation, Logic, and Integration | 27% | ~16 | 53 (36.3%) | over-represented |
| User Interface | 20% | ~12 | 45 (30.8%) | over-represented |
| Testing, Debugging, and Deployment | 20% | ~12 | 27 (18.5%) | about right |
| Performance | 18% | ~11 | 14 (9.6%) | **under-trained** |

### The gap you need to close

**Fundamentals and Performance are a third of the exam — about 20 of your 60 questions — and
14% of the deck.** Someone who drills this deck to 100% has rehearsed trigger patterns,
async Apex and Lightning components very thoroughly, and has seen almost nothing on
multi-currency, sharing objects, custom settings, Platform Cache, Continuations or query
selectivity thresholds.

Worse than the counts is what is missing outright. Reading all 146 against the outline's
sub-objectives, **eleven of them have no deck item at all**:

1. Multi-currency: `CurrencyIsoCode`, `convertCurrency()`, dated exchange rates
2. Custom settings: list vs hierarchy, `getInstance()` / `getOrgDefaults()`, `SeeAllData` in tests
3. Sharing objects: `__Share` tables, `RowCause`, `AccessLevel`, recalculation
4. Asynchronous callouts with `Continuation` (a named Performance objective)
5. Mocks and stubs with `System.StubProvider` / `Test.createStub()` (named in the Testing objective)
6. Platform Cache — session vs org cache, partitions, `CacheBuilder`
7. Lightning Message Service
8. Transaction Finalizers on Queueable jobs
9. Apex REST / SOAP *service* annotations (`@RestResource`, `@HttpGet`, `webservice`)
10. The save order of execution as a sequence — the deck tests only the re-fire side effects
11. Scratch orgs, unlocked packages and deployment test levels

[§8](#8-the-under-trained-15-advanced-fundamentals) and [§12](#12-the-under-trained-18-performance)
are written to cover those gaps from the documentation, because the deck can't. The other
sections consolidate what the deck does teach, and correct it where the deck's own fact-check
found it wrong.

### What the deck's 146 do rehearse well

The deck is strongest exactly where the exam is heaviest on code reading: async Apex
selection (14 items), trigger bulkification and recursion (9), the callout-and-DML rule (6),
LWC/Aura wiring errors (`@AuraEnabled`, `cacheable=true`, `public static`) (10), and the
`Test.startTest()` / `Test.setMock()` choreography (8). If a topic below has a deck-item count
next to it, that is roughly how many times the exam will ask it in a slightly different shape.

---

## 3. Order of execution and process interactions

The outline's first Process Automation objective is "identify the considerations of interactions
between multiple processes, both declarative and programmatic". Every one of those questions is
answered by the save order. Learn it as a sequence, not as trivia.

### The save sequence (Winter '24 documentation)

1. Load the record; initialise new values. For a request from the standard UI, run
   **system validation** — required fields, field formats, layout rules.
2. **Before-save record-triggered flows.**
3. **Before triggers.**
4. Run most system validation **again**, and **custom validation rules**. (So a before trigger
   can populate a field a validation rule requires.)
5. **Duplicate rules.**
6. **Save** the record to the database — *not yet committed*.
7. **After triggers.**
8. **Assignment rules.**
9. **Auto-response rules.**
10. **Workflow rules.** If a field update fires: the record is updated again, system validation
    runs again, and **before and after triggers fire one more time (and only one more time)**.
    Custom validation rules, flows, duplicate rules, processes and escalation rules **are not
    re-run.**
11. **Escalation rules.**
12. **Flow automations** — processes and flows launched by processes or workflow rules
    (no guaranteed order among them).
13. **After-save record-triggered flows.**
14. **Entitlement rules.**
15. **Roll-up summary** fields on the parent recalculate, and the parent goes through its own
    save (its triggers fire). Then the grandparent, if a roll-up is there too.
16. **Criteria-based sharing** evaluation.
17. **Commit** all DML to the database.
18. **Post-commit logic** — email, enqueued async Apex, outbound messages, platform events
    configured to publish after commit.

### The consequences the exam tests

| Fact from the sequence | The question it answers |
|---|---|
| Validation rules run **after** before triggers | "Which trigger context can set a field the validation rule requires?" → `before insert` |
| A workflow field update re-fires triggers **once** | Two Survey records per Case (`7871e9fd`); counter incremented twice (`72374e4c`) — the cause is a Field Update action, the cure is a static flag |
| Validation rules do **not** re-run after a field update | A field update that writes a value its own validation rule forbids **saves** |
| Roll-ups recalculate after the child's after trigger | The child's after trigger cannot read the parent's new roll-up value |
| Everything up to step 17 is **one transaction** | Cascading triggers share the 10,000 DML-row limit (`d2a074ac`: 200 Accounts → 10,000 Contacts → 10,000 Campaign Members fails). A governor limit anywhere rolls back everything |
| Post-commit work is skipped on rollback | An `@future` enqueued from a trigger never runs if the transaction fails; a platform event configured *publish after commit* is never published |
| The order of **multiple triggers on one object is not guaranteed** | One trigger per object, per event, delegating to a handler class |

### Recursion — the four shapes and one fix

- **Self re-entry**: an after-update trigger updates the same records → fires again → "Maximum
  trigger depth exceeded" (stack depth **16**).
- **Workflow field update** re-firing the trigger (`af20c4c2`, `7871e9fd`).
- **Two objects' triggers updating each other** (Account ↔ Contact).
- **Handler called twice** from two triggers on the same object.

The fix on the exam is always a **`public static Boolean`** (or `static Set<Id>` of processed
ids) in a helper class, checked before the work and set after it. Statics live for the
transaction and die with it, which is exactly the scope you want. The deck's own `72374e4c`
is worth reading twice: the keyed option declares the flag but never checks it, so the exam is
identifying the *mechanism*, not a working snippet.

### Declarative or programmatic — the stem's verbs decide it

| The stem says… | Answer |
|---|---|
| "optimal", "minimal code", "administrator can maintain", a single object, criteria on the record itself | **Record-triggered flow** (or validation rule for a check) |
| create a related record when a field crosses a threshold (`77c104fc`) | Flow |
| block a delete with a message, defaults from custom metadata, "depending on company personnel" (`a6345067`) | Flow **or** trigger — both are correct, read the count |
| a callout, complex cross-object logic, custom-object team/sharing, more than one place must run the same logic (`aa38d07c`) | **Apex** — and put the logic in **one helper class** called from every entry point |
| "reusable from flows" | `@InvocableMethod` (one per class, `static`, `List` in and `List` out) with `@InvocableVariable` on the request/response classes |
| start a flow from code | `Flow.Interview.createInterview(name, inputs).start()` (`fc0bc95b`) |

---

## 4. Triggers, transactions, and error handling

### Bulkification — what "best practice" means when the exam asks

A trigger receives **up to 200 records** per invocation (2,000 for platform-event and change-event
triggers). Every deck item on trigger quality reduces to the same four rules:

1. **No SOQL in a loop.** Collect the keys into a `Set<Id>` (or `Set<String>`), query once, put
   the results in a `Map`, look up inside the loop (`264d0eab`, `f7fd9efb`).
2. **No DML in a loop.** Add to a `List`, one DML statement after the loop (`c0bd95df`).
3. **Never DML `Trigger.new` / `Trigger.old`.** In a *before* trigger, set fields on
   `Trigger.new` directly and the save carries them; in an *after* trigger the records are
   read-only and you query fresh copies if you must update them. `update accountList` where
   `accountList` holds `Trigger.new` is an error, not merely redundant (`264d0eab`).
4. **One trigger per object, logic in a handler**, with `Trigger.isInsert / isUpdate /
   isBefore / isAfter` deciding what runs.

`Trigger.newMap` and `Trigger.oldMap` exist for update and delete; `Trigger.oldMap.get(c.Id)`
is how you detect a transition (closed now, was not closed before — `7871e9fd`). `Trigger.old`
is always read-only.

### Before or after?

- **Before**: validate, default, derive fields on the same record — no extra DML, no Id yet on
  insert.
- **After**: the record has an Id and its values are saved; use it to create related records
  (`53d0a7d2`), to publish events, to enqueue async work, and to read roll-ups computed by the
  save. Records in `Trigger.new` are read-only here.

### Error handling and transactional integrity

**Default behaviour**: any uncaught exception — including a governor-limit
`System.LimitException`, which **cannot be caught** — rolls back the entire transaction.
Everything below is about deliberately doing something other than that.

| Tool | What it does | When the exam wants it |
|---|---|---|
| `addError()` on a record in `Trigger.new` | Marks that record as failed with a message; the DML that caused the trigger fails for that record (all-or-none DML) or just that row (partial DML) | "prevent the save and show a message" in a trigger; the Flow equivalent is the **Custom Error** element |
| `try / catch / finally` | Catches `DmlException`, `QueryException`, `CalloutException`, custom exceptions — never `LimitException` | Handle, log, rethrow with a friendlier message (`AuraHandledException` in a Lightning controller) |
| Custom exception: `class MyException extends Exception {}` | Typed failures across layers | Service class signalling a business-rule failure to a controller |
| `Database.insert(records, false)` → `Database.SaveResult[]` | **Partial success**: failed rows are reported in the result, the rest commit; `isSuccess()`, `getErrors()`, `getId()` | "the integration should not fail because one Task failed" (`9d81f45b`); "process what you can" |
| `Database.DMLOptions` | `optAllOrNone`, `allowFieldTruncation`, `assignmentRuleHeader.useDefaultRule`, `emailHeader` | Run assignment rules from Apex; truncate instead of failing |
| `Database.setSavepoint()` / `Database.rollback(sp)` | Undo everything since the savepoint, inside the same transaction | "any error prevents all execution" across several DML statements (`f3d819e3`) |
| `DmlException.getNumDml()`, `getDmlIndex(i)`, `getDmlMessage(i)`, `getDmlStatusCode(i)` | Which row failed and why, from a caught DML exception | Building a per-record error report |

**Savepoint rules that get tested:**
- Rolling back to an earlier savepoint **invalidates every later one** — rollback to SP1, then
  rollback to SP3 → runtime error (`d6fe74e5`).
- `setSavepoint()` and `rollback()` each **count as a DML statement** against the 150.
- Records inserted after a savepoint **keep their Id in the Apex variable** after a rollback; set
  `Id = null` (or clone) before re-inserting them.
- You cannot roll back a callout, an email, or a published-immediately platform event.

**Mixed DML**: inserting or updating a *setup* object (`User`, `Profile`, `PermissionSet`,
`Group`, `GroupMember`, …) and a non-setup object in the same transaction throws
`MIXED_DML_OPERATION`. Split the work with `@future` or a Queueable; in tests, wrap one side in
`System.runAs()`.

### The callout-and-DML rule (six deck items, and it will be on the exam)

**A callout is forbidden in a transaction with pending uncommitted DML.** The error text is
"You have uncommitted work pending. Please commit or rollback before calling out". Three
correct responses, and the exam accepts any that fits the stem:

1. **Reorder**: make the callout first, then the DML (`11d22bd9`).
2. **Go async**: move the callout to `@future(callout=true)` or a Queueable implementing
   `Database.AllowsCallouts`, which runs in its own transaction after the commit
   (`ea09f5b0`, `11d22bd9`).
3. **In a test**: insert the data *before* `Test.startTest()` and make the (mock) callout
   after it (`595ebc61`, `614b99d9`). `Test.startTest()` does **not** commit anything — nothing
   in a test ever commits — it opens a fresh context, which is the boundary the rule is measured
   against.

And its cousin: **a trigger cannot make a synchronous callout at all** —
`System.CalloutException: Callout from triggers are currently not supported` (`4f9da22c`,
`03fa7cee`). The trigger hands ids to `@future(callout=true)` or a Queueable (`a170139a`,
`4c5d1329`). Note the exception's type: it is a `CalloutException`, **not** a
`LimitException` — `474e9918` turns on exactly that distinction.

---

## 5. Asynchronous Apex

Fourteen deck items, and the exam's version of each is "given these requirements, which
mechanism". The table is the whole subject.

| | `@future` | Queueable | Batch Apex | Schedulable |
|---|---|---|---|---|
| Declare | `@future` on a `static void` method | `implements Queueable`, `execute(QueueableContext)` | `implements Database.Batchable<sObject>`; `start` / `execute` / `finish` | `implements Schedulable`, `execute(SchedulableContext)` |
| Start | call the method | `System.enqueueJob(new Job())` → **returns the job Id** | `Database.executeBatch(new Job(), scope)` → job Id | `System.schedule(name, cronExpr, new Job())` |
| Arguments | **primitives and collections of primitives only** — pass Ids, not sObjects | anything: sObjects, custom types, state in instance variables | constructor state; `Database.Stateful` to keep it across chunks | constructor state |
| Callouts | `@future(callout=true)` | `implements Database.AllowsCallouts` | `implements Database.AllowsCallouts` | not directly — enqueue or batch from `execute` |
| Chaining | **none** — a future cannot call a future | **one child job** per `execute`; unlimited depth in production, **5** in Developer / Trial orgs | chain from `finish()` | schedule → `executeBatch` / `enqueueJob` |
| Per-transaction cap | **50** future calls (0 from batch/future context) | **50** `enqueueJob` (1 from an async context) | 5 concurrent jobs; flex queue holds **100** | **100** scheduled classes (5 in Developer Edition) |
| Monitoring | none — no Id | `AsyncApexJob` by Id | `AsyncApexJob`; Apex Jobs page; `BatchApexErrorEvent` | Scheduled Jobs page; `CronTrigger` |
| Limits inside | async (200 SOQL, 12 MB heap, 60 s CPU) | async | async, **reset per `execute` chunk** | **synchronous** limits apply to scheduled Apex |
| Pick it when | fire-and-forget after commit; callout from a trigger; mixed-DML split | you need the job Id, non-primitive input, sequential heavy steps (`218106b6`), a Finalizer | **more than 50,000 rows** or millions of records (`7675adce`, `abea6c7c`); one-time data seeding | recurring cadence (`f62513eb` pairs it with Batchable) |

### The facts underneath the table

- **Why Batch for volume, not "async"**: the 50,000 query-row limit is the *same* in async
  Apex. A Queueable fails on 50,001 rows exactly like a trigger would. Batch escapes it by a
  documented mechanism — "if you use a `QueryLocator`, the governor limit for the total number
  of records retrieved by SOQL queries is bypassed", up to **50 million** rows — and separately
  each `execute` chunk "is considered a discrete transaction" with **reset limits**. Two
  guarantees; the query headroom is the `QueryLocator`'s, not the chunking's. An `Iterable`
  `start` method gets no bypass.
- **Scope**: default **200** records per `execute`, maximum **2,000**. In a test only **one**
  chunk runs, so keep test data at or under the scope.
- **`BatchApexErrorEvent`** fires when `start`, `execute` or `finish` throws an unhandled
  exception — but only if the class `implements Database.RaisesPlatformEvents`. Only the
  platform can fire it (`6845ba58`); subscribe with a trigger, a flow, CometD or Pub/Sub.
- **Queueable `enqueueJob(job, delayMinutes)`** accepts a 0–10 minute delay; `AsyncOptions`
  with a `DuplicateSignature` de-duplicates enqueues.
- **Transaction Finalizers**: `implements Finalizer` with `execute(FinalizerContext ctx)`,
  attached with `System.attachFinalizer(f)` inside the Queueable's `execute`. Runs in its own
  transaction after the job **succeeds or fails**, can make callouts and re-enqueue the job —
  up to **5** consecutive re-enqueues after failure. `ctx.getResult()` is `ParentJobResult.SUCCESS`
  or `UNHANDLED_EXCEPTION`; `ctx.getException()` gives the cause. This is the documented answer to
  "recover from a failed Queueable" — the deck never asks it.
- **Daily allocation**: **250,000** async executions per 24 hours, or 200 × user licences,
  whichever is greater; batch `start` / `execute` / `finish` each count. Batch checks the
  remaining capacity up front and refuses to start a job it cannot finish.
- **Cron**: seven fields — `Seconds Minutes Hours Day_of_month Month Day_of_week [Year]`;
  `'0 0 2 * * ?'` is 2 a.m. daily. A scheduled class is **locked** against edits while scheduled.
- **Async is never immediate and never ordered.** Nothing after `enqueueJob()` may depend on
  the job having run; in the same transaction it has not.

### Testing async

`Test.startTest()` … enqueue / call future / `executeBatch` / `schedule` … `Test.stopTest()`
— **everything queued inside the block runs synchronously at `stopTest()`**, so query and assert
*after* it (`3810d972`, `6b4e2f7b`). A Queueable that chains another job **cannot** do so under
test ("Maximum stack depth has been reached" / chaining not supported) — guard the inner
`enqueueJob` with `if (!Test.isRunningTest())` (`c91ba2b8`). At most **5** batch jobs may be
submitted in one test.

---

## 6. SOQL beyond SELECT, and dynamic Apex

### The keywords the outline calls "advanced"

| Keyword | Effect | Trap |
|---|---|---|
| `ALL ROWS` | Returns Recycle Bin rows **and archived activities**; combine with `IsDeleted = false` to get archived Tasks without deleted ones (`082893f1`) | Only in Apex, not in the API |
| `FOR UPDATE` | Locks the returned records for the transaction; other transactions wait | **No `ORDER BY`** with `FOR UPDATE`; locks release at commit |
| `FOR VIEW` / `FOR REFERENCE` | Updates `LastViewedDate` / `LastReferencedDate` so the records appear in Recent Items | — |
| `TYPEOF … WHEN … THEN … END` | Polymorphic relationship fields (`Task.What`, `Event.Who`) select different fields per type | Only in SELECT |
| `WITH SECURITY_ENFORCED` | Throws `QueryException` if any selected field or object is not accessible to the user | **The exam's answer** for FLS in a query (`e9c0d546`); see §14 for `WITH USER_MODE` |
| `WITH USER_MODE` / `WITH SYSTEM_MODE` | Enforce (or bypass) sharing **and** FLS on the query, regardless of class sharing keyword | Newer; the recommended clause today |
| `USING SCOPE mine / team / everything / delegated` | Restricts to ownership scopes | — |
| `GROUP BY` / `ROLLUP` / `CUBE`, `HAVING` | Aggregates into `AggregateResult`; `ar.get('expr0')` or aliases | 2,000-row cap on grouped results |
| `COUNT()` | **Costs one query row**, not one per record (`497c27b5`); with `GROUP BY`, one per group | `SUM()` is the wrong tool for a count |
| `OFFSET n` | Skip rows; **max 2,000** | Pagination beyond that needs `StandardSetController` or an Id-keyed cursor |
| `LIMIT`, date literals (`LAST_N_DAYS:30`, `THIS_FISCAL_QUARTER`), `TODAY` | — | `CreatedDate = TODAY` in a loop is still SOQL in a loop (`9943756f`) |
| Semi-join / anti-join: `WHERE Id IN (SELECT Contact__c FROM Order__c …)` / `NOT IN` | Set membership against a child query (`59f7360d`) | The subquery selects the **foreign key**, not `Id`, when it runs on the child |
| Relationship queries | Child-to-parent by dot (`Account.Owner.Name`, up to 5 levels); parent-to-child by subquery in SELECT (`(SELECT Id FROM Contacts)`) | `__r` for custom relationships; each parent-child subquery counts as an extra query against the limit (subqueries get 3×) |

`List has more than one row for assignment to SObject` — the exception when a multi-row query is
assigned to a single sObject variable — is raised **before** any governor limit the same loop
would later hit (`9943756f`). Read code items for the *first* failure.

### SOQL for loops and SOSL

- `for (Account a : [SELECT …])` and `for (List<Account> chunk : [SELECT …])` fetch in
  **batches of 200** and keep the heap small; use them whenever a result set is large.
- **SOSL**: `FIND 'term' IN ALL FIELDS RETURNING Account(Name), Contact(Name)` — up to **2,000**
  rows, **20** queries per transaction. **Under test SOSL returns an empty list** unless
  `Test.setFixedSearchResults(ids)` was called first (`a3252caa`).

### Dynamic Apex (the objective says "identify the appropriate dynamic Apex feature")

| Need | Feature |
|---|---|
| Query whose fields or filters are chosen at run time (`40004899`) | **Dynamic SOQL**: `Database.query(String)`; bind variables in the string resolve to local variables in scope; `Database.queryWithBinds(q, bindMap, AccessLevel.USER_MODE)` for a map of binds; `Database.countQuery` |
| Same for search | `Search.query(String)` |
| User input in a query string | `String.escapeSingleQuotes(input)` — SOQL injection is the exam's stated reason |
| Which objects are custom (`62592f03`) | `Schema.getGlobalDescribe()` → `Schema.SObjectType` → `getDescribe()` → `DescribeSObjectResult.isCustom()` |
| Object-level CRUD | `DescribeSObjectResult.isAccessible() / isCreateable() / isUpdateable() / isDeletable()` |
| Field-level security | `DescribeFieldResult.isAccessible() / isUpdateable()` via `Schema.SObjectType.Account.fields.Name`; or `Security.stripInaccessible(AccessType.READABLE, records)` |
| Picklist values, labels, types | `DescribeFieldResult.getPicklistValues()`, `getLabel()` (translated for the running user), `getType()` |
| Field sets | `Schema.SObjectType.Account.fieldSets.getMap()` → `getFields()` |
| Build a record of a type known only at run time | `Schema.getGlobalDescribe().get(name).newSObject()`; generic `sObject` with `get(field)` / `put(field, value)` |
| Instantiate a class by name (plug-in pattern) | `Type.forName(className).newInstance()` — pair it with a custom metadata type that names the class |
| Dynamic DML | `insert (List<sObject>) records;` works; `Database.insert` accepts `sObject` lists |

`Schema.getGlobalDescribe()` is expensive — call it once per transaction, never in a loop. For
one object, `Account.sObjectType.getDescribe()` is cheaper.

---

## 7. Integration: platform events, callouts, and services

### Platform events — publish / subscribe logic

| Fact | Detail |
|---|---|
| Define | Custom object suffixed `__e`; fields are the payload; retention **72 hours** |
| Publish from Apex | `EventBus.publish(event)` returns `Database.SaveResult` — **check `isSuccess()`**; from the API, a POST to `/sobjects/Event__e` (`59d5a8f8`); from a flow, the Create Records element |
| Publish behaviour | **Publish After Commit** (default): counts as a DML statement, and the event is **not published if the transaction rolls back**. **Publish Immediately**: sent even on rollback, capped at **150** `EventBus.publish` calls per transaction — use it for logging errors that happen mid-transaction |
| Subscribe | Apex trigger (**after insert only**, runs as the *Automated Process* user unless you set one, batch size **2,000**), flow, CometD `/event/Event__e`, Pub/Sub API, `lightning/empApi` in an LWC |
| Replay | `ReplayId`; CometD `-1` = new events only, `-2` = everything retained. In an Apex trigger, `EventBus.TriggerContext.currentContext().setResumeCheckpoint(replayId)` marks progress so a failure resumes after the last checkpoint |
| Standard events | `BatchApexErrorEvent` (only the platform fires it — `6845ba58`), `PlatformStatusAlertEvent`, `FlowExecutionErrorEvent` |
| Test | Events published in a test are delivered at `Test.stopTest()`, or on demand with `Test.getEventBus().deliver()` |
| Change Data Capture | `AccountChangeEvent` etc. on `/data/ChangeEvents`; same 72-hour retention; ignores sharing, respects FLS |

When to pick a platform event over the alternatives (`3870d944`): **several** subscribers,
no reply expected, subscribers may be offline (replay), transaction must not wait. When the
target is one SOAP endpoint and you want declarative retries, that is an Outbound Message
(`e92e64ee`) — 24-hour queue, retries, SOAP only. When it is REST, only Apex can call it
(`f688895a`).

### Outbound: callouts from Apex

- `HttpRequest` → `Http.send()` → `HttpResponse`; `setEndpoint`, `setMethod`, `setHeader`,
  `setBody`, `setTimeout(ms)`; `res.getStatusCode()`, `getBody()`.
- **The endpoint must be authorised**: a **Remote Site Setting** (`df3ee6db` — "Unauthorized
  endpoint") or a **Named Credential** referenced as `callout:My_Cred/path`. Named Credentials
  hold the URL **and** the authentication, so a vendor switching from basic auth to OAuth
  (`e67f6bc8`) or an endpoint URL that changes (`caa4bfe8`) is a Setup change, not a code change.
  Never store secrets in custom settings or hard-coded strings; use a named credential or an
  encrypted field.
- **SOAP callouts**: import the WSDL with **WSDL2Apex** to generate stub classes; consume them
  as normal Apex; mock with `WebServiceMock`.
- **JSON**: `JSON.serialize(obj)`, `JSON.deserialize(str, Type.class)`,
  `JSON.deserializeUntyped(str)` → `Map<String, Object>` for unknown shapes, `JSONParser` /
  `JSONGenerator` for streaming. **XML**: `Dom.Document`, `XmlStreamReader`.
- Limits: **100** callouts per transaction, **120 s** cumulative, **10 s default** timeout raised
  by `setTimeout()` to 120 s; request/response **6 MB** sync / **12 MB** async and they count
  toward heap.
- Where the callout may run: never synchronously from a trigger; not with pending DML; from a
  controller, a Queueable, a future, a batch `execute`, a scheduled job's downstream job, a
  **Continuation** (§12).

### Inbound: exposing Salesforce

| Mechanism | When | Shape |
|---|---|---|
| **REST API** (standard) | External code needs standard CRUD/query and already knows the record (`50c95d23`) — no Apex to write | `GET /services/data/vXX.X/sobjects/Account/{id}`; `PATCH …/Order__c/Order_Number__c/{value}` **upserts by external Id**, and a lookup can be set by external Id in the body: `"Account__r": {"Customer_Number__c": "…"}` (`1b7b6b00`) |
| **SOAP API** | Strongly typed clients; `login()` returns a session Id placed in the **`SessionHeader`** of later calls (`2b360cbd`) | Enterprise WSDL (typed, one org) vs Partner WSDL (loosely typed, many orgs) |
| **Apex REST** | Custom logic per call, JSON, consolidate many objects (`cb0d4ef3`), **cut API calls** by doing a multi-step lookup server-side (`0eac03b0`) | `@RestResource(urlMapping='/orders/*') global with sharing class X { @HttpGet global static Order__c get() { … } }`; also `@HttpPost / @HttpPut / @HttpPatch / @HttpDelete`; `RestContext.request` / `response`; endpoint `/services/apexrest/orders/`. Methods are `global static` |
| **Apex SOAP** | A SOAP client that must call custom logic | `global class X { webservice static String doIt(String p) { … } }`; the WSDL is generated from the class |
| **Email service** | Create records from inbound mail (`d85ba695`) | `implements Messaging.InboundEmailHandler`; `handleInboundEmail(InboundEmail, InboundEnvelope)` returns `InboundEmailResult` |
| **Bulk API 2.0** | Loads of thousands to millions of rows | CSV jobs; the tool for "weekly, large, outside business hours" is an ETL that drives it (`0a52f212`) |
| **Composite** | Several related REST calls in one round trip | up to 25 subrequests; one API call |

Apex REST and Apex SOAP classes must be **`global`**; the exam's "class must be global" distractor
is *wrong* for `@AuraEnabled` (public is fine — `69a6cded`, `c8de9a78`) and *right* for
`@RemoteAction` and web services.

### Integration users and security, briefly

An integration gets its **own user** with an **API Only** profile, least-privilege permission
sets, and IP restrictions; auth is OAuth (client credentials for server-to-server, web server +
PKCE for a user context). Apex REST runs in **user mode by default** — bypassing FLS needs
explicit system-mode DML plus `without sharing`. `with sharing` on the service class decides
whether the caller's record access is enforced.

---

## 8. The under-trained 15%: Advanced Fundamentals

Three objectives, ~9 exam questions, **7 deck items**. Everything here is from documentation.

### 8a. Localization and multi-currency — "and how they affect coding"

**Labels and text**

| Surface | How |
|---|---|
| Apex | `System.Label.My_Label` (or `Label.My_Label`); `String.format('{0} of {1}', new List<Object>{a, b})` for placeholders |
| Visualforce / Aura | `{!$Label.c.My_Label}` (`$Label.namespace.Name` in packages) |
| LWC | `import myLabel from '@salesforce/label/c.My_Label';` |
| Translating them | **Translation Workbench** — custom labels, field labels, picklist values, validation error messages, layout sections. Describe calls return the **running user's language**: `DescribeFieldResult.getLabel()`, `getPicklistValues()[i].getLabel()` |

Custom labels hold up to 1,000 characters; translations are per supported language.

**Locale-aware formatting**

| Surface | How |
|---|---|
| Apex | `Date.format()` → the user's locale date string (`c26371c1`); `Datetime.format()` → user's locale **and time zone**; `Datetime.format(pattern, tz)`; `Datetime.formatGmt()`; `Decimal.format()`; `UserInfo.getLocale()`, `getLanguage()`, `getTimeZone()`, `getDefaultCurrency()` |
| Aura | `$Locale` value provider — date/time/number formats, currency code and symbol, separators, time zone (`e831eba6`); `$Browser.formFactor` for device |
| LWC | `@salesforce/i18n/locale`, `@salesforce/i18n/currency`, `@salesforce/i18n/timeZone`, `@salesforce/i18n/dateTime.shortDateFormat`, plus base components that localise for you: `lightning-formatted-date-time`, `lightning-formatted-number`, `lightning-formatted-currency` |
| Visualforce | `<apex:outputField>` localises automatically; `<apex:outputText value="{0,number,#,##0.00}">` with `<apex:param>` for explicit patterns |

Storage is not localised: `Datetime` values are **GMT** in the database and converted for
display by the user's time zone. `Date` has no time zone. SOQL date literals evaluate in the
running user's time zone.

**Multi-currency — what changes for a developer**

- Enabling multiple currencies is **irreversible**. Every currency-bearing record gains a
  **`CurrencyIsoCode`** picklist; the org has a **corporate currency**, each user a **personal
  currency**, and Setup holds a **conversion rate** per active currency.
- In Apex, a currency field is a `Decimal` **in the record's own currency** — nothing converts it
  for you. Set `CurrencyIsoCode` on insert or the record takes the user's currency. To convert in
  code, query **`CurrencyType`** (`IsoCode`, `ConversionRate`, `IsCorporate`) or, with dated rates,
  **`DatedConversionRate`** (`IsoCode`, `ConversionRate`, `StartDate`, `NextStartDate`) and do the
  arithmetic.
- In SOQL, **`convertCurrency(Amount)`** returns the amount in the **running user's** currency;
  **`FORMAT(convertCurrency(Amount))`** adds the locale symbol and separators. Roll-up summary
  fields convert children into the parent's currency using the static rate.
- **Advanced Currency Management (dated exchange rates)** applies **only** to opportunities,
  opportunity products, schedules, splits, campaign opportunity fields and their reports — chosen
  by the opportunity's close date. It is **not** used for forecasting, for currency fields on any
  other object, for formula fields returning Currency, or for cross-object formulas (static rate).
  Two coding consequences the documentation states outright: with ACM enabled you **cannot create
  currency roll-ups from Opportunity to Account** (existing ones stop calculating), and you
  **cannot bind `<apex:inputField>` / `<apex:outputField>` to ACM-enabled currency fields** in
  Visualforce.
- Reports and list views show converted amounts; the API and Apex do not.

### 8b. Sharing objects and Apex managed sharing

**The mechanics the deck never shows**

- Record access is stored in a **share object**: `AccountShare`, `OpportunityShare`, `CaseShare`,
  `ContactShare`, `LeadShare` for standard objects; **`MyObject__Share`** for a custom object. A
  share object exists only when the object's OWD is **Private or Public Read Only** — there is
  nothing to share when the default is already Read/Write.
- A share row has four fields that matter: **`ParentId`** (the record), **`UserOrGroupId`**
  (a user, public group, role or territory group id), **`AccessLevel`** (`Read`, `Edit`; `All`
  only via managed sharing) and **`RowCause`** — the *reason*. `AccountShare` uses
  `AccountAccessLevel`, `OpportunityAccessLevel`, `CaseAccessLevel`, `ContactAccessLevel` instead
  of a single level.
- **RowCause** values: `Owner`, `Rule`, `Team`, `ImplicitChild` / `ImplicitParent` (managed,
  read-only to you), `Manual` (user managed), and **an Apex sharing reason you define on a custom
  object**, referenced as `Schema.MyObject__Share.RowCause.My_Reason__c`. On **standard**
  objects Apex can only write `Manual`. **Apex sharing reasons and Apex managed sharing
  recalculation exist only for custom objects.**
- `Manual` rows are **deleted when the record owner changes**; rows with a custom Apex reason
  **survive** owner changes and user deactivation — that is the point of defining one.
- Only users with **Modify All Data** can add or change Apex managed shares; the trigger that
  writes them therefore runs `without sharing` or in system context.
- **Recalculation**: implement `Database.Batchable` in a class registered on the object as its
  Apex sharing recalculation; Salesforce runs it when the OWD changes so your share rows are
  rebuilt. Also run it after bulk data changes that your trigger did not see.
- You **cannot create sharing rules in Apex**, and criteria-based sharing cannot be tested from
  Apex — verify with `System.runAs()` and a query.
- Insert share records in bulk exactly like any sObject: build `List<Container__Share>`,
  `Database.insert(shares, false)`, and read the `SaveResult`s — a share that grants no more
  access than the OWD fails harmlessly.

**When the exam accepts code over configuration** (`e2a749f7`, `380cc77c`): team functionality on
a **custom** object (teams exist only on Account, Opportunity and Case), access driven by an
**external system of record**, access derived from **data relationships no rule can express**
(a junction object between Contact and several Accounts), or measured **poor performance of
declarative sharing**. Not: "manager sees reports' records" (role hierarchy), "everyone edits"
(OWD), "partners see cases on their own account" (**sharing sets** for Experience Cloud —
`a8b17c49`).

**Class-level sharing keywords**

| Keyword | Record sharing | Notes |
|---|---|---|
| `with sharing` | enforced | A `with sharing` `@AuraEnabled` query returns only what the user can see — the fix in `75e642fb` is `runAs(admin)`, not `without sharing` |
| `without sharing` | bypassed | Needed when code must read or write records the user cannot, e.g. writing share rows |
| `inherited sharing` | takes the caller's mode; **`with sharing` when it is the entry point** | The safe default for utility classes |
| none | system mode, **inherits the caller's** sharing if called from a sharing class | A Lightning controller with no keyword runs as `with sharing` — but declare it |

Sharing keywords cover **records**. Field- and object-level security are separate:
`WITH SECURITY_ENFORCED` / `WITH USER_MODE` in queries, `Security.stripInaccessible()`,
`Database.insert(recs, AccessLevel.USER_MODE)`, or describe checks. `runAs` in a test now
enforces object- and field-level permissions as well as sharing.

### 8c. Custom metadata types vs custom settings

| | Custom metadata type (`__mdt`) | Custom setting (`__c`) |
|---|---|---|
| Is | **Metadata** — records deploy with change sets, packages and source | **Data** — only the *definition* deploys; records are entered per org |
| In tests | Visible **without** `SeeAllData` (`1a279dfb`) | Invisible unless `SeeAllData=true` — create them in `@testSetup` |
| Read in Apex | `My_Type__mdt.getAll()`, `getInstance('DevName')` — no SOQL cost; SOQL on `__mdt` **does not count** against the query limit | `My_Setting__c.getInstance()` (hierarchy: org → profile → user, most specific wins), `getOrgDefaults()`, `getValues('Name')`, `getAll()` (list) — served from the application cache, no query |
| Write in Apex | **No DML.** Create or update through the Metadata API (`Metadata.Operations.enqueueDeployment`) — asynchronous | Ordinary DML at run time |
| Varies by user/profile | No | **Hierarchy** settings do |
| Formulas / validation rules / flows | `$CustomMetadata.Type__mdt.Record.Field__c` | `$Setup.Setting__c.Field__c` (hierarchy only) |
| Relationships | to other custom metadata, `EntityDefinition`, `FieldDefinition` | none |
| Secrets | No (readable) | No — **protected** settings hide values only inside a managed package; elsewhere use named credentials or encrypted fields |
| Use for | Config that must **deploy with the code**: mappings, feature flags, endpoint/route tables, rule definitions, the class name for `Type.forName` | Per-user or per-profile toggles, **runtime-mutable** state (a trigger-bypass flag an admin flips), counters, values that change without a deployment |

Field history (`f82f42e8`): standard tracking keeps **18 months** (24 via the API), **20 fields**
per object; **Field Audit Trail** extends that up to 10 years and 60 fields. **Big objects**
(`87b506a2`, `6d242d63`): hundreds of millions of rows, `__b` suffix, an **index** of up to five
custom fields that every query must filter **in index order** with `=`, `<`, `>`, `<=`, `>=`, `IN`
only — no `LIKE`, `INCLUDES`, `!=` — and no triggers, flows or formula fields; write with
`Database.insertImmediate()`.

---

## 9. User interface

### 9a. Lightning Web Components

**Wiring to Apex — the deck's most repeated code defect**

An Apex method a component uses must be `public` or `global`, **`static`**, and **`@AuraEnabled`**;
to be used with `@wire` it must be **`@AuraEnabled(cacheable=true)`** (`e2ba60ab`, `d5978be6`,
`e9c0d546`). Any inner class it returns needs `@AuraEnabled` on **each property** or the object
arrives empty (`15dc7a90`, `6686c9b7`). Parameters arrive by **name**, typed to what JavaScript
sends — an `Object` parameter breaks the call (`c8de9a78`). The import path is
`@salesforce/apex/Class.method` (`00016277`).

| Pattern | Code | Notes |
|---|---|---|
| Wire to a property | `@wire(getX, { id: '$recordId' }) result;` → `result.data` / `result.error` | `$` makes the parameter **reactive** — the wire re-runs when it changes |
| Wire to a function | `@wire(getX) wired({ data, error }) { … }` | Keep the raw result in a field to pass to `refreshApex()` |
| Imperative | `getX({ term }).then(r => …).catch(e => …)` | For user-initiated actions and DML; no `cacheable` needed (`15dc7a90`) |
| Client cache | `@AuraEnabled(cacheable=true)` (`2388fdd4`) | Works for LWC **and** Aura; only for read-only methods — a cacheable method cannot do DML |
| Records without Apex | `getRecord`, `updateRecord`, `createRecord`, `deleteRecord` from `lightning/uiRecordApi` (`2ddd7bf6`); `getRecordNotifyChange` after your own Apex DML | LDS enforces FLS and CRUD and shares its cache across components |
| Forms | `lightning-record-form` (fast, layout-driven), `lightning-record-edit-form` + `lightning-input-field` (place fields freely — `8ae9f7e4`), `lightning-record-view-form` | Errors need **`lightning-messages`** inside the form (`295b0c8b`); validation belongs in **validation rules**, not JavaScript (`fb30207f`, `1698e7ee`) |

**Lifecycle**: `constructor` → `connectedCallback` (inserted in DOM — the place for "on load"
logic, `3598b33b`) → `renderedCallback` (after every render — guard it) → `disconnectedCallback`;
`errorCallback(error, stack)` catches child component errors. Decorators: `@api` (public,
reactive), `@track` (only needed to observe *mutations inside* an object or array — every field is
already reactive), `@wire`.

**Events and communication**

| Direction | Mechanism |
|---|---|
| Child → parent | `this.dispatchEvent(new CustomEvent('passthrough', { detail: this.passthrough }))` (`b92420f4`); parent handles `onpassthrough` and reads `event.detail`. `bubbles` and `composed` default to **false** |
| Parent → child | `@api` properties and `@api` methods on the child |
| Unrelated components, Aura, Visualforce, utility bar | **Lightning Message Service** — a message channel (`MyChannel__c`), `publish(messageContext, channel, payload)`, `subscribe(...)` from `lightning/messageService`; `MessageContext` via `@wire`; scope `APPLICATION_SCOPE` to reach the whole page |
| Server → browser | `lightning/empApi` subscribing to a platform event or CDC channel |
| Notifications | `ShowToastEvent` from `lightning/platformShowToastEvent`; many components each toasting is the anti-pattern `036f6646` fixes with in-place `template lwc:if` errors or one aggregating component |

**Templates**: `lwc:if` / `lwc:elseif` / `lwc:else` (Spring '23 — `if:true` / `if:false` still
work and are what the deck prints); `for:each={items} for:item="i"` with a `key`; `iterator:it`
for first/last. **Static resources** (`67563135`): `import lib from '@salesforce/resourceUrl/lib';`
then `loadScript(this, lib + '/x.js')` / `loadStyle` from `lightning/platformResourceLoader`, usually
in `renderedCallback` with a once-guard or in `connectedCallback`. Other modules:
`@salesforce/schema/Account.Name`, `@salesforce/user/Id`, `@salesforce/client/formFactor`
(`Large` / `Medium` / `Small`), `@salesforce/apexContinuation/…` (§12).

**Form factor / responsiveness** (`95587f24`, `f9c8f7b9`, `e91d90d4`): `lightning-layout` +
`lightning-layout-item` are a mobile-first 12-column grid; `size` is the base, and
`small-device-size` / `medium-device-size` / `large-device-size` are **additive upward** — set
`size="12" medium-device-size="4"` for three-in-a-row from tablet up. Also
`@salesforce/client/formFactor` in JS, SLDS grid classes, CSS media queries, and in the
component's XML `<supportedFormFactors>` under a `lightning__RecordPage` target to limit where
it is offered.

**Surfacing** — `js-meta.xml`: `isExposed=true`, `targets`: `lightning__RecordPage`,
`lightning__AppPage`, `lightning__HomePage`, `lightning__FlowScreen`, `lightning__Tab`,
`lightning__UtilityBar`, `lightning__RecordAction` (quick action; `actionType` `ScreenAction`
for a modal or `Action` for headless), `lightningCommunity__Page`; `targetConfigs` expose
`property` elements the admin sets in App Builder (the LWC equivalent of a design attribute) and
`objects` to restrict to certain record pages. In **Visualforce**, an LWC is surfaced through
**Lightning Out**: an Aura dependency app `extends="ltng:outApp"` plus `$Lightning.use()` /
`$Lightning.createComponent()` (`<apex:includeLightning/>`). An LWC can sit **inside an Aura
component**; an Aura component cannot sit inside an LWC.

### 9b. Aura

- **Server calls**: `var action = component.get("c.method"); action.setParams({...});
  action.setCallback(this, function(r) { r.getState() === "SUCCESS" … }); $A.enqueueAction(action);`.
  `action.setStorable()` caches the result — equivalent to `cacheable=true` on the Apex.
- **Errors**: throw `new AuraHandledException('message')` in Apex to replace "An internal
  server error has occurred" (`2f02cf00`); read `r.getError()` in the callback.
- **Events**: **component event** for parent/child inside a containment hierarchy —
  `component.getEvent("searchComplete")`, `setParams`, `fire()` (`adfa5369`); **application
  event** for components with no relationship, such as a utility-tray alert (`9f8cdefa`) —
  `$A.get("e.c:evt")`, `setParams`, `fire()`. `aura:method` for parent → child calls.
  `<aura:handler name="init" value="{!this}" action="{!c.doInit}"/>` for on-load.
- **Interfaces** that make a component *available* somewhere: `flexipage:availableForAllPageTypes`
  / `availableForRecordHome` (App Builder — `17d8af13`, together with `access="global"`),
  `force:hasRecordId`, **`force:hasSObjectName`** (`1963db51` — no Apex, no coverage),
  `force:appHostable` (tab), `force:lightningQuickAction` / `WithoutHeader` (`b3a07999`),
  `lightning:actionOverride`, `lightning:isUrlAddressable`, `lightning:availableForFlowScreens`,
  `forceCommunity:availableForAllPageTypes`.
- **Design file** (`c4cec291`): `<design:component>` with `<design:attribute name label>` for
  admin-set values and `<sfdc:objects><sfdc:object>Account</sfdc:object></sfdc:objects>` to limit
  the record pages it appears on. A design attribute is how a page passes context — record type,
  a field set name — into the component (`20c11a40`).
- **Static resources**: `<ltng:require scripts="{!join(',', $Resource.zip + '/a.js', …)}"
  afterScriptsLoaded="{!c.init}"/>` — one zip, several files, loaded once in order (`7d4b9c57`).
- `$Locale`, `$Label.c.x`, `$Browser.formFactor` (`DESKTOP` / `PHONE` / `TABLET`), `$Resource`.

### 9c. Visualforce

**Controllers**: standard (`standardController="Case"`), standard set / list, custom, and
**extensions** (`extensions="A,B"` — when two define the same method, **the leftmost wins**,
`d50c6ceb`). An extension constructor takes `ApexPages.StandardController`; construct it in tests
with `new ApexPages.StandardController(record)` (`788ce14e`). `Test.setCurrentPage(Page.x)` and
`ApexPages.currentPage().getParameters()` for page context. A getter that lazily instantiates its
object avoids "Attempt to de-reference a null object" (`74efe37c`).

**Actions, partial refresh, asynchronous operations**

| Component | Does | Trap |
|---|---|---|
| `<apex:commandButton>` / `<apex:commandLink>` | Submit the form to an action; **`reRender="id"`** turns it into an AJAX partial update (`4023a9a3`, `85a3fa6c`) | Must be inside `<apex:form>` |
| `<apex:actionSupport>` | Adds AJAX to **another component's browser event** (`onchange`, `onclick`…) — sits inside the component it watches (`659c1a94`, `020e43fb`) | Not a JavaScript wrapper |
| `<apex:actionFunction>` | Defines a **JavaScript-callable** function bound to an action, with `reRender` | The JS wrapper — what actionSupport is not |
| `<apex:actionPoller>` | Calls an action every `interval` seconds (min 5) | Resets if re-rendered |
| `<apex:actionRegion>` | Limits which components are **processed** on submit | Does **not** shrink the view state |
| `<apex:actionStatus>` | Shows content while a request is in flight | — |
| `immediate="true"` | Skips validation and value application | — |
| **JavaScript remoting** | `@RemoteAction global static` method called from JS (`Visualforce.remoting.Manager.invokeAction` or `{!$RemoteAction.Ctrl.m}`), result in a callback; **no view state, no form** — the right tool under a third-party JS UI (`5f4a5b96`). Tests call it statically: `MyRemoter.getAccount('x')` (`ebb9f61a`) | Method must be `global static` |
| **Visualforce Remote Objects** | Declarative CRUD/query from JavaScript with **no Apex** | Cannot run business logic — remoting's advantage (`075e76d2`) |
| `<apex:pageMessages>` | Renders everything added with `ApexPages.addMessage()` (`97dbf5bc`) | `<apex:messages>` shows all errors unstyled; `<apex:message for="id">` one component's |
| `renderAs="pdf"` | The consideration that forces Visualforce over Lightning (`254644b6`) | — |

**Order of execution, GET request** (`f84106f3`): controller and extension constructors →
custom components created, *their* constructors run, their attribute expressions evaluated →
`assignTo` attributes → page expressions, the `<apex:page action>` and other getters/setters →
**view state created if `<apex:form>` exists** → HTML sent. Postbacks: view state decoded →
expressions and setters → action method → getters → view state re-created → response.

**View state** (`0d827147`, `b9fd412b`): everything the controller holds is serialised into a
hidden field on every postback, capped at **170 KB**. Mark large collections and derived data
**`transient`**, use `private static` for constants, avoid keeping query results you re-fetch,
and split monster pages. **Static resources** (`e82a5694`, `49c5e8ad`): `$Resource.name` and
`URLFOR($Resource.zip, 'path/file.js')`; benefits are referencing by name not Id, packaging a
zip/jar, and relative paths inside the archive; 5 MB per resource, 250 MB per org.

### 9d. Choosing the framework

| Requirement | Choose |
|---|---|
| PDF, email template, Salesforce Classic, a page rendered on the server | **Visualforce** |
| New development, mobile, performance, reuse in Experience Cloud, Jest tests | **LWC** |
| Wrap an LWC for a capability only Aura had on Winter '24 — URL-addressable component, standard action override, some interfaces | **Aura** (thin wrapper) |
| Existing Aura app to extend | Aura, or LWC inside Aura |

---

## 10. Testing

### Apex tests — the choreography

| Rule | Detail |
|---|---|
| Coverage | **75%** of the org's Apex must be covered to deploy to production; every trigger needs *some* coverage; test classes don't count toward the total |
| Assertions | `System.assert / assertEquals / assertNotEquals` or the `Assert` class (`Assert.areEqual`, `isTrue`, `isNull`, `fail`). A test without assertions is not a test the exam accepts |
| Data | Isolated by default (API 24+); `@isTest(SeeAllData=true)` opens org data for **queries only** — inserts, updates and **deletes are still rolled back** (`ad6dc9c9`: five "Test" accounts remain). Custom settings need it or `@testSetup` data |
| `@testSetup` | Runs **once per class**; records are re-provided to every test method and rolled back between them (`dbe97ce5`, `41c7ada5`). **Code run only from `@testSetup` earns no coverage** (`d47df5e9`). Not allowed with `SeeAllData=true`. Its local variables are out of scope in test methods (`75e642fb`) |
| `Test.startTest()` / `stopTest()` | Once per method. Fresh governor limits; **async runs synchronously at `stopTest()`**; put setup DML **before** `startTest` and callouts **after** it; `Test.setMock` **after** `startTest` and **before** the call (`b906dc2c`) |
| Callouts | Tests **cannot** make real callouts. `Test.setMock(HttpCalloutMock.class, mock)` for REST; `Test.setMock(WebServiceMock.class, mock)` for SOAP/WSDL2Apex (`614b99d9`). Without a mock: "Methods defined as TestMethod do not support Web service callouts" |
| SOSL | Returns empty in tests — `Test.setFixedSearchResults(ids)` (`a3252caa`) |
| `Test.loadData(Account.sObjectType, 'csvStaticResource')` | Bulk fixtures from a CSV static resource |
| `System.runAs(user)` | Enforces sharing **and** object/field permissions for the block; the way to test `with sharing` code and restricted profiles (`75e642fb`). Setup-object DML inside `runAs` avoids mixed-DML errors. Does not need the user inserted — a queried user works |
| `Test.isRunningTest()` | Escape hatch for behaviour that cannot run in a test: Queueable chaining (`c91ba2b8`), read-only system data like `AccountHistory` (`a7f95dd5` — a workaround, not a pattern) |
| `@TestVisible` | Reach a private member from a test without making it public |
| Re-query after DML | An in-memory sObject does not see what a trigger or page wrote — query again before asserting (`3467c031`, `5be4b08d`) |
| `Test.setCreatedDate(id, dt)` | Back-date a record for "older than 12 months" logic |
| Limits | Apply **per test method**; `MAX_DML_ROWS` in a synchronous test run is 450,000 |
| Environment independence | No hard-coded Ids; look up record types by `DeveloperName` through `Schema`, config through custom metadata; a test data factory class shared across tests |

### Mocks and stubs — the objective the deck skips

The Testing objective names "mocks and stubs" explicitly. `HttpCalloutMock` / `WebServiceMock`
are mocks for **callouts**. For **any Apex class**, the platform's mocking framework is the **Stub
API**:

1. Implement **`System.StubProvider`** — one method, `handleMethodCall(Object stubbedObject,
   String stubbedMethodName, Type returnType, List<Type> paramTypes, List<String> paramNames,
   List<Object> args)` — returning whatever the test wants each method to return.
2. Create the stub: `MyService svc = (MyService) Test.createStub(MyService.class, new MyProvider());`
3. Inject it into the class under test (constructor or setter injection — which is why service
   classes take their dependencies as parameters).

Stubs are generated at run time as anonymous subclasses, so nothing extra deploys. **Cannot** be
stubbed: static methods, private methods, `final` classes, system types, classes with only
private constructors, inner classes of the test itself. This is the answer when a stem says
"test the class in isolation" or "the dependency is slow / external".

### Jest for Lightning web components

- Package `@salesforce/sfdx-lwc-jest`; tests live in `__tests__` next to the component;
  `sf force lightning lwc test run` or `npm run test:unit`.
- Structure: `describe` → `it`; `const el = createElement('c-my-cmp', { is: MyCmp });
  document.body.appendChild(el);` then query `el.shadowRoot`; **`afterEach`** removes children
  of `document.body` because jsdom is shared across tests (`e6067a5f`).
- DOM updates are async: `await Promise.resolve()` (or a `flushPromises` helper) before asserting.
- Mock Apex: `jest.mock('@salesforce/apex/Ctrl.method', () => ({ default: jest.fn() }), { virtual: true })`
  for imperative calls; for wires, `createApexTestWireAdapter` / `emit()` (older: `registerApexTestWireAdapter`).
  Mock base components and LDS adapters the same way (`jest-mocks` ship with the package).
- What Jest tests (`3bbf155f`): **DOM output**, **basic user interaction** (dispatch a click),
  **events firing** (add a listener, assert it was called), public `@api` behaviour. What it
  doesn't: private state, multiple components integrating, real Apex.

---

## 11. Debugging and deployment

### Diagnosing Apex

| Tool | Use it for |
|---|---|
| **Debug logs** — trace flag on a user, an Apex class or trigger, or the *Automated Process* user (platform-event triggers); log levels per category (`Apex Code`, `Database`, `Workflow`, `Validation`, `Callout`, `System`…) from `NONE` to `FINEST`; **20 MB** per log (truncated beyond), trace flags expire, org retention capped | `System.debug()` narrative of a transaction — the deck's default answer for "why did the trigger run twice" (`be8e114a`) |
| **Developer Console → Log Inspector** — *Execution Overview*: **Executed Units** (count and time per method/query — `42d0474c`), Save Order, Limits, Timeline; *Stack Tree*: Execution Tree / Performance Tree; *Execution Log* with filters | Counting calls, finding the slow unit, reading limit consumption |
| **Checkpoints** (Developer Console only) — a heap dump at a line, with a symbol table; up to 5 | Inspect variable state without adding debug statements |
| **Apex Replay Debugger** (VS Code, free) — replays a debug log with breakpoints; **Apex Interactive Debugger** (licensed) and **ISV Customer Debugger** for subscriber orgs | Step through code |
| `Limits.getQueries()`, `getDmlStatements()`, `getHeapSize()`, `getCpuTime()` and their `getLimit…` twins | Guard rails inside code; the *wrong* answer when offered as a way to "stop the process" |
| **Apex Jobs**, **Apex Flex Queue**, **Scheduled Jobs**, `AsyncApexJob` SOQL | Async status, errors, reordering the flex queue |
| **Event Monitoring** log files (`727db5f6`), **Setup Audit Trail** (180 days — `7e99199d`), Apex exception emails | After-the-fact forensics |
| Query Plan (Developer Console, Query Editor → Query Plan) | Cost of a query; **cost < 1** means the optimizer found a selective index |

### Diagnosing the front end

- **Lightning components**: `console.log`, browser dev tools with breakpoints, and **Debug Mode**
  enabled per user (unminified framework, fuller messages — slower, so turn it off after)
  (`4ccc3eda`). **Salesforce Lightning Inspector** (Chrome extension) tabs: Component Tree,
  Performance, Transactions, Event Log, Actions, **Storage** — the last shows the client cache
  (storable actions, LDS), the tab for "stale cached data" (`5c94971b`).
- **Visualforce**: view state inspector (enable *Development Mode* and *Show View State in
  Development Mode* on the user), the same debug logs for controller code, `apex:pageMessages` to
  surface controller errors.

### Deployment — source-driven development

| Tool | Shape | When |
|---|---|---|
| **Salesforce CLI (`sf`) + Salesforce DX** | Project on disk (`sfdx-project.json`, `force-app/`), source of truth in **version control**, `sf project deploy start` / `retrieve start`, scriptable by any CI server (`e4d0d916`, `9199fb45`) | The exam's answer to every "source-driven", "CI/CD", "version control" stem |
| **Scratch orgs** | Disposable orgs from a definition file, created from a **Dev Hub**, **1–30 days** (default **7**), **source tracking** so changes sync both ways; snapshots for prebuilt state | Per-feature development and automated test runs |
| **Unlocked packages** (2GP) | Versioned, upgradeable bundles of metadata whose source lives in VCS; no namespace required | Modular deployment across environments |
| **Managed packages** | Namespaced, IP-protected, for ISVs / AppExchange; 2GP is the current generation | Distributing to other orgs |
| **Change sets** | Point-and-click between sandboxes and production in the same org family; **no deletions, no version control, no automation** | Admin-led deployments; recovering an abandoned one starts with **Setup Audit Trail** (`7e99199d`) |
| **Metadata API** | `deploy()` / `retrieve()` with `package.xml`, `destructiveChanges.xml` for deletes; what the CLI and every tool drives underneath | Tooling, large orchestrated deploys |
| **Ant Migration Tool**, **Force.com IDE** | Legacy; Force.com IDE is retired | Distractors |
| **Sandboxes** | Developer (200 MB, refresh daily), Developer Pro (1 GB, daily), Partial Copy (5 GB, sample data via template, every 5 days), Full (production copy, every 29 days) | Match the stem's data and refresh needs |

**Test levels on a production deploy**: `RunLocalTests` (default — all tests except managed
packages'), `RunAllTestsInOrg`, `RunSpecifiedTests` (**each** deployed class and trigger must
reach 75% from the named tests), `NoTestRun` (sandboxes only). A validated deployment can be
**quick-deployed** without re-running tests for **10 days**.

---

## 12. The under-trained 18%: Performance

Five objectives, ~11 exam questions, **14 deck items** — and no deck item at all on
asynchronous callouts, which is a named objective.

### 12a. User-interface performance

| Problem | Mitigation |
|---|---|
| Visualforce view state near 170 KB, "ViewState errors in production" (`0d827147`, `b9fd412b`) | `transient` on collections and derived data; `private static` constants; don't hold query results between requests; `<apex:actionRegion>` **does not** help |
| Visualforce page loads slowly with lots of data (`afd20ee7`) | **Lazy loading** on demand instead of in the constructor; pagination with `StandardSetController` (`setPageSize`, `getHasNext`, `next()`), or SOQL `OFFSET`; `readOnly="true"` on `<apex:page>` raises the query-row limit to **1,000,000** and the iteration-component limit from 1,000 to 10,000 (no DML) |
| Repeated identical server calls from a component | `@AuraEnabled(cacheable=true)` / `setStorable()` (`2388fdd4`); LDS wire adapters share one cache; `refreshApex()` only when data changed |
| Data every request needs, computed from many queries | **Platform Cache** — see below |
| Many components on one page all loading at once | Put secondary content in tabs or accordion sections (rendered lazily); one component that aggregates the data; avoid `renderedCallback` work that re-triggers renders |
| Third-party JS loaded per component | One zipped static resource, loaded once via `loadScript` / `ltng:require` (`7d4b9c57`) |
| Diagnosing | Lightning Inspector **Performance** and **Transactions** tabs; browser dev tools network panel; `Storage` tab for what is cached |

**Platform Cache** (documentation; no deck item)

- Two caches: **session** (per user session, max TTL **8 hours**) and **org** (shared, default TTL
  **24 hours**, max **48 hours**); values expire on TTL or LRU eviction, so **every read must
  handle a miss** — or implement **`Cache.CacheBuilder`** whose `doLoad(key)` runs on a miss and
  stores the value.
- Capacity by edition: **10 MB** Enterprise, **30 MB** Unlimited / Performance, 0 elsewhere
  (trial available); allocated to **partitions** (min 1 MB) so one app cannot evict another's data;
  a default partition can be addressed without the namespace.
- API: `Cache.Org.put('ns.partition.key', value, ttlSecs)`, `Cache.Org.get(key)`,
  `Cache.Session.put/get`, `Cache.OrgPartition` / `Cache.SessionPartition` objects, `contains`,
  `remove`. Keys are alphanumeric, max **50** chars; one item max **100 KB**. Visualforce reads it
  as `{!$Cache.Session.partition.key}`.
- Cache a few large items rather than many small ones; cache what is expensive to compute and
  read often — reference data, computed totals, a user's preferences for the session.

### 12b. Queries and large data volumes

**Selectivity — the numbers that decide whether an index is used**

- **Standard index** (Id, Name, OwnerId, CreatedDate, SystemModstamp, RecordTypeId, Division,
  Email on Contact/Lead, lookup and master-detail fields — `10197f02`): used when the filter
  matches **< 30% of the first million** records and < 15% of the rest, up to 1 million rows.
- **Custom index** (External Id and Unique fields automatically; anything else on request to
  Support): **< 10% of the first million** and < 5% of the rest, up to 333,333 rows.
- `AND`: indexes apply unless one filter returns more than 20%. `OR`: **every** field must be
  indexed and the combination must return under 10% — otherwise **decompose the OR into two
  queries and merge** (`738ade86`).
- **Not selective, ever**: `!=`, `NOT IN`, `LIKE '%x'` (leading wildcard — trailing is fine,
  `44d8b26d`), most formula fields, `NULL` filters (unless Support enables null indexing), and
  `Name != NULL` / `IsDeleted = false` as stand-ins for selectivity (`12c11e51`). For a NULL-heavy
  picklist, a **formula field substituting a token for NULL, indexed**, makes the filter selective
  (`ce2609d1`).
- **Skinny tables**: Support-created, per object, up to **200 columns**, kept in sync, no
  soft-deleted rows, no fields from other objects, copied only to Full sandboxes.
- **Two-column custom indexes** for select-by-one-field-sort-by-another list views.
- The **Query Plan** tool reports cost; below 1 the index wins.

**Structuring the code**

- `COUNT()` for a count (`497c27b5`); aggregates over rows you would otherwise load.
- `Database.getQueryLocator` and Batch Apex for anything past 50,000 rows; a **SOQL for loop**
  for anything that would strain the 6 MB heap.
- `Set<Id>` + one query + `Map<Id, sObject>` is the shape for every join; **semi-joins** push
  the filtering into the database.
- `LIMIT` and `ORDER BY` in the query, not in Apex; select only the fields you use.
- **External Id** fields are indexed and let you **upsert** without querying for Ids —
  `upsert orders Order_Number__c;` (`9efee9d1`), nightly integration loads (`fa810727`).
- Archive to **big objects** or an external store; keep hot tables small.
- **Bulk API** (parallel by default; serial only to dodge lock contention) for loads; defer
  sharing calculations and disable non-essential automation during a mass load.

### 12c. Asynchronous callouts — Continuations

A synchronous callout holds an application-server thread. When the remote service is slow,
that thread counts against the org's **concurrent long-running request** limit (requests over
**5 seconds**; floor 10, ceiling 50 per org) — and once that is exhausted, *every* user's next
request is refused, not just the caller's. The 10-second callout timeout is a default, not the
constraint; the concurrency limit is.

`Continuation` moves the wait off the app server:

```apex
public with sharing class CatalogController {
    @AuraEnabled(continuation=true cacheable=true)   // LWC / Aura
    public static Object startRequest(String sku) {
        Continuation con = new Continuation(60);        // timeout seconds, max 120
        con.continuationMethod = 'processResponse';
        HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setEndpoint('callout:ERP/catalog/' + sku);
        con.addHttpRequest(req);                        // up to 3 per continuation
        return con;
    }
    @AuraEnabled(cacheable=true)
    public static Object processResponse(List<String> labels, Object state) {
        HttpResponse res = Continuation.getResponse(labels[0]);
        return res.getBody();
    }
}
```

- Visualforce: the action method returns the `Continuation`; the callback name is a controller
  method; `con.state` carries data across. LWC imports the method from
  **`@salesforce/apexContinuation/Class.method`** and calls it like any Apex; Aura marks the
  action with `continuation=true`.
- Limits: **3 parallel callouts** per continuation, **120 s** timeout, **1 MB** response, up to
  **3 chained** continuations. Not usable from triggers, batch or scheduled Apex — it is a UI
  feature.
- The exam's phrasing: "analyze a scenario and determine performance improvements that can be
  achieved with an asynchronous callout" — the improvement is **freed server threads and no
  concurrent-request exhaustion**, with the user still getting the response in the page.

### 12d. Code reuse

- **One helper / service class** for logic that several entry points need (`aa38d07c`,
  `9e1c8386`) — a trigger and a Visualforce controller, or every class that calls the same REST
  API. Reuse means one query, one place to change, one place to test.
- Trigger handler framework: one trigger per object dispatching to a handler class; a base
  handler with virtual `beforeInsert()` etc. that concrete handlers override.
- Interfaces, `virtual` / `abstract` classes and inheritance for pluggable behaviour;
  `Type.forName()` + custom metadata for configuration-driven dispatch; dependency injection so
  the Stub API can replace a collaborator in tests.
- `@InvocableMethod` exposes the same service to flows; a Queueable can be reused by several
  callers by taking its work as constructor arguments.
- UI: LWC composition and `@api` contracts; Aura `aura:method`; one static resource for shared
  libraries; base components before custom ones.
- The wrong answers are always "put the code in each class that needs it" or "store the code as
  a static resource" (`9e1c8386`).

### 12e. Spotting inefficiency in sample code

Read every code item for these, in this order — the exam expects you to find the *first* fatal
one:

1. SOQL or DML inside a loop (`264d0eab`, `9943756f`, `f7fd9efb`); a per-record `@future` call
   (`474e9918` — 200 records → "Too many future calls" at 51).
2. A query without a filter or scope that the loop then filters in Apex (`017f2acb` — scope the
   `WHERE` clause with `IN :map.keySet()`); an `add()` outside the guard that writes every row.
3. Nested loops where a `Map` lookup would do; `List.contains()` in a loop instead of a `Set`.
4. `Schema.getGlobalDescribe()` per iteration; describes not cached.
5. Selecting fields never used; loading rows to count them; loading everything to update some.
6. Non-selective filters on large objects (§12b).
7. Holding large collections in Visualforce view state; instance variables in a batch without
   needing `Database.Stateful`.
8. A recursion guard declared but never checked (`72374e4c`); a static flag that is never reset
   in a batch context (statics persist across a batch `execute` — reset them if the handler is
   reused).
9. Synchronous callouts where the user is not waiting, or in a loop.
10. DML with `allOrNone` true where one bad row should not kill the batch (`9d81f45b`).

---

## 13. Numbers to memorise

### Governor limits (per transaction; sync / async where they differ)

| Limit | Value |
|---|---|
| SOQL queries | **100** / **200** (subqueries get 3×; **custom metadata queries are unlimited**) |
| SOQL rows retrieved | **50,000** (same async — the reason Batch exists) |
| `Database.getQueryLocator` rows (outside batch) | 10,000 |
| SOSL queries / rows per query | **20** / **2,000** |
| DML statements | **150** (savepoints, rollbacks, `runAs`, after-commit `EventBus.publish` count) |
| DML rows processed | **10,000**, transaction-wide, cascading automation included |
| Trigger recursion stack depth | **16** |
| Callouts / cumulative callout time | **100** / **120 s**; default timeout **10 s**, `setTimeout` to 120 s |
| Callout request/response size | 6 MB / 12 MB |
| `@future` calls | **50** (0 from batch or future; 50 from queueable) |
| `System.enqueueJob` | **50** sync / **1** from async |
| `sendEmail` calls | 10 |
| Heap | **6 MB** / **12 MB** (email services 50 MB) |
| CPU time | **10,000 ms** / **60,000 ms** |
| Transaction wall time | 10 minutes |
| `EventBus.publish` — publish immediately | 150 |

### Platform, async, UI

| Limit | Value |
|---|---|
| Async executions per 24 h | **250,000** or 200 × licences, whichever is greater |
| Concurrent long-running (> 5 s) requests | 100 licences : 1; **min 10, max 50** |
| Scheduled Apex classes | **100** (5 in Developer Edition) |
| Batch jobs active or queued / flex queue holding | **5** / **100** |
| Batch `start` running concurrently | 1 |
| Batch scope | default **200**, max **2,000**; QueryLocator **50 million** rows |
| Batch jobs per test / chunks per test | 5 / 1 |
| Queueable chain depth (Developer & Trial orgs) | 5; Finalizer re-enqueues after failure: 5 |
| Trigger batch size (records / events) | 200 / 2,000 |
| Platform event & CDC retention | **72 hours** |
| Outbound Message retry window / per-attempt timeout | 24 hours / 60 s |
| Continuation | **3** parallel callouts, **120 s**, **1 MB** response, 3 chained |
| View state | **170 KB** |
| SOQL `OFFSET` | 2,000 |
| Static resource | 5 MB each, 250 MB per org |
| Platform Cache | Enterprise **10 MB**, Unlimited/Performance **30 MB**; item 100 KB; key 50 chars; session TTL ≤ 8 h; org TTL default 24 h, ≤ 48 h |
| Custom labels | 1,000 characters each |
| Field history | **18 months** (24 via API); 20 fields per object; Field Audit Trail 10 years / 60 fields |
| Skinny table columns | **200** |
| Index selectivity | standard **30%** / custom **10%** of the first million |
| Debug log | 20 MB each |
| Scratch org lifetime | 1–30 days, default **7** |
| Quick-deploy window | 10 days |
| Sandboxes | Developer 200 MB / daily; Developer Pro 1 GB / daily; Partial 5 GB / 5 days; Full — / 29 days |
| Test coverage to deploy | **75%** org-wide; `RunSpecifiedTests` — 75% per class |
| `MAX_DML_ROWS` in a sync test run | 450,000 |

---

## 14. Answers that are right for the exam and wrong for production

The exam is pinned to **Winter '24**. These items are keyed to behaviour that has since changed,
or to a misconception the deck had to correct. **Answer them the exam's way**, and know the
reality so you can recognise it when a distractor is built from it.

| Topic | Exam's answer (Winter '24) | Reality now |
|---|---|---|
| **Process Builder / Workflow Rules** as an automation answer (`77c104fc` offers all three) | Valid mechanisms; Flow is "optimal" where the stem says so | **End of support 31 Dec 2025**; existing ones still run. Flow is the only thing you would build |
| **`WITH SECURITY_ENFORCED`** for FLS in SOQL (`e9c0d546`) | ✅ Keyed | **`WITH USER_MODE`** is the recommended clause — it enforces sharing too, and reports which field failed instead of throwing on the first |
| **"Apex runs in system mode by default"** | ✅ The premise behind `with sharing` questions | The Apex guide now states that in **API 67.0 and later Apex runs in user mode by default**; a class on an older API version still runs in system mode. A Lightning controller with no keyword has long behaved as `with sharing` |
| **`if:true` / `if:false`** in LWC templates (`036f6646`) | ✅ Appears in options | **`lwc:if` / `lwc:elseif` / `lwc:else`** since Spring '23; the old directives are deprecated |
| **Outbound Message "contains the session ID"** (`e92e64ee`) | ✅ Listed as a capability | **Removed February 2026** — no `<sessionID>` in the payload; callbacks use OAuth |
| **Aura-only capabilities**: URL-addressable component, standard action override, some surfaces | Aura (or LWC wrapped in Aura) | LWC has gained URL-addressable targets and action-override support in later releases |
| **`System.assert` family** | ✅ | The `Assert` class (`Assert.areEqual`…) is the newer, clearer API; both work |
| **Lightning Testing Service** for Aura | May appear | Deprecated; **Jest** for LWC, browser tools for Aura |
| **Force.com IDE / Ant Migration Tool** (`e4d0d916`) | Distractors | Force.com IDE retired; Ant is legacy; `sfdx` CLI became **`sf`** |
| **Connected Apps** for OAuth | ✅ | Creation restricted from Spring '26 — External Client Apps are the recommendation; existing apps keep working |
| **Async SOQL** for big objects | May appear | Retired Summer '23 — Batch Apex or Bulk API instead |
| **`runAs` "only enforces record sharing"** | Was the documented behaviour | Now enforces object- and field-level permissions too |
| **`Test.startTest()` "commits" DML** | ❌ **Never true** — the deck repaired several explanations that said so | Nothing in a test commits; `startTest` opens a fresh limit context, which is the boundary the callout rule uses |
| **`@future` "limited to 50 records per call"** | ❌ Invented | The 50 is **methods per transaction**; a future method takes a collection of any size |
| **"10-second callout ceiling"** | ❌ Invented | 10 s is the **default**; `setTimeout()` to 120 s; the real synchronous constraint is the 5-second concurrent-request limit |

The last three are not staleness — they are widely repeated falsehoods that the deck's fact-check
found in its own explanations and that appear as distractors on the exam.

---

## 15. Distractor tells

Patterns in how this exam writes wrong answers, from the deck's 146 and its fact-check.

1. **A fabricated API member.** `Test.fixedSearchResults()`, `@createData`, `Date.paras`,
   `Schema.getCustomObjects()`, `getObjectType()` returning 'Custom', `@MultiThread=true`,
   `lightning-error`, `aura:messages`, `tablet-device-size`. If you have never seen the
   identifier, it does not exist — the real one is usually one option away
   (`Test.setFixedSearchResults`, `@testSetup`, `Date.format`, `isCustom()`,
   `lightning-messages`, `medium-device-size`).
2. **A fabricated number stated confidently.** "50 records per future call", "10-second
   ceiling", "100 (sync), 200 (async) DML statements". Every number in an option is checkable
   against §13.
3. **The right tool in the wrong place.** `Test.setMock` *after* the call; `startTest` around
   the *insert* instead of the callout; `@AuraEnabled` on the class or on line 08 instead of the
   method; `actionFunction` *inside* `selectOptions`. Position is part of the answer on code items.
4. **Broader than needed.** "Make the class `global`" when `public static` is the defect;
   "delete and recreate the component" when one attribute is missing; "refresh the sandbox";
   "disable all flows and re-enable one at a time".
5. **Fixing security by weakening it.** `without sharing` to make a query return rows;
   `SeeAllData=true` to make a test pass; "remove the Apex class from the integration user's
   profile"; "deactivate the trigger before the integration runs". When the stem says "preserving
   security" or "minimal impact to business logic", the option that removes a safeguard is wrong.
6. **A synchronous answer to a forced-async problem.** Any option that keeps a callout in a
   trigger, or a callout after DML in one transaction, or `Database.insert(x, true)` "to commit
   immediately". Nothing commits mid-transaction.
7. **The exception type or name swapped.** `LimitException` vs `CalloutException` (`474e9918`);
   `QueryException: List has more than one row` vs `LimitException: Too many SOQL queries`
   (`9943756f`); "the test will fail" vs "the data is rolled back" (`ad6dc9c9`).
8. **The wrong scope of storage.** Custom setting where the config must deploy and be testable
   (custom metadata); custom object for a lookup table; static resource for *code* reuse;
   `SUM()` for a count; `apex:actionRegion` to shrink view state.
9. **A count trick.** "Which two changes" where one option contains both (`e2ba60ab`, `15dc7a90`);
   "three reasons" where one is true but *not a reason to use Jest*.
10. **Adjacent-tool name-dropping.** Metadata API for coverage, Streaming API for a filter,
    Tooling API for record CRUD, Salesforce Connect for a nightly load, Heroku Data Clips for
    email, Fuel API for anything.

### Read the question's own verb

- **"optimal" / "minimal code" / "least development effort"** → declarative, `cacheable=true`,
  external Id upsert, standard REST API, one helper class.
- **"best practice"** → bulkify, handler, static flag, `@testSetup`, named credential, one
  trigger per object.
- **"what is wrong with it" / "which change"** → find the single token: `static`, `public`,
  `@AuraEnabled`, `cacheable=true`, the parameter name, the import path.
- **"what will happen" / "expected result"** → walk the code to the **first** failure and name its
  exception exactly.
- **"only asynchronous Apex can…"** → the trigger callout (`4f9da22c`); everything else has a
  synchronous form.
- **"without additional test coverage"** → an interface or design attribute, not Apex.
- **"ensure … in both Production and all Sandboxes"** → custom metadata.

---

## 16. Two-week revision plan

Weighted toward where the points are, not where the deck is.

| Day | Focus |
|---|---|
| 1 | §3 order of execution until you can write the 18 steps from memory; §4 trigger rules. Drill the deck's trigger items |
| 2 | §4 error handling and the callout/DML rule; §5 async table. Drill async items |
| 3 | §6 SOQL keywords and dynamic Apex; §7 platform events. Drill integration items |
| **4** | **§8a localization and multi-currency** — no deck items exist; write out the `CurrencyIsoCode` / `convertCurrency` / ACM rules and the label/locale surfaces from memory |
| **5** | **§8b sharing objects** — draw a `__Share` row with its four fields and the `RowCause` rules; §8c custom metadata vs settings table cover-and-reproduce |
| 6 | §9a LWC wiring, lifecycle, events, LMS, surfacing. Drill UI items |
| 7 | §9b Aura, §9c Visualforce actions and view state, §9d framework choice. Drill UI items again |
| 8 | §10 testing choreography; **write a `StubProvider`** from memory; Jest structure |
| 9 | §11 debugging tools and deployment; scratch orgs, packages, test levels |
| **10** | **§12 Performance** — selectivity thresholds, Platform Cache, and a `Continuation` written from memory. Your highest-yield day after day 4 |
| 11 | §12e inefficiency checklist against every code item in the deck |
| 12 | §13 numbers (cover and reproduce), §14 stale answers, §15 tells |
| 13 | Full deck run, timed at 2 minutes a question |
| 14 | Re-read §8 and §12 — the 33% the deck does not train. Rest |

---

## 17. Sources

Every URL below was rendered and title-checked during this repo's fact-check work or while
writing this guide.

**The exam**
- [Salesforce Certified Platform Developer II Exam Guide](https://help.salesforce.com/s/articleView?id=005298967&type=1&language=en_US) — outline, weights, Winter '24 alignment.

**Transactions, triggers, order of execution**
- [Triggers and Order of Execution](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm) — the sequence in §3, including the field-update re-fire rule.
- [Trigger Context Variables](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_context_variables.htm) and [Context Variable Considerations](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_context_variables_considerations.htm) — `Trigger.new` cannot be updated with DML.
- [Trigger and Bulk Request Best Practices](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_bestpract.htm)
- [Transaction Control](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_transaction_control.htm) — savepoint invalidation.
- [Execution Governors and Limits](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm) — every number in §13's first two tables.

**Asynchronous Apex**
- [Future Methods](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_annotation_future.htm)
- [Queueable Apex](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_queueing_jobs.htm)
- [Transaction Finalizers](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_transaction_finalizers.htm) — five re-enqueues, separate transaction.
- [Batch Apex](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_batch_interface.htm) — the QueryLocator bypass and per-chunk limits.
- [Firing Platform Events from Batch Apex](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_batch_platformevents.htm) and [BatchApexErrorEvent](https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/sforce_api_objects_batchapexerrorevent.htm)
- [Apex Scheduler](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_scheduler.htm)

**SOQL and dynamic Apex**
- [Querying All Records with a SOQL Statement](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_SOQL_query_all_rows.htm)
- [Aggregate Functions](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_SOQL_agg_fns.htm) — COUNT() costs one row.
- [Dynamic SOQL](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dynamic_soql.htm) and [Describing sObjects Using Schema Method](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dynamic_describeSObject.htm)
- [Set an Access Mode for Database Operations](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_enforce_usermode.htm) — `AccessLevel.USER_MODE`.
- [Using Relationship Queries](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql_relationships_query_using.htm)
- [SOSL in Tests](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_SOSL.htm)

**Integration**
- [Callout Limits and Limitations](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_callouts_timeouts.htm)
- [Adding Remote Site Settings](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_callouts_remote_site_settings.htm) and [Named Credentials](https://help.salesforce.com/s/articleView?language=en_US&id=sf.named_credentials_about.htm&type=5)
- [Exposing Apex Classes as REST Web Services](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest.htm) and [Exposing Data with Apex REST Web Service Methods](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_exposing_data.htm) — user mode by default.
- [Insert or Update (Upsert) a Record Using an External ID](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_upsert.htm) and [SessionHeader](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_header_sessionheader.htm)
- [Using the InboundEmail Object](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_email_inbound.htm)
- [Platform Event Allocations](https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_event_limits.htm) and [Event Message Durability](https://developer.salesforce.com/docs/platform/pub-sub-api/guide/event-message-durability.html)
- [Considerations for Outbound Messages](https://help.salesforce.com/s/articleView?id=sf.workflow_om_considerations.htm&language=en_US&type=5) and [Security Updates to Outbound Messages](https://help.salesforce.com/s/articleView?id=005232763&language=en_US&type=1)
- [Flow.Interview Class](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/flow_interview_class.htm)

**Advanced fundamentals**
- [About Advanced Currency Management](https://help.salesforce.com/s/articleView?id=sf.administration_about_advanced_currency_management.htm&language=en_US&type=5) — which objects use dated rates, the roll-up and `apex:inputField` restrictions.
- [$Locale Value Provider (Aura)](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/expr_locale_value_provider.htm) and [Date Methods](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_methods_system_date.htm)
- [Understanding Sharing](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_bulk_sharing_understanding.htm) — share objects, RowCause, access levels, owner-change behaviour — and [Creating Apex Managed Sharing](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_bulk_sharing_creating_with_apex.htm)
- [Platform Sharing Architecture (Architect)](https://architect.salesforce.com/fundamentals/platform-sharing-architecture) — when programmatic sharing is warranted.
- [Using the with sharing, without sharing, and inherited sharing Keywords](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_keywords_sharing.htm)
- [Custom Settings (Apex Developer Guide)](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_customsettings.htm) — list vs hierarchy, test isolation, protection.
- [Custom Metadata Types](https://help.salesforce.com/s/articleView?id=platform.custommetadatatypes_overview.htm&language=en_US&type=5)
- [Create a Sharing Set for Experience Cloud Site Users](https://help.salesforce.com/s/articleView?id=platform.networks_setting_light_users.htm&language=en_US&type=5)
- [Big Objects](https://developer.salesforce.com/docs/atlas.en-us.bigobjects.meta/bigobjects/big_object.htm) and [Field History Tracking](https://help.salesforce.com/s/articleView?language=en_US&id=sf.tracking_field_history.htm&type=5)

**User interface**
- LWC guide: [Call Apex Methods](https://developer.salesforce.com/docs/platform/lwc/guide/apex.html), [Wire Apex Methods](https://developer.salesforce.com/docs/platform/lwc/guide/apex-wire-method.html), [Call Apex Imperatively](https://developer.salesforce.com/docs/platform/lwc/guide/apex-call-imperative.html), [Expose Apex Methods](https://developer.salesforce.com/docs/platform/lwc/guide/apex-expose-method.html), [Lifecycle Hooks](https://developer.salesforce.com/docs/platform/lwc/guide/create-lifecycle-hooks.html), [Create and Dispatch Events](https://developer.salesforce.com/docs/platform/lwc/guide/events-create-dispatch.html), [Lightning Message Service](https://developer.salesforce.com/docs/platform/lwc/guide/use-message-channel.html), [Use Third-Party JavaScript Libraries](https://developer.salesforce.com/docs/platform/lwc/guide/js-third-party-library.html), [Test Lightning Web Components](https://developer.salesforce.com/docs/platform/lwc/guide/testing.html)
- Component reference: [lightning-layout-item](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-layout-item.html), [lightning-record-edit-form](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-record-edit-form.html), [force:hasSObjectName](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/force-has-sobject-name.html)
- Aura guide: [Component Events](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/events_component.htm), [Application Events](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/events_application.htm), [Configure Components for Lightning App Builder](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/components_config_for_app_builder.htm), [Design Files](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/components_config_for_app_builder_design_files.htm), [Storable Actions](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_storable_actions.htm), [Returning Errors from an Apex Server-Side Controller](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_apex_custom_errors.htm), [Debug Aura Components](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/debug_intro.htm)
- [Introducing the Salesforce Lightning Inspector](https://developer.salesforce.com/blogs/developer-relations/2016/02/introducing-salesforce-lightning-inspector) — the six tabs.
- Visualforce: [Order of Execution for Visualforce Page Get Requests](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_controller_get_request.htm), [Building a Controller Extension](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_controller_extension.htm), [JavaScript Remoting](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_js_remoting.htm), [Visualforce Remote Objects](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_remote_objects.htm), [Static Resources](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_resources.htm), [apex:actionSupport](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_compref_actionSupport.htm), [Render a Page as a PDF](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_output_pdf_renderas.htm), [Lazy Loading](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_best_practices_perf_lazy_load.htm), [Optimize the View State](https://developer.salesforce.com/docs/atlas.en-us.salesforce_visualforce_best_practices.meta/salesforce_visualforce_best_practices/pages_best_practices_perf_code_view_state.htm)

**Testing, debugging, deployment**
- [Testing Best Practices](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_best_practices.htm), [Using the isTest(SeeAllData=true) Annotation](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_seealldata_using.htm), [Using Test Setup Methods](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_testsetup_using.htm), [Using Limits, startTest, and stopTest](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_tools_start_stop_test.htm), [Using the runAs Method](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_tools_runas.htm)
- [Testing HTTP Callouts](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_restful_http_testing.htm), [Performing DML Operations and Mock Callouts](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_restful_http_testing_dml.htm), [WebServiceMock](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_interface_webservicemock.htm)
- [Build a Mocking Framework with the Stub API](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_stub_api.htm) — `StubProvider` and `Test.createStub()`.
- [Debug Log](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_debugging_debug_log.htm) and [Log Inspector](https://help.salesforce.com/s/articleView?id=platform.code_dev_console_view_system_log.htm&language=en_US&type=5) — the Executed Units count column.
- [Monitor Setup Changes with Setup Audit Trail](https://help.salesforce.com/s/articleView?id=sf.admin_monitorsetup.htm&language=en_US&type=5) and [Event Monitoring](https://help.salesforce.com/s/articleView?id=sf.real_time_event_monitoring_overview.htm&language=en_US&type=5)
- [Scratch Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs.htm), [Create Scratch Orgs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_create.htm) — 1–30 days, default 7 — and [Continuous Integration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ci.htm)

**Performance**
- [Make Long-Running Callouts with Continuations](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_continuation_overview.htm) and [Asynchronous Callout Limits](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_continuation_limits.htm) — 3 parallel, 120 s, 1 MB.
- [Avoiding the Concurrent Request Limit](https://developer.salesforce.com/blogs/engineering/2015/11/avoiding-the-concurrent-request-limit-via-synchronous-callout-optimization)
- [Platform Cache](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_cache_namespace_overview.htm) and [Platform Cache Limits](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_platform_cache_limits.htm)
- [Indexes (LDV)](https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_infrastructure_indexes.htm), [Skinny Tables](https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_infrastructure_skinny_tables.htm), [SOQL and SOSL (LDV Best Practices)](https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices_soql_and_sosl.htm) — decompose the OR, substitute for NULL.

---

## 18. Using this with NotebookLM

Upload **this file** as a source. Markdown ingests cleanly and the headings become NotebookLM's
navigation.

Worth adding as additional sources:
- The [official exam guide](https://help.salesforce.com/s/articleView?id=005298967&type=1&language=en_US) URL.
- [Triggers and Order of Execution](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm) and [Execution Governors and Limits](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm) — the two pages the exam leans on hardest.

**Prompts that produce useful study media:**

- *"Generate an Audio Overview of sections 3 and 5 — the save order of execution and the
  asynchronous Apex table. Have the hosts give each other a requirement and argue over whether
  it needs a future method, a Queueable, Batch Apex or a scheduled job."*
- *"Using section 8, drill me on the topics the practice deck does not cover: give me a
  scenario about multi-currency, sharing objects or custom settings and ask what a developer
  should do. Don't give me the answer until I try."*
- *"Turn section 13 into flashcards — one limit per card, the name on the front and the value
  plus the trap on the back."*
- *"Using section 12, give me five short Apex snippets each with one inefficiency from the
  checklist in 12e, and ask me to find it."*
- *"Using section 14, explain each case where the exam's expected answer differs from current
  Salesforce behaviour, and why the exam still keys the old answer."*

For the Audio Overview specifically, sections 3, 5, 8 and 14 reward listening — they are
sequences and comparisons. Sections 13 and 17 are lookup tables and will not survive being read
aloud.
