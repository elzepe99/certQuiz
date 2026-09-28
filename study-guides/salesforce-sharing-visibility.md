# Sharing and Visibility Architect Field Guide

**Salesforce Certified Platform Sharing and Visibility Architect — Winter '23 item bank**

Built from the 136 questions in the practice deck, cross-checked against the official exam outline and the documentation those questions cite. **This exam has not been rebuilt** — it still aligns to Winter '23 — so the deck is roughly as current as the exam. The problem is shape, not age: **more than half the deck is record access**, and the domain worth 27% of the exam gets 16% of the practice. And the platform moved after the exam froze: **Apex now runs in user mode by default**, which changes how two keyed answers read. Section 9 carries both halves of that.

| Questions | Time | Pass mark | Prerequisite | Aligned to |
|---|---|---|---|---|
| 60 (+5 unscored) | 120 minutes | 58% (35 of 60) | None, US$400 | Winter '23, never rebuilt |

---

## 1. The exam, factually

> **Two structural facts that matter more than any topic.**
> **The deck over-drills the domain you are most likely to know already.** 75 of its 136 items are record access — OWDs, roles, sharing rules, teams, sharing sets — against 39% of the exam. Object and field permissions, 27% of the exam, get 22.
> **58% is a low bar and 120 minutes is a long exam.** This is the only architect exam in the repo with two hours for 60 questions. Long scenario stems are the norm; read the last sentence first.

| | |
|---|---|
| Official name | Salesforce Certified Platform Sharing and Visibility Architect |
| Content | **60 scored** multiple-choice items, plus up to 5 unscored |
| Time | **120 minutes** |
| Passing score | **58%** — 35 of 60 |
| Prerequisite | None |
| Fee | US$400, retake US$200 |
| Aligned to | **Winter '23** |
| Exam guide | Help article `005298977` |

## 2. Where the points actually are

Unusually, this deck's `_cat` tags already use the four current domain names. Every item was still re-read and placed on its own merits (`study-guides/reclassify-sharing-visibility.mjs`); the re-reading agreed with the tags on 129 of 136 and moved the other seven for stated reasons.

| Domain | Exam | ≈ Qs | Deck | Verdict |
|---|---:|---:|---:|---|
| Permissions to Standard Objects, Custom Objects, and Fields | 27% | ~16 | 22 · 16.2% | **badly under** |
| Access to Records | 39% | ~23 | 75 · 55.1% | **badly over** |
| Access to Other Data | 16% | ~10 | 17 · 12.5% | under |
| Implications of Security Model Choice | 18% | ~11 | 22 · 16.2% | about right |

> **The over-drill is the headline.** Access to Records is 55% of the deck and 39% of the exam. That is about 23 real questions, and the deck gives you 75. You will finish it fluent in sharing sets and account teams, which is good, and under-practised in the permissions domain, which is worth more than a quarter of your score.

### Sub-objectives the deck never asks

Found by reading all 136 against the outline, then confirmed by keyword sweep over stems, options *and* explanations on 2026-09-28. Each is taught in the section named.

1. **Programmatic enforcement the modern way** — `WITH USER_MODE`, `as user` DML, `stripInaccessible`. Zero hits. The deck teaches only `isAccessible()` and `with sharing`. §3.
2. **Permission set groups and muting.** Zero hits in an object-permissions domain. §3.
3. **Scoping rules** — and why they are not security. Zero hits. §3.
4. **Regulated data (PCI, PII, HIPAA) as a named requirement.** The outline names all three; the deck names none of them. It does have six encryption items. §3.
5. **Restriction rules**, the one mechanism that *narrows* record access after sharing has granted it. Zero hits. §4.
6. **Manager groups.** Zero hits, under a named "groups" bullet. §4.
7. **The external OWD ceiling** — external access can never be more permissive than internal. The deck uses separate external OWDs (`42ccc679`) but never states the rule. §4.
8. **Guest users and Knowledge.** Zero hits for either. Named here as gaps only; this pass did not render documentation for them.

## 3. Permissions to objects and fields

27% of the exam, 22 deck items — the domain to spend your spare time on.

### What the deck does cover

- **Remove the object permission, not the record:** stop Order deletion by removing Order Delete from profiles and permission sets (`5511f656`); stop reps editing system-provisioned work orders by removing Work Order Edit (`89980a66`).
- **Missing fields on a detail page are field-level security**, not sharing (`67edf27b`). A field vanishing after a deployment that did not touch the layout is diagnosed with **View Field Accessibility** (`7f7fa913`, `5cb48d4c`).
- **Readable by one team, editable by another:** FLS per profile (`719e1654`); three of a hundred users need read-only on one field → a new profile without edit (`43b7241d`); fields for reporting only → FLS without adding them to a layout (`79d8546f`).
- **OWD does not beat object permissions:** a manager with no Read on Invoice sees nothing of a subordinate's Invoice even though the OWD is Public Read Only (`c9f8748f`). Object access is the gate; sharing only opens records behind it.
- **Encryption:** encrypted fields can't drive criteria-based sharing rules (`f5aa4d62`); new fields added to Shield Platform Encryption need Salesforce to re-encrypt existing values (`0f59fb2a`).
- **Login hours are a profile setting** (`ced866bb`).
- **Modify All Data** for a tool that must write everything regardless of sharing and CRUD (`6a078f90`).

> **Zero deck questions — enforcing security from Apex, the modern way.**
> "Recommend the appropriate programmatic solution to ensure security settings are enforced" is a named bullet. The deck's answer is always `isAccessible()` (`43c201b6`, `abd2e57b`) or a sharing keyword. Know the three current tools:
>
> - **User mode on the query:** "insert a `WITH USER_MODE` or `WITH SYSTEM_MODE` clause". User mode "finds all FLS errors in your SOQL query".
> - **User mode on DML:** "insert the `as user` or `as system` keywords between the DML operator and the object name". Database methods take an `AccessLevel.USER_MODE` parameter.
> - **`stripInaccessible`:** strips "fields and relationship fields from query and subquery results that the user can't access". It allows "graceful degradation" by omitting fields rather than failing outright, and it can sanitise records "deserialized from an untrusted source" before DML.
>
> **One sentence decides between them:** user mode *fails* on an inaccessible field; `stripInaccessible` *removes* it and carries on.

> **The default has moved — see §9.** Salesforce's page now opens: "Apex database operations run in user mode by default, which means that they apply the sharing rules, field-level security (FLS), and object permissions of the running user." That is true from API 67.0; in 66.0 and earlier the default was system mode. The Winter '23 exam was written against the old default.

> **Zero deck questions — permission set groups and muting.**
> A **permission set group** bundles permission sets so a persona is assigned as one unit. A **muting permission set** disables selected permissions inside it — **at most one per group** — and "the muting affects only users assigned to the permission set group, not users assigned directly to a permission set outside of the permission set group". You can mute object, field and user permissions. That is the modern answer to "these three users need everything the team has except X", where the deck's answer is a new profile (`43b7241d`). Both are valid; know that the exam may offer either.

> **Zero deck questions — scoping rules, and why they are not security.**
> "Scoping rules let you control the records that your users see in list views, reports, and SOQL queries". The decisive sentence: **"A scoping rule doesn't restrict users' access to other records that they sometimes need."** Users can switch scope. So a scoping rule answers "help people focus", never "stop people seeing". Performance, Unlimited and Developer editions only.

### Regulated data — name the requirement, then pick the control

The outline names PCI, PII and HIPAA; the deck never does. Map the words to controls you already know: **field-level security** to hide, **Shield Platform Encryption** to protect at rest (`0f59fb2a`), and monitoring of who read or exported it. The deck has no item on Event Monitoring or Transaction Security policies; the data-architect deck's `4bce9573` keys both for exactly this kind of regulated customer.

## 4. Access to records

39% of the exam and 55% of the deck. Work it once and confirm you are fluent; the material is sound. What follows is the spine, then the three things it leaves out.

### The order access is decided in

1. **Object permission** — no Read, no records, whatever else is true (`c9f8748f`, `f06ffe05`).
2. **OWD** sets the floor. Choose the most restrictive any user needs, then open up (`ecf35f6a`, `13e3a0cb`, `3f1c2bdd`).
3. **Role hierarchy** opens upward, unless **Grant Access Using Hierarchies** is off — custom objects only (`4bea0db4`, `32ca6c0b`, `fe13cd62`, `9e11ff8d`).
4. **Sharing rules** — owner-based or criteria-based, to roles, roles and subordinates, or public groups (`437bd895`, `921e28b3`, `b893344a`).
5. **Teams, manual shares, Apex managed sharing** for what rules can't express (`96a7a404`, `2832551d`, `6da44329`).
6. **Implicit sharing** fills in parent access: opportunity access gives Read on the account (`16f36e7f`, `1b589ed2`).

### What survives an owner change — a reliable exam target

- **Manual shares are deleted** on ownership transfer (`30e22baa`).
- **Apex managed shares with a custom sharing reason survive**; that is the point of the reason (`3f1bd5c8`, `276034b7`).
- After a transfer between peers, the previous owner has **no access** (`1cb4aa5f`).

### External users

- **Customer Community (high-volume) users have no roles** — use a **sharing set** (`68234b0a`, `b90e1a88`), and a **share group** to give internal users access to what they own (`ca3ab1d9`).
- **Partner users get a three-tier role hierarchy** per account — Executive, Manager, User (`46cf2c6f`). **Partner Super User** widens a user's reach to their peers' records (`741614b9`, `e53d2012`, `681f22f4`).
- Collaborating on **opportunities** needs a **Partner Community** licence (`094a753b`).

> **Zero deck questions — restriction rules.**
> Everything above *grants*. Restriction rules are the one mechanism that **takes away**: "the records that the user is granted access to via org-wide defaults, sharing rules, and other sharing mechanisms are filtered by criteria that you specify." They apply to list views, lookups, related lists, reports, search, SOQL and SOSL.
>
> - Only for **custom objects, external objects, quotes, contracts, events, tasks, time sheets and time sheet entries** — not accounts, not opportunities.
> - **Up to two active rules per object** in Enterprise and Developer; **up to five** in Performance and Unlimited.
>
> The exam-shaped contrast: a **restriction rule** removes access a user was granted; a **scoping rule** (§3) only changes what they see by default.

> **Zero deck questions — manager groups.**
> "You can use manager groups to share records with your management chain, instead of all managers in the same role based on the role hierarchy." Every user has two: **Managers Group** (direct and indirect managers) and **Manager Subordinates Group** (the user and their direct and indirect reports). Usable in manual shares and sharing rules, but they **can't be added to other groups and don't include site or portal users**. The tell in a stem is "their manager" rather than "managers in that role".

> **The external OWD ceiling.** Separate internal and external defaults are in the deck (`42ccc679`). The rule it never states: **"The external access level for an object can't be more permissive than the internal access level."** An option setting external Public Read Only over an internal Private is wrong on sight.

## 5. Access to other data

16% of the exam, 17 deck items. One bullet — access to data that is not a standard or custom object record — and the deck covers its main families.

- **Files:** a file in a private library is visible only to its owner (`e39a74a8`); a file posted to a record's feed is visible to the poster and to users who can see the record (`5314dea1`, `7afcfb38`). Password-protected links come from a **content delivery** (`b1f7ddb3`).
- **Report and dashboard folders** are shared with users, roles, roles and subordinates, and public groups (`83bc5172`, `11c6463d`). To share one you need **Manage Reports in Public Folders** plus **Manager** on the folder (`19b83d4f`, `42219114`). Export is its own profile permission (`f8cfaa5e`).
- **List views** are shared with public groups and roles, which is also how you hide irrelevant ones (`ea780ddf`, `36f6a143`, `0fa57dbd`).
- **External objects:** access is an object permission on the profile (`e4ff9eb3`); limiting which external rows each user sees means connecting over OAuth and restricting access in the source system itself (`d40bd22a`).
- **Secrets:** protected custom metadata or protected custom settings in a managed package, or named credentials (`0da8893e`, `b53a73d3`, `d2ab6b1e`).

> **Not covered, and not taught here.** No item touches **Knowledge** article visibility. It belongs to this bullet; this pass did not render its documentation, so it is named rather than taught.

## 6. Implications of security model choice

18% of the exam, 22 deck items — the best-matched domain. Three bullets: scalability, licences, testing.

### Scalability

- **Ownership skew** is one user owning more than **10,000** records of an object. Spread the ownership, and give a parking user **no role** (`b9762333`, `d8e912b9`).
- **Parent (lookup) skew** — too many children under one parent — produces `UNABLE_TO_LOCK_ROW`; redistribute the children (`ffc0447d`, `d91acca1`).
- **Granular locking** lets group changes in separate hierarchies run concurrently (`80e1fa53`, `d603efad`, `9dde825b`).
- **Deferred sharing recalculation** for a reorganisation; **parallel sharing rule recalculation** for a 24x7 org (`57e4ff8c`, `a8ae2576`).
- Share Apex managed sharing to **groups, not users**, so team changes don't force a recalculation (`53a40bfb`).

### Licences

A million distributor users on opportunities point at a **Partner Community** licence (`af9c0811`); partner roles stop at three levels (`57ea8ddf`).

### Testing the model

- **`runAs()`** in tests, per user and profile (`5982cba0`, `b3eeee28`, `c095ab36`) — read §9 before the two items that ask what it enforces.
- **Login As** a sample user in each role and profile (`43e1b231`); the **Sharing** button's access view to troubleshoot (`b26eae84`); an export of **AccountShare** to review (`32457136`).

## 7. Numbers to memorise

| Number | What it is |
|---|---|
| **60 / 120 / 58%** | Scored items, minutes, pass mark. 35 of 60 to pass |
| **27 / 39 / 16 / 18** | Domain weights in outline order |
| **10,000** | Records owned by one user before it counts as ownership skew |
| **3** | Partner roles per partner account: Executive, Manager, User |
| **2 / 5** | Active restriction rules per object: Enterprise and Developer / Performance and Unlimited |
| **2** | Manager groups per user: Managers, and Manager Subordinates |
| **1** | Muting permission sets allowed per permission set group |
| **67.0** | First API version where Apex runs in user mode by default |

## 8. Distractor tells

> **Read the question's own verb.** "Which **feature**" wants a mechanism. "What is **causing**" wants a diagnosis, and this deck pairs several diagnoses with their fixes in one option set. "What is the **impact**" wants the side effect — usually implicit sharing (`33731b3c`, `cdd5ba1f`).

- **Sharing can't fix a permissions problem.** If the user lacks the object or field permission, no sharing rule in the option set helps.
- **"Grant Access Using Hierarchies" only switches off on custom objects.** An option unticking it on Account is wrong.
- **Roles for community users.** Customer Community users have none; an option building their access on the role hierarchy is wrong.
- **Manual sharing for anything that must survive an owner change** is wrong; Apex sharing with a reason is right.
- **A denial of a real capability.** This deck's fact-check found explanations denying things Enterprise Territory Management can do (`9c505fbc`) and calling `isAccessible()` not a real Apex member when it is. Distrust an option that says a platform feature "cannot" do something.

## 9. Where the deck is older than the platform

The exam froze at Winter '23; the platform did not. Two Apex facts moved, and every deck in this repo that touches Apex security still teaches them the old way.

> **runAs now enforces object and field permissions.** Using the runAs Method now says that inside the block "the user's sharing rules and object-level and field-level permissions are enforced", regardless of the test class's sharing mode. The legacy reading — "runAs enforces record sharing only" — is documented nowhere now.
>
> Two items key the legacy reading and are **defective as printed**, because a second option is now also true:
>
> - `09876cfd` keys "record sharing"; FLS and user permissions are now also enforced.
> - `e4de4c7a` keys "runAs does not enforce user or field-level permissions" as a consideration — the statement the documentation now contradicts.
>
> **Answer with the key on the exam; know the current rule for real work.** Neither key was moved, because the exam still tests the legacy reading.

> **Apex's default access mode flipped at API 67.0.** "In API version 66.0 and earlier, Apex runs in system mode by default"; "in API version 67.0 and later, Apex runs in user mode by default". So `28b6b693`'s keyed premise — Apex runs in system mode, so you must enforce visibility yourself — is version-dependent, and its explanation says so. On the exam, assume system mode.

### Defective items, kept as keyed

- **`7d2c8e5f`** — super user access reaches records "at their role level or below". For a Partner **User** that means same-role records only, so the stem's "any user, regardless of role, at the same distributor" is delivered by no option. Its twin `681f22f4` asks about the partner **manager** role, where the same mechanism does reach what the stem wants, so that one is simply correct.
- **`9c505fbc`** — a choose-three about Enterprise Territory Management where Salesforce's comparison table marks *five* options Yes.

### Repeats that are redundancy, not error

Several scenarios appear more than once, reworded. All copies were fact-checked and are correct, so meeting one twice is practice, not a contradiction: `13e3a0cb` / `3f1c2bdd` (lead OWD), `5314dea1` / `7afcfb38` (a file on a record feed), `80e1fa53` / `d603efad` (granular locking), `42219114` / `19b83d4f` (report folder permissions). Two look like repeats and are not: `ea780ddf` is a choose-one whose "(Variant)" `36f6a143` adds the role hierarchy as a second right answer, and `b3eeee28` / `c095ab36` differ in their option sets — only the second offers `with sharing`.

### Retired products in distractors

Process Builder appears as a distractor (`ee79628f`); it reached end of support at the end of 2025. It was never the right answer there, so nothing changes.

## 10. Two-week revision plan

Set by three facts: the pass mark is 58%, the deck spends more than half itself on record access, and the permissions domain is worth 27%.

### Week 1 — the permissions domain and the gaps

1. **Day 1 · User mode and `stripInaccessible`.** Read *Set an Access Mode for Database Operations* and the `stripInaccessible` page. Be able to say when each fails and when it degrades.
2. **Day 2 · Permission set groups, muting, and profiles.** Then work the deck's 22 permissions items.
3. **Day 3 · Restriction rules and scoping rules**, side by side, until "narrows access" versus "narrows the default view" is automatic.
4. **Day 4 · Manager groups and the external OWD ceiling.** Short reads, easy marks.
5. **Day 5 · Access to other data** — the deck's 17 items: files, folders, list views, external objects, secrets.
6. **Day 6–7 · Implications** — 22 items. Skew thresholds, granular locking, deferred and parallel recalculation, licences, testing.

### Week 2 — consolidate, then stop

1. **Day 8–9 · Access to records**, 75 items across two sittings. Above 85%, stop.
2. **Day 10 · §9 in full.** The two Apex facts and the defective items.
3. **Day 11 · §7 and §8.** Numbers and distractor tells.
4. **Day 12 · the order of access** from §4, written from memory.
5. **Day 13 · full deck in Blitz mode.**
6. **Day 14 · only the misses.**

## 11. Sources

Every URL below was rendered in a browser on 2026-09-28 and its title confirmed.

- [Salesforce Certified Platform Sharing and Visibility Architect Exam Guide](https://help.salesforce.com/s/articleView?id=005298977&type=1&language=en_US) — the outline, the four weights, 120 minutes, 58%, and the Winter '23 alignment.
- [Set an Access Mode for Database Operations](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_enforce_usermode.htm) — `WITH USER_MODE`, `as user`, `AccessLevel`, and the user-mode default. Retitled since earlier passes cited it as "Enforce User Mode".
- [Enforce Security with the stripInaccessible Method](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_with_security_stripInaccessible.htm) — strips inaccessible fields rather than failing; sanitises untrusted input.
- [Restriction Rules](https://help.salesforce.com/s/articleView?id=platform.security_restriction_rule.htm&language=en_US&type=5) — what they filter, which objects, and the 2/5 active-rule limit.
- [Scoping Rules](https://help.salesforce.com/s/articleView?id=platform.security_scoping_rule.htm&language=en_US&type=5) — "A scoping rule doesn't restrict users' access to other records".
- [Muting Permission Sets](https://help.salesforce.com/s/articleView?id=platform.perm_set_groups_muting.htm&language=en_US&type=5) — one muting set per group; muting affects only the group's assignees.
- [Sharing Records with Manager Groups](https://help.salesforce.com/s/articleView?id=platform.users_managers_only.htm&language=en_US&type=5) — the two groups, and that they can't be nested or include portal users.
- [External Organization-Wide Defaults Overview](https://help.salesforce.com/s/articleView?id=platform.security_owd_external.htm&language=en_US&type=5) — the external-can't-exceed-internal rule. Search surfaces an older id that redirects here.
- [Using the runAs Method](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_tools_runas.htm) — object and field permissions enforced inside the block. Verified in an earlier pass; see `verified-docs.md`.

Per-question citations live in the deck itself: every one of the 136 explanations ends in a `References:` block with at least one rendered URL.

## 12. Using this with NotebookLM

Upload `study-guides/salesforce-sharing-visibility.md`.

- *Quiz me on user mode versus stripInaccessible versus with sharing. For each scenario, tell me which one fails, which one degrades, and which one only handles records.*
- *Give me ten scenarios and ask whether the answer is a restriction rule, a scoping rule, a sharing rule or field-level security. Include at least three where the tempting answer is wrong.*
- *Walk me through the order access is decided in, from section 4, then give me five stems where one step silently blocks the rest.*
- *List every item in this guide that is defective or version-dependent. For each, tell me what to answer on the exam and what is actually true.*
- *I have seven days. Compress section 10, keeping the permissions domain first.*

---

Measured 2026-09-28 against `public/decks/sharing_visibility_questions_corrected.json` and Help article `005298977`. Question counts and domain weights both have a short shelf life — re-run `node study-guides/reclassify-sharing-visibility.mjs` before trusting the table in §2.
