# Verified Salesforce documentation

Every URL here was **opened and confirmed to render the named article**. That bar
exists because `help.salesforce.com` returns HTTP 200 and an identical shell for
any article id, real or invented — so a fetch, a status code, and a search-result
listing all prove nothing.

Reusing a URL from this file costs nothing and needs no re-verification. Add each
newly confirmed URL as you go: this file is what makes the second deck cheaper
than the first.

If a link here ever fails to render, move it to **Known dead** below rather than
silently dropping it, so nobody re-derives it from a search result later.

## Settled facts

Cross-deck facts already established from these sources. Check here before
looking anything up — these recur constantly across Salesforce certifications.

| Fact | Value | Source |
|---|---|---|
| Deleted custom field retention | **15 days**, in the Deleted Fields list in Object Manager (not the record Recycle Bin) | Manage Deleted Custom Fields |
| Standard fiscal year | May start on the **first day of any month**; custom fiscal years are for non-calendar structures (4-4-5, 13 periods) | Set the Fiscal Year |
| Apex callout timeout | **10 s is the default, not a ceiling**; `setTimeout()` raises it to 120 s, which is also the per-transaction cumulative budget | Apex Callout Timeout |
| High-volume platform event retention | **72 hours** | Event Message Durability |
| Composite API | Up to **25 subrequests**, counting as one API call (max 5 of them queries/collections) | Send Multiple Requests Using Composite |
| Apex callouts per transaction | **100** callouts max per Apex transaction | Callout Limits and Limitations |
| Concurrent long-running requests | A synchronous request running **over 5 seconds** counts against the org's concurrent long-running request limit — usually the real constraint on synchronous callouts, not the timeout | Avoiding Apex Speeding Tickets |
| Change event retention | **Three days (72 h)**, same as platform events — retention does *not* distinguish CDC from platform events. The discriminator is that change events are generated from record changes automatically | Change Event Storage and Delivery |
| Enterprise vs Partner WSDL | Enterprise is **strongly typed** and bound to one org's metadata; Partner is **loosely typed** (name/value pairs) and is the one for clients spanning multiple orgs | Using the Partner WSDL |
| Trusted URLs vs Remote Site Settings | **Trusted URLs (CSP)** govern browser-side calls from LWC/Aura and third-party JS; **Remote Site Settings** govern Apex HTTP callouts. A failing LWC `fetch` is a CSP problem | Manage Trusted URLs |
| MuleSoft API-led layers | **System → Process → Experience.** Experience APIs are the layer that tailors format and security per consuming channel | Understanding API-Led Connectivity Essentials |
| Bulk API batch allocation | **15,000 batches per rolling 24-hour period**, shared between Bulk API and Bulk API 2.0. In Bulk API 2.0 only ingest jobs consume batches; query jobs don't | Bulk API and Bulk API 2.0 Limits and Allocations |
| Bulk API lock contention | Caused by detail records sharing a parent loaded in **separate parallel batches**, not by batch size itself; remedy is grouping by parent or serial mode | Managing Task Locks |
| Standard vs enhanced related list | Standard renders **4 columns**; Enhanced List raises it to **10**. Columns come from the page layout; the list *type* is set in Lightning App Builder | Dynamic Related Lists |
| Lightning App Builder page types | App Page, Home Page, Record Page, Email Application Pane. **No User page or Dashboard page.** App and Record pages support the mobile app; Home is Lightning Experience only | Lightning Page Types |
| Flow variable data types | Text, Number, Currency, Boolean, Date, Date/Time, Picklist, Multi-Select Picklist, Record, Apex-Defined — **there is no ID type**; record type ids live in Text | Flow Variable Considerations |
| MFA verification methods | Salesforce Authenticator, TOTP apps, security keys, built-in authenticators. **Email and SMS codes are not accepted** | Set MFA Login Requirements for API Access |
| User deactivation blockers | Selected in a **custom hierarchy field** (persists until the field is erased); **sole recipient of a workflow email alert**. Territory membership is **not** a blocker — deactivation removes territory assignments | Considerations for Deactivating Users |
| Owner-based sharing rules | Share records **by who owns them** — the mechanism for opening one role's records to a peer role. Manual sharing is per-record and done by the owner | Create Owner-Based Sharing Rules |
| Outbound Messaging | Messages queue until sent or until they are **24 hours old**, then are dropped; per-message timeout is **60 seconds**; declarative (no Apex). Available to **flows, workflow rules, approval processes, entitlement processes** — *not* Process Builder | Considerations for Outbound Messages; Outbound Message Actions |
| Outbound Messaging session ID | **REMOVED, week of 23 Feb 2026.** No Send Session ID checkbox, `IncludeSessionId` forced FALSE, no `<sessionID>` in the payload. Callbacks must use OAuth 2.0. Any deck claiming "provides a session id" as an outbound-messaging capability is now teaching a retired feature | Security Updates to Outbound Messages |
| PushTopic events | **Legacy.** Salesforce no longer enhances them and points to CDC instead. Still distinct from CDC: PushTopic is scoped by a **SOQL query** and respects **sharing rules**; CDC emits every change on the object and ignores sharing | PushTopic Events (Legacy) |
| Bulk API concurrency | **Parallel is the default and the fast path**; serial exists to dodge lock contention, at a maximum parallelism of 1 | General Guidelines for Data Loads |
| Apex REST access mode | **Runs in USER mode by default** — object permissions, FLS, and sharing are all enforced. Bypassing needs an explicit `WITH SYSTEM_MODE` / system-mode DML, plus `without sharing` for record access. Any explanation saying Apex REST "runs in system context" automatically is wrong | Exposing Data with Apex REST Web Service Methods |
| OAuth for mobile | Salesforce recommends the **web server flow with PKCE** *instead of* the user-agent flow; the user-agent flow uses the implicit grant and can leak the token via the redirect URL, and admins can block it | OAuth 2.0 User-Agent Flow |
| SOAP API call size | **200 records max** per `create()`/`update()`/`upsert()` call; exceeding it fails the whole call | update() |
| Integration users | Salesforce recommends **one dedicated user per integration** — that is what delivers both least privilege and per-system audit attribution. A Connected App governs OAuth scope, not data access, so shared-user designs fail both tests | Give Integration Users API Only Access |
| Workflow Rules / Process Builder | **End of support 31 Dec 2025.** Existing automation *continues to run* and can still be edited — this is retirement of support, not removal of capability, so exam answers keying them are still correct. Contrast with the outbound-message session ID, which was genuinely removed | Workflow Rules & Process Builder End of Support |
| Salesforce Files max size | **10 GB** in Files home, libraries, and a record's Files related list. **2 GB applies only to uploads in Chatter posts and comments.** An older "2 GB is the Salesforce Files limit" claim is stale — it already produced one wrong explanation | File Size and Sharing Limits |
| CDC and record access | Change Data Capture **ignores sharing settings and sends change events for all records** of an object; it does still respect **field-level security** | CDC Security Considerations |
| Self-registration / SSO pairings | **Auth Provider + Registration Handler** (OpenID Connect and other social/external IdPs); **SAML + Just-in-Time provisioning**. Crossing the pairs is the standard distractor | Configure an Auth Provider Using OpenID Connect; Just-in-Time Provisioning for SAML |
| Auth Provider vs Delegated Authentication | **Not the same feature, and a live trap.** An Authentication Provider logs users in with third-party credentials over **OpenID Connect or custom OAuth 2.0** — it has **no LDAP capability**, since LDAP is neither. **Delegated Authentication** is the feature that has Salesforce validate credentials against an **LDAP** server, configured under Single Sign-On Settings and backed by a SOAP web service you host. An option saying "configure an authentication provider to delegate authentication to LDAP" describes something you cannot configure | Authentication Provider SSO; Delegated Authentication |
| Deactivating access via LDAP | JIT provisioning **cannot** deactivate a disabled user — a JIT registration handler only fires **on login**, and a user who can no longer authenticate never triggers it. A login flow runs **after** credentials are validated. Closing the gap needs IdP-backed SSO **plus Login Form authentication disabled**, or Delegated Authentication | Delegated Authentication; SAML SSO |
| Validation rules and multiple errors | **Two different behaviours — do not mix them up, I did.** Validation Rule Considerations says "when one validation rule fails, Salesforce continues to check other validation rules… and **displays all error messages at once**" — that describes the **standard page-layout UI**. `lightning-record-edit-form` documents the **opposite** for itself: "if a single field has multiple validation errors, the form shows only the first error on the field… if a submitted form has multiple errors, the form shows **only the first error encountered**", revealing the next as each is fixed. So on a record-edit-form, *nothing* renders several validation messages simultaneously | Validation Rule Considerations; Record Edit Form |
| Validation rules vs client-side validation (LWC) | The Record Edit Form guide states the head-to-head outright: "**We recommend using custom validation rules to verify data input instead of implementing client-side validation errors.** A validation rule can contain a formula or expression that evaluates the data in **one or more fields**." That single sentence settles every "client-side validation or validation rules?" item — and it's the citation to use, *not* the all-messages-at-once line, which is about a different UI | Record Edit Form |
| BatchApexErrorEvent | A **standard** platform event the **platform fires automatically** when a batch job's start/execute/finish hits an **unhandled** exception. Gated only on the class implementing `Database.RaisesPlatformEvents`. The object page settles every distractor in one line: **"Only the Salesforce Platform can fire this event; Apex code and the API can't."** Supported subscribers are Apex triggers, flows, processes, **Pub/Sub API, and Streaming API (CometD)** — so an external system genuinely can listen on `/event/BatchApexErrorEvent`. A *custom* event can't substitute either: an unhandled exception has no catch point, and a default-behaviour publish rolls back with the transaction | Firing Platform Events from Batch Apex; BatchApexErrorEvent |
| COUNT() and the query-row limit | **COUNT() and COUNT(fieldName) cost one query row** (one per grouping if `GROUP BY` is present). **Every other aggregate function counts each row used by the aggregation** as a query row — so `SUM()` over millions of records blows the 50,000-row limit while `COUNT()` over the same records does not. This is the real discriminator in "count millions of records efficiently" items | Working with SOQL Aggregate Functions |
| SeeAllData and rollback | The annotation "applies to data queries but **doesn't apply to record creation or changes, including deletions**. New and changed records are **still rolled back** in Apex tests even when using the annotation." So a test that deletes real org records under `SeeAllData=true` leaves the org exactly as it found it | Using the isTest(SeeAllData=True) Annotation |
| @testSetup and code coverage | "If a test setup method calls a **non-test method of another class, no code coverage is calculated** for the non-test method." So code reachable only from `@testSetup` doesn't count; call it from a test method instead | Using Test Setup Methods |
| ALL ROWS | Queries "all records in an organization, **including deleted records and archived activities**". To include archived but exclude deleted, combine `ALL ROWS` with `IsDeleted = false`. Can't be used with `FOR UPDATE` | Querying All Records with a SOQL Statement |
| Queueable vs Schedulable (the timing slot) | **Queueable has no scheduling capability.** Its only timing control is `System.enqueueJob(queueable, delay)` — a **minimum delay of 0–10 minutes**, "ignored during Apex testing". No recurrence, no time of day. `Schedulable` is what takes a **cron expression** via `System.schedule()` or the Schedule Apex page, and the Apex Scheduler page names the canonical pairing: "**ideal for daily or weekly maintenance tasks using Batch Apex**". On a "run this nightly over lots of records" choose-two, the two slots are *volume* (Batchable) and *recurrence* (Schedulable) — Queueable competes for neither | Apex Scheduler; Queueable Apex |
| Why Batch Apex and not Queueable for LDV | The query-row limit is **50,000 in async exactly as in sync**, so making a job asynchronous buys *no* extra room to query 50,000+ records — a Queueable fails the same way a synchronous method would (heap likewise: 6 MB sync / 12 MB async). Batch Apex escapes it by a specific documented mechanism: "**If you use a QueryLocator object, the governor limit for the total number of records retrieved by SOQL queries is bypassed**… up to **50 million records**." Separately, "each execution of a batch Apex job is considered a discrete transaction… **governor limits are reset for each transaction**". Two distinct guarantees — the bypass covers the *query*, the reset covers the *processing*. Don't attribute the query headroom to the chunking | Use Batch Apex; Execution Governors and Limits |
| @future limits (a fabricated-limit trap) | The **50** attached to `@future` is "**Maximum number of methods with the future annotation allowed per Apex invocation**" — a cap on how many future calls one transaction may make (0 in batch/future contexts, 50 in queueable). It is **not** "50 records per method call", a limit that does not exist and that a Dev II deck explanation asserted twice. Real `@future` constraints: static, `void`, **primitives or collections of primitives only** (no sObjects), can't be scheduled, no job id, no chaining | Execution Governors and Limits; Future Annotation |
| Scheduled Apex limits | "Although scheduled Apex is an asynchronous feature, **synchronous limits apply to scheduled Apex jobs.**" This is the real reason `Schedulable` alone can't aggregate 50,000+ records — it buys timing, not headroom — and why Batch Apex is the other half of every "run a big calculation nightly" answer | Execution Governors and Limits |
| DML governor limits | **150 DML statements** per transaction, and **10,000 records processed by DML** — the 10,000 is a **transaction-wide total, not a per-statement allowance**. Cascading trigger/flow DML counts against the same total, which is why a 200-record update can fail on it | Execution Governors and Limits |
| Callouts and pending DML | "You **can't make a callout when there are pending operations** in the same transaction. Things that result in pending operations are **DML statements**, asynchronous Apex, scheduled Apex, or sending email." DML *after* a callout is fine. In tests: keep the **DML outside** `Test.startTest()/stopTest()` and the **callout inside**, and `Test.startTest()` must precede `Test.setMock()`. `Test.startTest()` **commits nothing** — it opens a fresh governor-limit context | Callout Limits and Limitations; Performing DML Operations and Mock Callouts |
| Non-selective OR in SOQL | "If you use **two indexed fields joined by an OR** in the WHERE clause, your search results can exceed the index threshold. **Break the query into two queries and join the results.**" The same page's remedy for NULL filters on picklists/foreign keys is to "use values such as NA to replace NULLS" — i.e. an indexed formula field substituting a string for NULL | SOQL and SOSL (LDV Best Practices) |
| External ID indexing | "**External IDs cause an index to be created on that field.**" Available only on Auto Number, Email, Number, and Text. The record `Id` is the primary key index; `CreatedDate`, `Systemmodstamp`, `Name`, `RecordTypeId`, `Division`, `Email`, and lookup/master-detail foreign keys are the other standard indexed fields. **Read the list carefully before writing a distractor:** it is `CreatedDate` (not `CreatedById`) that is indexed, and the entry is written **"Systemmodstamp (LastModifiedDate)"** — so "LastModifiedDate is not indexed" is *not* a claim this page supports | Indexes (Large Data Volumes) |
| LIKE and indexes | A `LIKE` filter with a **leading** `%` wildcard cannot use an index; a **trailing** wildcard (`'value%'`) can. So "mark the field as an External ID" is a real fix for a slow `LIKE 'x%'` query, and a non-fix for `LIKE '%x%'` | Maximizing the Performance of Force.com SOQL |
| Big Object SOQL | Index fields must be filtered **left to right in defined order**, and only **`=`, `<`, `>`, `<=`, `>=`, `IN`** are permitted — `LIKE`, `INCLUDES`, `EXCLUDES`, `!=`, `NOT IN` all fail. Non-final index fields accept only `=` | The Big Objects Playbook (SF Developers blog) |
| Multiple controller extensions | A method defined in more than one extension resolves to the **leftmost** extension — first in the comma-separated `extensions` list. The others are **overridden, not chained** | Building a Controller Extension |
| Field history retention | **18 months** in the org, **24 months via the API**, when Field Audit Trail is off. Field Audit Trail retains until you delete it (archives after 18 months in production) | Field History Tracking Overview |
| Static resources | **5 MB** per resource, **250 MB** per org — **its own allocation, counting against neither data nor file storage.** Data and File Storage Allocations lists file storage (attachments, Files home, CRM Content, Chatter files, the Documents tab, the Knowledge File field, Site.com assets) and enumerates data storage object by object; **static resources appear in neither list**. So "static resources don't count against the data storage quota" is *true* — useful when grading a "three benefits" item that also offers it. Documented benefits: `$Resource` by name instead of hard-coded ids, a `.zip`/`.jar` archive of related files, and relative paths between files inside an archive. **Not** automatically minified | Using Static Resources; Data and File Storage Allocations |
| Trigger.new and DML | "**trigger.new and trigger.old cannot be used in Apex DML operations.**" And "you can use an object to change its own field values using trigger.new, **but only in before triggers**" — those assignments save when the trigger finishes. So a `update trigger.new`-equivalent inside a before trigger isn't just redundant, it's prohibited; that's the citation for "remove the update statement" answers | Context Variable Considerations |
| Sharing sets | Grant Experience Cloud **site users** access to any record associated with an account or contact **matching the user's own** account or contact, via access mappings that follow lookups. The article's own worked example is "all **cases** related to an account identified on the user's contact" — i.e. the canonical partner-cases scenario. Access granted this way is **not** extended up the role hierarchy. (The Customer Community Plus / Partner Community restriction that gets quoted around this applies to **share groups**, not sharing sets) | Create a Sharing Set for Experience Cloud Site Users |
| When programmatic sharing | Apex managed sharing is for "**when a data access requirement can't be met by any other means**". Passes that test: **team functionality on custom objects** (account/opportunity/case teams exist only on those standard objects) and **an external system of record driving access**. Fails it: a manager seeing subordinates' records (role hierarchy) | Platform Sharing Architecture |
| Integration pattern definitions | **Request and Reply** — "Salesforce invokes a process on a remote system, **waits for completion**… then tracks state based on the response": the pattern whenever a user needs the answer during their interaction. **Fire and Forget** — invokes but doesn't wait. **Batch Data Synchronization** — Salesforce data refreshed from an external system *and* changes sent out, "**in either direction… in a batch manner**": the ETL / scheduled-bulk answer. **Data Virtualization** — reads external data live without persisting it (Salesforce Connect) | Integration Patterns |
| Visualforce GET order of execution | Controller/extension constructors → custom components created, *their* constructors, then their attribute expressions → `assignTo` attributes → page expressions, `<apex:page action>`, other getters/setters → view state created if `<apex:form>` → HTML sent. Custom-component evaluation comes **before** the page's own expressions and action attribute | Order of Execution for Visualforce Page Get Requests |
| Opportunity.ContactId | **It exists.** A standard, read-only field holding the primary contact, derived from the OpportunityContactRole. Any explanation asserting "Opportunity has no ContactId field" is wrong — the reason to reject a ContactId-based query is that it returns one primary contact, not the Account's contacts | Opportunity (Object Reference) |
| Queueable chaining inside a test | **Real behaviour, no longer documented.** "You can't chain queueable jobs in an Apex test" was removed from the Queueable Apex page and from the Queueable interface reference; only third-party sources still state it. What the current page *does* document is that only **one job can be enqueued from an executing job**, and the `Test.startTest`/`stopTest` pattern. Treat `Test.isRunningTest()` guards around a chained enqueue as correct but **cite the enqueue limit, not a chaining-in-test sentence** — there isn't one to cite | Queueable Apex |
| One MFA prompt across mixed login paths | **Session security levels, not the org-wide MFA setting.** Profile side: "For Session Security Level Required at Login, select **High Assurance** to require users to verify their identity with multi-factor authentication when they log in." Org side (Session Settings): "If users access Salesforce via single sign-on (SSO) only and you're using **your SSO provider's MFA solution**: Put your SSO provider in the **High Assurance** column" — and conversely, if you want *Salesforce* to do the MFA for SSO users, put the provider in the **Standard** column. Enabling "MFA for User Interface Logins" org-wide instead **double-prompts** anyone whose IdP already did MFA. Salesforce does **not** infer trust from a SAML authn context — that mechanism does not exist | Understand the Relationship Between MFA and a High Assurance Login Session; Edit Session Settings in Profiles |
| Registration handler: Apex is no longer required | "To set up a registration handler, you can use **Flow Builder or Apex**", and the flow option "can be configured and maintained entirely with clicks instead of code. **No developer knowledge is necessary.**" Any deck item asserting "Apex coding skills are needed for the Registration Handler" is now **stale**. The handler itself is still mandatory: "To set up single sign-on (SSO) with an authentication provider, you **must** set up a registration handler" | Create an Authentication Provider Registration Handler |
| Registration handler behaviour | Create vs update is decided by matching, not by a separate feature: the handler must "look for a matching user record in Salesforce", then "If there is a matching user, the registration handler **updates** the user record with information from the identity provider", else it creates one. Method names (`createUser`, `updateUser`, `canCreateUser`) are **not** on the help article — they live in the Mobile SDK guide's "Customize the Auth. Provider Apex Class" | Create an Authentication Provider Registration Handler; Customize the Auth. Provider Apex Class |
| Connected app creation | **Restricted as of Spring '26** — the banner appears on every connected-app help page: "Connected apps creation is restricted as of Spring '26. You can continue to use existing connected apps during and after Spring '26. However, we recommend using **external client apps** instead." Like the Workflow Rules row, this is a restriction on *creating*, not a removal of capability — so exam answers keying "create a Connected App" remain correct, and should note external client apps as the current recommendation rather than be marked wrong | Integrate Service Providers as Connected Apps with SAML 2.0; Configure Trusted IP Ranges for a Connected App |
| App Launcher tile | One sentence settles every "how does the app appear in App Launcher" item: "**Specifying a Start URL makes the application available in the app menu and in App Launcher.**" For a canvas app the Start URL field is skipped — Canvas embeds rather than redirects, so Canvas is the wrong answer whenever the stem says a redirect is acceptable | Integrate Service Providers as Connected Apps with SAML 2.0 |
| Salesforce as SAML IdP | Enabling it requires only a **certificate** (default self-signed SHA-256, or your own) and clicking **Enable Identity Provider**. The current article **never mentions My Domain** as a prerequisite — that requirement predates universal My Domain enforcement, so treat "set up Salesforce as a SAML IdP *with My Domain*" as still-correct but no longer a distinct step | Enable Salesforce as a SAML Identity Provider |
| Connected App refresh token policy | Four options: **valid until revoked (default)**; immediately expire; **expire if not used for n** (inactivity — resets on each use); **expire after n** (fixed clock — "if the policy states one day, the user can obtain new sessions only for 24 hours"). The policy "is evaluated only during usage of the issued refresh token and doesn't affect a user's current session". Daily re-auth ⇒ *after n*; a cohort re-authing together ⇒ *after n* started at first authorisation. The `refresh_token` grant does **not** use the callback URL, so a changed redirect URI cannot cause refresh failures | Manage OAuth Access Policies for a Connected App |
| OAuth username-password flow | **Being retired for connected apps** — Salesforce states the update "will break all connected app integrations that use this flow", because the flow "directly passes the user's credentials in HTTP requests". Replacements it names: **client credentials flow** for server-to-server, **web server flow with PKCE** for end-user login. Any item whose scenario is built on username-password is still answerable, but should flag the retirement rather than teach the flow as current practice | Salesforce Retirement of OAuth 2.0 Username-Password Flow |
| Connected App trusted IP range | The field is **"Trusted IP Range for OAuth Web Server Flow"** — scoped to the web server flow by its own name, so it does **not** restrict a username-password integration. **IP Relaxation relaxes** org IP enforcement rather than adding it. IP restrictions are enforced **only where configured on a user's profile**, so the mechanism that actually denies a login by source IP is profile **Login IP Ranges**: "a login from any other IP address is denied" | Configure Trusted IP Ranges for a Connected App; Restrict Login IP Addresses in Profiles |
| My Domain and SSO | With My Domain "the target hostname at Salesforce is unique to the organization", so "the correct Identity Provider (IdP) data for SSO can be looked up immediately". Without it, on a Salesforce link — login page, **deep link**, Outlook Sync URL — "Salesforce does not know in advance which Identity Provider to use", which is the SP-initiated case. **Caveat:** on a generic login page, SP-initiated *can* work after one IdP-initiated login sets an IdP cookie, so "SP-initiated will never work" is an overstatement. Separately, "**The Salesforce Mobile App only supports Service Provider (SP) Initiated SSO**" | Considerations for Setting Up Salesforce My Domain with SSO; Salesforce Mobile App: Single Sign-On overview |
| Identity Verification Credits | Denominated in **SMS sends** — the add-on "typically includes 25,000 SMS messages per month, 300,000 credits per year". So estimates key off SMS challenges, not all verifications. **Cite the add-on considerations article** (`id=005239145`, a `type=1` knowledge article); `security_sms_identity_verification` renders but never uses the word "credit" | Identity Verification Credits Add-On License Considerations |
| Lightning Inspector docs | **Removed from the Aura guide.** `lightning/inspector_*.htm` now redirects to the Debugging intro, including pinned old-version URLs. The Storage tab (client-side cache of storable actions) is still described in the Salesforce Developers blog post introducing the Inspector | Introducing the Salesforce Lightning Inspector |
| Workflow Rules / Process Builder end of support | **31 December 2025.** "Salesforce no longer supports Workflow Rules and Process Builder as of December 31, 2025... Your active Workflow Rules and Process Builder processes continue to run as they do today, even after 2025. The only change is that Salesforce no longer provides customer support or bug fixes." Retirement of *support*, not of capability — an exam key naming either tool stays correct; flag it and name the Flow Builder equivalent. The banner now sits on every workflow and process help page | Salesforce Workflow Rules & Process Builder End of Support |
| Validation rules after a workflow field update | **They do not re-run.** Order of Execution: "Executes workflow rules. If there are workflow field updates: Updates the record again. **Runs system validations again. Custom validation rules, flows, duplicate rules, processes built with Process Builder, and escalation rules aren't run again.**" Corroborated by the field-update considerations page: "Workflow rules and some processes can invalidate previously valid fields. Invalidation occurs because updates to records based on workflow rules... don't trigger validation rules." So a field update writing a value its own validation rule forbids **saves successfully**. This moved an App Builder key | Triggers and Order of Execution; Considerations for Field Update Actions |
| Roll-up summary supported relationships | Master-detail is the general rule, but four documented exceptions matter: roll-ups can be built on "Any custom object that is on the master side of a master-detail relationship; Any standard object that is on the master side of a master-detail relationship with a custom object; **Opportunities using the values of opportunity products**; **Accounts using the values of related opportunities**; **Campaigns using campaign member status or the values of campaign member custom fields**." **Cases are not on that list** — an Account/Case roll-up is impossible and sends you to Flow, Apex, or AppExchange. Calculation types are COUNT, SUM, MIN, MAX; there is no AVG | Roll-Up Summary Field |
| Data Loader record ceiling | **150,000,000 records** per CSV, not the 5 million older material claims. The Data Import Wizard's line is "You're loading less than 50,000 records", and its supported objects are "accounts, contacts, leads, solutions, campaign members, person accounts, and custom objects" — a short list that disposes of any option proposing it for PermissionSetAssignment or similar | When to Use Data Loader; What kind of objects can I import? |
| Actions on a Lightning record page | The page-layout action list surfaces in exactly three places, per Actions in Lightning Experience: the **highlights panel** page-level action menu ("The actions in the highlights panel come from the Salesforce Mobile and Lightning Experience Actions section of the page layout"), the **Activity tab** ("New Event and New Task don't show up here" — they "display on the Activity tab"), and the **Chatter tab** (standard Chatter actions only). **Path displays no actions**: a path is picklist steps, up to five key fields, and up to 1,000 characters of guidance. This moved an App Builder key | Actions in Lightning Experience; Standard Lightning Page Components; Create a Path |
| Record type assignment | Controls **creation and editing, never visibility**: "Record type assignment on a user's profile or permission set (or permission set group) doesn't determine whether a user can view a record with that record type." Assignable in **both** profiles and permission sets — but assignment is additive, so granting record types through a permission set can never *remove* one the profile already offers. Only profiles carry a default record type and the Master record type; only permission sets are restricted to custom record types | How Is Record Type Access Specified?; Assign Record Types and Page Layouts in Profiles; Assign Custom Record Types in Permission Sets |
| My Domain as a prerequisite | **No longer a live blocker.** "All orgs get a My Domain with enhanced domains by default." Legacy items that make My Domain deployment a precondition (custom Lightning components in App Builder, Salesforce as a SAML IdP) are historically accurate but describe a condition satisfied everywhere | My Domain |
| Path enforcement | Path **guides, it does not require**: "You can't use the page layout to require different fields in different steps. However, you can set up validation rules based on a path step." Each step shows up to five key fields and up to 1,000 characters of guidance for success | Considerations and Guidelines for Creating Paths; Create a Path |
| Before-save vs after-save flows | A before-save (Fast Field Updates) flow supports "**only these elements: Assignment, Decision, Get Records, and Loop**" and can update only the triggering record. Anything else — related records, or an action such as Submit for Approval — needs the after-save (Actions and Related Records) context. This is also why "one flow per object" is not achievable and "one per object **per trigger context**" is | Before-Save Record-Triggered Flows; Record-Triggered Automation (decision guide) |
| Blocking a delete declaratively | The **Custom Error element** in a record-triggered flow now does what an Apex `before delete` trigger used to be needed for: it "use[s] the same functionality as the addError() method in Apex", and the article's own example is "when a user deletes a record that triggers a flow, the flow can return an error message that tells the user why the deletion wasn't allowed." A few objects (OpportunityTeamMember, CampaignMember) don't support it on before-delete | Custom Error Element |
| Approvals are now "Classic" | Every approval help page carries: "Try **Flow Approval Processes**, a modern alternative to Classic Approval Processes." Classic approvals remain fully supported and remain the exam answer; note the alternative rather than marking items stale. Unanimity is a step setting: "Require unanimous approval from all selected approvers. The record is approved only if everyone approves the request." Delegation is a User field: "If populated, this user receives the same approval requests as you do. Delegated approvers can't reassign approval requests" | Classic Approval Processes; Identify Assigned Approvers for an Approval Step; Classic Approval Processes User Preferences |
| Change set deployment | **Atomic**: "A change set is deployed in a single transaction. If the deployment is unable to complete for any reason, the entire transaction is rolled back", and once successful it can't be rolled back. A deployment connection is **necessary but not sufficient**: "A deployment connection alone doesn't enable change sets to be sent between orgs. Each org must be authorized to send and receive change sets." Both facts are true simultaneously, which broke a "choose 2" in the App Builder deck | Deploy a Change Set; Deployment Connections for Change Sets |
| Field type change in a deployment | The slow part is a per-record data conversion: "the conversion runs in the background... **In some cases, the conversion can take over 24 hours to complete**", with Picklist↔Text and Date/Time→Time the slowest. Deployments also hit a ceiling of **85 million field type conversions** — 30 million records × 3 fields = 90 million, over the limit | Considerations for Converting the Field Type of a Custom Field |
| Workflow reevaluation cascade | With Re-evaluate Workflow Rules After Field Change on, "This cascade... can happen **up to five times** after the initial field update that started it", and mutually triggering rules "can cause your organization to exceed its limit for **workflow time triggers per hour**" (1,000/hour). Only rules **on the same object** are reevaluated; "Cross-object workflow rules aren't candidates for reevaluation." Per-object limits: **50 active**, 500 total | Field Updates That Reevaluate Workflow Rules; Workflow Limits |
| Schema Builder | Creates objects, fields (including formula and roll-up summary) and both relationship types, and its whole purpose is visualising relationships. Its one documented gap: "**Any field you add through Schema Builder isn't automatically added to the object's page layout.** You must edit the page layout to specify where the field should be displayed." It also cannot export a schema | Create Fields with Schema Builder; Schema Builder Considerations |
| Standard report type auto-generation | "When the custom object is the **child** in any master-detail relationship, a new standard report type will be created (**Parent WITH Custom Object** report type)", conditional on Allow Reporting being enabled. Lookups between two custom objects generate one too; multi-level relationships generate a *custom* report type that counts against the org limit | Criteria to Generate a Standard Report Type |
| Master-detail reparenting | "**By default, records can't be reparented in master-detail relationships.** Administrators can, however, allow child records... to be reparented to different parent records by selecting the **Allow reparenting** option." The classic symptom is a user who cannot change a detail record's parent after creation | Object Relationships Overview |
| Contacts with no account | "**A contact that isn't linked to an account is always private**, regardless of your organization's sharing model. Only the owner of the contact and administrators can view it. Sharing rules and workflow rules don't apply to private contacts." First thing to check on "one user can't see a contact" | Considerations for Sharing and Accessing Contacts |
| Lightning page activation options | Exactly four: org default; default for **specific Lightning apps**; a combination of **apps, record types, and profiles** (record types for record pages only); and a **form factor**. **Permission sets and roles are not activation targets** | Activate Lightning Record or Home Pages |
| Lightning page templates | **Not blanket-responsive.** "Home page templates are desktop-only. Standard app page templates support both desktop and phone. Standard record page templates support both desktop and phone, **except the pinned region templates, which are desktop only**." A page's template **can** be switched later, but not to one supporting a narrower device set, and components the new template's form factor doesn't support are dropped at run time | Lightning Page Templates |
| External ID | "An external ID field contains record identifiers from a system outside of Salesforce. You can use an external ID field to update or **upsert** records using the API... you can use this field to **prevent duplicates by also marking the field as Unique**." Up to **25** per object; auto-number, email, number or text only | Custom Field Attributes |
| Sandbox licences bundle Developer sandboxes | "Developer sandboxes **aren't available for purchase** but are bundled with add-on sandboxes of other types. The Partial Copy Sandbox add-on is bundled with **10**. The Full Sandbox add-on is bundled with **15**." Developer Pro must be bought. Refresh/storage: Developer 1 day / 200 MB, Developer Pro 1 day / 1 GB, Partial 5 days / 5 GB, Full 29 days / production-sized | Sandbox Licenses and Storage Limits by Type |
| Process Builder action list | Complete and closed: create a record, invoke another process, Chatter post, quick action, Quip, launch a flow, send an email, custom notification, survey invitation, submit for approval, update records, call Apex. **No delete action and no outbound message action** — outbound messages belong to Workflow Rules | Add Actions to Your Process |
| Process Builder cannot run on delete | Its Record Change trigger offers exactly two settings — "**only when a record is created**" and "**when a record is created or edited**" — and its only other trigger types are Event (platform event) and Invocable. There is no delete trigger under any configuration. Record-triggered **flows** do run on delete and can block one with a Custom Error element, so any "prevent/gate a deletion" item separates cleanly along this line. This moved an App Builder key | Configure the Process Trigger; Custom Error Element |
| Classic approval process automated actions | **Exactly four: Task, Email Alert, Field Update, Outbound Message.** No delete, no flow, no Apex. So an approval process can route a decision and stamp the outcome onto a field, but it can never itself delete a record or stop someone deleting one — "gate a delete with approval" always needs a second mechanism to enforce it | Add Automated Actions to a Classic Approval Process |
| CASE() vs nested IF() | CASE "checks a given expression against a series of values. **If the expression is equal to a value**, returns the corresponding result" — equality only, so it cannot express a numeric range. Salesforce's own Case Age colour-indicator sample uses nested `IF()` with `IMAGE()`; the picklist samples use `CASE()` | CASE; Sample Image Link Formulas |

Every row above now names a source that was opened and read. If you add a row you
have not rendered, mark it "verify before citing" and confirm it before it reaches
a deck — two of the facts here were wrong while carrying exactly that marker, and
one of them ("Salesforce Files max size 2 GB") had already been copied into a
deck explanation and into a script comment that told future passes not to re-check
it. A believed-correct fact with no rendered source is a liability, not a shortcut.

## Confirmed URLs

### Platform / setup
- **Set the Fiscal Year** — https://help.salesforce.com/s/articleView?id=sf.setting_the_fiscal_year.htm&language=en_US&type=5
  States directly that changing the start month is what standard fiscal years are for.
- **Considerations for Deactivating Users** — https://help.salesforce.com/s/articleView?id=platform.users_deactivate_considerations.htm&language=en_US&type=5
- **Cannot deactivate a User (error article)** — https://help.salesforce.com/s/articleView?id=000386275&language=en_US&type=1
- **Manage Deleted Custom Fields** — https://help.salesforce.com/s/articleView?id=sf.fields_managing_deleted_fields.htm&language=en_US&type=5

### Security / identity
- **Set MFA Login Requirements for API Access** — https://help.salesforce.com/s/articleView?language=en_US&id=sf.security_require_2fa_api.htm&type=5
- **Configure Your API Client to Use Mutual Authentication** — https://help.salesforce.com/s/articleView?id=xcloud.security_keys_uploading_mutual_auth_cert_api.htm&language=en_US&type=5
  The "Enforce SSL/TLS Mutual Authentication" permission and port 8443.
- **Which Standard Fields Can I Encrypt?** — https://help.salesforce.com/s/articleView?id=sf.security_pe_standard_fields.htm&language=en_US&type=5
- **Manage Trusted URLs** — https://help.salesforce.com/s/articleView?id=sf.security_trusted_urls_manage.htm&language=en_US&type=5
- **Just-in-Time Provisioning for SAML** — https://help.salesforce.com/s/articleView?id=sf.sso_jit_about.htm&language=en_US&type=5
- **Configure an Authentication Provider Using OpenID Connect** — https://help.salesforce.com/s/articleView?id=xcloud.sso_provider_openid_connect.htm&language=en_US&type=5

### Commerce / order management
- **Order Management and Service Cloud** — https://help.salesforce.com/s/articleView?id=sf.om_order_management_and_service_cloud.htm&language=en_US&type=5
- **Connect B2C Commerce with Service Cloud (Trailhead)** — https://trailhead.salesforce.com/content/learn/modules/om-salesforce-order-management/om-connect-b2c-commerce-service-cloud
  Agents see B2C order history in the Service Console without leaving it.
  Note: `sf.c360_a_commerce_cloud_connector.htm` is a *different* thing (the Data 360
  B2C Commerce data-stream connector) — it renders fine but does not support this claim.
- **Create Owner-Based Sharing Rules** — https://help.salesforce.com/s/articleView?id=sf.security_sharing_rules_owner.htm&type=5&language=en_US

### Automation / Flow
- **Flow Variable Considerations** — https://help.salesforce.com/s/articleView?language=en_US&id=platform.flow_considerations_feature_variable.htm&type=5
- **Update Salesforce Records from a Flow** — https://help.salesforce.com/s/articleView?id=platform.flow_build_data_update.htm&language=en_US&type=5
- **Record-Triggered Flow Considerations** — https://help.salesforce.com/s/articleView?language=en_US&id=sf.flow_considerations_trigger_record.htm&type=5
- **Add a Time-Dependent Action to Your Workflow Rule** — https://help.salesforce.com/s/articleView?id=sf.workflow_time_dependent.htm&language=en_US&type=5

### UI / App Builder
- **Lightning Page Types** — https://help.salesforce.com/s/articleView?language=en_US&id=platform.lightning_page_types.htm&type=5
- **Create Dynamic Related Lists in Lightning App Builder** — https://help.salesforce.com/s/articleView?id=platform.lightning_app_builder_create_dynamic_related_list.htm&language=en_US&type=5

### Integration patterns

- **Integration Patterns (the whole guide, one page)** — https://architect.salesforce.com/docs/architect/fundamentals/guide/integration-patterns.html
  The five patterns — Request and Reply, Fire and Forget, Batch Data Synchronization,
  Remote Call-In, UI Update Based on Data Changes — with a selection matrix.
  **The old `developer.salesforce.com/docs/atlas.…integration_patterns_and_practices…`
  URLs now redirect here**, so cite this one. Useful anchors:
  `#Remote_Process_Invocation___Request_And_Reply`,
  `#Remote_Process_Invocation___Fire_And_Forget`.
- **Understanding API-Led Connectivity Essentials (Trailhead)** — https://trailhead.salesforce.com/content/learn/modules/application-networks-and-api-led-connectivity-in-mulesoft/explore-api-led-connectivity
  System / Process / Experience layers, and what each is responsible for.

### Integration / APIs / data loads
- **Apex Callout Timeout — How to Handle and Increase Timeout** — https://help.salesforce.com/s/articleView?id=000232687&language=en_US&type=1
  The article for the default-vs-maximum timeout distinction.
- **Callout Limits and Limitations** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_callouts_timeouts.htm
  States both the 100-callouts-per-transaction limit and "the default timeout is 10 seconds"
  in one place — the primary source for the default-vs-ceiling trap.
- **Execution Governors and Limits** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm
- **Make Long-Running Callouts with Continuations** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_continuation_overview.htm
- **Asynchronous Callout Limits** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_continuation_limits.htm
- **Avoiding Apex Speeding Tickets (concurrent request limits)** — https://developer.salesforce.com/blogs/engineering/2015/11/avoiding-the-concurrent-request-limit-via-synchronous-callout-optimization
  Why the >5-second concurrent long-running request limit bites before any timeout does.
- **Send Multiple Requests Using Composite** — https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_composite_post.htm
  "You can have up to 25 subrequests in a single call. Up to 5 … can be sObject Collections
  or query operations."
- **Composite (resource overview)** — https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_composite.htm
  "The entire series of requests counts as a single call toward your API limits."
- **Named Credentials** — https://help.salesforce.com/s/articleView?language=en_US&id=sf.named_credentials_about.htm&type=5
- **Using the Partner WSDL** — https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_partner.htm
  Contrasts both WSDLs directly; covers the enterprise-vs-partner question in one page.
- **Get Started with User Interface API** — https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_get_started.htm
- **When to Use Connect REST API** — https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/intro_using_chatter_connect.htm
- **Monitor Bulk Data Load Jobs** — https://help.salesforce.com/s/articleView?id=sf.monitoring_async_api_jobs.htm&language=en_US&type=5
- **Monitor a Batch (Bulk API)** — https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/asynch_api_batches_monitor.htm
- **Analytics External Data API — External Data** — https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_ext_data.meta/bi_dev_guide_ext_data/bi_ext_data_overview.htm

### Events / streaming
- **Event Message Durability (Pub/Sub API)** — https://developer.salesforce.com/docs/platform/pub-sub-api/guide/event-message-durability.html
  The 72-hour retention statement. Note this newer `/docs/platform/…/guide/*.html` doc
  format is server-rendered, so `check-urls.mjs` can verify it without a browser.
- **Change Event Storage and Delivery** — https://developer.salesforce.com/docs/atlas.en-us.change_data_capture.meta/change_data_capture/cdc_subscribe_delivery.htm
  "Change event messages are stored in the event bus for three days."
- **Change Data Capture (guide intro)** — https://developer.salesforce.com/docs/atlas.en-us.change_data_capture.meta/change_data_capture/cdc_intro.htm
- **Platform Event Allocations** — https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_event_limits.htm
- **Subscribing to Platform Events** — https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_events_subscribe.htm
- **Publishing Platform Events** — https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_events_publish.htm
- **CDC Security Considerations** — https://developer.salesforce.com/docs/atlas.en-us.change_data_capture.meta/change_data_capture/cdc_security_considerations.htm
  "Change Data Capture ignores sharing settings and sends change events for all records
  of a Salesforce object", and separately that it respects field-level security.
- **Considerations for Outbound Messages** — https://help.salesforce.com/s/articleView?id=sf.workflow_om_considerations.htm&language=en_US&type=5
  The 24-hour queue and the 60-second per-message timeout.
- **Outbound Message Actions** — https://help.salesforce.com/s/articleView?id=platform.workflow_managing_outbound_messages.htm&language=en_US&type=5
  Which automation tools can send one (flows, workflow rules, approval and entitlement
  processes — not Process Builder).
- **Security Updates to Outbound Messages: Session ID Will No Longer Be Sent** — https://help.salesforce.com/s/articleView?id=005232763&language=en_US&type=1
  Dated: effective the week of 23 February 2026. Cite this whenever a question or
  explanation treats the outbound-message session ID as a live capability.
- **PushTopic Events (Legacy)** — https://developer.salesforce.com/docs/atlas.en-us.api_streaming.meta/api_streaming/pushtopic_events_intro.htm
  Says in one place that PushTopic is SOQL-scoped, respects sharing rules, and is legacy
  with CDC as the recommended successor — settles most PushTopic-vs-CDC items.
- **General Guidelines for Data Loads (Bulk API)** — https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/asynch_api_planning_guidelines.htm
  Parallel is the default; serial trades throughput for freedom from lock contention.

### External data / files
- **Access External Data With Salesforce Connect** — https://help.salesforce.com/s/articleView?id=platform.salesforce_connect.htm&language=en_US&type=5
- **Access External Data with OData Adapters for Salesforce Connect** — https://help.salesforce.com/s/articleView?id=platform.salesforce_connect_odata.htm&language=en_US&type=5
- **File Size and Sharing Limits** — https://help.salesforce.com/s/articleView?language=en_US&id=experience.collab_files_size_limits.htm&type=5
  The 10 GB / 2 GB split. Read the LOCATION column before quoting a number.
- **Identity Type for External Data Sources** — https://help.salesforce.com/s/articleView?language=en_US&id=sf.platform_connect_identity_type.htm&type=5
  Named Principal vs Per User — the authorization boundary for Salesforce Connect.
- **External Services** — https://help.salesforce.com/s/articleView?id=platform.external_services.htm&language=en_US&type=5
- **Introducing Canvas** — https://developer.salesforce.com/docs/atlas.en-us.platform_connect.meta/platform_connect/canvas_framework_intro.htm
- **Storing Sensitive Data (Secure Coding Guide)** — https://developer.salesforce.com/docs/atlas.en-us.secure_coding_guide.meta/secure_coding_guide/secure_coding_storing_sensitive_data.htm
  Protected custom metadata types as the store for secrets inside a namespaced package.
- **Authorization Through External Client Apps / Connected Apps and OAuth 2.0 (REST API)** — https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_understanding_authentication.htm

### Data loads / large data volumes
- **Load Binary Attachments (Bulk API)** — https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/binary_intro.htm
  A zip containing `request.txt` plus the attachments — the documented multi-attachment load.
- **update() (SOAP API)** — https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_calls_update.htm
  "Your client application can change up to 200 records in a single update() call."
  Also lists the available SOAP headers — useful for refuting "turn off validation rules via a header".
- **upsert() (SOAP API)** — https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_calls_upsert.htm
- **Bulk API and Bulk API 2.0 Limits and Allocations** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet/salesforce_app_limits_platform_bulkapi.htm
  "You can submit up to 15,000 batches per rolling 24-hour period."
- **Indexes (Large Data Volumes)** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_infrastructure_indexes.htm
- **Maximizing the Performance of Force.com SOQL, Reports, and List Views** — https://developer.salesforce.com/blogs/engineering/2013/07/maximizing-the-performance-of-force-com-soql-reports-and-list-views
  Selectivity thresholds and how the query optimizer picks an index.

### Identity / users
- **Give Integration Users API Only Access** — https://help.salesforce.com/s/articleView?language=en_US&id=sf.integration_user.htm&type=5
  "We recommend creating and configuring one Salesforce user for every integration."
- **Invoke REST APIs with the Salesforce Integration User and OAuth Client Credentials** — https://developer.salesforce.com/blogs/2024/02/invoke-rest-apis-with-the-salesforce-integration-user-and-oauth-client-credentials
- **OAuth 2.0 User-Agent Flow** — https://help.salesforce.com/s/articleView?id=xcloud.remoteaccess_oauth_user_agent_flow.htm&language=en_US&type=5
- **Restrict Login IP Addresses in Profiles** — https://help.salesforce.com/s/articleView?id=platform.login_ip_ranges.htm&language=en_US&type=5
- **Set Trusted IP Ranges for Your Org** — https://help.salesforce.com/s/articleView?id=sf.security_networkaccess.htm&language=en_US&type=5
- **Manage Duplicate Records** — https://help.salesforce.com/s/articleView?language=en_US&id=sales.managing_duplicates_overview.htm&type=5
- **Workflow Rules & Process Builder End of Support** — https://help.salesforce.com/s/articleView?id=001096524&language=en_US&type=1

### Apex behaviour
- **Exposing Data with Apex REST Web Service Methods** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_exposing_data.htm
  The user-mode-by-default statement. Load-bearing whenever a question turns on FLS bypass.
- **Set an Access Mode for Database Operations** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_enforce_usermode.htm
- **Performing DML Operations and Mock Callouts** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_restful_http_testing_dml.htm
  Why the DML goes outside `Test.startTest()` and the callout inside.
- **BatchApexErrorEvent** — https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/sforce_api_objects_batchapexerrorevent.htm
- **Introducing Visualforce** — https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_intro.htm
- **External Object Relationships** — https://help.salesforce.com/s/articleView?id=platform.external_object_relationships.htm&language=en_US&type=5
  Lookup / external lookup / indirect lookup only — no master-detail to an external object.

### Testing / tooling
- **Testing HTTP Callouts by Implementing the HttpCalloutMock Interface** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_restful_http_testing_httpcalloutmock.htm
- **Testing HTTP Callouts** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_restful_http_testing.htm
- **ApexCodeCoverageAggregate (Tooling API)** — https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/tooling_api_objects_apexcodecoverageaggregate.htm
- **Managing Task Locks for Data Loads** — https://developer.salesforce.com/blogs/engineering/2014/08/managing-task-locks-data-loads
  Explains that lock contention comes from parent-sharing records split across parallel batches.
- **Install a Managed Package** — https://help.salesforce.com/s/articleView?id=sf.distribution_installing_packages.htm&language=en_US&type=5

### Sales / forecasting
- **Manage Opportunity Stage to Forecast Category Mappings** — https://help.salesforce.com/s/articleView?id=sales.faq_forecasts_category_mapping.htm&language=en_US&type=5

### Trailhead
- **Build a Discount Approval Process — Prepare Your Org** — https://trailhead.salesforce.com/content/learn/projects/build-a-discount-approval-process/prepare-your-org
  Establishes that both a custom Discount field and a populated Manager field are prerequisites.

### Identity & access management
All rendered during the IAM deck repair.

Added in the IAM answer-verification pass (2026-08-10), all three rendered:

- **Restrict Login IP Addresses in Profiles** — https://help.salesforce.com/s/articleView?id=sf.users_profiles_epui_login_ip_ranges.htm&language=en_US&type=5
  "To control login access at the user level, specify the ranges of allowed IP
  addresses on a user's profile. When you define IP address restrictions for a
  profile, a login from any other IP address is denied." The mechanism that
  actually restricts an OAuth username-password integration to one host.
- **Configure Trusted IP Ranges for a Connected App** — https://help.salesforce.com/s/articleView?id=xcloud.connected_app_edit_ip_ranges.htm&language=en_US&type=5
  The field is named **"Trusted IP Range for OAuth Web Server Flow"** — scoped to
  the web server flow, so it does not govern username-password. IP Relaxation
  *relaxes* org IP enforcement rather than adding it, and IP restrictions are
  enforced only where configured on a user's profile.
- **Identity Verification Credits Add-On License Considerations** — https://help.salesforce.com/s/articleView?id=005239145&language=en_US&type=1
  Credits are denominated in SMS: "typically includes 25,000 SMS messages per
  month, 300,000 credits per year". Note this is a `type=1` knowledge article,
  not a `type=5` doc page. **Do not** cite `security_sms_identity_verification`
  for credit consumption — it renders, but never uses the word "credit".

- **Custom Login Flows** — https://help.salesforce.com/s/articleView?id=sf.security_login_flow.htm&language=en_US&type=5
- **Session Security** — https://help.salesforce.com/s/articleView?id=sf.security_overview_sessions.htm&language=en_US&type=5
- **Monitor Access to Your Salesforce Orgs and Experience Cloud Sites** — https://help.salesforce.com/s/articleView?id=sf.identity_monitor_access.htm&language=en_US&type=5
- **Identity Connect** — https://help.salesforce.com/s/articleView?id=xcloud.identityconnect_about.htm&language=en_US&type=5
- **Salesforce Identity Licenses** — https://help.salesforce.com/s/articleView?id=sf.identity_licenses.htm&language=en_US&type=5
- **User Licenses** — https://help.salesforce.com/s/articleView?id=platform.users_understanding_license_types.htm&language=en_US&type=5
- **Manage Salesforce User Identities with SCIM** — https://help.salesforce.com/s/articleView?id=sf.identity_scim_overview.htm&language=en_US&type=5
- **Delegated Authentication** — https://help.salesforce.com/s/articleView?id=sf.sso_delauthentication.htm&language=en_US&type=5
  "You can configure your Salesforce org to rely on a Lightweight Directory Access
  Protocol (LDAP) server to validate credentials."
- **Authentication Provider SSO** — https://help.salesforce.com/s/articleView?id=sf.sso_authentication_providers.htm&language=en_US&type=5
  "…such as with OpenID Connect or with a custom OAuth 2.0 configuration." No LDAP.
- **SAML SSO with Salesforce as the Service Provider** — https://help.salesforce.com/s/articleView?id=sf.sso_saml_setting_up.htm&language=en_US&type=5
- **Configure SSO with Salesforce as a SAML Service Provider** — https://help.salesforce.com/s/articleView?id=sf.sso_saml.htm&language=en_US&type=5
- **My Domain** — https://help.salesforce.com/s/articleView?id=sf.domain_name_overview.htm&language=en_US&type=5
- **Connected App Use Cases** — https://help.salesforce.com/s/articleView?id=sf.connected_app_about.htm&language=en_US&type=5
- **User Provisioning for Connected Apps** — https://help.salesforce.com/s/articleView?id=sf.connected_app_user_provisioning.htm&language=en_US&type=5
- **ConnectedAppPlugin Class** — https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_class_Auth_ConnectedAppPlugin.htm
  Note: it lives in the **apexref** book. The `apexcode` path 404s.
- **Multi-Factor Authentication for Salesforce Orgs** — https://help.salesforce.com/s/articleView?id=sf.security_require_two_factor_authentication.htm&language=en_US&type=5
- **SMS Identity Verification** — https://help.salesforce.com/s/articleView?id=xcloud.security_sms_identity_verification.htm&language=en_US&type=5

**OAuth flows** — all confirmed:
`sf.remoteaccess_oauth_web_server_flow.htm`, `sf.remoteaccess_oauth_refresh_token_flow.htm`,
`sf.remoteaccess_oauth_jwt_flow.htm`, `sf.remoteaccess_oauth_SAML_bearer_flow.htm`,
`sf.remoteaccess_oauth_device_flow.htm`, `sf.remoteaccess_oauth_asset_token_flow.htm`,
`sf.remoteaccess_oauth_scopes.htm`, `sf.remoteaccess_revoke_token.htm`,
`sf.remoteaccess_oidc_token_introspection_endpoint.htm` (note `_oidc_..._endpoint`,
not `remoteaccess_token_introspection`).

**Experience Cloud / Customer Identity** — all confirmed:
`sf.external_identity_self_registration_configure.htm`,
`xcloud.external_identity_self_registration_person_accounts.htm`,
`sf.external_identity_branding_use_cases.htm`,
`sf.external_identity_login_pages_configure.htm`,
`sf.external_identity_manage_create_contactless_users.htm`,
`platform.networks_create_external_users.htm`,
`sf.users_license_types_communities.htm`, `sf.users_login_history.htm`.

### Platform Developer II — Apex
All rendered during the Dev II deck pass. Book prefix is
`https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/` unless noted.

- **Triggers** — `apex_triggers.htm`, `apex_triggers_context_variables.htm`,
  `apex_triggers_bulk.htm`, `apex_triggers_bulk_idioms.htm`, `apex_triggers_bestpract.htm`
- **Transactions & limits** — `apex_transaction.htm`, `langCon_apex_transaction_control.htm`
  (the savepoint-invalidation rule), `apex_gov_limits.htm`
- **Async** — `apex_batch_interface.htm`, `apex_scheduler.htm`, `apex_queueing_jobs.htm`,
  `apex_classes_annotation_future.htm` (`(callout=true)` and the static/primitive-args rules),
  `apex_batch_platformevents.htm`
- **Callouts** — `apex_callouts.htm`, `apex_callouts_timeouts.htm`,
  `apex_callouts_remote_site_settings.htm`, `apex_callouts_wsdl2apex_testing.htm`
- **Web services** — `apex_rest.htm`
- **Testing** — `apex_testing_SOSL.htm` (SOSL returns an empty list unless
  `Test.setFixedSearchResults`), `apex_testing_data.htm`, `apex_testing_data_access.htm`,
  `apex_testing_seealldata_using.htm` (the rollback-including-deletions rule — cite **this**,
  not `apex_testing_data_access.htm`, which covers access isolation and never mentions
  rollback), `apex_testing_testsetup_using.htm`, `apex_testing_tools_start_stop_test.htm`,
  `apex_testing_tools_runas.htm`, `apex_testing_best_practices.htm`,
  `apex_classes_restful_http_testing_dml.htm`
- **Classes & annotations** — `apex_classes_static.htm`, `apex_classes_keywords_sharing.htm`,
  `apex_classes_annotation_AuraEnabled.htm`, `apex_classes_email_inbound.htm`
- **SOQL** — `apex_dynamic_soql.htm`, `apex_dynamic_describeSObject.htm`,
  `langCon_apex_SOQL_query_all_rows.htm`, `langCon_apex_SOQL_working_with_results.htm`,
  `langCon_apex_SOQL_agg_fns.htm` (the COUNT()-costs-one-query-row rule),
  `langCon_apex_dml_examples_upsert.htm`, `langCon_apex_dml_nested_object.htm`
- **Sharing** — `apex_bulk_sharing.htm`, `apex_bulk_sharing_understanding.htm`,
  `apex_bulk_sharing_creating_with_apex.htm`
- **Debugging** — `apex_debugging_debug_log.htm`

Apex Reference Guide (`…apexref.meta/apexref/`): `apex_methods_system_date.htm`,
`apex_methods_system_database.htm`, `apex_methods_system_sobject_describe.htm`,
`apex_pages_standardcontroller.htm`, `apex_interface_webservicemock.htm`,
`apex_namespace_Flow.htm`, `flow_interview_class.htm`.

### Platform Developer II — LWC and Aura

The newer `developer.salesforce.com/docs/platform/**/guide/*.html` format is
**server-rendered**, so `check-urls.mjs` verifies these without a browser. Prefer it
over `docs/component-library/bundle/…`, which is client-rendered.

LWC guide (`https://developer.salesforce.com/docs/platform/lwc/guide/`):
`create-lifecycle-hooks.html`, `create-lifecycle-hooks-dom.html`, `create-conditional.html`,
`create-resources.html`, `js-third-party-library.html`, `events-create-dispatch.html`,
`apex.html`-family: `apex-call-imperative.html`, `apex-wire-method.html`,
`apex-expose-method.html`, `apex-error-handling.html`, `data-wire-service-about.html`,
`data-create-record.html`, `reference-lightning-ui-api-record.html`,
`reference-salesforce-modules`, `testing.html`, `unit-testing-using-jest-create-tests.html`.

Lightning Component Reference (`…/docs/platform/lightning-component-reference/guide/`):
`lightning-record-edit-form.html` (states that `lightning-messages` goes immediately before
or after the `lightning-input-field`s), `lightning-layout.html`, `lightning-layout-item.html`
(mobile-first grid; device attributes are additive), `lightning-datatable.html`,
`lightning-platform-resource-loader.html`, `force-has-sobject-name.html`.

Aura guide (`…lightning.meta/lightning/`): `expr_locale_value_provider.htm`,
`components_using_lex_s1_config_action.htm`, `components_config_for_app_builder.htm`,
`components_config_for_app_builder_design_files.htm`, `events_intro.htm`,
`events_component.htm`, `events_component_fire.htm`, `events_application.htm`,
`controllers_server_storable_actions.htm`, `controllers_server_apex_custom_errors.htm`,
`js_libs_platform.htm`, `debug_intro.htm`.

- **Introducing the Salesforce Lightning Inspector (blog)** — https://developer.salesforce.com/blogs/developer-relations/2016/02/introducing-salesforce-lightning-inspector
  Names all six tabs; "The Storage tab reveals the client-side storage for Lightning
  applications. Actions marked as storable are cached in the actions store." Cite this
  instead of the removed `inspector_storage.htm`.

### Visualforce
Book prefix `https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/`.

`pages_controller_lifecycle.htm`, `pages_controller_get_request.htm`,
`pages_controller_extension.htm` (the leftmost-extension override rule),
`pages_controller_methods.htm`, `pages_resources.htm` (5 MB / 250 MB and the three
documented benefits), `pages_js_remoting.htm`, `pages_remote_objects.htm`,
`pages_output_pdf_renderas.htm`, `pages_best_practices_perf_lazy_load.htm`,
`apex_ApexPages_StandardController_ctor.htm`, and component reference pages
`pages_compref_actionSupport.htm`, `pages_compref_commandButton.htm`,
`pages_compref_messages.htm`, `pages_compref_pageMessages.htm`.

- **Optimize the View State** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_visualforce_best_practices.meta/salesforce_visualforce_best_practices/pages_best_practices_perf_code_view_state.htm
  Note the separate `salesforce_visualforce_best_practices` book — the `pages` book's
  `pages_controller_transient.htm` is dead.

### More platform / reference (Dev II pass)
- **Data and File Storage Allocations** — https://help.salesforce.com/s/articleView?id=xcloud.overview_storage.htm&language=en_US&type=5
  The authoritative what-counts-as-what list. Search it before asserting that anything
  consumes data or file storage — static resources are in neither list.
- **Platform Sharing Architecture (Architect)** — https://architect.salesforce.com/fundamentals/platform-sharing-architecture
  OWD, role hierarchy, sharing rules, manual shares, teams, territories and Apex managed
  sharing in one page, each with a "use case" line. The tiebreaker for "declarative or code?"
- **Context Variable Considerations** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_context_variables_considerations.htm
- **Validation Rule Considerations** — https://help.salesforce.com/s/articleView?id=platform.fields_validation_considerations.htm&language=en_US&type=5
- **Validation Rules Fields** — https://help.salesforce.com/s/articleView?id=platform.fields_validation_rules_fields.htm&language=en_US&type=5
- **Custom Metadata Types** — https://help.salesforce.com/s/articleView?id=platform.custommetadatatypes_overview.htm&language=en_US&type=5
- **Create a Sharing Set for Experience Cloud Site Users** — https://help.salesforce.com/s/articleView?id=platform.networks_setting_light_users.htm&language=en_US&type=5
- **Custom Error Element (Flow)** — https://help.salesforce.com/s/articleView?id=platform.flow_ref_elements_custom_error.htm&language=en_US&type=5
- **Event Monitoring** — https://help.salesforce.com/s/articleView?id=sf.real_time_event_monitoring_overview.htm&language=en_US&type=5
- **Monitor Setup Changes with Setup Audit Trail** — https://help.salesforce.com/s/articleView?id=sf.admin_monitorsetup.htm&language=en_US&type=5
  Note the `sf.` namespace; `platform.admin_monitorsetup.htm` does not resolve.
- **Log Inspector (Developer Console)** — https://help.salesforce.com/s/articleView?id=platform.code_dev_console_view_system_log.htm&language=en_US&type=5
  The Executed Units tab's **Count** column is "Number of times the item was called during
  the process" — the answer to "how do I count calls to a method".
- **Field History Tracking Overview** — https://help.salesforce.com/s/articleView?language=en_US&id=sf.tracking_field_history.htm&type=5
- **Field Audit Trail** — https://help.salesforce.com/s/articleView?language=en_US&id=sf.field_audit_trail.htm&type=5
- **AccountHistory (Field Reference Guide)** — https://developer.salesforce.com/docs/atlas.en-us.sfFieldRef.meta/sfFieldRef/salesforce_field_reference_AccountHistory.htm
- **Opportunity (Object Reference)** — https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_opportunity.htm
- **SOQL and SOSL (LDV Best Practices)** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices_soql_and_sosl.htm
  The decompose-the-OR rule and the NULL-substitution rule, in one table.
- **Using Relationship Queries** — https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql_relationships_query_using.htm
- **COUNT() and COUNT(fieldName)** — https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql_select_count.htm
- **Big Objects (Implementation Guide)** — https://developer.salesforce.com/docs/atlas.en-us.bigobjects.meta/bigobjects/big_object.htm
  Sibling pages that exist: `big_object_considerations.htm` (Best Practices),
  `big_object_query_examples.htm`.
- **The Big Objects Playbook (blog)** — https://developer.salesforce.com/blogs/2026/06/big-objects-playbook-payload-capture-and-replay
  The only current source found for the permitted big-object query operators.
- **Continuous Integration (Salesforce DX Developer Guide)** — https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ci.htm
- **About REST API** — https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm
- **Insert or Update (Upsert) a Record Using an External ID** — https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_upsert.htm
- **SessionHeader (SOAP API)** — https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_header_sessionheader.htm

### Platform App Builder pass (2026-08-11)

Every URL below was opened and its rendered title confirmed. Note the namespace
split: most current help ids use `platform.`, but a stubborn minority still only
answer on `sf.`, and Sales Cloud topics live under `sales.`. When a `platform.`
id 404s, try `sf.` before assuming the article is gone.

**Fields, formulas, validation**
- **Sample Image Link Formulas** — https://help.salesforce.com/s/articleView?id=platform.useful_advanced_formulas_image_links.htm&language=en_US&type=5
  Contains the "Color Squares for Case Age" and "Flags for Case Priority" samples.
- **IMAGE** — https://help.salesforce.com/s/articleView?id=platform.customize_functions_image.htm&language=en_US&type=5
- **CASE** — https://help.salesforce.com/s/articleView?id=platform.customize_functions_case.htm&language=en_US&type=5
- **ISCHANGED** — https://help.salesforce.com/s/articleView?id=platform.customize_functions_ischanged.htm&language=en_US&type=5
  "Returns FALSE when evaluating any field on a newly created record."
- **Tips for Writing Validation Rules** — https://help.salesforce.com/s/articleView?id=platform.fields_validation_rules_tips.htm&language=en_US&type=5
- **Validation Rule Considerations** — https://help.salesforce.com/s/articleView?id=platform.fields_validation_considerations.htm&language=en_US&type=5
- **Custom Field Attributes** — https://help.salesforce.com/s/articleView?id=platform.custom_field_attributes.htm&language=en_US&type=5
  The External ID / Unique definition and the 25-per-object limit.
- **Considerations for Converting the Field Type of a Custom Field** — https://help.salesforce.com/s/articleView?id=platform.notes_on_changing_custom_field_types.htm&language=en_US&type=5
- **Roll-Up Summary Field** — https://help.salesforce.com/s/articleView?id=platform.fields_about_roll_up_summary_fields.htm&language=en_US&type=5
- **Create a Roll-Up Summary Field** — https://help.salesforce.com/s/articleView?id=platform.fields_defining_summary_fields.htm&language=en_US&type=5

**Objects, relationships, schema**
- **Object Relationships Overview** — https://help.salesforce.com/s/articleView?id=platform.overview_of_custom_object_relationships.htm&language=en_US&type=5
- **Create a Custom Object from a Spreadsheet in Lightning Experience** — https://help.salesforce.com/s/articleView?id=platform.dev_objectcreate_task_lex_from_spreadsheet.htm&language=en_US&type=5
  The article behind "Lightning Object Creator".
- **Create Fields with Schema Builder** — https://help.salesforce.com/s/articleView?id=sf.schema_builder_elements_fields.htm&language=en_US&type=5
  `platform.schema_builder_creating_fields` does **not** exist; this is the live id.
- **Schema Builder Considerations** — https://help.salesforce.com/s/articleView?id=platform.schema_builder_considerations.htm&language=en_US&type=5
- **Criteria to Generate a Standard Report Type** — https://help.salesforce.com/s/articleView?id=000383026&language=en_US&type=1

**UI / App Builder**
- **Actions in Lightning Experience** — https://help.salesforce.com/s/articleView?id=platform.actions_in_lex.htm&language=en_US&type=5
  Enumerates every place an action appears on a record page. Path is not among them.
- **Global Quick Actions** — https://help.salesforce.com/s/articleView?id=platform.actions_overview_global.htm&language=en_US&type=5
- **Set Predefined Field Values for Quick Action Fields** — https://help.salesforce.com/s/articleView?id=platform.predefined_field_values.htm&language=en_US&type=5
- **Create Dynamic Actions in Lightning App Builder** — https://help.salesforce.com/s/articleView?id=platform.lightning_app_builder_create_dynamic_action.htm&language=en_US&type=5
- **Activate Lightning Record or Home Pages** — https://help.salesforce.com/s/articleView?id=platform.lightning_app_builder_customize_lex_pages_activate.htm&language=en_US&type=5
- **Lightning Page Templates** — https://help.salesforce.com/s/articleView?id=platform.lightning_page_templates.htm&language=en_US&type=5
- **Tips for Creating Mobile App Pages in Lightning App Builder** — https://help.salesforce.com/s/articleView?id=platform.lightning_app_builder_mobile_guidance.htm&language=en_US&type=5
- **Page Layouts** — https://help.salesforce.com/s/articleView?id=platform.customize_layout.htm&language=en_US&type=5
- **Guide Users with Path** — https://help.salesforce.com/s/articleView?id=sales.path_overview.htm&language=en_US&type=5
- **Create a Path** — https://help.salesforce.com/s/articleView?id=sales.path_create.htm&language=en_US&type=5
- **Considerations and Guidelines for Creating Paths** — https://help.salesforce.com/s/articleView?id=sales.path_considerations.htm&language=en_US&type=5
- **Customize Chatter Feed Tracking** — https://help.salesforce.com/s/articleView?id=sf.collab_feed_tracking.htm&language=en_US&type=5
  `platform.collab_feed_tracking` 404s.
- **View a List of Lightning Components in Your Org** — https://developer.salesforce.com/docs/platform/lwc/guide/use-setup.html
- **My Domain** — https://help.salesforce.com/s/articleView?id=xcloud.domain_name_overview.htm&language=en_US&type=5
  `platform.` and `sf.` both 404 for this one; only `xcloud.` renders.

**Automation**
- **Salesforce Workflow Rules & Process Builder End of Support** — https://help.salesforce.com/s/articleView?id=000389396&language=en_US&type=1
- **Add Actions to Your Process** — https://help.salesforce.com/s/articleView?id=platform.process_action.htm&language=en_US&type=5
- **Configure the Process Trigger** — https://help.salesforce.com/s/articleView?id=sf.process_start.htm&language=en_US&type=5
  Enumerates the Record Change trigger settings; the `platform.` and `sf.process_which_object` variants both 404.
- **Add Automated Actions to a Classic Approval Process** — https://help.salesforce.com/s/articleView?id=platform.approvals_automated_actions.htm&language=en_US&type=5
- **Workflow Limits** — https://help.salesforce.com/s/articleView?id=platform.workflow_limits.htm&language=en_US&type=5
- **Field Updates That Reevaluate Workflow Rules** — https://help.salesforce.com/s/articleView?id=platform.workflow_field_updates_reevalute_wf.htm&language=en_US&type=5
- **Considerations for Field Update Actions** — https://help.salesforce.com/s/articleView?id=platform.workflow_field_update_considerations.htm&language=en_US&type=5
- **Triggers and Order of Execution** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm
- **Before-Save Record-Triggered Flows** — https://help.salesforce.com/s/articleView?id=platform.flow_concepts_trigger_record.htm&language=en_US&type=5
- **Custom Error Element** — https://help.salesforce.com/s/articleView?id=platform.flow_ref_elements_custom_error.htm&language=en_US&type=5
- **Connecting to an API Without a Connector Using HTTP Callout** — https://help.salesforce.com/s/articleView?id=platform.flow_http_callout.htm&language=en_US&type=5
- **Record-Triggered Automation (decision guide)** — https://architect.salesforce.com/docs/architect/decision-guides/guide/record-triggered.html
  "Use one entry point per Salesforce Object."
- **Classic Approval Processes** — https://help.salesforce.com/s/articleView?id=platform.what_are_approvals.htm&language=en_US&type=5
- **Identify Assigned Approvers for an Approval Step** — https://help.salesforce.com/s/articleView?id=platform.approvals_step_approver.htm&language=en_US&type=5
- **Classic Approval Processes User Preferences** — https://help.salesforce.com/s/articleView?id=platform.approvals_change_approval_user_pref.htm&language=en_US&type=5

**Data loading, sandboxes, deployment**
- **When to Use Data Loader** — https://developer.salesforce.com/docs/atlas.en-us.dataLoader.meta/dataLoader/when_to_use_the_data_loader.htm
  The help-site `sf.when_to_use_the_data_loader` URL redirects here.
- **What kind of objects can I import?** — https://help.salesforce.com/s/articleView?id=sf.faq_data_import_wizard_what_kind_objects.htm&language=en_US&type=5
- **Sandbox Licenses and Storage Limits by Type** — https://help.salesforce.com/s/articleView?id=platform.data_sandbox_environments.htm&language=en_US&type=5
- **Deploy a Change Set** — https://help.salesforce.com/s/articleView?id=platform.changesets_inbound_deploy.htm&language=en_US&type=5
- **Deployment Connections for Change Sets** — https://help.salesforce.com/s/articleView?id=sf.changesets_about_connection.htm&language=en_US&type=5
- **Install a Managed Package** — https://help.salesforce.com/s/articleView?id=sf.distribution_installing_packages.htm&language=en_US&type=5
  `platform.distribution_installing_packages` 404s.
- **Account Hierarchy: Set Up** — https://help.salesforce.com/s/articleView?id=sales.account_hierarchy_setup_lex.htm&language=en_US&type=5
- **Considerations for Using Account Hierarchy** — https://help.salesforce.com/s/articleView?id=sales.account_parent_lex.htm&language=en_US&type=5

### Sharing, visibility, and record access

One home for every record-access URL, gathered from the Platform App Builder pass
(2026-08-11) and the sharing-visibility pass (2026-08-17). Provenance lives on the
entries that need it, not in the heading — file new sharing URLs here rather than
starting another pass-named section.

Verification for this section: help articles were rendered in a browser and their
titles checked; developer guides were fetched through the docs content API, which
returns real topic content for a live id and nothing for an invented one — a stronger
check than a browser render on `developer.salesforce.com`, where any book id yields
the generic shell.

*Profiles, permission sets, record types*
- **Assign Record Types and Page Layouts in Profiles** — https://help.salesforce.com/s/articleView?id=platform.users_profiles_record_types.htm&language=en_US&type=5
- **Assign Custom Record Types in Permission Sets** — https://help.salesforce.com/s/articleView?id=platform.perm_sets_record_types_assign.htm&language=en_US&type=5
- **How Is Record Type Access Specified?** — https://help.salesforce.com/s/articleView?id=platform.permissions_record_type_access.htm&language=en_US&type=5
- **Permission Set Groups** — https://help.salesforce.com/s/articleView?id=platform.perm_set_groups.htm&language=en_US&type=5
- **Field Permissions** — https://help.salesforce.com/s/articleView?id=platform.users_profiles_field_perms.htm&language=en_US&type=5
- **"View All" and "Modify All" Permissions Overview** — https://help.salesforce.com/s/articleView?id=platform.users_profiles_view_all_mod_all.htm&language=en_US&type=5
- **Create Criteria-Based Sharing Rules** — https://help.salesforce.com/s/articleView?id=platform.security_sharing_rules_criteria.htm&language=en_US&type=5
- **Grant Access to Records with Manual Sharing in Lightning Experience** — https://help.salesforce.com/s/articleView?id=platform.granting_access_to_records_lex.htm&language=en_US&type=5
- **Considerations for Using Account Teams** — https://help.salesforce.com/s/articleView?id=sales.accountteam_def.htm&language=en_US&type=5
  Lists Profiles among the account access methods — useful against "profiles never grant record access".
- **Considerations for Sharing and Accessing Contacts** — https://help.salesforce.com/s/articleView?id=sales.contacts_sharing_considerations.htm&language=en_US&type=5
- **Salesforce Entity Key Prefix Decoder** — https://help.salesforce.com/s/articleView?id=000385203&language=en_US&type=1
  User = 005.

*Org-wide defaults, hierarchy, groups, rules*
- **Organization-Wide Sharing Defaults** — https://help.salesforce.com/s/articleView?id=sf.security_sharing_owd_about.htm&language=en_US&type=5
- **Sharing and Record Access Features** — https://help.salesforce.com/s/articleView?id=platform.managing_the_sharing_model.htm&language=en_US&type=5
- **Controlling Access Using the Role Hierarchy** — https://help.salesforce.com/s/articleView?id=sf.security_controlling_access_using_hierarchies.htm&language=en_US&type=5
- **Public and Personal Groups** — https://help.salesforce.com/s/articleView?id=platform.user_groups.htm&language=en_US&type=5
- **Custom Object Security** — https://help.salesforce.com/s/articleView?id=platform.dev_security.htm&language=en_US&type=5
  Carries the junction-object rule verbatim: viewing a detail record needs "Read
  permission and read access to the related master record. If the record has two
  master records in a many-to-many relationship, the user must have read access to
  **both** master records."
- **Create a Many-to-Many Object Relationship** — https://help.salesforce.com/s/articleView?id=platform.relationships_manytomany.htm&language=en_US&type=5
- **Considerations for Object Relationships** — https://help.salesforce.com/s/articleView?id=platform.relationships_considerations.htm&language=en_US&type=5
- **Defer Sharing Calculations** — https://help.salesforce.com/s/articleView?id=sf.security_sharing_defer_sharing_calculations.htm&language=en_US&type=5
- **Automatic Recalculation of Org-Wide Defaults and Sharing Rules** — https://help.salesforce.com/s/articleView?id=sf.security_sharing_recalculating_parallel.htm&language=en_US&type=5
- **Verify Access for a Particular Field** (the Field Accessibility viewer) — https://help.salesforce.com/s/articleView?id=sf.checking_field_accessibility_for_a_particular_field.htm&language=en_US&type=5
- **Log In as Another User** — https://help.salesforce.com/s/articleView?id=sf.logging_in_as_another_user.htm&language=en_US&type=5
- **View and Edit Login Hours in Profiles** — https://help.salesforce.com/s/articleView?id=platform.login_hours.htm&language=en_US&type=5
- **Create Queues** — https://help.salesforce.com/s/articleView?id=sf.users_queue_membership_list.htm&language=en_US&type=5
  `platform.users_queue_membership_list` is dead; only `sf.` renders.
- **User Sharing and Visibility** — https://help.salesforce.com/s/articleView?id=platform.security_sharing_users.htm&language=en_US&type=5
- **Who Can See My File?** — https://help.salesforce.com/s/articleView?language=en_US&id=sf.collab_files_settings_perms.htm&type=5
- **Access to Report Folders** — https://help.salesforce.com/s/articleView?id=analytics.access_report_folders.htm&language=en_US&type=5
- **User Permissions for Sharing Reports and Dashboards** — https://help.salesforce.com/s/articleView?id=analytics.analytics_sharing_permissions.htm&language=en_US&type=5
- **Share a List View with Specific Users via Public Groups** — https://help.salesforce.com/s/articleView?id=000387584&language=en_US&type=1
- **Considerations and Guidelines for Using Opportunity Teams** — https://help.salesforce.com/s/articleView?id=sales.salesteam_def.htm&language=en_US&type=5
- **Guidelines for Sharing Price Books** — https://help.salesforce.com/s/articleView?id=sales.products_sharing.htm&language=en_US&type=5
- **Set Up Content Deliveries** — https://help.salesforce.com/s/articleView?id=sf.content_delivery_about.htm&language=en_US&type=5
- **Break Up Your Record Details with Dynamic Forms** — https://help.salesforce.com/s/articleView?id=sf.dynamic_forms_overview.htm&language=en_US&type=5
- **Classic Encryption for Custom Fields** — https://help.salesforce.com/s/articleView?id=sf.fields_about_encrypted_fields.htm&language=en_US&type=5
- **Synchronize Your Data Encryption with the Background Encryption Service** — https://help.salesforce.com/s/articleView?id=xcloud.security_pe_mass_encryption.htm&language=en_US&type=5
- **Protection and Privacy Options for Custom Settings** — https://help.salesforce.com/s/articleView?id=platform.cs_schema_settings.htm&language=en_US&type=5
- **Access Rules When Packaging Custom Metadata Types and Records** — https://help.salesforce.com/s/articleView?id=sf.custommetadatatypes_package_access.htm&language=en_US&type=5
- **Standard Action Overrides** — https://help.salesforce.com/s/articleView?id=sf.standard_actions_overrides.htm&language=en_US&type=5
- **Assign Action Overrides** — https://help.salesforce.com/s/articleView?id=platform.assign_action_overrides.htm&language=en_US&type=5
- **Considerations for Overriding Standard Buttons** — https://help.salesforce.com/s/articleView?id=sf.links_override_considerations.htm&language=en_US&type=5
- **Comparing Original Territory Management and Salesforce ETM** — https://help.salesforce.com/s/articleView?id=000387747&language=en_US&type=1
- **Enable Filter-Based Opportunity Territory Assignment** — https://help.salesforce.com/s/articleView?id=sf.tm2_enable_ota.htm&language=en_US&type=5

*Experience Cloud*
- **Partner User Roles** — https://help.salesforce.com/s/articleView?id=sf.networks_partner_roles_overview.htm&language=en_US&type=5
- **Grant Portal Super User Access to Partner and Customer Users** — https://help.salesforce.com/s/articleView?id=sf.networks_partner_super_user_access.htm&language=en_US&type=5
- **Use Share Groups to Share Records Owned by High-Volume Experience Cloud Site Users** — https://help.salesforce.com/s/articleView?id=sf.networks_sharing_light_users.htm&language=en_US&type=5
- **Control Which Users Experience Cloud Site Users Can See** — https://help.salesforce.com/s/articleView?id=sf.networks_user_sharing.htm&language=en_US&type=5
- **Experience Cloud User Licenses** — https://help.salesforce.com/s/articleView?id=platform.users_license_types_communities.htm&language=en_US&type=5

*Developer guides — Designing Record Access for Enterprise Scale (DRAES)*
- **Implicit Sharing** — https://developer.salesforce.com/docs/atlas.en-us.draes.meta/draes/draes_object_relationships_implicit_sharing.htm
- **Group Membership Locking** — https://developer.salesforce.com/docs/atlas.en-us.draes.meta/draes/draes_group_membership_locking.htm
- **Ownership Data Skew** — https://developer.salesforce.com/docs/atlas.en-us.draes.meta/draes/draes_group_membership_data_skew.htm
- **Parent-Child Data Skew** — https://developer.salesforce.com/docs/atlas.en-us.draes.meta/draes/draes_object_relationships_parent_child_data_skew.htm
- **Record-Level Locking** — https://developer.salesforce.com/docs/atlas.en-us.draes.meta/draes/draes_object_relationships_record_level_locking.htm
- **Deferred Sharing Maintenance** — https://developer.salesforce.com/docs/atlas.en-us.draes.meta/draes/draes_tools_deferred_sharing_maintenance.htm
- **Record-Level Access: Under the Hood** (PDF) — https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/salesforce_record_access_under_the_hood.pdf
  `check-urls.mjs` reports this **DEAD**, and that verdict is wrong: Node's fetch
  can't build a certificate chain for `resources.docs.salesforce.com`. `curl`
  downloads it and a browser offers the file. Don't drop it on the script's say-so.

*Developer guides — Apex, LWC, Visualforce*
- **Understanding Sharing** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_bulk_sharing_understanding.htm
- **Using the runAs Method** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_tools_runas.htm
- **Enforce Sharing Rules** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_security_sharing_rules.htm
- **Enforce Object and Field Permissions** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_perms_enforcing.htm
- **Enforce User Mode for Database Operations** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_enforce_usermode.htm
- **Secure Apex Classes (LWC guide)** — https://developer.salesforce.com/docs/platform/lwc/guide/apex-security.html
- **Security Guidelines for Apex and Visualforce Development** — https://developer.salesforce.com/docs/atlas.en-us.securityImplGuide.meta/securityImplGuide/review_and_certification.htm

| Fact | What the doc actually says | Article |
|---|---|---|
| Implicit sharing and View All | Parent implicit sharing gives "read-only access to the parent account for a user with access to a child case, contact, or opportunity" — but it is explicitly **"Not granted by the View All permission on the child object"**, and child implicit sharing is likewise "not granted by the View All permission on the parent object". So View All on Case does **not** hand the user the accounts | Implicit Sharing (DRAES) |
| Group Maintenance tables | "Tables that store the data supporting **group membership and inherited access grants**." The four grant types are explicit, group membership, inherited, implicit; explicit grants live in the Object Sharing table | Record-Level Access: Under the Hood |
| Granular locking concurrency | Enabled **by default** now. The published matrix is exact — "Changing customer or partner account owner" runs concurrently with **territory creation only**, because it is a form of role reparenting | Group Membership Locking (DRAES) |
| Deferred vs parallel recalculation | Deferral is a **planned-window** tool: suspend, make changes, resume, then manually run a full recalculation. **Parallel** recalculation is the one documented as providing "better resilience to site operations such as patches and server restarts" (Security Implementation Guide through v240) — that is the answer to "recover from a maintenance restart" | Defer Sharing Calculations; Automatic Recalculation |
| Ownership data skew | ">10,000 records of an object" owned by one user. Remedies: distribute ownership across a **greater** number of users; if you must concentrate it, **don't assign the user a role**; keep them out of public groups used as sharing-rule sources; if they need a role, put it at the **top** of the hierarchy | Ownership Data Skew (DRAES) |
| runAs and FLS | **Changed, and decks still teach the old rule.** The current page says a runAs block enforces "the user's sharing rules and **object-level and field-level permissions**… regardless of the sharing mode of the test class". The legacy "runAs only enforces record sharing" is no longer what the doc says | Using the runAs Method |
| Apex default access mode | "In API version **66.0 and earlier**, Apex runs in system mode by default… In API version **67.0 and later**, Apex runs in **user mode** by default." Separately, an `@AuraEnabled` class with no sharing keyword "uses a default or implicit value of **with sharing**". Any explanation stating "Apex runs in system mode" flatly is now version-dependent | Secure Apex Classes (LWC) |
| `with sharing` and FLS | "Enforcing sharing rules by using the with sharing keyword **doesn't enforce the user's permissions and field-level security**" | Enforce Sharing Rules |
| Manual share on owner change | "**User managed sharing is removed when the record owner changes**", and "Apex managed sharing **is maintained** across record owner changes" — the discriminator behind every "which share survives a transfer" item | Understanding Sharing |
| Sharing set available objects | The list "excludes: Objects with an org-wide sharing setting of **Public Read/Write**" and "**Custom objects that don't have an account or contact lookup field**" | Create a Sharing Set |
| Sharing set across multiple accounts | "If you created a user from a contact to multiple accounts, you can grant access to all records with a lookup to any accounts related to that contact. Select **Contact.RelatedAccount** and Account respectively" — the declarative answer to "agent works for several partner accounts". **Share groups** (not sharing sets) are what's unavailable to Customer Community Plus and Partner Community licences | Create a Sharing Set |
| Private library files | "Users with **Modify All Data**… However, if the file is in a private library, then **only the file owner** has access to it", and the same sentence again for **View All Data**. A file posted to a record feed is "Privately Shared": owner + Modify All Data or View All Data + record viewers | Who Can See My File? |
| Partner role hierarchy | "The **three** roles in this hierarchy are Partner User, Partner Manager, or Partner Executive", rolling up to the Channel Manager role. Partner users "can view and edit all data owned by or shared with users **below** them in the hierarchy" | Partner User Roles |
| Action overrides per experience | There **is** a separate mobile slot: "Specify the override option for **each user experience**", and the worked example is "a Visualforce page for Salesforce Classic and a Lightning component for Lightning Experience. The **mobile override** specifies the Salesforce Classic override, so mobile users see the Visualforce page." A mobile-only override is therefore configurable — don't reason from "Button overrides affect everywhere that action is available", which is about one experience | Assign Action Overrides |
| ETM vs original Territory Management | Salesforce's comparison table marks **"Share a Report / Dashboard Folder with a Territory" and "Create a Public Group with Territory" as Yes for BOTH**. The genuine ETM-only rows are territory models, territory types/priority, multiple hierarchies, audit trail, Metadata API support, Collaborative Forecasts integration | Comparing Original TM and ETM |
| Preventing edits to encrypted fields | "Use **validation rules, field-level security settings, or page layout settings** to prevent users from editing encrypted fields." Also: encrypted fields "aren't available for use in filters such as list views, reports, roll-up summary fields, and rule filters", which is why they don't appear in criteria-based sharing rule criteria | Classic Encryption for Custom Fields |
| Shield: encrypting existing data | No longer support-only. Self-service sync runs from the **Encryption Statistics and Data Sync** page for standard/custom fields, Attachment Content Body, field history and feed tracking — **once every 7 days**; everything else still needs Salesforce Customer Support | Synchronize Your Data Encryption |
| Site vs Portal user visibility | **Portal** User Visibility = users in the same customer/partner account see each other. **Site** User Visibility = user sharing for authenticated site users, exposing "See other members of this site" per site. Both apply only when the User object's external OWD is **Private** | Control Which Users Site Users Can See |
| List view sharing targets | "List Views can be shared with **All Users, Only Me, or Groups of Users**"; "sharing a List View with a specific **individual user** is not natively supported" — the documented workaround is a public group of one | Share a List View via Public Groups |
| Protected custom settings in a package | In a **managed** package, access "is allowed only through the Apex code that is part of that managed package"; the subscriber can't read it. In an **unmanaged** package they behave like public settings | Protection and Privacy Options for Custom Settings |


## Known dead

Do not re-add these; all look plausible and all 404.

### From the IAM deck repair
Fifteen ids that a review pass produced without rendering them. The pattern is
worth internalising: a real article name with an **invented suffix or namespace**.

- `sf.security_login_flow_overview.htm` → real: `sf.security_login_flow.htm`
- `sf.security_login_forensics.htm` → use `sf.identity_monitor_access.htm`
- `sf.security_auth_policies_session.htm` → use `sf.security_overview_sessions.htm`
- `sf.networks_self_registration.htm` → use `sf.external_identity_self_registration_configure.htm`
- `sf.networks_self_registration_person_accounts.htm` → use `xcloud.external_identity_self_registration_person_accounts.htm`
- `sf.identity_connect_overview.htm` → real: `xcloud.identityconnect_about.htm`
- `sf.networks_exp_cloud_login_branding.htm` → use `sf.external_identity_branding_use_cases.htm`
- `sf.networks_login_page_types.htm` → use `sf.external_identity_login_pages_configure.htm`
- `sf.identity_verification_credits.htm` → use `xcloud.security_sms_identity_verification.htm`
- `sf.networks_users_add.htm` → use `platform.networks_create_external_users.htm`
- `sf.users_license_types_platform.htm` → use `platform.users_understanding_license_types.htm`
- `sf.remoteaccess_token_introspection.htm` → real: `sf.remoteaccess_oidc_token_introspection_endpoint.htm`
- `sf.c360_a_identity.htm` → use `sf.identity_licenses.htm`
- `sf.networks_contactless_users.htm` → use `sf.external_identity_manage_create_contactless_users.htm`
- `…apexcode/apex_classes_ConnectedApp.htm` → real: `…apexref/apex_class_Auth_ConnectedAppPlugin.htm`

### From the IAM answer-verification pass (2026-08-10)

Both are the **atlas apexref** failure mode, and both were the top Google result for
`Auth.RegistrationHandler`. Neither is a 404 — one renders an empty shell, the other
renders the book's table of contents, so only opening them reveals the problem.

- `…/docs/atlas.en-us.apexref.meta/apexref/apex_auth_plugin.htm` — renders a body of
  **15 characters** ("Skip Navigation") with the bare title "Salesforce Developers",
  even after waiting for the client-side render. The article historically lived in the
  `apexcode` book, same migration pattern as the ConnectedAppPlugin entry above.
- `…/docs/atlas.en-us.apexref.meta/apexref/apex_interface_Auth_RegistrationHandler.htm`
  — guessed from the naming convention of its sibling interfaces
  (`apex_interface_Auth_ConfigurableSelfRegHandler.htm` and friends, which are real).
  Answers 200 and renders the **Apex Reference Guide root TOC**, not the interface.
  A plausible-looking id that follows a real convention is still a guess.

A third dead id, and the only one so far that produces the **textbook 404-wearing-a-200**:

- `sf.security_require_two-factor_authentication.htm` — renders "We looked high and low but
  couldn't find that page" in a 633-character body. Note the **hyphen** in `two-factor`.
- The deck's own citation uses **underscores** — `sf.security_require_two_factor_authentication.htm`
  — and that one is **alive**, but it resolves to the general "Multi-Factor Authentication
  for Salesforce Orgs" overview rather than an article matching its id. Fine to cite for
  MFA questions; do not expect a page about *requiring* MFA. One character of difference
  separates a live redirect from a dead link, so copy ids rather than retyping them.

Use instead, both rendered and confirmed:
- **Create an Authentication Provider Registration Handler** — https://help.salesforce.com/s/articleView?id=xcloud.sso_create_registration_handler.htm&language=en_US&type=5
  Carries the sentences that settle the whole Registration Handler cluster: "The
  registration handler creates and updates Salesforce users after they authenticate
  with the identity provider", and for a returning user, "If there is a matching user,
  the registration handler updates the user record with information from the identity
  provider." Note it does **not** contain the method names `createUser`/`updateUser`.
- **Customize the Auth. Provider Apex Class** (Mobile SDK guide) — https://developer.salesforce.com/docs/platform/mobile-sdk/guide/communities-customize-auth-provider.html
  This is where the method names live: `createUser()`, `updateUser()`, `canCreateUser()`,
  and the auto-generated `AutocreatedRegHandlerxxxxxx` class. A newer `/docs/platform/…`
  path, which renders reliably where the atlas ids did not.

### Others

- `https://releasenotes.docs.salesforce.com/en-us/spring20/release-notes/rn_lex_enhanced_related_lists.htm`
- `https://help.salesforce.com/s/articleView?language=en_US&id=release-notes.rn_lex_enhanced_related_lists.htm&release=220&type=5`
- `https://developer.salesforce.com/docs/atlas.en-us.connect_api.meta/connect_api/intro.htm`
  — the Connect REST API guide is under the `chatterapi` book, not `connect_api`. This URL
  renders the bare "Salesforce Developers" shell. Use `…chatterapi/intro_using_chatter_connect.htm`.

### From the Platform App Builder pass (2026-08-11)

All of these render the "We looked high and low but couldn't find that page" shell
behind HTTP 200. Every one is a **namespace guess** — the article exists, but under a
different prefix. Try `sf.`, then `sales.`, then `xcloud.` before concluding an id is
dead, and never cite a `platform.` id you have not opened.

- `help.salesforce.com/s/articleView?id=platform.fields_useful_validation_formulas.htm`
  — the examples live at `platform.fields_useful_field_validation_formulas.htm`; for
  general guidance cite `platform.fields_validation_rules_tips.htm` instead. This one
  was drafted into three findings before being caught by rendering.
- `platform.collab_feed_tracking.htm` — live at `sf.collab_feed_tracking.htm`.
- `platform.faq_data_import_wizard_what_kind_objects.htm` — live at `sf.`.
- `platform.distribution_installing_packages.htm` — live at `sf.`.
- `platform.when_to_use_the_data_loader.htm` — the topic moved out of Help entirely,
  into the Data Loader Guide on developer.salesforce.com.
- `platform.domain_name_overview.htm` and `sf.domain_name_overview.htm` — only the
  `xcloud.` namespace renders My Domain.
- `platform.schema_builder_creating_fields.htm` — the article is
  `sf.schema_builder_elements_fields.htm`.
- `platform.lcc_appexchange_packages_overview.htm` and its `sf.` twin — both dead;
  no replacement found, use `sf.distribution_installing_packages.htm` for AppExchange
  installation claims.
- `platform.flow_concepts_trigger_guidelines.htm` and its `sf.` twin — both dead. For
  flow-consolidation guidance cite the architect decision guide instead.

### From the Platform Developer II deck pass

A different failure mode from the IAM deck's invented ids: most of these were **real
pages that have since been removed or moved between books**. Two of them return HTTP 404
and `check-urls.mjs` catches them; the rest answer 200 and quietly render either the
**book root** or a **different article**, which only opening them reveals.

Hard 404s (caught by `check-urls.mjs`):
- `…/docs/platform/lightning-component-reference/guide/lightning-messages.html` — no such
  page in the new reference format. Cite `lightning-record-edit-form.html`, which states
  where `lightning-messages` goes.
- `…/docs/platform/lwc/guide/create-conditional-rendering.html` → real: `create-conditional.html`
- `…/docs/platform/sf-cli/guide/sf-intro.html` and `…/docs/platform/sfdx-dev/guide/sfdx-dev-intro.html`
  — the DX guide is still under `atlas.en-us.sfdx_dev.meta/sfdx_dev/`.

Silent redirects — **200 with the wrong article**, so only a browser catches them:
- `…lightning.meta/lightning/inspector_storage.htm` → renders **Debugging**. The whole
  Lightning Inspector section is gone from the Aura guide. `inspector_intro.htm` and the
  pinned `atlas.en-us.236.0.lightning.meta/…/inspector_storage.htm` do the same, so
  falling back to an older API version does **not** rescue a removed page.
- `…pages.meta/pages/pages_controller_transient.htm` → renders **Introducing Visualforce**.
  Use the `salesforce_visualforce_best_practices` book's `pages_best_practices_perf_code_view_state.htm`.
- `…pages.meta/pages/pages_static_resources.htm` → real: `pages_resources.htm`
- `…pages.meta/pages/apex_ApexPages_StandardController.htm` → real:
  `apex_ApexPages_StandardController_ctor.htm`, or `apexref/apex_pages_standardcontroller.htm`
- `…pages.meta/pages/pages_js_remoting_config.htm` → use `pages_js_remoting.htm`
- `…apexcode/apex_callouts_remote_site.htm` → real: `apex_callouts_remote_site_settings.htm`
- `…apexcode/apex_flow.htm` → real: `apexref/flow_interview_class.htm`
- `…apexcode/apex_classes_restful_http_testing_wsdl2apex.htm` → real:
  `apexcode/apex_callouts_wsdl2apex_testing.htm`
- `…soql_sosl.meta/soql_sosl/big_object_querying.htm` **and**
  `…bigobjects.meta/bigobjects/big_object_querying.htm` → both fall back to their book
  root. "SOQL with Big Objects" no longer exists in either book; the operator list
  survives only in the 2026 Big Objects Playbook blog post.
- `…object_reference.meta/object_reference/sforce_api_objects_accounthistory.htm` → falls
  back to the book root. Use the Field Reference Guide's
  `sfFieldRef/salesforce_field_reference_AccountHistory.htm`.
- `help.salesforce.com … id=platform.admin_monitorsetup.htm` → real namespace is `sf.`
- `help.salesforce.com … id=platform.code_dev_console_log_inspector.htm` → real:
  `platform.code_dev_console_view_system_log.htm`

The book-root fallback is the pattern to internalise from this deck: a wrong section id
inside a **real** book renders that book's landing page with a plausible title
("Big Objects | Big Objects Implementation Guide"), which reads as success in a tab
listing. Check the `<h1>` and the breadcrumb, not just `document.title`.

Old release-note URLs are the most fragile category — Salesforce reorganises them
between releases. Prefer a current help article over a release note when both
cover the fact.

---

# Verified Databricks documentation

Added 2026-08-15 during the first Databricks pass (Data Engineer Associate, 153 q).
Every URL below was fetched and returned HTTP 200; the ones carrying a decisive fact
were additionally rendered and read.

## Databricks docs behave differently from Salesforce Help — this is the important part

**`docs.databricks.com` returns honest 404s.** An invented article id gets a real
`404` status, unlike `help.salesforce.com`, which answers every id with `200`. So a
plain status check is a *reliable* deadness test here, and URL verification is far
cheaper on this vendor than on Salesforce.

Two caveats that still bite:

- In a **browser** a 404 renders a friendly "We can't find the article you're looking
  for" page with the generic title `Databricks on AWS`, so it *looks* like a soft 404.
  The status underneath is genuinely 404 — check the status, not the rendering.
- A `200` proves the page exists, **not** that it contains your claim. That trap is
  live here: this deck shipped a Delta Live Tables *tutorial* URL as the citation on a
  *table-permissions* question. It renders perfectly and is plainly the wrong page.

Fastest bulk check: open any `docs.databricks.com` page in the browser tool, then
`fetch()` candidate URLs from that origin in a loop — same-origin, so no CORS, and the
final `r.url` shows you where each one redirects.

## Renames and redirects to know

| Old | Now | Notes |
|---|---|---|
| `/dlt/…` | `/ldp/…` | **Delta Live Tables → Lakeflow Declarative Pipelines.** All DLT URLs redirect |
| `/delta-sharing/` | `/opensharing` | |
| `/delta/vacuum`, `/delta/history`, `/delta/clustering`, `/delta/update-schema` | `/tables/…` | The `/delta/` tree largely moved under `/tables/` |
| `/compute/sql-warehouse/serverless` | `/admin/sql/serverless` | |
| `/structured-streaming/` | `/structured-streaming/concepts` | |
| Data Explorer | **Catalog Explorer** | UI rename; decks still say Data Explorer |
| `/connect/external-systems/jdbc` | `/archive/connectors/jdbc` | Redirects into `/archive/` — **don't cite**, it will age out |

Dead guesses that looked plausible and were not real: `/jobs/task-dependencies`
(use `/jobs/configure-task`), `/jobs/schedule` (use `/jobs/triggers`), `/ldp/python-dev`,
`/ldp/sql-ref`, `/sql/language-manual/functions/groupby`, `/tables/write`,
`/notebooks/variable-explorer`, `/optimizations/join-strategies`.

## Settled facts

| Fact | Value | Source |
|---|---|---|
| Job cluster notebook output ceiling | **30 MB**. Distinct from *maximum cell output size*, which **defaults to 10 MB** and is configurable 1–20 MB via `%set_cell_max_output_size_in_mb`. A classic default-vs-ceiling trap | Known limitations of Databricks notebooks |
| Expectation actions | `EXPECT` = warn (invalid rows **written** to target); `EXPECT … ON VIOLATION DROP ROW` = dropped before write, count logged with dataset metrics; `EXPECT … ON VIOLATION FAIL UPDATE` = update fails, manual intervention needed | Manage data quality with pipeline expectations |
| Notebook cell languages | **One language per cell.** A `%python`/`%sql` magic overrides the *whole* cell — it does not mix languages within one | Develop code in Databricks notebooks |
| Auto Loader schema inference | For formats that don't encode types (**JSON, CSV, XML**) all columns infer as **strings**. Samples first **50 GB or 1000 files** | Configure schema inference and evolution in Auto Loader |
| `cloudFiles.schemaEvolutionMode` | `addNewColumns` (default, fails then restarts with new schema), `addNewColumnsWithTypeWidening`, `rescue`, `failOnNewColumns` (fails and does **not** restart), `none` | same |
| `Trigger.Once` | **Deprecated** since DBR 11.3 LTS — use `Trigger.AvailableNow`. `AvailableNow` splits the backlog into **multiple** incremental batches; `Once` uses a single batch | Configure Structured Streaming trigger intervals |
| Intelligent Workload Management (IWM) | **Serverless SQL warehouses only.** Documented as enhancing "Databricks SQL Serverless's ability to process large numbers of queries quickly and cost-effectively". Pro gets Photon + Predictive IO; Classic gets Photon only | SQL warehouse types |
| Unity Catalog lineage retention | **Indefinite** (all lineage captured after 2024-09-01). Not 90 days, not 3 months | Lineage in Unity Catalog |
| Dropping UC tables | **Managed** → metadata *and* underlying data files removed. **External** → metadata only, data files left intact | Work with external tables |
| `TBLPROPERTIES` syntax | Requires parenthesised key-value pairs: `TBLPROPERTIES ('PII' = 'true')`. A bare `TBLPROPERTIES PII` is a **syntax error** — `COMMENT "…"` is what takes a bare string literal | Table properties and table options |
| Notebook debugger | Provides breakpoints, step-by-step execution and a **variable explorer pane**. A breakpoint stops *before* the line runs — it does **not** raise type errors | Debug Databricks notebooks |
| Git folders (Repos) | Now support **merge, rebase, resolve conflicts, reset** in-workspace. Older exam items claiming merge must happen outside Databricks are **stale** | Create and manage Git folders |
| Legacy vs UC grants | `USAGE ON DATABASE` is legacy Hive metastore. Unity Catalog uses `USE CATALOG` / `USE SCHEMA`, plus `SELECT` to read | Privileges reference |
| Control vs compute plane | Control plane = Databricks-managed backend services in the Databricks account (web app). Compute plane = where data is processed; classic runs in the customer's cloud account | High-level architecture |

**Not documented by Databricks**, despite appearing in this deck: any rule of thumb
reading a **CPU-time vs task-time ratio** in the Spark UI. The Spark UI guide diagnoses
slow stages by I/O, small files, skew, spill and slow UDFs, and never frames that ratio.

---

# Verified Salesforce Revenue Cloud documentation

From the salesforce-revenue-cloud pass (2026-08-15). Every URL below was opened in
the browser and confirmed to render the named article.

## The rename that shapes every search

Revenue Cloud is now documented as **"Agentforce Revenue Management (formerly
Revenue Cloud)"**, and its Help articles live in the **`ind.`** namespace. Search
results still surface `sf.` ids for the same titles and **many of those 404** — see
Known dead below. When a `sf.pricing_*` or `sf.product_catalog_*` id fails, try the
`ind.` equivalent before concluding the article is gone.

## How this vendor fails (confirmed by test)

An invented `ind.` article id renders **"We looked high and low but couldn't find
that page"** under the generic title `Salesforce Help | Article`. A real one renders
the article title. So on help.salesforce.com **title alone is a reliable signal** —
but the title lags one call behind `navigate`, so read `document.title` in a
follow-up call, not from the navigate output. Batching across several tabs and
reading titles one call later verifies ~8 URLs per round trip.

`developer.salesforce.com` atlas pages render their title immediately, and a dead
book/section id yields an **empty body** (innerText length ~15) under the generic
title `Salesforce Developers`. `cml_cml_core_concepts.htm` fails this way.

## Settled facts

| Fact | Value | Source |
|---|---|---|
| Place Sales Transaction line items | **1,000** quote line items per quote, 1,000 order products per order; 3,000 line item attributes | Place Sales Transaction (POST) |
| Place Order line items | **300** max, and the API is **deprecated as of API v63.0** in favour of Place Sales Transaction | Place Order (POST) |
| quantityScaleMethod valid values | **Constant** and **Proportional** only — "None" is not a value. Proportional means child qty = parent x child | Product Related Component |
| Products List (POST) inputs | catalogId, categoryId, productClassificationId optional; **priceBookId is Required**. There is **no** productIds property | Products List (POST) |
| Standard context definition | Can only be **extended or cloned**, never edited or deleted. Extend keeps the inheritance link and receives upgrades; clone is a point-in-time copy that does not | Context Definitions |
| Context definition health check | Query ContextDefinition; InheritedFrom should be blank if ClonedFrom is populated. Both populated causes unexpected pricing errors — recreate it | KB 004259656 |
| Pricing procedure inputs | Elements map Input Variables to **context tags**, not raw attributes — an untagged attribute is invisible to the procedure | Use Context Definitions |
| Decomposition Scope | Broad to narrow: **Account, Order, Bundle, Order Line Item**. Order Line Item is the default. A child's scope must not be broader than its parent's | Decomposition Scope |
| Local vs group cardinality | Local = default/min/max **quantity** of one component. Group = min/max **number of child components** | Define Quantity Limits for Bundled Products |
| Activated orders | Once status moves Draft to Activated, items cannot be edited on the order **regardless of permissions** | View and Edit Orders |
| Quote-to-contract popup | Driven by flow rev_contracts__CreateCntrFromQuote, set in Setup > Revenue Settings; admins customize by entering a **different flow API name** | Map a Flow to Capture Quote Line Pricing on Contracts |
| Contract extraction template | Defines **attribute mapping, context mapping, and prompt instructions**; Create Attribute Definition clones ContractsExtractionContext | Create a Contract Extraction Template |
| Asset lifecycle permissions | Separate permission sets per action: **InitiateAmendment API, InitiateCancellation API, InitiateRenewal API**, plus Assetize Order — so one action can be withdrawn without the others | Assign Revenue Management Permission Sets |
| PCM Viewer vs Designer | Viewer = **read**; Designer = **read-write** plus Product Discovery setup. Product Discovery User = use the browsing experience | Assign Revenue Management Permission Sets |
| Migrated assets | Amend/renew/cancel work **only** with assets created through order activation. Migrated or manually created assets may lack the required relationships | Amending, Renewing, and Canceling Assets |
| Pricing Operations Console | **Renamed** to Revenue Cloud Operations Console. Article title is "Monitor and Troubleshoot Pricing Issues" | ind.pricing_operations_console |

## Confirmed URLs — Help (pricing)

- https://help.salesforce.com/s/articleView?id=ind.pricing_use_context_definitions.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.pricing_pricing_procedures.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.pricing_pricing_element.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.pricing_discount_spread_service.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.pricing_subscription_pricing_proration.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.pricing_attribute_based_price.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.pricing_create_bundle_based_adjustments.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.pricing_price_adjustment_matrix.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.pricing_operations_console.htm&language=en_US&type=5

## Confirmed URLs — Help (catalog, configurator, discovery)

- https://help.salesforce.com/s/articleView?id=ind.product_catalog_products.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.product_catalog_qualification_rules.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.product_catalog_change_a_configurable_bundle_product_to_a_static_bundle_product.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.product_catalog_local_cardinality_and_group_cardinality.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.product_configurator_use_the_cml_editor.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.product_configurator_product_configurator_permissions.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?language=en_US&id=ind.product_configurator_configure_bundled_products.htm&type=5
- https://help.salesforce.com/s/articleView?language=en_US&id=ind.qocal_set_up_product_discovery.htm&type=5

## Confirmed URLs — Help (quote, order, asset lifecycle)

- https://help.salesforce.com/s/articleView?id=ind.qocal_manage_assets_in_revenue_lifecycle_management.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.qocal_renew_assets.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.qocal_asset_lifecycle.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.qocal_view_and_edit_orders.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.qocal_manage_orders_in_revenue_lifecycle_management.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.qocal_create_asset_contract_relationship.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.qocal_flow_templates_automate_renewal_opportunity_creation_and_asset_renewal.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.qocal_considerations_syncing_quotes_and_opportunities_in_revenue_cloud.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.qocal_set_up_quote_and_order_features_in_revenue_cloud.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.qocal_setup_tax_engine.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.qocal_quote_to_contract_flow.htm&language=en_US&type=5 (renders as "Map a Flow to Capture Quote Line Pricing on Contracts")
- https://help.salesforce.com/s/articleView?id=ind.transaction_management_essentials.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.order_edit.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sales.cpq_quotes_without_opportunities.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sales.quotes_synch.htm&language=en_US&type=5

## Confirmed URLs — Help (DRO, billing, usage, contracts, setup)

- https://help.salesforce.com/s/articleView?id=sf.dro_decomposition_scope.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.dro_in_flight_order_changes.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.dro_fulfillment_plan_actions_and_information.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.dro_define_how_a_product_decomposes.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.billing.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.billing_credit_memos.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.blng_advance_and_arrears.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?language=en_US&id=sf.blng_invoice_sched.htm&type=5
- https://help.salesforce.com/s/articleView?id=ind.um_define_a_product_usage_grant.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.sf_contracts_create_a_contract_extraction_template_for_extraction.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.sf_contracts_View_the_Standard_ContractsExtractionContext_Mapping.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.sf_contracts_Salesforce_Contracts_Overview.htm&language=en_US
- https://help.salesforce.com/s/articleView?language=en_US&id=ind.revenue_cloud_permission_sets_table.htm&type=5
- https://help.salesforce.com/s/articleView?id=ind.setup_revenue_cloud.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.data_model_overview.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.context_service_context_definitions.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.context_service_add_context_mapping.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.revenue_intelligence_set_up_revenue_management_intelligence.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.revenue_intelligence_install_deploy_rev_intelligence_data_kit.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ind.revenue_management_intelligence_for_revenue_cloud.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=004259656&language=en_US&type=1 (Context Definition Extension Best Practices)
- https://help.salesforce.com/s/articleView?id=004576666&language=en_US&type=1 (New Contract vs Create Contract buttons)

## Confirmed URLs — developer guide

All under https://developer.salesforce.com/docs/atlas.en-us.revenue_lifecycle_management_dev_guide.meta/revenue_lifecycle_management_dev_guide/ unless noted:

- connect_resources_products_list.htm
- connect_resources_product_details.htm
- product_discovery_business_apis.htm
- connect_resources_place_sales_transaction.htm
- connect_resources_place_order.htm
- connect_resources_place_supplemental_transaction.htm
- connect_resources_pricing_process_execution.htm
- connect_responses_product_related_component_output.htm
- sforce_api_objects_asset.htm
- sforce_api_objects_assetstateperiod.htm
- sforce_api_objects_assetstateperiodattribute.htm
- sforce_api_objects_assetactionsource.htm
- sforce_api_objects_assetcontractrelationship.htm
- sforce_api_objects_productusagegrant.htm
- apex_interface_commercetax_TaxEngineAdapter.htm
- cml_what_is_constraint_modeling_language.htm
- cml_cml_best_practices.htm
- cml_constraints.htm
- cml_types.htm

Also confirmed:
- https://developer.salesforce.com/docs/atlas.en-us.industries_reference.meta/industries_reference/context_service_overview.htm
- https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_billingschedule.htm
- https://developer.salesforce.com/docs/platform/data-models/guide/usage-management.html

## Confirmed URLs — Trailhead

All under https://trailhead.salesforce.com/content/learn/modules/:

- product-catalog-management-with-revenue-cloud/get-started-with-product-catalog-management
- product-catalog-management-with-revenue-cloud/create-a-product-bundle
- price-management-with-revenue-cloud/implement-attribute-based-pricing
- price-management-with-revenue-cloud/set-up-bundle-based-pricing
- advanced-price-management-with-revenue-cloud/configure-contract-based-pricing
- advanced-price-management-with-revenue-cloud/set-up-subscription-pricing-with-proration
- asset-lifecycle-management-with-revenue-cloud/manage-customer-asset-amendments
- asset-lifecycle-management-with-revenue-cloud/manage-customer-asset-renewals-and-cancellations
- billing-management-with-revenue-cloud/create-billing-policies-and-treatments
- billing-management-with-revenue-cloud/generate-invoices-revenue
- complex-order-decomposition-and-orchestration-with-revenue-cloud/define-an-order-decomposition
- product-qualification-and-disqualification-with-agentforce-revenue-management/manage-product-visibility
- revenue-cloud-design/set-up-your-product-offerings
- revenue-cloud-design/configure-pricing-for-products
- usage-management-foundations/get-to-know-usage-management
- deep-dive-into-salesforce-contracts/create-update-and-manage-contracts-hoc

## Known dead — from the Revenue Cloud pass (2026-08-15)

All seven were caught by browser verification. Five came from search-result
listings; two were constructed during the pass.

| Dead URL | Replacement |
|---|---|
| sf.pricing_attribute_based_price.htm | ind.pricing_attribute_based_price.htm ("Attribute-Based Discounts") |
| sf.pricing_bundle_based_price.htm | ind.pricing_create_bundle_based_adjustments.htm |
| sf.pricing_price_adjustment_matrix.htm | ind.pricing_price_adjustment_matrix.htm ("Dynamic Pricing With Price Adjustment Matrix") |
| sf.product_catalog_qualification_rules_key_terms.htm | ind.product_catalog_qualification_rules.htm |
| sf.product_catalog_view_and_assign_permission_set_licenses_in_product_catalog_management.htm | dropped; use the permission set table |
| https://www.salesforce.com/company/legal/safe-harbor/ (HTTP 404) | none found — no citable Safe Harbor page |
| trailhead.../modules/salesforce-implementation-strategies (404) | ind.setup_revenue_cloud.htm |

**The lesson worth carrying:** the five `sf.*` ids all appeared as titled results in
web search. Search returning a title is not evidence the URL resolves — for these,
the article had moved to the `ind.` namespace and the old id 404s. Always render.

## Agentforce Specialist — verified 2026-08-17 (full deck pass, 121 questions)

89 URLs, every one loaded in the browser pane and checked for the term it is cited
for. Agentforce content lives under these namespaces, which is the first thing to know
when guessing an id: **ai.** for Agentforce and Einstein generative AI (49 of the 89),
**data.** for Data 360 / retrievers / models (12), **sales.** and **service.** for the
cloud-specific agents (12), **platform.** for Flow (4), **sf.** for older platform
articles that still resolve (6), plus developer.salesforce.com for the Metadata API and
the Agentforce Developer Guide (5).

Dead ids encountered during this pass — do not cite:

| Dead id | Use instead |
|---|---|
| ai.prompt_builder_flex_template.htm | ai.prompt_builder_create_flex_prompt_template.htm |
| platform.flow_ref_elements_actions_outbound_message.htm | platform.workflow_managing_outbound_messages.htm |
| ai.copilot_actions_ref_draft_or_revise_sales_email.htm | ai.copilot_actions_ref_draft_or_revise_email.htm (action renamed) |
| ai.setup_agent_topic_ref_fallback.htm and sf.setup_agent_topic_ref_fallback.htm | ai.agent_reasoning_engine.htm (Off-Topic system subagent) |
| data.c360_a_unstructured_data_chunking.htm | data.c360_a_search_index_ground_ai.htm |
| platform.flow_concepts_type_screen.htm | platform.create_forms_with_screen_flow_components.htm |
| apex_testing_code_coverage.htm | apex_code_coverage_intro.htm |

Full list:

- https://developer.salesforce.com/docs/ai/agentforce/guide/agent-api-variables.html
- https://developer.salesforce.com/docs/ai/agentforce/guide/agent-dx-deploy-metadata.html
- https://developer.salesforce.com/docs/ai/agentforce/guide/mcp.html
- https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_code_coverage_intro.htm
- https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_genaiplannerbundle.htm
- https://help.salesforce.com/s/articleView?id=ai.agent_actions_common_perms.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_asset_filters.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_builder_tour.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_deploy_emp_slack.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_mcp_connect_register.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_parent_deploy.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_reasoning_engine.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_setup_data_sources.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_setup_explore_types.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_testing_center.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_testing_center_considerations.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.agent_user.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.copilot_actions_custom.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.copilot_actions_instructions.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.copilot_actions_ref.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.copilot_actions_ref_answer_questions_with_knowledge.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.copilot_actions_ref_draft_or_revise_email.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.copilot_setup_activate_deactivate.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.copilot_setup_system_messages.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.copilot_utterance_analysis.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.data_library_concept.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.data_library_custom_retriever.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.data_library_select_fields.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.generative_ai_audit_data_mask.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.generative_ai_audit_toxicity.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.generative_ai_audit_trail.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.generative_ai_feedback.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.generative_ai_session_trace_about.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.generative_ai_trust_arch.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_add_flows_with_data_cloud_field_gen.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_best_practices.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_changing_llm_configurations.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_considerations_changeset.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_create_flex_prompt_template.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_create_sales_email_template.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_enable.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_enable_prompt_performance_metrics.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_enable_resolution.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_ground_dmo.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_ground_related_list.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_ground_template.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_limitations.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_override_standard_template.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_standard_prompt_templates.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_standard_template_types.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.prompt_builder_use_multiple_versions.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.service_agent_considerations_1.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.service_agent_email_configuration.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=ai.service_agent_escalation.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_ai_byom_connect_your_external_model_databricks.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_ai_byom_set_up_your_endpoint_databricks.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_ai_foundation_models.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_ai_license_perms.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_ai_retriever_about.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_ai_retriever_create.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_bring_your_own_model.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_hybridsearch_fusion_ranking.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_search_index_ground_ai.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_search_index_rebuild_search_index.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_search_index_reference.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=data.c360_a_unstructured_data_connect_content_document.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=experience.support_add_agent_to_site.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=platform.flow_concepts_trigger_prompt_template_capability.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=platform.flow_distribute_context.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=platform.flow_ref_elements_actions_generate_prompt_response.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=platform.flow_ref_elements_add_prompt.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sales.call_coaching.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sales.call_coaching_setup_insights.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sales.einstein_sales_emails_draft.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sales.sales_agent_sdr_assign_manually.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sales.sales_agent_sdr_intro.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sales.sales_agent_sdr_setup_connect_agent_user_email.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sales.sales_cloud_agents.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=service.cc_generative_ai_work_summaries.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=service.einstein_generative_ai_enable_grounding.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=service.einstein_generative_ai_ground_knowledge.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=service.einstein_generative_ai_grounding_setup.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=service.einstein_replies_intro.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.generative_ai_trust_setup.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.knowledge_setup_users_lex.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.prompt_builder_add_field_gen_to_lightning_record_page.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.prompt_builder_add_merge_fields_sales_email.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.prompt_builder_review_revise.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.salesforce_app_field_gen.htm&language=en_US&type=5

## Salesforce Admin — verified 2026-08-17 (reference repair on 8 questions)

All rendered in the browser pane and grepped for the term each one is cited for.

- **Close Cases** (Notify contact on case close, predefined case close template) — https://help.salesforce.com/s/articleView?id=service.closing_cases.htm&language=en_US&type=5
- **Customize Support Settings** (Case Close Template field) — https://help.salesforce.com/s/articleView?id=sf.customize_supportrules.htm&language=en_US&type=5
- **Controlling Access Using the Role Hierarchy** (Grant Access Using Hierarchies, custom objects only) — https://help.salesforce.com/s/articleView?id=sf.security_controlling_access_using_hierarchies.htm&language=en_US&type=5
- **Schedule-Triggered Flows** — https://help.salesforce.com/s/articleView?id=platform.flow_concepts_trigger_schedule.htm&language=en_US&type=5
- **Outbound Message Actions** ("associated with flows, workflow rules, approval processes") — https://help.salesforce.com/s/articleView?id=platform.workflow_managing_outbound_messages.htm&language=en_US&type=5
- **Visibility Rules on Lightning Pages** — https://help.salesforce.com/s/articleView?id=platform.lightning_page_components_visibility.htm&language=en_US&type=5
- **Restrict Login IP Addresses in Profiles** (Enforce login IP ranges on every request) — https://help.salesforce.com/s/articleView?id=platform.login_ip_ranges.htm&language=en_US&type=5
- **Customize Actions with the Enhanced Page Layout Editor** (Salesforce Mobile and Lightning Experience Actions section) — https://help.salesforce.com/s/articleView?id=sf.adding_actions_using_ple.htm&language=en_US&type=5
- **Use Screen Flows to Interact with Users** — https://help.salesforce.com/s/articleView?id=platform.create_forms_with_screen_flow_components.htm&language=en_US&type=5
- **Set Trusted IP Ranges for Your Org** — still live at the `sf.` id, re-confirmed

### Known dead — from the same pass

| Dead id | Replacement |
|---|---|
| sf.security_sharing_owd_custom_objects.htm | sf.security_controlling_access_using_hierarchies.htm |
| sf.flow_builder_overview.htm (and platform.flow_builder_overview.htm) | platform.create_forms_with_screen_flow_components.htm, where the claim was about screen flows |
| sf.flow_concepts_scheduled_start.htm | platform.flow_concepts_trigger_schedule.htm |
| sf.dynamic_forms_component_visibility.htm | platform.lightning_page_components_visibility.htm |
| sf.security_enforce_ip_ranges.htm | platform.login_ip_ranges.htm |
| sf.customize_page_layouts.htm | sf.adding_actions_using_ple.htm |
| sf.actions_in_lex.htm | platform.actions_in_lex.htm renders, but for an object page layout question sf.adding_actions_using_ple.htm is the page that carries the claim |
| platform.workflow_outbound_messages.htm | platform.workflow_managing_outbound_messages.htm |
| platform.flow_ref_elements_actions_outbound_message.htm | constructed during this pass and dead — never shipped |
| platform.actions_page_layouts.htm | constructed during this pass and dead — never shipped |

**Live but wrong page:** platform.sharing_model_fields.htm renders as
"Organization-Wide Default Access Settings" and never uses the phrase "Grant Access
Using Hierarchies" — failure pattern 11, caught by grepping the rendered text.

---

# Verified Slack documentation

Added 2026-08-18 during the first Slack pass (Slack Consultant, 37 q). First
non-Salesforce, non-Databricks vendor in the repo.

## How this vendor fails — tested, per pattern 4a

**`slack.com/help` fails honestly, like `docs.databricks.com` — not like
`help.salesforce.com`.** Probed a real article against an invented one:

| Probe | Result |
|---|---|
| `.../articles/115001915507-Manage-workspace-access-on-Enterprise-Grid` | HTTP 200, full article body |
| `.../articles/999999999999-Totally-Invented-Article-Slug` | **honest HTTP 404**, no body, no shell |

So a plain status check is reliable and cheap here. No browser rendering needed —
`WebFetch` returns the real article text, unlike Salesforce Help.

**The Slack-specific catch: the URL slug is cosmetic. Resolution is by numeric id
alone.** Fetching `115001915507-Totally-Wrong-Slug-Here` returns the genuine
article, full content, canonical title. Two consequences:

- A citation whose *slug* reads plausibly proves nothing. **Verify by rendered
  title, never by slug.**
- A stale slug is **not** a dead link, so do not "repair" one. Slack renames
  articles under stable ids, and several ids below resolve to titles that differ
  from their slug — `115001915507` is slugged `...-on-Enterprise-Grid` but titles
  itself *"Manage workspace access in an Enterprise organization"*, and
  `115004378828` is slugged `Onboard-your-company-to-Slack` but renders as
  *"Getting started for workspace creators"*.

**Also established this session, and relevant to the queued admin-deck work:**
`help.salesforce.com` is **not verifiable via `WebFetch` from a cloud container**.
The real article `sf.security_networkaccess` and an invented id both return HTTP
200 with the same "Sorry to interrupt / CSS Error" SPA shell — WebFetch does not
execute the SPA, so the two are indistinguishable. Salesforce URL checking still
needs a real browser.

## Settled facts

| Fact | What the documentation says | Article |
|---|---|---|
| Role hierarchy | Every Enterprise org has **exactly one Org Primary Owner**; only they can transfer ownership. **Org Owners** hold the same permissions *except* transferring ownership. **Org Admins** sit below, managing org settings and policies | Types of roles in Slack |
| Workspace Admin and billing | "Workspace Owners can assign Workspace Admins. They help manage members and can perform administrative tasks, but **they can't access the Billing page**" — decisive for the two "no billing access" items | Types of roles in Slack |
| Roles that do **not** exist | Slack documents **no "Guest Admin" and no "User Group Admin" role.** Guests are *Multi-Channel* / *Single-Channel Guest* account types; managing user groups is a permission, not a role | Permissions by role in Slack |
| Legal hold | A **native Enterprise feature**, separate from exporting. Someone with the **Legal Holds Admin** system role places a hold; held content is saved "regardless of retention settings or if members edit or delete any content", then read via JSON export or Discovery API | Create and manage legal holds |
| "Compliance Exports" | **Not current terminology.** The documented export paths are the standard public-channel export, the self-serve data export tool (Business+/Enterprise, covers private channels and DMs), and the **Discovery API** export mechanism (Enterprise) | Guide to Slack import and export tools |
| Channel-creation settings | The only documented control is **which role types** may *create public channels, create private channels, archive, and unarchive*. Workspace settings → Channel Management; Grid org settings → Channel Management Restrictions | Adjust channel management permissions |
| **Not documented: justification-on-create** | No Slack setting requires a member to give a reason or purpose before creating a channel. A deck keying this is asserting an invented capability (pattern 2) | Adjust channel management permissions |
| **Not documented: auto-archive on inactivity** | Archiving is **manual** — individually or in bulk from the channel-management dashboard. Slack documents **no inactivity trigger**. Third-party apps and `admin.conversations.bulkArchive` are the only routes | Use channel management tools |
| **Not documented: channel-creation approval queue** | Slack ships approval queues for **Slack Connect invitations, workspace invitations, and app requests — not channel creation.** A propose-then-approve flow is a process (Workflow Builder, a request channel), not a setting | Adjust channel management permissions |
| IP allowlisting for sign-in | **Slack Help does not document a self-serve IP allowlist restricting where members may sign in from.** The documented network control is proxy-based: insert `X-Slack-Allowed-Workspaces-Requester` / `X-Slack-Allowed-Workspaces` headers, which limit *which workspaces* are reachable, not the caller's network. IP allowlisting in Slack docs is scoped to **app OAuth and SCIM tokens**. Terminology is now "allowlist", not "whitelist" | Approve Slack workspaces for your network |
| Analytics — Channels tab | Documented columns: Created, Workspaces, External organizations, Last active, Total membership, Full members, Guests, Messages posted, Messages posted by members, Members who posted, Members who viewed, Change in members who posted, Reactions added, Members who reacted, Huddles initiated. **On Pro and Business+, public channels only** | Understand the data in your Slack analytics dashboard |
| Analytics — Overview tab | Total members, Claimed members, Monthly active members, Daily/Weekly/Monthly active people, **Messages sent**, **Files uploaded**. Useful when a deck dismisses those as invented — they are real metrics | Understand the data in your Slack analytics dashboard |
| SCIM | Provisions and **deactivates** members and Multi-Channel Guests, syncs profile fields and user groups. Business+ and Enterprise (also Free/Pro with a connected Salesforce org). **ADFS does not support automatic de-provisioning** | Manage members with SCIM provisioning |
| Slack DLP | **Enterprise only.** Scans messages, text-based files and canvases against rules; a DLP Admin chooses whether a rule applies to **Slack Connect conversations**, specific workspaces and conversation types | Slack data loss prevention |
| App approval | Default is that **members can install apps without approval**. Owners enable approval, pre-approve or restrict apps, and appoint App Managers. Slack: "we review all apps in the Slack Marketplace… **Slack doesn't endorse or certify these apps**" — so directory listing and popularity are explicitly not assurance | Manage app approval / Security recommendations for approving apps |
| Grid org vs workspace settings | Org policies control workspace preferences; **a lock icon means the preference is locked by an Org Admin**. Unlocked preferences stay adjustable by Workspace Owners/Admins — the documented basis for "global core settings, regional adjustments" | Manage a workspace in an Enterprise organization |

## Confirmed URLs — all rendered and title-checked 2026-08-18

```
https://slack.com/help/articles/360018112273-Types-of-roles-in-Slack
https://slack.com/help/articles/201314026-Permissions-by-role-in-Slack
https://slack.com/help/articles/115005225987-Manage-a-workspace-on-Enterprise-Grid
https://slack.com/help/articles/115001915507-Manage-workspace-access-on-Enterprise-Grid
https://slack.com/help/articles/4401830811795-Create-and-manage-legal-holds
https://slack.com/help/articles/204897248-Guide-to-Slack-import-and-export-tools
https://slack.com/help/articles/115004988303-Adjust-channel-management-permissions
https://slack.com/help/articles/360047512554-Use-channel-management-tools
https://slack.com/help/articles/217626408-Create-guidelines-for-channel-names
https://slack.com/help/articles/1500000019361-Keep-work-organized-with-channels
https://slack.com/help/articles/360057638533-Understand-the-data-in-your-Slack-analytics-dashboard
https://slack.com/help/articles/212572638-Manage-members-with-SCIM-provisioning
https://slack.com/help/articles/12914005852819-Slack-data-loss-prevention
https://slack.com/help/articles/222386767-Manage-app-approval-for-your-workspace
https://slack.com/help/articles/360001670528-Security-recommendations-for-approving-apps
https://slack.com/help/articles/360000281563-Manage-apps-in-an-Enterprise-organization
https://slack.com/help/articles/360024821873-Approve-Slack-workspaces-for-your-network
https://slack.com/help/articles/115003538426-Troubleshoot-audio-and-video-issues-in-Slack
https://slack.com/help/articles/205138367-Troubleshoot-connection-issues
https://slack.com/help/articles/360001537467-Guide-to-apps-in-Slack
https://slack.com/resources/slack-for-admins/launching-slack
https://slack.com/blog/transformation/teams-to-slack-migration
```

**Two `slack.com/help` pages that did not carry the claim they looked right for**
(pattern 11, caught by grepping the rendered text):

- `360001603387-Manage-Slack-connection-issues` renders fine but **never mentions
  clearing the cache** — it covers app updates, URL allowlisting, WSS domains and
  antivirus. The page that actually documents "Clear Cache and Restart" as step 1
  is `205138367-Troubleshoot-connection-issues`.
- `115004378828-Onboard-your-company-to-Slack` renders as *"Getting started for
  workspace creators"* and covers initial setup only — **no phased rollout, no
  role-tailored training, no refreshers.** For rollout and enablement claims use
  `slack.com/resources/slack-for-admins/launching-slack`.

**Non-help hosts used as citations of record here** — `slack.com/resources/…` and
`slack.com/blog/…` are Slack-authored but are marketing/guidance, not product
documentation. Both render, and both are cited only for process guidance (launch
planning, migration sequencing) that the Help Center does not cover. Prefer a
`slack.com/help` article whenever one exists.

---

# Salesforce Data Architect — verified 2026-08-19 (full deck pass, 135 questions)

## How the doc hosts behave from a cloud container — retested, and one prior claim corrected

The session brief for this pass said `help.salesforce.com` is **not** verifiable via
WebFetch because a real and an invented article both return HTTP 200 with the same
"Sorry to interrupt / CSS Error" SPA shell. That is true of the **body** and false of
the **title**. Tested both ways:

| URL | WebFetch `<title>` |
|---|---|
| `sf.security_networkaccess.htm` (known live) | **"Set Trusted IP Ranges for Your Org \| Salesforce Help"** |
| `sf.flow_builder_overview.htm` (known dead, per CLAUDE.md 4b) | **"We looked high and low but couldn't find that page."** |
| `platform.salesforce_connect_totally_invented_xyz.htm` (invented) | **"We looked high and low but couldn't find that page."** |

So **article existence on help.salesforce.com IS checkable here** — a live article
returns its own title, a dead or invented id returns the 404 sentence. What is *not*
checkable is the body, so **failure pattern 11 stays unresolvable on `type=5` pages**:
you cannot grep the rendered text for the term the citation is meant to support.

**But `type=1` knowledge articles DO return their body.** This is the useful half of the
discovery and it carried three findings in this pass. `type=1` URLs
(`articleView?id=000383595&type=1`, `id=005132112&type=1`) render prose that WebFetch
reads and quotes. `type=5` product-doc URLs return title only.

A **third state** exists and must be treated as unconfirmed, not as live: some help URLs
return the generic title **"Salesforce Help"** with no article name and no 404 sentence.
Seen on `sales.managing_duplicates_overview.htm` (which verified-docs already lists as
confirmed — it may have rotted), `service.entitlements_service_contracts_parent.htm`,
`sf.users_license_types_communities.htm`, `xcloud.security_pe_overview.htm`. Drop these
rather than cite them.

**Policy this pass used, and the next one should:** prefer `developer.salesforce.com`
and `architect.salesforce.com` (both body-verified) for anything a claim rests on; use a
help.salesforce.com `type=5` URL only when its **rendered title itself carries the fact**
(e.g. "Salesforce Connect Support for Reports" proves reports on external objects are
supported); use `type=1` freely, since the body is readable.

### developer.salesforce.com section-id fallback — confirmed again, and it is silent

An invented **guide** id 404s honestly ("Beep boop. That did not compute."). An invented
**section** id inside a real guide silently returns that guide's overview page with the
guide's own title. Confirmed on `ldv_deployments_techniques_using_soql_sosl.htm` and
`ldv_deployments_techniques_deferring_sharing_calculations.htm` — both wrong slugs, both
returned the LDV introduction with plausible on-topic prose. **Always check the returned
title names the section you meant**, not the guide.

The Security Guide has largely **migrated off developer.salesforce.com**:
`securityImplGuide/salesforce_shield.htm`, `security_pe_overview.htm` and
`security_pe_considerations.htm` all now 301 to `help.salesforce.com/.../xcloud.*`,
whose titles do not resolve. Shield facts had to be cited from the product page
`https://www.salesforce.com/platform/shield/`, which renders fully.

`architect.salesforce.com` renders fully and is the best source for governance and
integration-decision material, which has no equivalent in the developer docs.

**Object Reference object pages return the object index with the right title but a
catalog body** — confirmed on Attachment, EventLogFile, Individual,
AccountContactRelation, AuthorizationFormConsent. Do not claim a field-level fact from
one. Workaround that worked: the *same object page in a smaller guide* often renders
(`psc_api/sforce_api_objects_accountcontactrelation.htm` gave the real body).

## Settled facts — large data volumes and data architecture

| Fact | Value | Source |
|---|---|---|
| Ownership data skew — role placement | "a single user owns more than 10,000 records of an object". Mitigation, verbatim: **"Place them in a separate role at the top of the hierarchy."** "Don't move them out of that top-level role to avoid triggering sharing recalculations." "Keep them out of public groups that can be used as the source for sharing rules." Better still, "not assigning the users to a role". **A low role is the worst placement** — every ancestor inherits access to all the records. This moved a key | Ownership Data Skew (DRAES) |
| Parent-child data skew | "a large number of child records (10,000 or more)" on one parent. Its worked example is **"a customer with hundreds of thousands of contacts all assigned to one dummy account"** — i.e. the bucket-account pattern is the *anti*-pattern, not the fix. This moved a key | Parent-Child Data Skew (DRAES) |
| Bucket accounts, if unavoidable | "set up **several** dummy accounts and distribute the contacts among them" — never one. Also "Avoid having any user own more than 10,000 records" and "Distribute child records so that no parent has more than 10,000 child records" | General (LDV) |
| Lookup skew | "a very large number of records are associated to a single record in the lookup object". Documented remedy list includes **"Using a Picklist Field — Replace lookup fields with picklist fields when you have relatively few values and don't need additional related data"** — the citation for every "picklist not lookup for N status values" item | Managing Lookup Skew (SF Developers blog) |
| Skinny tables | **Maximum 200 columns, not 100** — a deck taught 100 and it is wrong. "kept in sync with their source tables when the source tables are modified"; "omit soft-deleted records"; "can't contain fields from other objects"; "**You can't create, access, or modify skinny tables yourself**" — Customer Support creates them, per object, never per report. On custom objects plus Account, Contact, Opportunity, Lead, Case | Skinny Tables (LDV) |
| Index selectivity thresholds | **Standard** indexed field: filter matches <30% of the first million records and <15% of additional records. **Custom** indexed field: <10% of the first million, <5% of additional. AND clauses: indexes apply unless one returns over 20%. OR: all fields must be indexed and together return under 10% | Indexes (LDV) |
| Default indexed fields | RecordTypeId, Division, CreatedDate, Systemmodstamp (LastModifiedDate), Name, Email (contacts and leads), foreign keys (lookup and master-detail), the record Id. Custom indexes not allowed on long text areas, rich text areas, non-deterministic formulas, encrypted text | Indexes (LDV) |
| Load operation speed ranking | "**insert() is fastest, update() is next, and upsert() is next after that**" — the citation for splitting a known-new/known-existing load into insert + update rather than one upsert | Loading Data from the API (LDV) |
| Lock contention during load | "**Group them by parent — group records by the field ParentId in the same batch to minimize locking conflicts.**" Bulk API guide's example: organise AccountTeamMember by AccountId. Serial mode is the *fallback* when parallel still times out — its named triggers are creating users, updating ownership under private sharing, updating user roles, updating territory hierarchies | Loading Data from the API (LDV); General Guidelines for Data Loads |
| Pre-load lean configuration | Documented steps: defer sharing calculations; load with Public Read/Write and configure sharing rules after; establish complex relationships in a later phase; disable **validation rules, workflow rules, assignment rules and triggers**. **Removing custom indexes is NOT among them** — a deck asserted it and no Salesforce page supports it | Loading Data from the API (LDV); Extreme Data Loading Parts 2 and 3 |
| Bulk API batch sizing | "Start with the maximum batch size of 10,000 records." Any operation over **2,000 records** is "a good candidate for Bulk API 2.0". SOAP: "use as many batches as possible—up to 200" | General Guidelines for Data Loads; Loading Data from the API (LDV) |
| PK Chunking | "splits bulk queries on large tables into chunks based on the record IDs". Enable it "when querying tables with **more than 10 million records** or when a bulk query consistently times out". Chunk size 100,000 default, 250,000 max. Header: `Sforce-Enable-PKChunking` | PK Chunking |
| Pre-PK-Chunking extract technique | Still the documented answer when PK chunking is not offered: create an auto-number field with "Generate Auto Number for existing records", add a **numeric formula field** over it (because "you cannot use an index with comparison operators such as '<=' or '>' for the text-based auto-number field"), have Support index it, then extract in ranges. **This moved a key** — an ETL tool alone issues the same unselective query | Extracting Large Data Volumes (LDV) blog |
| Recycle bin | Soft delete: "Deleted items remain in the Recycle Bin for **15 days**". Soft-deleted rows still cost query time because "deleted records have to be excluded from any queries". Bulk API **hard delete** bypasses the bin; use it for deletions of a million or more, and "delete the children first" | Deleting Data (LDV, both pages) |
| Divisions | "a means of partitioning the data of large deployments to reduce the number of records returned by queries and reports". Requires **over one million records in a single object and more than 35 licenses**; enabled by Salesforce Customer Support. A real LDV remedy — do not write it off as a distractor | Divisions (LDV) |
| Defer sharing calculation | Suspends and resumes **group membership calculation and sharing rule calculation**; lets recalculation "run overnight between business days or over a weekend". Needs the defer-sharing-calculation permission. **There is no equivalent for roll-up summary fields** | Defer Sharing Calculation (LDV) |
| Granular locking | Now the **default**, not something an admin enables. Lets "some group maintenance operations to proceed simultaneously if there's no hierarchical or other relationship between the roles or groups involved" — the answer to "Group membership operation already in progress" / "could not acquire lock" during user and territory updates | Group Membership Locking (DRAES) |
| Reporting at LDV | "Minimize the number of: Objects queried in the report, Relationships used to generate the report"; "De-normalize data when practical… Use summarized data stored on the parent record"; "Use report filters that emphasize the use of standard or custom indexed fields"; "Reduce the amount of data by archiving unused records" | Reporting (LDV) |
| SOQL/SOSL at LDV | "If you use two indexed fields joined by an OR in the WHERE clause… **Break the query into two queries and join the results.**" Avoid negative filters; use IN over long OR chains; avoid cross-object formula fields in filters | SOQL and SOSL (LDV) |
| SOSL best practice | Verbatim: "**Use single-object searches for greater speed and accuracy**" and "**Keep searches specific and avoid using wildcards, if possible. For example, search with Michael instead of Mi\***" | Searching (LDV) |
| Extract via API | "Use the getUpdated() and getDeleted() SOAP API to sync an external system with Salesforce at intervals **greater than 5 minutes**"; for over a million records, evaluate Bulk API 2.0's query | Extracting Data from the API (LDV) |
| Big objects | "consistent performance, whether you have 1 million records, 100 million, or even 1 billion". Three named use cases: 360° customer view, auditing and tracking, **historical archive**. Standard (e.g. FieldHistoryArchive) vs custom. Defined "with Metadata API **or in Setup**". Up to 100 per org. No encryption, no transactions, no standard UI. **Reporting: "it's not practical to build reports or dashboards directly from that data"** — extract a subset with Bulk API into a custom object first | Big Objects; Define and Deploy Custom Big Objects; View Big Object Data in Reports and Dashboards; Big Objects Best Practices |
| **Async SOQL is retired** | Summer '23. "You must use the **Bulk API or batch Apex** to query or report on custom Big Objects after your org gets upgraded to the Summer '23 release." Any deck keying Async SOQL for big-object reporting is teaching a dead feature | Salesforce Big Objects Async SOQL Retirement (`000394892`, type=1) |
| **Salesforce Archive is a real product** | Purchasable add-on with automated policies that "regularly offload inactive records, files, and attachments from production" and shrink the storage footprint; archived records can be found, viewed, and restored. **Two deck explanations denied a native archiving feature exists** — that is now a fabricated absence. Distinct from Backup, which is short-term recovery | Data Archiving Solutions (salesforce.com); Find Documentation for Archive Products |
| Data classification field metadata | `securityClassification` (Public, Internal, Confidential, Restricted, MissionCritical), `complianceGroup` (CCPA, COPPA, GDPR, HIPAA, PCI, PII), `businessOwnerUser`, `businessStatus` — all native CustomField attributes. Well-Architected states the practice: "Classify the data in your org by specifying applicable regulations at the field level to capture who the owner is, the sensitivity level, and whether or not the field is currently in use" | CustomField (Metadata API); Compliant (Well-Architected) |
| Lookup delete behaviour | `deleteConstraint`: "**Restrict**—Prevents the record from being deleted if it's in a lookup relationship"; Cascade deletes; SetNull is the default. A **required lookup with Restrict** is how you get referential enforcement while each object keeps its own sharing model — master-detail cannot, because detail records "inherit the master's sharing and security settings" | CustomField (Metadata API); Relationships Among Standard Objects and Fields |
| Product2 and master-detail | Product2 is among the standard objects that **cannot be on the detail side** of a master-detail relationship (with Lead, User, PriceBook2). So a Product hierarchy is a self-referential **lookup** to the parent | Relationships Among Standard Objects and Fields |
| Duplicate rule actions | `actionOnInsert`/`actionOnUpdate` = **Allow** or **Block**. With Allow, `operationsOnInsert`/`operationsOnUpdate` may include **alert** (shows `alertText`, user may continue) and **report** (adds it to the duplicate report). "Prompt the user *and* give me a report" is therefore Allow + alert + report, never Block | DuplicateRule (Metadata API) |
| Field history tracking | "**The default limit is 20 fields per object.**" Data retained 18 months. Tracking ~100 fields is not configurable — it needs a custom object written from a trigger | Salesforce Field History Tracking: Storage Limits (`000383595`, type=1) |
| Universally required field | "must have a value whenever a record is saved within Salesforce, the Lightning Platform **API**, Connect Offline, Salesforce for Outlook, the Self-Service portal, or automated processes". Required *on a page layout* is UI-only and an integration walks straight past it | Considerations for Universally Required Fields |
| Reporting Snapshots | "lets you report on historical data" by saving "tabular or summary report results to fields on a custom object", on a schedule. The native answer to trend reporting plus a purge of detail rows | Report on Historical Data with Reporting Snapshots; AnalyticSnapshot (Metadata API) |
| Salesforce Connect OData callout limits | They exist and they bite: "Depending on your qualified Salesforce organization edition, specific governor limits are in place for number of allowed callouts **per hour and per day**", and exceeding them leaves the org "temporarily unable to access external data sources through Salesforce Connect". A search snippet claiming OData adapters have *no* callout limits is wrong — verify on the type=1 article | Proactive Alert Monitoring: Hourly OData XDS Callouts Limit (`000382494`, type=1) |
| External objects and reports | **Reports on external objects ARE supported** — Salesforce publishes an article titled "Salesforce Connect Support for Reports". Two deck explanations asserted the opposite. Writable external objects also exist ("Writable External Objects in Salesforce Connect"), so "the cross-org adapter is read-only" is likewise unsupported | Salesforce Connect Support for Reports; Writable External Objects in Salesforce Connect |
| Virtualize vs persist | Salesforce's default is virtualization: "**Unless the data absolutely needs to reside in Salesforce, consider data virtualization with Salesforce Connect instead**", because "More data in your organization ultimately leads to larger data volumes, which can adversely affect performance and add technical debt." What forces persistence is Apex and automation — external objects support no Apex triggers | Data Integration decision guide; Apex Considerations for Salesforce Connect External Objects |
| Performance testing the platform | **Not permitted in production**: "Because Salesforce is a multitenant platform, performance testing is not permitted in production environments. Use a full copy sandbox"; "scale tests are only permitted in sandboxes". And it needs prior approval: "Submit an LAP request for approval **at least one week before the testing date**… All tests must be pre-approved. Unapproved testing is subject to throttling or blocking", with a test plan document, dates, sandbox org id, scenario and justification | Salesforce Performance and Scale Test FAQs (`000387059`, type=1); Introduction to Performance Testing (blog) |
| FOR UPDATE | "use FOR UPDATE to lock sObject records while they're being updated in order to prevent race conditions and other thread safety problems"; while locked "no other client or user is allowed to make updates either through code or the Salesforce user interface" | Locking Records |
| Data.com is retired | Data.com appears in Salesforce's Past Product & Feature Retirements list, and `sf.data_dot_com_clean_implementing.htm` now 404s. **Four questions in this deck key Data.com Clean**; one of them has no correct answer left | Salesforce Past Product & Feature Retirements (`005132112`, type=1) |
| Batch Apex error reporting | "If you specify Database.Stateful in the class definition, you can maintain state across these transactions", and the page's own sample sends a `Messaging.SingleEmailMessage` from `finish()` — one citation covers both halves of "email the business when the job fails" | Use Batch Apex |
| Daily API request allocation | Developer Edition 15,000; Enterprise/Professional/Unlimited/Performance "100,000 + (number of licenses x calls per license type) + purchased API Call Add-Ons"; Full sandbox 5,000,000 | API Request Limits and Allocations |

## Confirmed URLs — Large Data Volumes best-practices guide

All rendered and title-checked. The guide is the highest-yield source for this
certification: nine of its sections carried more than half this deck.

- **Introduction** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_introduction.htm
- **Indexes** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_infrastructure_indexes.htm
- **Skinny Tables** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_infrastructure_skinny_tables.htm
- **Divisions** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_infrastructure_divisions.htm
- **Techniques for Optimizing Performance** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_techniques_for_performance.htm
- **Defer Sharing Calculation** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_techniques_deferred_sharing_calculation.htm
  Note the slug: `techniques_deferred_sharing_calculation`, not `techniques_deferring_…` (that one silently falls back to the intro).
- **Using Mashups** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_techniques_using_mashups.htm
- **Deleting Data (technique)** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_techniques_deleting_data.htm
- **Best Practices (index)** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices.htm
- **Reporting** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices_reporting.htm
- **Loading Data from the API** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices_api_loading_data.htm
- **Extracting Data from the API** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices_api_extracting_data.htm
- **SOQL and SOSL** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices_soql_and_sosl.htm
- **Searching** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices_searching.htm
- **Deleting Data (best practice)** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices_deleting_data.htm
- **General** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_best_practices_general.htm

## Confirmed URLs — Designing Record Access for Enterprise Scale (DRAES)

Short guide, entirely on point for skew and locking. Not previously used in this repo.

- **Ownership Data Skew** — https://developer.salesforce.com/docs/atlas.en-us.draes.meta/draes/draes_group_membership_data_skew.htm
- **Parent-Child Data Skew** — https://developer.salesforce.com/docs/atlas.en-us.draes.meta/draes/draes_object_relationships_parent_child_data_skew.htm
- **Group Membership Locking** — https://developer.salesforce.com/docs/atlas.en-us.draes.meta/draes/draes_group_membership_locking.htm

## Confirmed URLs — big objects, metadata, and platform reference

- **Big Objects** — https://developer.salesforce.com/docs/atlas.en-us.bigobjects.meta/bigobjects/big_object.htm
- **Define and Deploy Custom Big Objects** — https://developer.salesforce.com/docs/atlas.en-us.bigobjects.meta/bigobjects/big_object_define.htm
- **View Big Object Data in Reports and Dashboards** — https://developer.salesforce.com/docs/atlas.en-us.bigobjects.meta/bigobjects/big_object_query_and_report.htm
- **Big Objects Best Practices** — https://developer.salesforce.com/docs/atlas.en-us.bigobjects.meta/bigobjects/big_object_considerations.htm
- **SOQL with Big Objects** — https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/big_object_querying.htm
- **CustomField (Metadata API)** — https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/customfield.htm
  Carries `deleteConstraint`, `externalId`, `unique`, and all four data-classification attributes. One of the most reusable pages in the whole repo.
- **DuplicateRule (Metadata API)** — https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_duplicaterule.htm
- **FieldSet (Metadata API)** — https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_fieldset.htm
- **Custom Metadata Types (CustomObject)** — https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_custommetadatatypes.htm
- **AnalyticSnapshot (Metadata API)** — https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_analyticsnapshot.htm
- **CustomObject (Metadata API)** — https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/customobject.htm
- **Relationships Among Standard Objects and Fields** — https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/relationships_among_objects.htm
- **External Objects (Object Reference)** — https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_external_objects.htm
- **Geolocation Compound Field** — https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/compound_fields_geolocation.htm
- **AccountContactRelation (Public Sector guide)** — https://developer.salesforce.com/docs/atlas.en-us.psc_api.meta/psc_api/sforce_api_objects_accountcontactrelation.htm
  The Object Reference copy renders a catalog; this one renders the real body, including the `IsDirect` direct/indirect flag.
- **Privacy Consent Data Model** — https://developer.salesforce.com/docs/platform/data-models/guide/privacy-consent.html
- **PK Chunking** — https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/async_api_headers_enable_pk_chunking.htm
- **General Guidelines for Data Loads** — https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/asynch_api_planning_guidelines.htm
- **Outbound Messaging (SOAP API)** — https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_om_outboundmessaging.htm
- **Locking Records (FOR UPDATE)** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_locking_records.htm
- **Use Batch Apex** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_batch_interface.htm
- **Triggers** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers.htm
- **Triggers and Order of Execution** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm
- **Apex Considerations for Salesforce Connect External Objects** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_external_objects_considerations.htm
- **Writable External Objects (Apex)** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_connector_external_objects_writeable.htm
- **Get Started with the Apex Connector Framework** — https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_connector_start.htm
- **API Request Limits and Allocations** — https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet/salesforce_app_limits_platform_api.htm
- **Analytics External Data API overview** — https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_ext_data.meta/bi_dev_guide_ext_data/bi_ext_data_overview.htm

## Confirmed URLs — Salesforce Developers blogs (body renders in full)

- **Extracting Large Data Volumes (LDV) in Force.com** — https://developer.salesforce.com/blogs/engineering/2013/06/extracting-large-data-volume-ldv-in-force-com
- **Managing Lookup Skew to Avoid Record Lock Exceptions** — https://developer.salesforce.com/blogs/engineering/2013/04/managing-lookup-skew-to-avoid-record-lock-exceptions
- **Extreme Force.com Data Loading, Part 1: Tune Your Data Model** — https://developer.salesforce.com/blogs/engineering/2013/02/extreme-salesforce-data-loading-part-1-tune-your-data-model
- **Extreme Force.com Data Loading, Part 2: Loading into a Lean Salesforce Configuration** — https://developer.salesforce.com/blogs/engineering/2013/04/extreme-force-com-data-loading-part-2-load-into-a-lean-salesforce-configuration
- **Extreme Force.com Data Loading, Part 3: Suspending Events that Fire on Insert** — https://developer.salesforce.com/blogs/engineering/2013/05/extreme-force-com-data-loading-part-3-suspending-events-that-fire-on-insert
- **Introduction to Performance Testing** — https://developer.salesforce.com/blogs/2020/09/introduction-to-performance-testing

## Confirmed URLs — architect.salesforce.com (renders fully)

- **Compliant | Trusted | Well-Architected** — https://architect.salesforce.com/well-architected/trusted/compliant
  The only rendered Salesforce source found for data governance practice: field-level classification, data dictionaries, security matrices, stakeholder involvement. Carried every governance-judgment item in this deck.
- **Data Integration decision guide** — https://architect.salesforce.com/decision-guides/data-integration
  The virtualize-before-you-persist statement.

## Confirmed URLs — help.salesforce.com, type=1 (body readable)

- **Enable the 'Create Audit Fields' Permission in Salesforce** — https://help.salesforce.com/s/articleView?id=000213290&language=en_US&type=1
- **Salesforce Field History Tracking: Storage Limits and Data Retention** — https://help.salesforce.com/s/articleView?id=000383595&language=en_US&type=1
- **Salesforce Past Product & Feature Retirements** — https://help.salesforce.com/s/articleView?id=005132112&language=en_US&type=1
- **Salesforce Big Objects Async SOQL Retirement** — https://help.salesforce.com/s/articleView?id=000394892&language=en_US&type=1
- **Salesforce Performance and Scale Test FAQs** — https://help.salesforce.com/s/articleView?id=000387059&language=en_US&type=1
- **Proactive Alert Monitoring: Hourly OData XDS Callouts Limit** — https://help.salesforce.com/s/articleView?id=000382494&language=en_US&type=1

## Confirmed URLs — help.salesforce.com, type=5 (title verified, body NOT readable)

Cite these only where the article **title itself** carries the fact.

- **Salesforce Connect** — https://help.salesforce.com/s/articleView?id=platform.platform_connect_about.htm&language=en_US&type=5
- **Salesforce Connect Support for Reports** — https://help.salesforce.com/s/articleView?id=platform.platform_connect_considerations_reports.htm&language=en_US&type=5
- **Cross-Org Adapter for Salesforce Connect** — https://help.salesforce.com/s/articleView?id=platform.xorg_adapter_about.htm&language=en_US&type=5
- **Writable External Objects in Salesforce Connect** — https://help.salesforce.com/s/articleView?id=sf.platform_connect_considerations_writable_external_objects.htm&language=en_US&type=5
- **General Limits for Salesforce Connect OData Adapters** — https://help.salesforce.com/s/articleView?id=sf.odata_general_limits.htm&language=en_US&type=5
- **Export Backup Data from Salesforce** — https://help.salesforce.com/s/articleView?id=xcloud.admin_exportdata.htm&language=en_US&type=5
- **Report on Historical Data with Reporting Snapshots** — https://help.salesforce.com/s/articleView?id=analytics.data_about_analytic_snap.htm&language=en_US&type=5
- **Custom Metadata Types** — https://help.salesforce.com/s/articleView?id=platform.custommetadatatypes_overview.htm&language=en_US&type=5
- **Geolocation Custom Field** — https://help.salesforce.com/s/articleView?id=platform.custom_field_geolocate_overview.htm&language=en_US&type=5
- **Considerations for Universally Required Fields** — https://help.salesforce.com/s/articleView?id=platform.fields_universally_required_field_considerations.htm&language=en_US&type=5
- **Considerations for Using Person Accounts** — https://help.salesforce.com/s/articleView?id=sales.account_person_behavior.htm&language=en_US&type=5
- **Store Customers' Data Privacy Preferences** — https://help.salesforce.com/s/articleView?id=platform.individuals_store_data_privacy.htm&language=en_US&type=5
- **User Licenses** — https://help.salesforce.com/s/articleView?id=platform.users_understanding_license_types.htm&language=en_US&type=5
- **Find Documentation for Archive Products** — https://help.salesforce.com/s/articleView?id=xcloud.archive_o_overview.htm&language=en_US&type=5
- **Restrict Login IP Addresses in Profiles** — https://help.salesforce.com/s/articleView?id=platform.login_ip_ranges.htm&language=en_US&type=5
- **Set Trusted IP Ranges for Your Org** — https://help.salesforce.com/s/articleView?id=sf.security_networkaccess.htm&language=en_US&type=5

## Confirmed URLs — salesforce.com and AppExchange (render fully)

- **Salesforce Shield** — https://www.salesforce.com/platform/shield/
  Names Event Monitoring (including Transaction Security Policies that "automatically block risky user actions, and prevent data loss"), Platform Encryption, Field Audit Trail, Data Detect. The developer Security Guide pages for Shield now redirect into unreadable help URLs, so this is the citable source.
- **Data Archiving Solutions / Salesforce Archive** — https://www.salesforce.com/platform/data-archiving-solutions/
- **Data Quality Analysis Dashboards (Salesforce Labs, free)** — https://appexchange.salesforce.com/appxListingDetail?listingId=a0N300000016cshEAA

## Known dead — from the Data Architect pass (2026-08-19)

Each returned "We looked high and low but couldn't find that page." unless noted.

- `platform.platform_connect_cross_org.htm` — the cross-org adapter lives at `platform.xorg_adapter_about.htm`
- `platform.duplicate_management_overview.htm`
- `platform.account_person.htm` — Person Accounts material is under `sales.account_person_*`
- `sf.data_dot_com_clean_implementing.htm` — dead, and useful evidence that Data.com Clean is retired
- `sf.flow_builder_overview.htm` — re-confirmed dead, matching CLAUDE.md 4b
- `platform.security_transaction_security_intro.htm`
- `platform.salesforce_connect_totally_invented_xyz.htm` — the deliberate control

**Returned the generic title "Salesforce Help" — treat as unconfirmed, do not cite:**
`sales.managing_duplicates_overview.htm` (listed as confirmed earlier in this file — it
may have rotted; re-check before reusing), `sf.consent_mgmt_fields.htm`,
`service.entitlements_service_contracts_parent.htm`,
`service.console2_assign_service_feature_license.htm`,
`sf.users_license_types_communities.htm`, `platform.users_license_types_communities.htm`,
`data.c360_a_data_governance.htm` (rendered as "Govern and Secure", not the expected
title), `xcloud.security_pe_overview.htm`, `xcloud.real_time_event_monitoring.htm`,
`release-notes.rn_api_async_soql.htm`, knowledge articles `000318293` and `000335652`.

**developer.salesforce.com slugs that silently fell back to a guide overview** — the
dangerous failure, since the returned prose is real and on-topic:
`ldv_deployments_techniques_using_soql_sosl.htm`,
`ldv_deployments_techniques_deferring_sharing_calculations.htm`,
`ldv_deployments_best_practices_loading_data_from_the_api.htm`,
`apex_metadata_custom_metadata_types.htm`, `apex_classes_email_outbound.htm`,
`meta_transactionsecuritypolicy.htm`, `real_time_event_monitoring.htm`,
`transaction_security_policies.htm`, `salesforce_app_limits_platform_objects.htm`,
`salesforce_app_limits_external_data.htm`, `sforce_api_objects_transactionsecuritypolicy.htm`.

**Redirected off developer.salesforce.com into unreadable help pages:**
`securityImplGuide/salesforce_shield.htm`, `securityImplGuide/security_pe_overview.htm`,
`securityImplGuide/security_pe_considerations.htm`,
`securityImplGuide/tracking_field_history.htm`. The Security Guide has moved to
`help.salesforce.com/.../xcloud.*`.
