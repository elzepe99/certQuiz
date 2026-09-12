# Salesforce Certified Platform Administrator — Study Guide

**Built from the 154 questions in `salesforce_admin_questions.json`, cross-checked against the
official exam outline and the documentation those questions cite.**

Every fact below traces to a rendered Salesforce page (see [Sources](#15-sources)) or to this
deck's own fact-check pass. This guide runs the opposite way from the others in this repo: the
exam is aligned to **Summer '25**, which is *newer* than most of the deck, so the risk is not
that the exam still tests retired features — it is that the deck still keys some. [§12 Where
the deck is older than the exam](#12-where-the-deck-is-older-than-the-exam) lists every case.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Salesforce Certified **Platform** Administrator |
| Content | **60 scored** multiple-choice / multiple-select questions + up to 5 unscored |
| Time | **105 minutes** (1 min 45 s per question) |
| Passing score | **68%** (English) → you need **41 of 60**; 65% for the Japanese version |
| Prerequisite | None |
| Fee | US$200 (retake US$100) |
| **Release alignment** | **Summer '25** |

**The alignment row cuts the other way on this exam.** Summer '25 means the item bank
post-dates the end of support for Workflow Rules and Process Builder, the rename of Critical
Updates to Release Updates, the rename of 2FA to MFA, and the arrival of Agentforce as its own
**8% domain**. The outline's Automation domain lists flows, approval processes and assignment
rules — Workflow Rules and Process Builder are not on it. When a deck item keys Process Builder,
the same stem on the real exam will key **Flow**.

Pacing: 105 minutes for 60 questions is tight compared with the architect exams, but the stems
are short. The pattern is a company name, one sentence of situation, one sentence of
requirement, and four features that all exist. The skill is matching the requirement's
**verb** — restrict, route, notify, escalate, prevent, prompt, report — to the one feature
built for it.

---

## 2. Where the points actually are

Official outline weightings against the deck. The deck came tagged with the **previous**
outline's seven categories — "Workflow and Process Automation" instead of "Automation", and no
Agentforce bucket even though seven Agentforce items sit inside "Service and Support" — so the
column below is an independent re-classification of all 154 questions
(`study-guides/reclassify-admin.mjs` holds the per-question calls).

| Domain | Weight | ≈ Questions | Deck | Verdict |
|---|---:|---:|---:|---|
| Configuration and Setup | 15% | ~9 | 33 (21.4%) | over-represented |
| Object Manager and Lightning App Builder | 15% | ~9 | 27 (17.5%) | about right |
| Sales and Marketing Applications | 10% | ~6 | 18 (11.7%) | about right |
| Service and Support Applications | 10% | ~6 | 15 (9.7%) | about right |
| Productivity and Collaboration | 10% | ~6 | 8 (5.2%) | **under-trained** |
| Data and Analytics Management | 17% | ~10 | 17 (11.0%) | **under-trained** |
| Automation | 15% | ~9 | 29 (18.8%) | over-represented |
| Agentforce | 8% | ~5 | 7 (4.5%) | **under-trained** |

### The gap you need to close

**Data and Analytics is the exam's largest domain and the deck's weakest.** Seventeen percent of
the exam — about ten questions — against 11% of the deck, and the deck's 17 items are almost
all dashboards and folders. The objective's other halves — import, export and backup;
**duplicate and matching rules**; **report types, joined reports and cross filters** — have
no item at all. Productivity and Collaboration (mobile app, Chatter, activities, AppExchange)
and Agentforce are each about half-covered.

Reading all 154 against the outline's sub-objectives, **ten have no deck item**:

1. **Duplicate rules and matching rules** — named under Data and Analytics.
2. **Data Export**, backup and archival.
3. **Report types** — with / without related records, renaming fields — plus **joined reports**
   and **cross filters**.
4. Dashboard options beyond running user and filters: **subscriptions, scheduled refresh, the
   org limits, View Dashboard As**.
5. **Territory management**, forecasting mechanics, and Einstein for Sales beyond Opportunity
   Scoring.
6. The **default workflow (automation) user**.
7. **Schema Builder** and the implications of **deleting fields**.
8. Agentforce **security, agent-permission troubleshooting, installing prompts, and
   conversation-preview testing**.
9. **Campaign** mechanics — member statuses, hierarchies.
10. Salesforce **mobile app branding** and the app menu.

[§7](#7-the-under-trained-10-productivity-and-collaboration), [§8](#8-the-under-trained-17-data-and-analytics)
and [§10](#10-the-under-trained-8-agentforce) cover those from the documentation.

### What the deck's 154 do rehearse well

Sharing and security controls (OWD, sharing rules, profiles vs permission sets, login
restrictions — 20+ items), object relationships and field behaviour (12), the case toolkit
(assignment, auto-response, escalation, queues — 10), and Flow selection (12). If you know why
each of those items is keyed the way it is, the Configuration, Object Manager and Automation
domains are covered.

---

## 3. Configuration and Setup

### Company settings

| Setting | Where | What the exam asks |
|---|---|---|
| Org ID, edition, instance, **licences** | **Company Information** → User Licenses, Permission Set Licenses, Feature Licenses related lists | "What have we bought and how many are free?" (`0eb39a7c`) |
| **Default language, locale, time zone, currency** | Company Information | Global team setup: default language and currency locale (`14bbd3a3`); users override locale, language and time zone on their own record |
| **Fiscal year** | Company Settings → Fiscal Year | **Standard** = 12 Gregorian months starting in *any* month (`cbd180d3`); **Custom** = 4-4-5, 13-period, week-based structures — irreversible |
| **Multiple currencies** | Company Settings → Manage Currencies | Irreversible; corporate currency + conversion rates; **Advanced Currency Management** adds dated rates for opportunities only |
| **Business hours** and holidays | Company Settings → Business Hours | One set per time zone (`1ae04c79`); used by escalation rules, entitlements and milestones; one default set |
| Currencies, fiscal year, business hours together | **Company Settings** (`ce311cff`) | |

### Declarative user interface

- **App Manager** builds Lightning apps: navigation items, **console navigation** for
  multi-record work (`2085c46e`), utility bar, branding, assigned profiles; the **app menu**
  order is set there too.
- **Rename Tabs and Labels** changes what a standard object or field is *called* everywhere —
  Account Type → Tier — without creating a field (`177095a2`).
- **List views** filter and sort records; visibility is *me / all users / groups*; the
  **Kanban** view drags records between stages (`53e999c6`); inline editing.
- **Global actions** live on the global publisher layout (Home, Chatter, the mobile action
  bar); **object-specific quick actions** on the object's page layout, in the **Salesforce
  Mobile and Lightning Experience Actions** section (`0cadd1e2`, `6c8c7013`).
- **Lightning App Builder** builds record, app and home pages (`fbfd7a7a`); **component
  visibility filters** show or hide components by field value, profile, permission or device
  (`b8b50c29`, `9938615c`); a page is activated as **org default, app default, or per app +
  record type + profile** (`1c029e7f`); Dynamic Forms put fields on the page as components.
- **Path** on any object with a picklist "stage" field: key fields and guidance per stage.

### Users, licences, and what you cannot do to them

- **Username**: unique across **every** Salesforce org, email-format but need not be a real
  mailbox (`eb7e2558`); up to 80 characters.
- **Licences**: Salesforce (full CRM), Salesforce Platform (custom apps + accounts/contacts),
  Identity, Chatter Free / External, Experience Cloud licences; **feature licences** (Marketing
  User, Knowledge User, Service Cloud User…) are checkboxes on the user record — the
  **Marketing User** checkbox is what allows campaign management (`c2a95184`); **permission set
  licences** gate add-ons.
- **Users are never deleted.** Deactivate them; **freeze** first when you need to block login
  immediately but keep the licence assigned until clean-up is done (`c6364b77`).
- **What blocks deactivation** (`98a15ab1`, `ab489b08`): the user is named in an active case
  **assignment or escalation rule**, is the value of a **custom hierarchy field**, is the sole
  recipient of a **workflow email alert**, or is the default workflow / lead / case owner.
- **What deactivation does**: keeps record ownership and history, but **permanently deletes the
  user's manual shares** — a rehired rep on a reactivated record does not get them back
  (`154ff957`). Deactivated users still count until the licence is freed.
- **Locked out**: click **Unlock** on the user record, or reset the password — resetting a
  locked-out user's password unlocks the account automatically (`cea6caee`, `be16cc1a`); after
  a reset the user may have to **activate their device**. SSO users cannot use the forgot-password
  link.
- **Log in as another user** (Login Access Policies) is how you *reproduce* a user's error
  (`bd1a9ddf`); **Login History** (6 months, 20,000 rows on screen) is how you *diagnose* a
  failed login by its status code (`6caa5c2f`).

### Organization security controls

| Control | Where | Effect |
|---|---|---|
| **Login hours** and **login IP ranges** | Profile | Login outside them is **denied** (`75a6edb8`); IP ranges can also be set org-wide, and **Enforce login IP ranges on every request** extends them to API calls (`242c27b9`) |
| **Trusted IP ranges** | Network Access | Skip identity verification from inside; do not block |
| **Password policies** | Password Policies / profile | Expiration, history, length, **complexity**, **maximum invalid attempts**, lockout period, question requirement (`c39b0409`) |
| **Multi-factor authentication** | Identity Verification / user permissions | Authenticator app, security key or built-in authenticator (`e713e780`); **email and SMS codes are not MFA**; the API-login permission makes Data Loader require a code and walks the user through enrolling an authenticator (`76248f85`) |
| **Session settings** | Session Settings | Timeout (default 2 h), lock to IP, force logout, caching on login page |
| **Setup Audit Trail** | View Setup Audit Trail | Who changed what in Setup; **180 days** (`59a0fdfe`) |
| **Health Check** | Health Check | Grades settings against a baseline; **Fix Risks** applies the baseline (`51f47a9e`) |
| **Release Updates** | Release Updates | Test in a **sandbox** before the enforcement date (`532479a7`, which still says "critical update") |
| **My Domain** | My Domain | Every org has one; redirect policy for old bookmarks — **redirect with a warning** for a grace period (`b0427160`); the login URL changes for everyone (`67375ad1`) |

### The sharing model — who can see which record

1. **Organization-wide defaults** set the floor per object: Private, Public Read Only, Public
   Read/Write, Public Read/Write/Transfer (leads, cases), Controlled by Parent (contacts,
   detail objects). External OWDs separately. Private is the setting that makes "each user sees
   only their own" true, including on reports (`bb27462f`).
2. **Role hierarchy** opens records upward — unless **Grant Access Using Hierarchies** is
   unchecked, which is possible **only for custom objects** and is how a manager is kept out of
   feedback about themselves (`a8d31e32`).
3. **Sharing rules** open records sideways: **owner-based** (records owned by role/group X →
   role/group Y, `c4eb0512`) or **criteria-based**; grant Read Only or Read/Write; to public
   groups, roles, roles and subordinates, territories. Up to 300 per object, 50 of them
   criteria-based. The answer for "VP needs to report across branches of the hierarchy"
   (`a72edbf1`) and for collaborative deals under a Private OWD together with the role
   hierarchy (`9f08b9dc`).
4. **Teams** — account, opportunity and case teams — share a single record with a working
   group; **default account teams** are added automatically to accounts the user owns
   (`dcc3ab15`).
5. **Manual sharing** — the owner or anyone above them shares one record; via **Sharing**
   (Classic) or the **Sharing Hierarchy** view in Lightning; lost on owner change and on
   deactivation.
6. **Public groups** bundle users, roles and other groups for rules, folders and list views.
7. **Report and dashboard folders** have their own sharing (View / Edit / Manage), which does
   not cascade (`91817bb4`).
8. **Restriction rules** and scoping rules narrow what a user sees below what sharing would
   grant (Enterprise+).

Sharing controls **records**. What a user can *do* comes from the object permissions below.

### Profiles vs permission sets

| | Profile | Permission set / group |
|---|---|---|
| Per user | Exactly **one** | Any number, additive |
| Holds | Object CRUD, FLS, tab and app visibility, record type and page layout **defaults**, **login hours / IP ranges**, session settings, system permissions | Object CRUD, FLS, tabs, apps, record types, system and app permissions — everything except login hours/IP, defaults and password policies |
| Standard ones | Cannot change their object or system permissions (`b7e12d88` — the Marketing User profile needs a *custom* profile or a permission set to edit Opportunities) | — |
| Use it for | The baseline a role gets; anything that must be a login restriction | The **exception**: a few marketing users need edit on Campaigns (`3615e19f`) |
| Grouping | — | **Permission set groups** bundle sets; a **muting permission set** removes specific permissions from the group — the only way to trim a packaged group you cannot edit (`4d52ce6a`) |

Salesforce's recommendation is the **Minimum Access – Salesforce** profile plus permission
sets. View All / Modify All on an object, and View All Data / Modify All Data, bypass sharing.

---

## 4. Object Manager and Lightning App Builder

### The standard object architecture

Account ← Contact (Contacts to Multiple Accounts adds many-to-many); Account ← Opportunity ←
Opportunity Product ← Product / Price Book; Lead → converts to Account + Contact + Opportunity;
Case (with Account and Contact lookups); Campaign ← Campaign Member (leads and contacts);
Task and Event relate to a person (**WhoId**) and a record (**WhatId**); Contract, Order,
Asset, Quote. Ticket and Request are not Salesforce objects (`3bdb4138`).

### Relationships

| Type | Traits | Pick it when |
|---|---|---|
| **Lookup** | Optional; child survives parent deletion; independent ownership and sharing | "Shipments should remain when the account is deleted" (`532d0949`); "designs must not be deletable" (`b77f33bd`) |
| **Master-detail** | Required; **cascade delete**; detail inherits the master's **owner and sharing** (`225ec7dd`); enables **roll-up summary** fields; the detail must be a custom object; up to two per object | "Prevent orphaned records" (`3bc13244`); anything that needs a roll-up |
| **Junction object** | A custom object with **two master-detail** relationships — the first is the primary and decides look-and-feel and sharing (`2dda7a31`) | Many-to-many: a contact interested in many merchandise items (`28e4d309`) |
| **Self / hierarchical** | Object to itself; hierarchical only on User | Reports-to, manager |
| **External / indirect lookup** | To external objects (Salesforce Connect) | — |

**Roll-up summaries** (COUNT, SUM, MIN, MAX) need master-detail — with one standard exception:
**Account rolls up Opportunity** natively (`4faeff3d`). **Schema Builder** shows the objects
and relationships as a diagram and can create objects and fields from it.

### Fields

- **Universally required** (on the field) blocks every path — UI, API, integration
  (`b26213ef`); **required on the page layout** blocks only that layout; a **validation rule**
  blocks conditionally (`0424bfcc`).
- **Default value formulas** pre-fill and stay editable — the warranty date that is normally a
  year out but can be extended (`84fac1dc`); a formula field is read-only and recalculates.
- **Picklists**: record types restrict which values a user sees (`9881d4a4`, `9149fd05`);
  **global value sets** keep values consistent across objects (`be02a4c2`); **dependent
  picklists** narrow by a controlling picklist or checkbox.
- **Changing a field type** can lose data: text → picklist deletes list views filtered on it and
  can break assignment and escalation rule criteria (`061bd870`); **auto-number → text keeps
  the values** and stops generating new ones (`57a9f154`).
- **Deleting a field**: it sits in **Deleted Fields for 15 days**, restorable with its data
  (`c9181352`); a field referenced in a formula, roll-up, Apex or Visualforce cannot be deleted
  until the reference is removed; deleting a controlling field removes the dependency; deleting
  a relationship field deletes its lookup filters.
- **Field history tracking**: up to 20 fields per object, 18 months.

### Page layouts, record types, Lightning pages

- **Page layout**: fields, sections, related lists and their columns (`f467f78f`), buttons,
  quick actions; assigned per **profile × record type**. Standard related lists show four
  columns; the **Enhanced List** related-list type in App Builder shows more (`4d0aaac5`).
- **Compact layout**: the highlights panel and mobile record cards.
- **Record types** carry a **business process** (sales process = opportunity stages, support
  process = case statuses, lead process), picklist values and a page layout; a new business
  model gets a new sales process on a new record type (`72a0b976`); a record type also tags
  who entered what (`2ffa1825`); different picklist values for two teams = two record types or
  two page layouts with two fields (`9881d4a4`).
- **Lightning record page**: components such as **Related Record** (edit a parent's fields in
  place) and **Rich Text** with a visibility filter (`1d05b596`); a **Flow** component puts a
  screen flow on the record (`ee4f3d4e`).

---

## 5. Sales and Marketing Applications

### Leads

- **Conversion** creates an Account, Contact and (optionally) Opportunity; standard fields map
  automatically, **custom fields need a mapping** in Lead Settings and a matching field on the
  target (`036bd684`, `0d87e06c`). Converting from the **campaign member** page keeps the
  campaign history on the new contact (`b3aeaf96`).
- **Lead assignment rules** route on create — by address, product, source — to a user or
  queue; one active rule, entries in order, first match wins (`4063708c`). Web-to-Lead
  (500 per day) and the API can invoke it; a checkbox on the layout lets users invoke it.
- Lead **auto-response rules**, lead **queues**, lead **Path**, **duplicate rules** (§8).

### Opportunities and the sales process

- **Stage** drives **probability**, **forecast category** and **type**; Probability is
  editable if placed on the layout (`ee07bdba`).
- **Path** shows the stage, **key fields** and guidance per stage (`d9be4b44`, `c09761e4`);
  it guides but does not enforce — a **validation rule** with `PRIORVALUE` / `ISCHANGED` stops
  a backwards stage move (`045926e2`, `3bf6aa88`).
- **Kanban** on a list view for drag-and-drop pipeline updates (`53e999c6`); **Deal Change
  Highlights** flag amount and close-date movement for seven days (`7a1ab0a9`); **Big Deal
  Alerts** email when an opportunity crosses an amount **and** probability threshold
  (`3b28d8c6`); opportunity update reminders.
- **Opportunity teams** and **splits** — revenue splits total 100%, overlay splits credit
  helpers (`0aa33a5b`); **account teams** with a default team (`dcc3ab15`).
- **Forecasting** projects revenue by period from stages and forecast categories — Pipeline,
  Best Case, Commit, Closed, Omitted — with quotas and adjustments (`1fa46a19`).
- **Territory management** (Enterprise Territory Management): a territory model with territory
  types, assignment rules on account fields, and opportunity territory assignment; one active
  model at a time.
- **Einstein for Sales**: **Opportunity Scoring** (1–99 with key factors — `24d30683`),
  **Lead Scoring**, Einstein Activity Capture, Einstein Forecasting, the home-page assistant.

### Campaigns

- Creating and managing campaigns needs the **Marketing User** checkbox (`c2a95184`).
- **Campaign members** are leads or contacts (or person accounts) with a **member status**
  per campaign (Sent / Responded by default, customisable); add them from reports, list views
  or manually; **campaign hierarchies** go five levels deep and roll up statistics; campaign
  influence attributes opportunities.

---

## 6. Service and Support Applications

### The case toolkit — one tool per verb

| The requirement says… | Tool | Deck |
|---|---|---|
| Customers create their own cases | **Web-to-Case** (5,000/day) and **Email-to-Case** | `87b1a995` |
| Route on create, whatever the channel | **Case assignment rules** — one active rule, ordered entries, to users or **queues** | `e8d13165`, `3561a6c6` |
| Acknowledge immediately | **Auto-response rules** | `3561a6c6` |
| Something has been open too long | **Escalation rules** — age from creation or last modification, respecting business hours; actions are **reassign** and **notify** only (`ebcb1c79`) | `0408c3f8`, `3d646528`, `4bf824b6`, `34290bc6` |
| The business moves agents around itself | **Omni-Channel** — queues, presence, capacity | `8b250773` |
| Tiered service levels | **Entitlements** (with milestones and service contracts), assigned by a flow | `0a88ffb9` |
| Agents repeat the same clicks | **Macros** with quick actions | `8b0dd43b` |
| Find answers and similar cases | **Knowledge** — articles, data categories, suggested articles | `08eab7c6` |
| Who owns automated cases; email the contact on close | **Support Settings** — default case owner, automated case user (`39ebd532`), case close template + **Notify Contact** on the close layout (`8d3dc667`) | |
| Send Email action missing from the feed | **Enable Email-to-Case** | `c191e454` |
| Different case flows per team | **Support processes** on record types | |

**Einstein for Service** adds case classification, reply and article recommendations, and
Agentforce Service Agent (§10). Case teams, case hierarchies, the Service Console and Case Path
round out the toolkit.

---

## 7. The under-trained 10%: Productivity and Collaboration

Four objectives, ~6 exam questions, **8 deck items**.

### Activities

- **Tasks** and **events**; a custom object needs **Allow Activities** before anything can be
  related to it (`50404cc9`); **recurring tasks** are switched on in Activity Settings and need
  the recurrence field on the layout (`4dc33121`); shared activities relate one activity to
  several contacts; the **activity timeline**, reminders, public calendars and resources.
- **Einstein Activity Capture** syncs email and events from Gmail / Outlook; the Outlook and
  Gmail integrations surface Salesforce in the inbox.

### Chatter

- **Feed tracking** per object decides which field changes post; dashboards need it to be
  posted to Chatter (`8a82b5df`).
- **Groups**: **public** (anyone can see and join), **private** (visible, join by request or
  invitation, content hidden), **unlisted** (invisible to non-members — the "sensitive records"
  answer, `3a88eed3`); **broadcast** groups where only owners post; groups with **customers**
  admit external people with a Chatter External licence. Chatter Free users get Chatter without
  CRM.

### The Salesforce mobile app

- The **mobile navigation menu** is built from tab-like items — objects, Lightning app pages,
  Chatter, Dashboards, Today — filtered by the user's tab settings (`a5ce7184`); **Mobile Home**
  is the customisable landing page with report and record cards (`98f643f0`).
- **Lightning App Builder** pages for phones: **app pages** appear as navigation items and
  **record pages** get a phone form factor (`fbfd7a7a`); compact layouts drive record
  highlights; quick actions come from the page layout's mobile-and-Lightning section (`6c8c7013`).
- **Branding**: logo, colours and loading page under Salesforce Mobile App → Branding; **Mobile
  Publisher** ships a branded app; the Mobile Only app and mobile-only settings restrict a
  licence to the app.

### AppExchange

- **Managed packages** are upgradeable, namespaced and locked (components cannot be edited);
  **unmanaged** packages are editable templates with no upgrade path. Publishers are Salesforce
  partners who pass security review; **Salesforce Labs** apps are free.
- Install for admins only / all users / specific profiles; in a **sandbox**, change `login` to
  `test` in the install URL, and remember the package disappears on refresh unless production
  has it (`45a096bd`).
- Beyond apps: **consultants and developers**, industry **solution templates**, flow
  solutions, Lightning components (`dbe75d48`); pre-built **CRM Dashboards** (`981a6656`).
- **AgentExchange** publishes agent templates, topics, actions and **prompt templates** that
  install as packages (§10).

---

## 8. The under-trained 17%: Data and Analytics

Five objectives, ~10 exam questions, **17 deck items** — and the largest domain on the exam.

### Moving data

| Need | Tool | Facts |
|---|---|---|
| Import a few thousand accounts + contacts, leads, campaign members, custom objects | **Data Import Wizard** | Up to **50,000** records; matches on name, email, ID or external ID; can skip triggering automation; accounts and their contacts in one pass (`78b894fb`) |
| Anything larger, or opportunities, cases, any object; delete; export | **Data Loader** | Insert, update, **upsert** (external ID), delete, hard delete, export, export all; command line; millions of rows |
| Undo a bad import | **Data Loader** delete, or **Mass Delete Records** for small sets (accounts, leads, activities, contacts, cases, solutions, products, reports — 250 at a time) (`dea1e510`) | Deleted records sit in the **Recycle Bin for 15 days** |
| Change owners in bulk | **Mass Transfer Records** | Accounts, leads, custom objects; needs the Transfer permission |
| Back up | **Data Export Service** | **Weekly** on Enterprise, Performance and Unlimited; **monthly** on every other edition; CSV zip files available for 48 hours; **Backup & Recover** as the managed product |
| Keep old data without keeping it live | **Archive** products / big objects; field history retention via Field Audit Trail | |

### Data validation tools

- **Validation rules**: an **error condition formula** that is TRUE when the record is invalid,
  plus an **error message and location** (`82b23e87`); conditional requirements are theirs
  (`0424bfcc`); they run on every save path.
- **Duplicate rules** decide what happens when a **matching rule** finds a match: **Allow**
  (with alert and/or report) or **Block**, on create and on edit. Up to **5 active duplicate
  rules per object**, **3 matching rules per duplicate rule**, 5 active matching rules per
  object. Standard matching rules exist for Account, Contact, Lead and Person Account; custom
  ones use exact or fuzzy matching per field. Rules run on edit only when an edited field is in
  the matching rule; a user without access to a matched field makes the rule silently miss;
  **duplicate jobs** (Performance/Unlimited) find existing duplicates.
- **Required fields**, lookup filters and picklists constrain input; **data quality** is
  assessed with reports that filter on blank key fields (`75de9c35`).

### Reports

- **Report types** decide the objects and fields available. Standard ones come with the
  objects; a **custom report type** names a primary object and up to **four** related objects
  in a chain, each joined **"with"** (records must have the child) or **"with or without"**
  (outer join); fields via lookup from up to 60 objects, 1,000 fields per type; labels can be
  **renamed** in the report type layout; **hide report types** to limit what users can build
  (`da7f0e3d`). Allocation: 50 / 300 / 2,000 / 400 per edition.
- **Formats**: tabular, summary (row groups), matrix (rows × columns), **joined** (up to five
  blocks from different report types sharing a common object).
- **Filters**: up to **20 field filters** with filter logic; **cross filters** ("accounts with /
  without cases", up to 3 per report, 5 sub-filters each); the relative-value filter
  **equals $USER**-style personalisation on user fields (`57f8b23a`); relative date literals.
- **Formulas**: one row-level formula, up to **5 summary formulas** per report; **bucket
  columns** categorise without a field (up to 5 per report, 20 buckets each — `2b6f1886`).
- **Chart settings**, conditional formatting, subtotals and grand totals, **hide details**,
  export (formatted or details only). Reports show **2,000 rows** on screen. Troubleshooting a
  missing field: report type, field-level security, or the object's "with" join.
- **Folders**: View / Edit / Manage, shared to users, groups, roles; no cascade
  (`91817bb4`); move a dashboard to a private folder to take it offline (`73169c29`).
- **The sharing model applies to reports**: a report shows the *viewer* what the viewer can
  see (`bb27462f`); folder access decides who can open it; FLS decides which fields appear.

### Dashboards

- **Widgets**: charts, tables, metrics, gauges, **text** (`75278521`) and images — up to 25 per
  dashboard, 20 of them charts and tables; each chart or table has one **source report**.
- **Dashboard filters**: up to 5 per dashboard, 50 values each — one dashboard per team
  (`6e12dd2e`).
- **Running user** decides whose data everyone sees: **run as specified user** shows one
  person's view to all (enterprise-wide totals for reps who cannot see everything —
  `307b7189`; also the cause of reps seeing too much — `fdfedecb`); **run as logged-in user**
  makes it a **dynamic dashboard** — limited to **5 (Enterprise) / 10 (Unlimited and
  Performance) / 3 (Developer)** per org, not in private folders, cannot be scheduled or
  subscribed to. Managers with View My Team's Dashboards can **View Dashboard As** a subordinate.
- **Subscriptions** email a refreshed dashboard on a schedule; scheduled refreshes are capped
  per edition; feed tracking lets components be posted to Chatter (`8a82b5df`); a dashboard's
  folder controls who opens it, and the source reports' folders do not need to be shared for
  the dashboard to display.

---

## 9. Automation

### Picking the tool

| The requirement | Tool |
|---|---|
| Route a lead or case when it is created | **Assignment rules** |
| Reply to a new case or lead automatically | **Auto-response rules** |
| Act when a case has been open too long | **Escalation rules** |
| Sign-off by specific people, in order, with rejection handling | **Approval process** |
| Anything else — create/update/delete records, send email, call an action, present screens, run on a schedule, react to a record change | **Flow** |
| Block a bad save | **Validation rule** (not automation) |
| Conversational, natural-language help for users or customers | **Agentforce** (§10) |
| Workflow Rules / Process Builder | **Not on the Summer '25 outline** — see §12 |

Two org-level settings the outline names: the **Default Workflow User** in Process Automation
Settings is *required* for scheduled paths in record-triggered flows and always runs
schedule-triggered flows — if the triggering user is inactive, the actions run as this user;
the **Automated Process User email** is the sender for flow and approval emails.

### Flow — types and when

| Type | Runs when | Use it for | Deck |
|---|---|---|---|
| **Screen flow** | A user launches it — from a page, action, utility bar, Experience site, URL | Guided data entry, wizards, forms, choosing which records to update (`8dfcba92`, `8aea4354`, `4419a83a`, `5ca89056`) | |
| **Record-triggered, before save** | As the record is saved, before it is written | Fast field updates on the triggering record; toolbox is **Assignment, Decision, Get Records, Loop** only (`9dfd991f`) | |
| **Record-triggered, after save** | After the record is written | Related records, emails, actions, outbound messages (`86a0ffaa`), renewals (`fd10e166`), stamping a date on a status change (`00548807`), **scheduled paths** for time-based actions | |
| **Schedule-triggered** | At a time, once or recurring, over a set of records | Clean-ups and sweeps (`48ce1490`, `7bbd2652`, `952b907a`); up to 250,000 records per 24 hours or 200 × licences | |
| **Autolaunched** | Called by another flow, Apex, a button, a process | Reusable logic; no screens | |
| **Platform event-triggered** | An event message arrives | Integration reactions | |
| **Flow orchestration** | Multi-step, multi-user work | Sequenced stages with assigned work items | |

**Building blocks**: `$Record` is the triggering record, `$Record__Prior` its pre-save values
(`f2231f7b`); variables are Text, Number, Currency, Boolean, Date, Date/Time, Picklist, Record —
there is no ID type, so an Id goes in **Text** (`b38545fa`); **Available for input / output**
control what a caller — or the debug screen — can set (`24bc315d`); **fault connectors** catch
errors and show a helpful screen instead of the default message (`e0ca62a8`); one **active
version** at a time; conditional **component visibility** on screens (`32afb676`); entry
conditions, "only when a record is updated to meet the condition", trigger order.

**Order of execution** (`1be375ea`): before-save flows → before triggers → validation rules →
duplicate rules → save → after triggers → **assignment rules → auto-response rules → workflow
rules → escalation rules** → after-save flows → entitlement rules → roll-ups → commit → email
and scheduled work. A flow's actions therefore see the assigned owner but run before escalation.

### Approval processes

- **Entry criteria** decide which records enter (`9d407d53`); **steps** each have their own
  criteria and approvers — a named user, a queue, a **related user field such as Manager**
  (which must be populated, `9b03a10e`), or an approval hierarchy; unanimous or first-response;
  **delegated approvers**; the record is **locked** while pending.
- **Actions** at initial submission, each step's approval and rejection, final approval, final
  rejection and recall: **field update, email alert, task, outbound message** (`2915050c`,
  `f7935d50`). Rejections can end the process or return a step.
- A failed advance usually means the **next approver is inactive or missing** (`3037b817`).
  Thirty criteria sets are thirty steps or thirty processes, not thirty flows (`26d0b0b1`);
  manager-then-finance is sequential steps (`f8bb917c`); automatic submission comes from a
  **flow** or from **Flow Approval Processes**, the record-triggered form (`8058ccdf`).
- **Email approval response** lets approvers reply APPROVE / REJECT. Only one approval process
  is active on a record at a time.

---

## 10. The under-trained 8%: Agentforce

Two objectives, ~5 exam questions, **7 deck items** — all seven on writing instructions and
prompts, none on security, permissions or testing.

### What an agent is made of

- An **agent** has a role, **topics** and **actions**. A topic is a job the agent can do,
  with a **classification description** (how the reasoning engine recognises it), a **scope**
  and **instructions**. An action is something the agent can execute — a **flow**, an **Apex**
  class, a **prompt template**, or an API — with its own **action instructions** and per-input /
  per-output descriptions. **Agentforce (Default)** is the employee-facing agent; **Agentforce
  Service Agent** serves customers over web chat and messaging.
- **Instructions are the configuration.** Good action instructions state what the action does,
  its goal, and *when* to use it (`0049d522`, `d6f431f5`); good input instructions state the
  **format, source and requirement** — "18-character ID, from the conversation or the user,
  required" (`1f67bbf5`); prompts use plain, concise language rather than nested conditions or
  jargon (`0cbd5323`).
- **Prompt Builder** templates (Sales Email, Field Generation, Record Summary, Flex) pull record
  data in through **merge fields** (`644fe387`) and can ground on related lists, flows and Apex;
  the **Einstein Trust Layer** masks sensitive data, keeps zero retention with the model provider,
  scores toxicity and logs the exchange.

### Maintaining, testing, installing

- Edit topics, actions and instructions in **Agent Builder**; an agent must be **deactivated to
  edit**, and **deactivation interrupts live conversations** — users get a system error until it
  is reactivated (`7856a477`). Each save is a version.
- **Light testing** is the **conversation preview** panel in Agent Builder: type as a user, watch
  which topic and action the reasoning engine selects and what it sends. Batch testing is the
  **Testing Center**, which runs test cases against the agent.
- **Install** prompts, topics, actions and agent templates from **AgentExchange** as packages,
  then adapt the instructions; Prompt Builder templates are also installable.

### Security and permissions — the objective the deck skips

- The agent acts **as a user**: the agent user's profile, permission sets and sharing decide
  which records it can read and change. "The agent cannot find the record" or "cannot run the
  action" is a **permissions** problem before it is an instruction problem — check the agent
  user's object and field access, the flow's run mode, and that the action is assigned to the
  topic.
- People who *build* agents and prompts need the Agentforce and Prompt Builder permission sets;
  people who *use* them need the user permission sets; **Einstein Generative AI** must be
  enabled in Setup.
- **When AI is appropriate**: repeatable, well-bounded, high-volume conversational work with
  clear guardrails and a path to a human — escalation to a support rep (`a63b1272`) should carry
  the conversation context. Not appropriate: irreversible or high-risk actions without a human
  in the loop, or anything the data it can see does not support.

---

## 11. Numbers to memorise

| Item | Value |
|---|---|
| Exam | 60 scored + up to 5 unscored; **105 min**; **68%** (EN) = 41 of 60; **Summer '25**; no prerequisite |
| Domain weights | Config 15 · Object Manager 15 · Sales 10 · Service 10 · Productivity 10 · **Data & Analytics 17** · Automation 15 · Agentforce 8 |
| Data Import Wizard | **50,000** records |
| Mass Delete Records | 250 at a time |
| Web-to-Lead / Web-to-Case | **500** / **5,000** per day |
| Recycle Bin | **15 days** |
| Deleted custom fields | **15 days** in Deleted Fields |
| Field history | 20 fields per object; 18 months |
| Data Export | **weekly** (Enterprise, Performance, Unlimited), **monthly** (others); files available 48 hours |
| Setup Audit Trail | **180 days** |
| Login History | **6 months**, 20,000 rows on screen |
| Session timeout default | 2 hours |
| Username | Unique across all orgs; up to 80 characters |
| Master-detail per object | **2** |
| Sharing rules per object | 300, up to 50 criteria-based |
| Duplicate rules | **5 active per object**; **3 matching rules per duplicate rule**; 5 active matching rules per object |
| Custom report types | 50 / **300** / 2,000 / 400 (Professional / Enterprise / Unlimited & Performance / Developer); **4** related objects; 60 object references; 1,000 fields |
| Report | **2,000 rows** on screen; **20 field filters**; **5** summary formulas; 1 row-level formula; 3 cross filters × 5 sub-filters; 5 bucket columns × 20 buckets; joined reports 5 blocks; timeout 10 min; mobile 25 columns |
| Dashboard | **25 widgets** (20 charts/tables); **5 filters** × 50 values; **dynamic dashboards 5 / 10 / 3** per org (Enterprise / Unlimited & Performance / Developer) |
| Campaign hierarchy | 5 levels |
| Schedule-triggered flow | 250,000 records per 24 h or 200 × licences |
| Escalation actions | 2 kinds — reassign, notify (up to 5 extra recipients) |
| Deal Change Highlights | 7 days |

---

## 12. Where the deck is older than the exam

The exam is aligned to **Summer '25**. Several deck items were written against earlier
outlines and key features that are retired, renamed, or simply absent from the current
objectives. **On the real exam, answer the Summer '25 way** — the modern feature. In the deck,
these items are keyed as scraped and their explanations say so.

| Deck item | Keyed as | Summer '25 answer |
|---|---|---|
| Closed Won → follow-up task now and in 60 days (`c1c37914`) | Process Builder + Workflow Rule | A **record-triggered flow** with a **scheduled path**. Workflow Rules and Process Builder reached end of support on **31 Dec 2025** and are not on the outline |
| Welcome tasks and email on Closed Won (`0eeaeebf`) | Process Builder | Record-triggered flow |
| Update a parent when a child field changes (`4c6f4b49`) | Process Builder | Record-triggered flow (update related records) |
| "Which workflow action sends data to an external system" (`ff68f441`) | Outbound Message as a workflow action | Still an **outbound message** — but fired from a **flow** (`86a0ffaa` is the modern twin) |
| Approvals with sign-off steps (`26d0b0b1`, `f8bb917c`, `2915050c`) | Classic approval process | Still correct — the outline says "approval process"; know that **Flow Approval Processes** exist and that `8058ccdf` keys them for *automatic* submission |
| "Critical update" (`532479a7`) | Activate in a sandbox first | Same practice, under the name **Release Updates** |
| "Two-factor authentication for User Interface / API Logins" (`76248f85`) | 2FA permission names | **Multi-Factor Authentication** permissions; MFA is required and auto-enabled for direct logins |
| "Stage Setup Flow" (`0e3ab3e8`) | Leads and Opportunities | No longer documented under that name; lead status and opportunity stage setup live with Path |
| "Einstein Analytics" as a dashboard option (`981a6656`) | Distractor | The product is **CRM Analytics** |
| Agentforce items (`a63b1272`, `7856a477`, `0049d522`, `1f67bbf5`, `0cbd5323`, `644fe387`, `d6f431f5`) | Instructions, prompts, deactivation | Current — but the outline also tests **permissions, security and testing**, which the deck does not (§10) |

Two items are flagged in their own explanations as unsettled rather than stale: `a63b1272`
(the "agent history component" is not a documented name) and `be02a4c2` (record-type-specific
values are a record type setting, not a picklist type).

---

## 13. Distractor tells

Patterns in how this exam writes wrong answers, from the deck's 154 and its fact-check.

1. **The right tool for the neighbouring verb.** Assignment rule offered for a *time* problem
   (escalation), escalation for a *creation* problem (assignment), auto-response for a *close*
   problem (case close template), validation rule for a *notification*. Match the verb first.
2. **Profile where a permission set belongs**, and vice versa. Editing a standard profile's
   object permissions (impossible); a new profile for three users (`3615e19f`); a permission
   set for login hours (impossible).
3. **The sharing tool one level off.** Manual sharing for a whole team (`c4eb0512`); OWD
   Public Read/Write when the aim is *restriction*; role hierarchy when the access is lateral;
   Apex sharing on an admin exam.
4. **The relationship that does the opposite.** Master-detail when children must survive
   (`532d0949`, `b77f33bd`); lookup when orphans must be impossible (`3bc13244`).
5. **Required in the wrong place.** Layout-required for "every record however created"
   (`b26213ef`); field-required for a conditional rule (`0424bfcc`).
6. **The dashboard running user confusion.** A specified running user shows *their* data to
   everyone — the cure for restricted reps needing totals (`307b7189`) and the cause of reps
   seeing too much (`fdfedecb`); dynamic dashboards go the other way.
7. **Retired automation offered as current.** Workflow Rules and Process Builder in the options
   of a Summer '25 exam are distractors — Flow is the answer (§12).
8. **Delete instead of deactivate; deactivate instead of freeze.** Users are never deleted;
   freezing is the temporary block (`c6364b77`).
9. **Login IP vs trusted IP.** Profile ranges *deny*; trusted ranges *skip verification*.
10. **A product name that does not exist.** "Private Chatter Channel", "Ticket", "Request",
    "Custom variable", "Email Notifications" as a feature, "Search Layout Editor" for related
    list columns.
11. **Custom code on an admin exam.** Apex, Lightning web components and Visualforce are
    almost always the wrong answer when a declarative feature is offered.
12. **The count trick.** "Which two" where one option contains both, or where a plausible
    third option is the one the docs contradict (`ebcb1c79` — escalation rules do not change
    priority or reopen).

### Read the question's own verb

- **"prevent" / "ensure ... cannot"** → validation rule, OWD, uncheck Grant Access Using
  Hierarchies, universally required field.
- **"route" / "assign"** → assignment rules, queues, Omni-Channel.
- **"after N hours" / "still open"** → escalation rules.
- **"notify" / "alert"** → escalation rule email, Big Deal Alert, flow email, Chatter.
- **"guided" / "step by step" / "form"** → screen flow.
- **"on a schedule" / "once a week" / "clean up existing records"** → schedule-triggered flow.
- **"sign off" / "approve"** → approval process.
- **"different values / layout / process for different users"** → record types (or two page
  layouts).
- **"see only their own"** → OWD Private; on a report, the `$USER`-style filter.
- **"quickly" / "without building"** → AppExchange, Salesforce Labs, standard feature.
- **"what should the admin check first"** → Login History, Setup Audit Trail, the next approver,
  the running user.

---

## 14. Two-week revision plan

| Day | Focus |
|---|---|
| 1 | §3 company settings, users and what blocks deactivation; security controls table. Drill Configuration items |
| 2 | §3 sharing model steps 1–8 and profiles vs permission sets until the two tables are automatic |
| 3 | §4 relationships, field behaviour, record types and Lightning pages. Drill Object Manager items |
| 4 | §5 leads, opportunities, campaigns; §6 the case toolkit table cover-and-reproduce |
| **5** | **§8 moving data and validation tools** — the import/export table and the duplicate-rule limits from memory |
| **6** | **§8 reports and dashboards** — report types, joined reports, cross filters, running user, dynamic dashboard limits. The exam's biggest domain |
| 7 | §9 tool-selection table, Flow types, order of execution. Drill Automation items — and re-answer every Process Builder item the Summer '25 way |
| 8 | §9 approval processes; the Default Workflow User |
| **9** | **§7 Productivity** — Chatter group types, mobile navigation and branding, managed vs unmanaged packages |
| **10** | **§10 Agentforce** — agent anatomy, instruction rules, deactivation behaviour, permissions and testing |
| 11 | §11 numbers (cover and reproduce); §12 the deck-older-than-exam list |
| 12 | §13 tells; re-drill every item you missed |
| 13 | Full deck run, timed at 105 seconds a question |
| 14 | Re-read §8, §10 and §12. Rest |

---

## 15. Sources

Every URL below was rendered and title-checked during this repo's fact-check work or while
writing this guide.

**The exam**
- [Salesforce Certified Platform Administrator Exam Guide](https://help.salesforce.com/s/articleView?id=005298966&type=1&language=en_US) — outline, weights, Summer '25 alignment.

**Configuration and setup**
- [Company Information Fields](https://help.salesforce.com/s/articleView?id=xcloud.company_information_fields.htm&language=en_US&type=5), [Set the Fiscal Year](https://help.salesforce.com/s/articleView?id=sf.setting_the_fiscal_year.htm&language=en_US&type=5), [Set Business Hours](https://help.salesforce.com/s/articleView?id=sf.customize_supporthours.htm&language=en_US&type=5)
- [Considerations for Deactivating Users](https://help.salesforce.com/s/articleView?id=platform.users_deactivate_considerations.htm&language=en_US&type=5), [Unlock Users](https://help.salesforce.com/s/articleView?id=platform.users_unlock.htm&language=en_US&type=5), [Reset Passwords for Your Users](https://help.salesforce.com/s/articleView?id=sf.resetting_and_expiring_passwords.htm&language=en_US&type=5)
- [Restrict Login IP Addresses in Profiles](https://help.salesforce.com/s/articleView?id=sf.users_profiles_epui_login_ip_ranges.htm&language=en_US&type=5), [Set Password Policies](https://help.salesforce.com/s/articleView?id=sf.admin_password.htm&language=en_US&type=5), [Multi-Factor Authentication](https://help.salesforce.com/s/articleView?id=sf.security_overview_2fa.htm&language=en_US&type=5)
- [Monitor Setup Changes with Setup Audit Trail](https://help.salesforce.com/s/articleView?id=sf.admin_monitorsetup.htm&language=en_US&type=5), [Monitor Login History](https://help.salesforce.com/s/articleView?id=xcloud.users_login_history.htm&language=en_US&type=5), [Security Health Check](https://help.salesforce.com/s/articleView?id=sf.security_health_check.htm&language=en_US&type=5)
- [Organization-Wide Sharing Defaults](https://help.salesforce.com/s/articleView?id=sf.security_sharing_owd_about.htm&language=en_US&type=5), [Sharing Rules](https://help.salesforce.com/s/articleView?id=sf.security_about_sharing_rules.htm&language=en_US&type=5), [Owner-Based Sharing Rules](https://help.salesforce.com/s/articleView?id=sf.security_sharing_rules_owner.htm&language=en_US&type=5), [Control Access Using Hierarchies](https://help.salesforce.com/s/articleView?id=sf.security_controlling_access_using_hierarchies.htm&language=en_US&type=5)
- [Permission Set Groups](https://help.salesforce.com/s/articleView?id=sf.perm_set_groups.htm&language=en_US&type=5) — muting.

**Object Manager**
- [Object Relationships Overview](https://help.salesforce.com/s/articleView?id=platform.overview_of_custom_object_relationships.htm&language=en_US&type=5), [Considerations for Relationships](https://help.salesforce.com/s/articleView?id=platform.relationships_considerations.htm&language=en_US&type=5), [Roll-Up Summary Fields](https://help.salesforce.com/s/articleView?id=platform.fields_about_roll_up_summary_fields.htm&language=en_US&type=5)
- [Considerations for Converting the Field Type of a Custom Field](https://help.salesforce.com/s/articleView?id=platform.notes_on_changing_custom_field_types.htm&language=en_US&type=5) and [Manage Deleted Custom Fields](https://help.salesforce.com/s/articleView?id=sf.fields_managing_deleted_fields.htm&language=en_US&type=5)
- [Record Types](https://help.salesforce.com/s/articleView?id=platform.customize_recordtype.htm&language=en_US&type=5), [Lightning Page Types](https://help.salesforce.com/s/articleView?id=platform.lightning_page_types.htm&language=en_US&type=5), [Activate Lightning Record Pages](https://help.salesforce.com/s/articleView?id=platform.lightning_app_builder_customize_lex_pages_activate.htm&language=en_US&type=5)

**Sales and service**
- [Map Custom Lead Fields for Lead Conversion](https://help.salesforce.com/s/articleView?id=sales.customize_mapleads.htm&language=en_US&type=5), [Set Up Assignment Rules](https://help.salesforce.com/s/articleView?id=sales.creating_assignment_rules.htm&language=en_US&type=5), [Set Up Big Deal Alerts](https://help.salesforce.com/s/articleView?id=sf.activating_big_deal_alerts.htm&language=en_US&type=5)
- [Who Has Access to Campaigns?](https://help.salesforce.com/s/articleView?id=sales.faq_campaigns_who_has_access.htm&language=en_US&type=5) and [Campaign Members](https://help.salesforce.com/s/articleView?id=sales.campaigns_members_landing_page.htm&language=en_US&type=5)
- [Escalation Actions](https://help.salesforce.com/s/articleView?id=service.rules_escalation_actions.htm&language=en_US&type=5), [Support Settings](https://help.salesforce.com/s/articleView?id=service.customize_supportrules.htm&language=en_US&type=5), [Send Email Action Considerations for Cases](https://help.salesforce.com/s/articleView?id=service.case_interaction_send_email_quick_action_considerations.htm&language=en_US&type=5)

**Productivity and collaboration**
- [Enable Recurring Tasks](https://help.salesforce.com/s/articleView?id=sf.tasks_enable_recurring_tasks_lex.htm&language=en_US&type=5), [Unlisted Groups](https://help.salesforce.com/s/articleView?id=sf.collab_unlisted_groups_overview.htm&language=en_US&type=5)
- [Customize the Mobile Navigation Menu](https://help.salesforce.com/s/articleView?id=xcloud.salesforce_app_customize_nav_menu.htm&language=en_US&type=5)
- [Install a Package](https://help.salesforce.com/s/articleView?id=sf.distribution_installing_packages.htm&language=en_US&type=5) and [Install Sample Dashboards from AppExchange](https://help.salesforce.com/s/articleView?id=sf.dashboards_install_sample_appexchange.htm&language=en_US&type=5)

**Data and analytics**
- [What Kind of Objects Can I Import?](https://help.salesforce.com/s/articleView?id=sf.faq_data_import_wizard_what_kind_objects.htm&language=en_US&type=5), [Delete Multiple Records and Reports](https://help.salesforce.com/s/articleView?id=sf.admin_massdelete.htm&language=en_US&type=5), [Export Backup Data from Salesforce](https://help.salesforce.com/s/articleView?id=xcloud.admin_exportdata.htm&language=en_US&type=5)
- [Things to Know About Duplicate Rules](https://help.salesforce.com/s/articleView?id=sf.duplicate_rules_overview.htm&language=en_US&type=5) — 5 rules per object, 3 matching rules per rule.
- [Reports and Dashboards Limits and Allocations](https://help.salesforce.com/s/articleView?id=analytics.rd_reports_dashboards_limits.htm&language=en_US&type=5) — the allocations table and every report and dashboard limit in §11.
- [Dynamic Dashboards](https://help.salesforce.com/s/articleView?id=analytics.dashboards_dynamic_overview.htm&language=en_US&type=5) — 5 / 10 / 3 and the four considerations — and [View Dashboards As](https://help.salesforce.com/s/articleView?id=analytics.dashboards_view_as_overview.htm&language=en_US&type=5)
- [Bucket Your Report Data](https://help.salesforce.com/s/articleView?id=sf.reports_bucketing_overview.htm&language=en_US&type=5), [Hide Report Types](https://help.salesforce.com/s/articleView?id=sf.reports_hide_report_types.htm&language=en_US&type=5), [Report and Dashboard Folder Sharing Permissions](https://help.salesforce.com/s/articleView?id=analytics.analytics_sharing_permissions.htm&language=en_US&type=5)

**Automation**
- [Process Automation Settings](https://help.salesforce.com/s/articleView?id=platform.automation_about_settings.htm&language=en_US&type=5) — the Default Workflow User and the Automated Process User email.
- [Triggers and Order of Execution](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm)
- [Flow Types](https://help.salesforce.com/s/articleView?id=platform.flow_concepts_type.htm&language=en_US&type=5), [Record-Triggered Flows](https://help.salesforce.com/s/articleView?id=platform.flow_concepts_trigger_record.htm&language=en_US&type=5), [Flow Global Variables](https://help.salesforce.com/s/articleView?id=platform.flow_ref_resources_global_variables.htm&language=en_US&type=5)
- [Limits and Considerations for Classic Approval Processes](https://help.salesforce.com/s/articleView?id=platform.approvals_considerations.htm&language=en_US&type=5), [Troubleshoot Approval Processes](https://help.salesforce.com/s/articleView?id=platform.approvals_troubleshoot.htm&language=en_US&type=5), [Automate Approvals](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals.htm&language=en_US&type=5)

**Agentforce**
- [Design and Implement Agents](https://help.salesforce.com/s/articleView?id=ai.copilot_intro.htm&language=en_US&type=5), [Activate or Deactivate Your Agent](https://help.salesforce.com/s/articleView?id=ai.copilot_setup_activate_deactivate.htm&language=en_US&type=5)
- [Write Instructions for Actions](https://help.salesforce.com/s/articleView?id=ai.copilot_actions_instructions.htm&language=en_US&type=5), [Write Instructions for Topics](https://help.salesforce.com/s/articleView?id=ai.copilot_topics_instructions.htm&language=en_US&type=5), [Escalate from an Agent](https://help.salesforce.com/s/articleView?id=ai.service_agent_escalation.htm&language=en_US&type=5)
- [Ground Prompts with Merge Fields](https://help.salesforce.com/s/articleView?id=sf.prompt_builder_ground_merge_fields.htm&language=en_US&type=5) and [Einstein Trust Layer](https://help.salesforce.com/s/articleView?id=ai.generative_ai_trust_layer.htm&language=en_US&type=5)

---

## 16. Using this with NotebookLM

Upload **this file** as a source. Markdown ingests cleanly and the headings become NotebookLM's
navigation.

Worth adding as additional sources:
- The [official exam guide](https://help.salesforce.com/s/articleView?id=005298966&type=1&language=en_US) URL.
- [Reports and Dashboards Limits and Allocations](https://help.salesforce.com/s/articleView?id=analytics.rd_reports_dashboards_limits.htm&language=en_US&type=5) — the one page behind the exam's largest domain.

**Prompts that produce useful study media:**

- *"Generate an Audio Overview of sections 6 and 9. Have the hosts take turns describing a
  support or sales requirement and arguing over which single feature — assignment rule,
  escalation rule, approval process, flow, validation rule — is built for it."*
- *"Using section 8, drill me on reports and dashboards: give me a reporting requirement and ask
  which report type, format, filter or dashboard setting delivers it. Don't give me the answer
  until I try."*
- *"Turn section 11 into flashcards — one number per card."*
- *"Using section 12, quiz me on each deck item that keys Process Builder or Workflow Rules, and
  make me give the Flow answer instead."*
- *"Using section 3, give me five user-access scenarios and ask whether the fix is a profile, a
  permission set, a sharing rule, the role hierarchy, or an OWD change."*

For the Audio Overview, sections 3, 6, 9 and 13 reward listening — they are decision tables
argued out loud. Sections 11 and 15 are lookups and will not survive being read aloud.
