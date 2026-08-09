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

Old release-note URLs are the most fragile category — Salesforce reorganises them
between releases. Prefer a current help article over a release note when both
cover the fact.
