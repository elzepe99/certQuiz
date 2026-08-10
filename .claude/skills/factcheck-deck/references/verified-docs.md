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
| Validation rules and multiple errors | "When one validation rule fails, Salesforce continues to check other validation rules on that field or other fields on the page and **displays all error messages at once**." This is what makes *validation rules* — not client-side JS — the answer to "show more than one error on a `lightning-record-edit-form`" | Validation Rule Considerations |
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
| Static resources | **5 MB** per resource, **250 MB** per org — its own allocation. Documented benefits: `$Resource` by name instead of hard-coded ids, a `.zip`/`.jar` archive of related files, and relative paths between files inside an archive. **Not** automatically minified | Using Static Resources |
| Visualforce GET order of execution | Controller/extension constructors → custom components created, *their* constructors, then their attribute expressions → `assignTo` attributes → page expressions, `<apex:page action>`, other getters/setters → view state created if `<apex:form>` → HTML sent. Custom-component evaluation comes **before** the page's own expressions and action attribute | Order of Execution for Visualforce Page Get Requests |
| Opportunity.ContactId | **It exists.** A standard, read-only field holding the primary contact, derived from the OpportunityContactRole. Any explanation asserting "Opportunity has no ContactId field" is wrong — the reason to reject a ContactId-based query is that it returns one primary contact, not the Account's contacts | Opportunity (Object Reference) |
| Queueable chaining inside a test | **Real behaviour, no longer documented.** "You can't chain queueable jobs in an Apex test" was removed from the Queueable Apex page and from the Queueable interface reference; only third-party sources still state it. What the current page *does* document is that only **one job can be enqueued from an executing job**, and the `Test.startTest`/`stopTest` pattern. Treat `Test.isRunningTest()` guards around a chained enqueue as correct but **cite the enqueue limit, not a chaining-in-test sentence** — there isn't one to cite | Queueable Apex |
| Lightning Inspector docs | **Removed from the Aura guide.** `lightning/inspector_*.htm` now redirects to the Debugging intro, including pinned old-version URLs. The Storage tab (client-side cache of storable actions) is still described in the Salesforce Developers blog post introducing the Inspector | Introducing the Salesforce Lightning Inspector |

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

### Others

- `https://releasenotes.docs.salesforce.com/en-us/spring20/release-notes/rn_lex_enhanced_related_lists.htm`
- `https://help.salesforce.com/s/articleView?language=en_US&id=release-notes.rn_lex_enhanced_related_lists.htm&release=220&type=5`
- `https://developer.salesforce.com/docs/atlas.en-us.connect_api.meta/connect_api/intro.htm`
  — the Connect REST API guide is under the `chatterapi` book, not `connect_api`. This URL
  renders the bare "Salesforce Developers" shell. Use `…chatterapi/intro_using_chatter_connect.htm`.

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
