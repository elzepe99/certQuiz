# Data Architect Field Guide

**Salesforce Certified Platform Data Architect — Spring '23 item bank**

Built from the 135 questions in the practice deck, cross-checked against the official exam outline and the documentation those questions cite. **This exam has not been rebuilt** — it still aligns to Spring '23 — so several products the deck names are retired, and the exam still tests them. That is §11's subject. The rest of the guide is about shape: the deck spends **twice the exam's weight on Master Data Management** and never once names an MDM implementation style, while **Salesforce Data Management, a quarter of the exam, gets a sixth of the practice**.

| Questions | Time | Pass mark | Prerequisite | Aligned to |
|---|---|---|---|---|
| 60 (+5 unscored) | 105 (minutes) | 58% (35 of 60) | None (US$400) | Spring '23 (never rebuilt) |

---

## 1. The exam, factually

> **Two structural facts that matter more than any topic.** **The exam is older than the platform.** Four questions key a product that no longer exists or has been renamed — Data.com Clean three times, Async SOQL once. The exam still asks them. Learn the keyed answer *and* the current reality, and never confuse the two.
>
> **The two 25% domains are not equally practised.** Data Modeling gets 29 items; Salesforce Data Management gets 22 — and the deck spends 14 on a 5% domain.

| | |
|---|---|
| Official name | Salesforce Certified Platform Data Architect |
| Content | **60 scored** multiple-choice items, plus up to 5 unscored |
| Time | **105 minutes** |
| Passing score | **58%** — 35 of 60 |
| Prerequisite | None |
| Fee | US$400, retake US$200 |
| Aligned to | **Spring '23** |
| Exam guide | Help article `005298972` |

## 2. Where the points actually are

This deck's six `_cat` tags already use the current domain names. Every item was still re-read and placed on its own merits (`study-guides/reclassify-data-architect.mjs`). The re-reading agreed with the tags on 122 of 135 and moved no domain by more than three items — so the imbalance below is the deck's own, not a tagging artefact.

| Domain | Exam | ≈ Qs | Deck | Verdict |
|---|---|---|---|---|
| Data Modeling/Database Design | 25% | ~15 | 29 · 21.5% | slightly under |
| Master Data Management | 5% | ~3 | 14 · 10.4% | double |
| Salesforce Data Management | 25% | ~15 | 22 · 16.3% | badly under |
| Data Governance | 10% | ~6 | 15 · 11.1% | about right |
| Large Data Volume Considerations | 20% | ~12 | 30 · 22.2% | about right |
| Data Migration | 15% | ~9 | 25 · 18.5% | over |

> **Fourteen questions on three questions' worth.** Master Data Management is 5% of the exam — about three questions — and 14 deck items. Yet those 14 all ask one thing, "which system is the source of truth", and **none names an MDM implementation style**, which is the first example the outline gives. Heavy on volume, thin on breadth.

### Sub-objectives the deck never asks

Found by reading all 135 against the outline, then confirmed by keyword sweep over stems, options *and* explanations on 2026-09-28.

1. **MDM implementation styles** — registry, consolidation, coexistence, centralised. Zero hits. §4.
2. **Survivorship rules, thresholds and weights; canonical modelling; hierarchy management.** All named in the MDM bullet. "Canonical" and "hierarchy management" return zero; "survivorship" appears only inside explanations. §4.
3. **Data lineage and taxonomy**, named in the modelling domain's metadata bullet. Zero hits. Data dictionaries and classification *are* covered. §3.
4. **Consolidating data across Salesforce orgs** gets two items, under a bullet of its own in a 25% domain. §5.
5. **Erasure and processing restrictions under GDPR** — the deck covers consent and classification but never the "forget" and "don't process" side. §6.
6. **Protecting personal data outside production** — zero hits for Data Mask. The DLD deck's `52e1dadf` covers it. §6.

## 3. Data modeling and database design

25% of the exam, 29 deck items — the best-served domain, and the one to keep sharp.

### Relationships — the choice the exam asks most

- **Many-to-many** is a junction object with two master-detail relationships (`d48ebc5a`).
- **A required parent with its own sharing model** is a *required lookup*, not master-detail — master-detail children inherit the parent's sharing (`c36f8114`, `490f04a3`).
- **A roll-up is a reason to choose master-detail** (`5f012203`).
- **Time-series readings are their own child records**, with an archiving process to keep the volume viable (`04d735c5`).
- One contact working for several accounts is **Account Contact Relationships**, not duplicate contacts (`72d0a97f`).
- B2C consumers are **Person Accounts** (`660b65ef`, `94c7d168`, `02273426`).

### Skew is a modelling decision, not a load problem

- **Ownership skew:** one user owning more than 10,000 records. Spread ownership across several placeholder users, and give a placeholder **no role** or the top role (`198da736`, `bc116afe`).
- **Lookup skew** from a lookup to a small reference object is avoided with a **picklist** (`ca99247f`).
- **Group-membership locking** during territory and role changes: granular locking (`23b3dd3a`, `b8dcc15e`) — now the default, §11.

### Big objects versus custom objects

A big object gives "consistent performance, whether you have 1 million records, 100 million, or even 1 billion", for a 360° view, auditing and tracking, or historical archive. Build one in Setup or through the Metadata API (`83a2f38e`); the loyalty ledger in `0fc4b859` is the textbook case. Querying one means filtering its index **left to right, in order**.

### Business and technical metadata

Covered: a data dictionary built from an ERD and the Metadata API (`6d6fb137`, `c3169fdf`); field descriptions plus source control to trace configuration to requirements (`6cea8580`); data classification fields (§6).

> **Zero deck questions — lineage and taxonomy.** The bullet names **data lineage** (where a value came from and every transformation on the way) and **taxonomy** (the controlled vocabulary that categorises entities) beside the dictionary and classification. No Salesforce feature is *named* for either in the outline, so expect them as the right description of a practice rather than as a Setup node. This is general data management vocabulary; no Salesforce page settles it.

## 4. Master data management

5% of the exam, 14 deck items, and the 14 all ask variations of one question.

### What the deck teaches

- **Decide the system of record per object, and where needed per field**, with the business (`494f56e1`, `d3d324d1`, `228d9ec1`).
- **An MDM hub as the customer master** with centralised integrations (`0799aef6`, `c04b9186`, `32c1152d`, `7320edf2`).
- **A global unique customer ID** held in every system (`f2c6a011`, `b6e90eb0`), stored in Salesforce as an **external ID** (`e45b6fef`).
- **Enrichment from external reference data** (`64fb7668`, `bc6a239c`).

> **Zero deck questions — the four implementation styles.** The outline's first example. These are industry terms, not Salesforce features, so the definitions below are orienting rather than cited:
>
> | Style | Where the golden record lives | Do sources change? |
> |---|---|---|
> | **Registry** | Nowhere — the hub holds only keys and a cross-reference index | No; the view is assembled on read |
> | **Consolidation** | In the hub, built from copies of source data | No; the hub feeds reporting and analytics |
> | **Coexistence** | In the hub, synchronised back to the sources | Yes; edits can start in either |
> | **Centralised** | In the hub, which is where records are authored | Sources consume the hub |
>
> The exam-shaped reading: "one read-only view without moving data" is registry; "a clean record for BI" is consolidation; "keep the legacy CRM and Salesforce both live and in sync" (`21f0d218`, `228d9ec1`) is coexistence.

> **Thin coverage — survivorship, thresholds and weights.** "Establishing data survivorship rules, thresholds and weights" and "criteria and methodology for picking the winning attributes" are both named. The deck reaches them only as "stakeholders decide per field" (`d3d324d1`). Know the usual criteria a survivorship rule ranks by: **source trust** (which system is authoritative for this attribute), **recency**, and **completeness**; and that matching uses **weights** per attribute and a **threshold** above which two records are the same. Again industry vocabulary — no Salesforce page settles it.

## 5. Salesforce data management

25% of the exam and 16% of the deck — the biggest shortfall in this guide. Four bullets; here is what the deck gives for each, and where to add.

### Licence types

- Complaints, white papers and paid support → **Service Cloud** (`653108ec`).
- Franchisees or resellers tracking opportunities and running reports and dashboards → **Partner Community** (`9a854137`, `82f8541b`).

### Data persisted consistently

- **Duplicate and matching rules** to alert at entry (`62d57046`, `8a9dd0ab`, `d944cd7b`).
- **Required at the field level plus a validation rule**, because a page-layout requirement does not bind an integration (`ce519e3c`).
- **FLS read-only** on a field that only automation should set (`dbda5ce8`).
- **`FOR UPDATE`** to lock records and stop two processes updating the same record at once (`bc9fbe75`).

### A single view of the customer

Surface external sources in Salesforce rather than copying them (`03d3d67f`), and send contacts to Marketing Cloud with a reconciliation back (`fc881d63`).

> **Thin coverage — data across multiple Salesforce orgs.** A bullet of its own, and two deck items. What they teach, and what to add:
>
> - **Near-real-time, bidirectional:** Heroku Connect with Heroku Postgres, middleware, or Salesforce Connect's **cross-org adapter** (`1dcb0fad`). The adapter "uses Lightning Platform REST API calls to access records in other Salesforce orgs" and surfaces them as external objects that are read on demand, not copied.
> - **External objects can be writable.** An earlier version of this deck said the cross-org adapter was read-only; that was an invented absence and was corrected.
> - **Splitting an org** in a divestiture is an ETL-orchestrated migration (`e1bb3531`).

## 6. Data governance

10% of the exam, 15 deck items. Two bullets: a GDPR-compliant model, and a governance programme.

### Classify and protect

- **Data classification metadata fields** on every field definition: data owner, field usage, **data sensitivity level**, **compliance categorization** (`7864209e`, `2381fc3c`, `62817718`).
- **Consent** is recorded on the **Individual** object and on **Authorization Form Consent** (`080ab665`, `fee3c3cb`).
- For a regulated customer: **Event Monitoring** to see every user action, **Transaction Security** policies to stop exports, and **encryption** at rest (`4bce9573`, `917fdd2a`).

> **Thin coverage — the erasure side of GDPR.** The Individual record carries privacy preferences beyond consent: **Don't Market**, **Forget this individual**, **Don't Process** and **Don't Track**. Salesforce's page documents their email effect — a person flagged "Forget this individual" or "Don't Process" "can't receive any emails". It does **not** say that setting the flag deletes anything. **Treat the flag as the recorded request and design the erasure yourself.**

> **Personal data outside production.** No item in this deck asks it. The DLD deck's `52e1dadf` keys masking a Full sandbox after refresh. Salesforce Data Mask now carries a "(Legacy)" title, reaches end of service on **31 December 2026**, and is superseded by Data Mask & Seed.

### The governance programme

- First steps: **executive sponsorship** on strategy, then **business units and IT** on current systems (`3fa0d934`).
- The decision team includes **data domain stewards** and analytics owners (`65d0445b`). The programme improves **integrity and usability** (`059c5083`).
- Measure quality on **completeness, accuracy, timeliness, consistency** and duplication (`6aec9626`, `2720a20e`, `7677c4b0`).

## 7. Large data volume considerations

20% of the exam, 30 deck items — well covered. Three bullets: a model that scales, archiving, and virtualised data.

### Query and report performance

- **Selective filters on indexed fields**, bounded date ranges, fewer joins, fewer rows returned (`5e9beb7c`, `f0db132b`, `8240db57`).
- **Skinny tables** avoid joins, omit soft-deleted records, stay in sync with their source — and hold **a maximum of 200 columns**. Salesforce Support enables them (`9463eb8c`, `4a391507`, `835bdddc`).
- **SOSL:** search single objects, avoid wildcards (`57575bec`).

### Archiving and purging

- Ask first: must archived data be reported on, can it be aggregated, what does regulation require (`3c855a77`).
- Keep it in Salesforce but out of the way: a **big object** (`6c68223a`, `37c626a7`, `ef7c3bbb`, `ec8bac62`).
- Move it out: a **batch job or ETL tool** to export and delete (`e3a36fd1`, `b335ae04`, `7aacafef`, `0492a3b0`). Summarise first where trends are what matter (`75e5ce3f`).

### Virtualised data

- **Salesforce Connect** when you need real-time access, have too much to copy, and need small amounts at a time (`a53d5bba`); external objects for 150 million read-only orders (`6df7398a`, `92c5ec17`).
- No OData endpoint? A custom adapter with the **Apex Connector Framework** (`9c969490`). Watch **OData callout limits** (`4c72af32`).
- **External objects can be reported on** — an earlier explanation denied it and was corrected (`9ffe285d`).
- Data that workflows and developers must aggregate belongs **in** Salesforce, not virtualised (`086174ae`).

## 8. Data migration

15% of the exam, 25 deck items — over-covered, and consistent. Learn the load recipe once.

### The load recipe

1. **Clean before you load**, in a staging database keyed on external IDs (`18c03f25`, `cef24a99`, `cc82d27c`); an ETL tool for type mismatches (`f7f8df0e`).
2. **Defer sharing calculations** for the load (`02d7d143`, `bd39a845`, `aacf221c`).
3. **Disable triggers, validation, workflow and approvals** for the load (`1b5040e4`, `46b07a60`).
4. **Load parents first, and sort children by parent ID** so batches don't fight over one parent's lock (`1829b7d4`, `0fcda086`).
5. **Serial mode** when parallel batches still lock (`c18bcee7`, `22459270`, `b2d96c78`).
6. **Insert new and update existing** rather than upsert everything: "insert() is fastest, update() is next, and upsert() is next after that" (`c99f1959`); an upsert file with a repeated external ID fails (`017a4f13`).
7. **Preserve history** with *Set Audit Fields upon Record Creation* and *Update Records with Inactive Owners* (`49211aa0`).

### Exporting

- **Bulk API** for a million rows (`8a8b4d53`); **PK chunking** for tens of millions, set by the `Sforce-Enable-PKChunking` header (`8060db43`, `b53c2dee`); an auto-number to chunk by if you must (`6a70c4d2`).
- **Data Export Service** for a scheduled weekly CSV export from the UI (`08d19a88`).
- Classic-encrypted fields export masked unless the exporting user has **View Encrypted Data** (`50edde4f`).

## 9. Numbers to memorise

| Number | What it is |
|---|---|
| **60 / 105 / 58%** | Scored items, minutes, pass mark. 35 of 60 to pass |
| **25 / 5 / 25 / 10 / 20 / 15** | Domain weights in outline order |
| **10,000** | Records owned by one user before it counts as ownership skew |
| **200** | Maximum columns in a skinny table |
| **1 billion** | The scale at which big objects still promise consistent performance |
| **Summer '23** | Async SOQL retired; use Bulk API or batch Apex on big objects |
| **31 Dec 2025** | End of support for Workflow Rules and Process Builder |
| **31 Dec 2026** | End of service for Data Mask (Legacy) |

## 10. Distractor tells

> **Read the question's own verb.** "To **minimise load time**" wants a load setting (defer sharing, serial, sort). "To **avoid** the error" wants a design change (spread ownership, picklist, granular locking). This deck puts both kinds in the same option sets.

- **The invented absence.** This deck's fact-check found five explanations denying capabilities that exist: external objects can't be reported on (they can), the cross-org adapter is read-only (it isn't), there is no native archiving (there are three archiving products). An option claiming Salesforce "cannot" do something is wrong more often than right.
- **A wrong number on a real feature.** `9463eb8c` offers skinny tables of "up to 100 columns"; the documented cap is 200. Numbers in options are checkable facts.
- **Upsert as the fast choice.** It is the convenient one. The LDV guide ranks them: "insert() is fastest, update() is next, and upsert() is next after that."
- **A retired product as the "declarative" option.** On this exam it may still be the key — see §11.

## 11. Where the deck is older than the platform

The exam froze at Spring '23. These items key what the exam tests; know the current reality beside it.

> **Data.com Clean — retired, still keyed three times.** Data.com appears in Salesforce's Past Product & Feature Retirements list, and its setup article is gone.
>
> - **`ba5e12d5` has no correct answer on a current org.** Its key is Data.com Clean, and no other option does the job.
> - `bc6a239c` keys Data.com Clean beside a third-party enrichment service; the second half is the answer that survives.
> - `d944cd7b` keys it beside Duplicate Management; same shape.
>
> **On the exam, pick Data.com Clean where it is keyed. In real work, name a third-party enrichment service.**

> **Async SOQL — retired Summer '23, no replacement offered.** `d0fb5008` keys Async SOQL for reporting on big objects. Salesforce's retirement notice: "You must use the Bulk API or batch Apex to query or report on custom Big Objects after your org gets upgraded to the Summer '23 release." Neither is among the options, so the item is stale as printed.

### Renamed or changed, answer unaffected

- **Wave / Einstein Analytics / Tableau CRM / CRM Analytics** — one product, four names (`f033e669`, `d5dd4ffc`, `ec8bac62`).
- **Granular locking** is now the default rather than something an admin enables (`23b3dd3a`, `b8dcc15e`). The keyed answer stands; on a current org the diagnosis matters more than the switch.
- **Workflow Rules** reached end of support on 31 December 2025; a new build fires the same outbound message from a record-triggered flow (`e557d7c9`).
- **Classic Encryption** is a legacy feature (`50edde4f`).

### Questions no documentation can settle

About nineteen items are governance, MDM strategy or tooling judgment, and say so in their own prose — among them `3fa0d934`, `65d0445b`, `059c5083`, `6aec9626`, `494f56e1` and `0799aef6`. Their citations orient rather than decide. Three licensing items (`653108ec`, `9a854137`, `82f8541b`) rest on commercial bundles that change often.

### Near-duplicates the detector cannot see

Eleven pairs ask the same thing with rewritten stems, which is why `find-duplicates.mjs` misses them; four are self-labelled "(Variant)". All copies are correct, so treat them as repetition. The clearest: `23b3dd3a` / `b8dcc15e` (granular locking), `9a854137` / `82f8541b` (Partner Community), `2381fc3c` / `62817718` (data classification), `9463eb8c` / `4a391507` (skinny tables), `660b65ef` / `94c7d168` (B2C modelling).

## 12. Two-week revision plan

Set by three facts: the pass mark is 58%, Salesforce Data Management is a quarter of the exam and a sixth of the deck, and four keyed answers name retired products.

### Week 1 — the under-covered half

1. **Day 1 · Salesforce Data Management.** The deck's 22 items, then §5's multi-org material until you can choose between Heroku Connect, middleware and the cross-org adapter.
2. **Day 2 · MDM styles and survivorship.** §4's table from memory. Then the deck's 14 MDM items in one sitting — they will take less than an hour.
3. **Day 3 · Governance.** Classification fields, consent, the privacy flags, and what a governance programme measures.
4. **Day 4–5 · Data modeling**, 29 items. Relationships and skew until automatic.
5. **Day 6–7 · Large data volumes**, 30 items.

### Week 2 — consolidate, then stop

1. **Day 8 · Data migration**, 25 items. Write the load recipe from memory.
2. **Day 9 · §11 in full.** Data.com Clean, Async SOQL, and the renames.
3. **Day 10 · §9 and §10.**
4. **Day 11–12 · full deck in Blitz mode**, in two halves.
5. **Day 13 · only the misses.**
6. **Day 14 · rest.**

## 13. Sources

The exam guide, the privacy page and the cross-org adapter page were rendered in a browser on 2026-09-28; the others were verified by the deck's 2026-08-19 fact-check and its 2026-09-21 readability pass, and are recorded in `verified-docs.md`.

- [Salesforce Certified Platform Data Architect Exam Guide](https://help.salesforce.com/s/articleView?id=005298972&type=1&language=en_US) — The outline, the six weights, 105 minutes, 58%, and the Spring '23 alignment.
- [What's the Difference Between Email Opt Out and Individual Email Privacy Settings?](https://help.salesforce.com/s/articleView?id=sales.emailadmin_opting_out_differences.htm&language=en_US&type=5) — The four Individual privacy flags and their email effect. Nothing on this page says the flags delete data.
- [Salesforce Big Objects Async SOQL Retirement](https://help.salesforce.com/s/articleView?id=000394892&language=en_US&type=1) — Summer '23, and "Bulk API or batch Apex" as the replacement.
- [Big Objects](https://developer.salesforce.com/docs/atlas.en-us.bigobjects.meta/bigobjects/big_object.htm) — The 1-billion-record claim and the three named use cases.
- [Skinny Tables](https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_infrastructure_skinny_tables.htm) — The 200-column cap and the three reasons skinny tables are fast.
- [Cross-Org Adapter for Salesforce Connect](https://help.salesforce.com/s/articleView?id=platform.xorg_adapter_about.htm&language=en_US&type=5) — REST calls into another org, surfaced as external objects.
- [Past Product & Feature Retirements](https://help.salesforce.com/s/articleView?id=005132112&language=en_US&type=1) — Where Data.com is listed.

Per-question citations live in the deck itself: every one of the 135 explanations ends in a `References:` block with at least one rendered URL.

## 14. Using this with NotebookLM

Upload `study-guides/salesforce-data-architect.md`.

- *Give me eight scenarios and ask which MDM implementation style fits each. Include a stem where two styles look plausible and explain the tie-break.*
- *Quiz me on the load recipe in section 8. Give me a failing load and ask which step was skipped.*
- *For every item in section 11, tell me the exam answer and what I would actually build today.*
- *Explain the difference between a load-time lock and a design-time skew, then give me five stems and ask which one each is.*
- *I have six days. Compress section 12, keeping Salesforce Data Management first.*

---

Measured 2026-09-28 against `public/decks/questions_data_architect_merged.json` and Help article `005298972`. Question counts and domain weights both have a short shelf life — re-run `node study-guides/reclassify-data-architect.mjs` before trusting the table in §2.
