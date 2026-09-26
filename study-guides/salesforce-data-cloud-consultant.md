# Data 360 Consultant Field Guide

Built from the 100 questions in the practice deck, cross-checked against the official exam
outline and the documentation those questions cite. Measured 2026-09-26.

**Read this first: the product and the certification have both been renamed, and the deck
deliberately keeps the old names.** Salesforce rebranded Data Cloud to **Data 360** on
**14 October 2025**, and the certification became the **Salesforce Certified Data 360
Consultant** on **27 March 2026** — same exam code, `Data-Con-101`. All 100 stems and option
sets still say "Data Cloud", and that is a deliberate choice recorded in this repo, not an
oversight: a learner who meets the old name on the exam and has only ever seen the new one is
worse off than the reverse. So **the deck teaches you the exam's vocabulary and this guide
teaches you the product's.** §11 maps every rename you will meet.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Salesforce Certified Data 360 Consultant |
| Exam code | `Data-Con-101` (unchanged through the rename) |
| Content | **60 scored** multiple-choice questions, plus up to 5 unscored |
| Time | **105 minutes** |
| Passing score | **70%** — 42 of 60 |
| Prerequisite | None |
| Fee | US$200, retake US$100 |
| Aligned to | **Spring '26** |
| Exam guide | Help article `005298940` |
| Courses named | SDC101 *Discover Salesforce Data 360 Fundamentals*, SDC301 *Design and Build Effective Solutions with Data 360* |

Two structural facts matter more than any topic.

**The exam is aligned to Spring '26 and the deck was fact-checked in August 2026 against
Data Cloud-era material.** Unlike Revenue Management, where the exam lags the docs, here the
exam is *current* — it was rebuilt around the Data 360 name and around AI. That makes the
deck's gaps real exam risk rather than trivia.

**70% is a real bar.** You can miss 18 of 60. The deck over-drills one domain so heavily
(activations, 32 of its 100 questions against 20% of the exam) that working it to completion
gives a false sense of readiness.

---

## 2. Where the points actually are

The deck's own six `_cat` tags — Data Ingestion and Modeling, Segmentation and Insights, Act
on Data, Data Cloud Overview, Data Cloud Setup and Administration, Identity Resolution — are
the *old* outline. The current one has six domains with different boundaries, and it splits
enrichment and analysis away from segmentation, which is what exposes the imbalance. The deck
column is an independent re-classification of all 100 against the current domains
(`study-guides/reclassify-data-cloud.mjs`).

| Domain | Exam | ≈ Qs | Deck | Verdict |
|---|---:|---:|---:|---|
| **Solution Positioning** | **14%** | **~8** | **7 · 7.0%** | **badly under** |
| Setup and Administration | 13% | ~8 | 9 · 9.0% | under |
| Data Source Connection and Ingestion | 18% | ~11 | 23 · 23.0% | over |
| Harmonization and Unification | 17% | ~10 | 16 · 16.0% | about right |
| **Data Enhancements, Sharing and Analysis** | **18%** | **~11** | **13 · 13.0%** | **under** |
| **Data Activations and Utilization** | 20% | ~12 | **32 · 32.0%** | **badly over** |

**The over-drill is the headline.** Nearly a third of the deck is segments, containers,
activations, publish schedules and activation troubleshooting — worth about twelve real
questions. You will finish the deck fluent in the one domain that needed the least work.

**The two gaps that will cost you marks:**

- **Solution Positioning, 14% against 7%.** Eight real questions on terminology, business
  value, initial use cases, data ethics — and Data 360's role in **generative and predictive
  AI**, which the deck never touches at all.
- **Data Enhancements, Sharing and Analysis, 18% against 13%.** And the shortfall is
  concentrated in exactly the bullets the deck ignores: predictive and generative AI tooling,
  reports and dashboards over Data 360 data, and referencing Data 360 from other systems.

One boundary rule was applied consistently, and it is worth knowing so you can reproduce the
table: **a question whose discriminator is a calculated or streaming *insight* is
Enhancements, even when the scenario is a segment; a question whose discriminator is the
segment, container, activation or flow is Activations.** Without that split the two domains
blur and the 32-question activation block looks like balanced coverage.

---

## 3. Solution Positioning

14% of the exam, about eight questions, seven in the deck — and the seven cover only half the
bullets.

### What the deck does cover

- **Use cases that fit**: ingest and unify data from various sources to reconcile customer
  identity; use harmonised data to understand the customer and business impact
  (`9b1101be`, `a6d82413`, `84996fff`).
- **The two functional areas to highlight** to a customer with disjointed sources: **Data
  Harmonization** and **Unified Profiles** (`c50c16e0`).
- **The first phase of the lifecycle**: identify use cases *and* the required data sources
  *and* data quality (`87c989ff`). Note all three — an option naming only use cases is
  incomplete.
- **Data ethics**: carefully consider asking for sensitive data such as age, gender or
  ethnicity (`3ce5cecc`). This is a principles question and the deck's only one.
- **High availability** comes from distributing data across multiple regions and data centres
  (`b2861a64`).

### What the deck does not cover at all

**"Articulate Data 360's foundational role in generative and predictive AI" is a named
bullet, and the deck returns zero hits for "generative", "predictive", "prediction",
"Einstein Studio", "Model Builder", "Agentforce", "Copilot" or "prompt".** This is the
single biggest content gap in the deck. What to know:

- **Grounding** is the process of adding additional context to a prompt. Data 360 is the
  grounding substrate: it holds the unified profile and the unstructured content, and it
  serves both to prompt templates and agents.
- **Retrieval-Augmented Generation (RAG)** in Data 360 works through **search indexes** and
  **retrievers** — see §7, where the mechanism belongs.
- **Predictive AI** is built in **AI Models (formerly Einstein Studio)**: you can train a
  model on Data 360 data, or register an externally hosted one — for example a Databricks
  serving endpoint — through **Model Builder**, and write its inferences back.
- The positioning sentence to be able to say: Data 360 is what makes AI answers *about this
  customer* rather than *about customers in general*, because it is the layer that has
  already resolved identity and harmonised the model.

If you remember one thing from this section for the exam: when an option offers Data 360 as
the foundation for an AI capability, that is usually the right shape, and the deck will never
have shown you one.

---

## 4. Setup and Administration

13% of the exam, 9 deck questions. Reasonable coverage, one clear hole.

### Permissions and permission sets — learn both names

This is where the rename bites hardest, because the deck's option text sends you to a Setup
node that no longer exists. The capabilities map 1:1, so no key changes.

| The deck's options say | Salesforce now calls it |
|---|---|
| Data Cloud Admin | **Data Cloud Architect** |
| Data Cloud Marketing Specialist | **Activation Specialist** |
| Data Cloud Marketing Manager | **Activation Manager** |
| Data Cloud for Marketing Data Aware Specialist | **Data Cloud Data Aware Specialist** |

The deck's questions, with the capability that decides them:

- Review individual rows and validate modelling, nothing more → **Data Aware Specialist**
  (`860708a5`).
- Create, manage and activate segments, but not create reports or manage data sources →
  **Marketing Specialist** / Activation Specialist (`1d6366ff`).
- Segment Intelligence insights → **Data Cloud Admin** / Data Cloud Architect (`3b0c0a4e`).
- A custom CRM object missing from New Data Stream configuration → confirm **View All** object
  permission in the **source** CRM org (`ddf8624d`). Note *source*, not Data 360.

### Data spaces

Four deck questions, and they are consistent: a data space is the tool for **segregating data
by brand or by business line**.

- Six brands, marketing director wants one brand kept separate → **separate that brand into a
  data space** (`480f5379`).
- Business and personal loans sharing a Contact DLO → **two data spaces** (`3e489c6f`).
- An object missing when mapping a data stream in a data space → **Data Space tab, select the
  object to include** (`0a109a96`).

### Governance mechanisms

- **Consent API** for right-to-be-forgotten: deletion requests are submitted **for Individual
  profiles**, and are **reprocessed at 30, 60 and 90 days** (`ff10adbd`). Those three numbers
  are the most exam-shaped fact in this domain.

### The hole: development lifecycle and tooling

The outline has two bullets here — "manage the development lifecycle with available tooling"
and "use tooling to diagnose and troubleshoot common issues". The deck has **one** item:
**data kits** move a tested S3 data stream and its mappings between Data 360 orgs
(`aa78cb1b`). Nothing on packaging beyond that, nothing on sandbox-to-production promotion,
nothing on metadata deployment. Read the data-kit documentation and know at minimum that a
data kit is the unit of portable Data 360 configuration.

---

## 5. Data Source Connection and Ingestion

18% of the exam, 23 deck questions — over-covered by volume, but **one whole named bullet is
missing**, so do not skip this section.

### Zero-Copy — a named bullet with zero deck questions

"Describe Data 360's data collaboration capabilities, **including Zero-Copy**" is in the
outline. **"Zero-Copy" returns zero hits in the deck, as do Snowflake, BigQuery, Databricks,
Redshift, "data share" and "federation".** Learn it from scratch; it is the most
self-contained gap in this guide and therefore the cheapest to close.

**Zero copy data federation** means querying data from multiple physically distinct sources
and treating them as one logical system — a *federation* — while each system keeps its
autonomy. It **avoids duplicating data across system boundaries.**

Every system has a **storage** component and a **compute** component, and that is the key to
the two methods:

| Method | Whose compute runs the query |
|---|---|
| **Query Federation (Compute)** | Data 360 sends SQL to the **external** system's compute engine; it executes and returns records |
| **File Federation (Storage)** | Data 360 queries external storage **directly with its own** query engine, provided the data uses a supported **open table format** |

**In both cases the records are not retained after the workflow completes.** That is the
sentence to remember — zero copy means no persistent copy, in either direction.

Three more facts:

- Either way Data 360 **creates a DLO**, but a zero-copy DLO **contains no actual data** — it
  is a **pointer to the external physical table**. These are called **external** or **virtual
  DLOs**.
- **Caching, also called acceleration**: enabling acceleration when you create a data stream
  turns on caching, which pulls data into a DLO temporarily. Salesforce recommends it **when
  accessing large data sets or when data changes frequently**, and you choose the refresh
  frequency. So the three performance options are live query, accelerated query against the
  local cache, and file federation.
- The **outbound** direction is **Data Shares** — Data 360 objects exposed as **views** in a
  target account such as Snowflake.

Partners named in the documentation: **Amazon Redshift, Databricks, Google BigQuery,
Snowflake, Apache Iceberg, IBM watsonx.data.**

### Connectors and bundles

- **CRM Connector**: allows standard fields to **stream in real time** (`57588274`); on
  initial setup expect a **full refresh** (`086bbfd8`); and when a **column is added or
  removed** it performs a full refresh (`062012ec` — see §11, this one is not settled).
- **Web and Mobile Application Connector**: the **Tenant Specific Endpoint is
  auto-generated** when you set the connector up (`6c28ea56`).
- **Ingestion API** for fast, scalable near-real-time streaming from an inventory system
  (`4ea7fff4`).
- **Marketing Cloud Data Extension Data Stream** for subscriber profile attributes daily
  (`a0813551`).
- **B2C Commerce**: the **Order Bundle ingests 30 days** of historical data (`d45cb02d`); for
  two years of history use **Starter Bundles plus a custom extract** (`8fb738c4`).
- **Bulk then streaming**: load the last 90 days in bulk, then switch to streaming to stay
  current (`3128d558`).
- Separate S3 buckets for ingestion and activation → **dedicated S3 data sources in Data 360
  setup** (`159e1391`).
- S3 `NO FILE FOUND` → check the Data 360 user's permissions **and** that the file exists at
  the specified bucket location (`485c7063`).
- An S3 stream in upsert mode with a changed formula → Data 360 does a **full refresh and
  updates the formula on all records** (`008f7008`).

### Stream categories — a reliable exam target

| Category | When |
|---|---|
| **Profile** | Data you will segment on, e.g. a list of employees (`74955e95`) |
| **Engagement** | Data used for **date and time-based operations** in segmentation and calculated insights (`7539b43f`) |
| **Other** | Everything else |

And one that catches people: only **Engagement** category DLOs can be mapped to the Sales
Order DMO (`6c5846b5`).

### Transforms, formulas and keys

- A **formula on ingest** transforms a date-time field into a date for mapping (`dab6989b`),
  and standardises a phone format for later SMS use (`214e0fc6`).
- **No primary key available** → build a **composite key by combining two or more source
  fields through a formula field** (`575074ec`), using **`CONCAT`** (`746c2926`).
- **Streaming transforms** for real-time CRM integration (`4dea9b59`) and for normalising
  three phone fields off a Contact into one (`8446b713`).
- **Batch data transform creating a new DLO** when related-attribute values need reshaping
  before activation (`4a344343`).
- **Text** field type preserves leading zeros in a purchase order number (`98eda96e`).
- Case data's event time field should be **Creation Date** (`282c475b`).

---

## 6. Harmonization and Unification

17% of the exam, 16 deck questions — the best-matched domain, and the deck's material is
sound. Compressed, because there is little to add.

### Identity resolution

- **Match rules** decide who gets unified; **reconciliation rules** decide which attribute
  value wins when they conflict (`ab4092db`). That single sentence answers most of this
  domain.
- A **low consolidation rate** → **increase the number of matching rules** (`d0a0a5f3`).
- To unify on an ID that is not the customer's unique ID — a Loyalty ID, a Patient ID — use
  the **Party Identification** object (`caf7811f`, `a76eedab`). The healthcare case is worth
  noting: Party Identification on Patient ID avoids unifying on PII.
- Identity resolution is the configuration you must complete **after ingestion and before
  segmenting** (`d0755ebe`).
- **Deleting a ruleset** removes the unified customer data associated with it **and** the
  dependencies on data model objects (`64df83e0`).
- Validate a unified profile with **Identity Resolution, Data Explorer and Profile Explorer**
  (`a82aca1f`), or with **Data Explorer and the Query API** (`704331e8` — see §11, the deck
  contradicts itself here).
- Segment on the **Unified Individual** entity (`ffde1996`).

### Modelling

- Map **name to Individual** and **email address to Contact Point Email** — do not put the
  email on Individual (`73954651`).
- A **1-to-1 relationship error** between Account and Contact Point Address → **map additional
  fields to the Contact Point Address DMO** (`53f152a2`).
- Extra profile attributes such as eye colour → **custom fields on the standard Individual
  DMO**, not a new custom DMO (`31242001`).
- A new custom DMO that will not appear in segmentation → **it is not of category Profile**
  (`a8a68101`).
- **Value suggestion** is enabled at **Data Mapping** time when you create the DMO
  (`579f07b4`).

---

## 7. Data Enhancements, Sharing and Analysis

18% of the exam, 13 deck questions, and **three of its four bullets are barely covered.** After
Solution Positioning this is the domain to spend time on.

### Calculated and streaming insights — what the deck does teach

- A **calculated insight** is the answer when the criterion is an aggregate over history:
  deposits over $250,000 in five years (`056ea0e6`), two page visits in 24 hours
  (`0b702723`), lifetime value.
- A **streaming insight** is the answer when the window is minutes and the trigger is
  real-time: 15-minute aggregations from the Interaction or Mobile SDK (`a40ce191`), daily
  transaction volume outside a customer's norm, paired with a **data action** to notify
  (`a032b276`).
- Streaming insight windows are set by the **insights aggregation time window** — 1 hour for
  an abandoned-browse journey (`d9f0e781`).
- **Metrics on metrics** builds a metric from another metric, for LTV broken down by channel
  (`ce553d2c`).
- The DMO join path for a unified LTV metric: **Unified Individual → Unified Link Individual →
  Sales Order** (`537887b3`). Memorise the link object in the middle.
- For a calculated insight to appear in the segmentation canvas it needs **a dimension
  including the Individual or Unified Individual Id** *and* **the primary key of the segmented
  table as a dimension** (`01c4c7ad`).
- Modifying a calculated insight: **new dimensions can be added** (`de949f0f` — and new
  measures; see §11, this item is defective).
- The refresh order to respect: **Data Stream → Identity Resolution → Calculated Insight**
  (`98a2f67b`).

### Retrievers and search indexes — the AI bullet, zero deck coverage

The outline asks you to "apply predictive and generative AI tooling capabilities of Data 360
to customer scenarios." The deck has nothing. This is the mechanism:

**Data preparation for retrieval is: loading, chunking, vectorizing, and storing content in a
search-optimised way.** Data 360 uses a **vector data store** for unstructured data such as
documents and conversation histories.

- A **search index** stores the chunked and vectorized data. It is **defined in a data space
  and associated with a DMO**. Search indexes are built for general use — indexing a whole
  knowledge base.
- A **retriever** conducts a *specialised* search over a search index and hands results to
  agents, prompt templates and flows. You build retrievers in **AI Models (formerly Einstein
  Studio)** and **activate** them to make them available to Prompt Builder.
- An **individual retriever**: choose its search index, define **filters**, specify which
  **fields** to return and **how many results**. Each save creates a **new version**, and
  **only one version can be active**.
- An **ensemble retriever** is a collection of individual retrievers: it runs them, combines
  the results into one list, **reranks by relevance**, and returns only the most relevant.
- A **dynamic retriever** uses placeholders that take run-time values from the prompt
  template.
- The **Retriever Playground** is where you configure pre-filters, select test data and adjust
  result parameters before deploying.
- **Citations**, enabled in AI Models at the individual-retriever level, link a generated
  response to its source content so a user can spot a hallucination.
- Retrievers obey data governance, and **row-level access checks** apply to what they return.

### Data graphs — appears in the deck only as a wrong answer

"Data graphs" appears once in the deck (`8a1c3eba`) and only as a **distractor**. They are how
Data 360 serves unified data fast, so they are worth knowing properly:

- A data graph brings together structured data from **DMOs** into an easy-to-use view. Because
  the data is **preprepared**, queries return "almost instantly".
- You choose the fields to combine; Data 360 produces a single **read-only data graph record**
  holding all of it in **one JSON blob**.
- Data graphs are **crucial for real-time identity resolution, real-time calculated insights
  and real-time segmentation** — that triple is the exam-shaped fact.
- Visible through **Data Explorer** and **Query Editor**; queryable directly through the
  **Metadata API** and **Query API**.

### Reports, dashboards, and reaching Data 360 from elsewhere

Two named bullets, one deck question each.

- **Tableau** is the tool named for visualising and analysing unified data (`e64df7b2`).
- To see when each segment was last published, use a **Dashboard and a Report** (`b0006afc`).
  Note this is monitoring, not analysis of customer data — the outline wants the latter too.
- To show all cases for a Unified Individual on a contact record: **Profile API** plus
  **Lightning Web Components** (`0e845e09`). That is the deck's only "reference Data 360 from
  another system" item; the broader surface is the Query API, the Connect API and data graphs.

---

## 8. Data Activations and Utilization

20% of the exam and **32% of the deck**. Work it once, confirm you are fluent, and spend the
time you save on §3 and §7.

### Segments

- The three things you can build a segment on: **direct attributes, calculated insights,
  related attributes** (`7fc59544`).
- **Containers**: attributes for product colour and product type must go in a **single
  container** to mean "the same purchase" (`300d941c`). Two containers joined by AND mean two
  *separate* purchases (`0147d0c4`). Multiple container paths make the result **larger or
  smaller than expected** (`4627a1a2`).
- **Nested segment** for exclusion criteria shared across brand teams and updated monthly
  (`0c1d58b4`). But **"Segment is too complex"** is fixed by replacing nested segments with a
  **calculated insight** (`884376a2`), and **"too many data lake objects"** by splitting the
  segment *and* using calculated insights (`ee3e98b9`).
- **Segmentation exclude rules** to remove recent purchasers (`4caa9078`).
- **Last Number of Days** is the filter operator for "visited in the previous 7 days"
  (`0b277734`).
- **Value suggestion** gives a picklist of text attribute values (`d917a833`); if suggestions
  are missing it is **still processing, up to 24 hours** (`b16bbc31`, `e652607d`).
- Segmentation filters are **case-insensitive**: `City Is Equal To 'San Jose'` matches
  `SAN JOSE`, `san jose` and `San jose` (`f3b19bee`).
- Delays publishing many segments at once → **increase the segmentation concurrency limit**
  (`f687a6b9`).
- Schedules follow **the time zone of the logged-in user who set them** (`e362f29c`).

### Activations

- The activation membership object is a **Data Model Object** (`29f828ca`).
- **Consent**: include Consent Status for the applicable channel in the **filter criteria of
  each segment** (`1148d70c`).
- **Pause** an activation you intend to reuse by **stopping the publish schedule**
  (`8f5494a9`).
- **Source priority order in activations** decides which source's contact point is used —
  this is the documented way to pick a best email or address (`dc2c1055`).
- **Preferred attribute names** are set when configuring the activation, for Cloud File
  Storage naming conventions (`5ce00e3e`).
- S3 output: the **`.json` file carries the segment metadata**, the **`.csv` carries the
  activated data payload** (`9d9d4efd`, `a0c8b14c`).
- To get a CRM Campaign ID into the file, put the campaign identifier in **the activation
  name** and in **the filename specification** (`625b0134`).
- Related attributes missing from a payload → the related engagement events must be **within
  the last 90 days**, and the **correct path** must be selected (`e80443fb`); or the attributes
  **sit on different related paths** (`7001f646`, `2646b393`, `17b95a6b`).
- Stale related attributes → **filter the related attribute** by date, e.g. exclude orders
  older than 30 days (`8a1c3eba`).
- Activation lag → check that **calculated insights run before segments refresh** and that
  **segments refresh after ingestion** (`e99bd25d`).
- A Data 360 segment count differing from a Marketing Cloud data extension count → **business
  units** (`49ee75cb`).

### Data 360 in Salesforce flows

Two deck items, and both are the same shape — flow is the glue for anything event-driven:

- Refresh calculated insights and segments when a nightly file lands → **Flow triggering a
  change data event** (`b35887c5`).
- Alert an admin on Slack and email when a data stream fails → **Salesforce flows**
  (`b985f235`).

---

## 9. Numbers to memorise

| Number | What it is |
|---|---|
| **60 / 105 / 70%** | Scored questions, minutes, pass mark. 42 of 60 to pass |
| **14 / 13 / 18 / 17 / 18 / 20** | Domain weights in outline order. They sum to 100 |
| **Spring '26** | Exam alignment |
| **14 Oct 2025** | Data Cloud became Data 360 |
| **27 Mar 2026** | The certification was renamed; exam code stayed `Data-Con-101` |
| **30, 60, 90 days** | Consent API deletion requests are reprocessed at these intervals |
| **24 hours** | How long value suggestion can take to become available |
| **90 days** | The window for related engagement events to appear in an activation payload |
| **30 days** | History the B2C Commerce Order Bundle ingests |
| **2 methods** | Zero copy: Query Federation (their compute), File Federation (our compute) |
| **1 active version** | Of an individual retriever, however many you save |
| **3 real-time features** | Data graphs power real-time identity resolution, calculated insights and segmentation |
| **4 stages** | Retrieval data prep: loading, chunking, vectorizing, storing |

---

## 10. Distractor tells

**Read the question's own verb.** "Which **object**" wants an object name. "Which **feature**"
wants a product capability. "What is the **cause**" wants a diagnosis, not a fix — and this
deck has several pairs where the fix is also an option.

Patterns that recur:

- **The invented capability.** This deck's fact-check found a "reusable container block", a
  "Data Segmentation Object", and a phone field type that normalises to E164 — none exists. If
  an option names a Data 360 object you cannot place in the DLO/DMO/DLO-category vocabulary,
  distrust it.
- **The invented absence** — the mirror. An option asserting Data 360 *cannot* do something is
  wrong more often than it is right.
- **Match rules versus reconciliation rules.** Both appear in identity-resolution option sets.
  Match decides *who*; reconcile decides *which value*.
- **One container or two.** The single most repeated discriminator in the activation block. One
  container = the same record; two = two records.
- **Nested segment versus calculated insight.** Nested segments share criteria; calculated
  insights reduce complexity. An error message about complexity points at the insight.
- **Profile versus Engagement category.** Anything date- or time-based in segmentation needs
  Engagement.
- **The old product name in a doc-shaped option.** The deck's options say Data Cloud and so
  will the exam's. A current Setup-node name in an option set is not automatically the right
  answer.

---

## 11. Where the deck is older than the exam

### The renames, in one table

| The deck says | Salesforce now says | Since |
|---|---|---|
| Data Cloud | **Data 360** | 14 Oct 2025 |
| Data Cloud Consultant | **Data 360 Consultant** | 27 Mar 2026 |
| Data Cloud Admin | **Data Cloud Architect** | 4 Sep 2025 |
| Data Cloud Marketing Specialist | **Activation Specialist** | 4 Sep 2025 |
| Data Cloud Marketing Manager | **Activation Manager** | 4 Sep 2025 |
| Data Cloud for Marketing Data Aware Specialist | **Data Cloud Data Aware Specialist** | 4 Sep 2025 |
| Einstein Studio | **AI Models** | — |

**The deck's option text was deliberately left alone**, and the reasoning is recorded in this
repo's brief: the rename is unprovable at item level (Salesforce publishes no sample items),
and a learner who meets the old name on the exam having only seen the new one is worse off
than the reverse. The current names appear in the deck's *explanations*. So: **answer with the
old names, navigate with the new ones.**

One consequence worth stating plainly: four questions (`860708a5`, `1d6366ff`, `3b0c0a4e`, and
`49ee75cb` by implication) keep correct keys while their option text points at a Setup node
that no longer exists. The capability mapping is 1:1, so the reasoning still works.

### Two defective items, kept as keyed

- **`704331e8` has three defensible options.** It keys Data Explorer + Query API and its
  explanation denies that Identity Resolution is a validation surface — but the Resolution
  Summary reports match and reconciliation statistics after every run, and **this deck's own
  `a82aca1f` keys Identity Resolution as exactly that.** The deck contradicts itself. If you
  meet this shape, all three are defensible.
- **`de949f0f` has two true options.** Adding a new **dimension** *and* adding a new
  **measure** are both possible when modifying a calculated insight; only **removal** is
  blocked. Learn the rule — **you can add, you cannot remove** — rather than the keyed letter.

### One item whose keyed mechanism the documentation contradicts

**`859419eb`** keys "configure reconciliation rules on Contact Point Address" to pick the best
address. Salesforce states that **reconciliation rules do not apply to contact points**, and
that Source Priority sorts DLOs rather than DMOs. The documented way to choose a contact
point's source is **source priority on the activation** — which this same deck keys correctly
in `dc2c1055`. The key was kept because no option describes the documented mechanism. **Learn
`dc2c1055`'s answer as the true one.**

### One item that is not settled

**`062012ec`** — "when a column is added or removed, the CRM connector performs a full
refresh", and the 600K-deletion threshold in its distractor. Neither is stated on any Data 360
page that could be rendered; the closest match was CRM Analytics' `sfdcDigest`, a different
product. Do not spend time on it.

### One redundant pair

**`b16bbc31`** and **`e652607d`** are the same question with the same intended answer (value
suggestion is still processing). They differ only in whether the option states the documented
"up to 24 hours". `find-duplicates.mjs` scores them 0.94. **`b16bbc31` is the better copy**
because its option carries the number. If you see it twice, you are not going mad.

### Verification debt to be honest about

About six of this deck's citations are **topical rather than decisive** — the data-ethics item
(`3ce5cecc`), the two "which use case fits" items, the Flow-orchestration item (`b985f235`)
and the LWC/Profile API item (`0e845e09`) rest on judgment or product positioning rather than
on a page that settles them. The deck reaches 100/100 citation coverage, and that number means
less on those six than on the rest.

### How to verify any of this yourself

`help.salesforce.com` is a single-page app that answers **every** article id with HTTP 200, so
a status check proves nothing. Two things that do work:

1. **Render the page and read `document.title`.** A live article gives its own title; a dead id
   gives the generic `Salesforce Help | Article` plus the sentence "We looked high and low but
   couldn't find that page." Poll for a real title **and** a body over ~1,500 characters — a
   half-loaded page reports live articles as dead.
2. **Grep the rendered text for the term the citation is meant to support**, not for the term
   the topic suggests. A page can render, be on the right topic, and not contain the fact.

`WebFetch` does **not** work on this host from a cloud container — it returns the SPA's "CSS
Error" shell for real and invented ids alike, re-confirmed on 2026-09-26. And beware the
keyword sweep: searching this deck for `RAG` returns three hits, all of them the substring
inside "sto**rag**e".

---

## 12. Two-week revision plan

Set by three facts: the pass mark is 70%, the deck spends a third of itself on a fifth of the
exam, and two domains worth 32% are under-covered.

**Week 1 — close the gaps the deck cannot close.**

1. **Day 1 · Zero-Copy, start to finish.** Read *Zero Copy Data Federation* and the Data Shares
   page. Be able to state the Query-versus-File Federation difference in one sentence, and what
   an external DLO contains. This is the most self-contained gap in the guide.
2. **Day 2 · Retrievers and search indexes.** Read *Retrieve Data*. Learn the four data-prep
   stages, and individual versus ensemble versus dynamic retrievers.
3. **Day 3 · Data graphs, and AI positioning.** Read *Data Graphs*. Then write a paragraph
   explaining why Data 360 is the foundation for generative and predictive AI — that paragraph
   is §3's whole gap.
4. **Day 4 · Solution Positioning, the rest.** Terminology, business value, initial use cases,
   data ethics. Work the deck's seven items; they take an hour.
5. **Day 5 · Setup and Administration.** The permission-set rename table until it is automatic.
   Data spaces. Data kits and what else is in the lifecycle bullet.
6. **Day 6–7 · Work the deck's ingestion set** — 23 items. Pay attention to stream categories
   and refresh behaviour; both recur.

**Week 2 — consolidate, then stop.**

7. **Day 8 · Harmonization and Unification.** 16 items, 17% of the exam, and the deck is good
   here. One pass.
8. **Day 9 · Enhancements and Analysis.** The deck's 13 items, then re-read Day 2 and Day 3.
9. **Day 10 · Activations, once.** 32 items in one sitting. Above 85%, do not return.
10. **Day 11 · §11 in full.** The renames, the three defective or contradicted items, the
    unsettled one.
11. **Day 12 · §9 and §10.** Numbers and distractor tells.
12. **Day 13 · full deck in Blitz mode**, options read aloud off.
13. **Day 14 · only the misses**, plus the Zero-Copy and retriever notes.

---

## 13. Sources

Every URL below was rendered in a browser on 2026-09-26 and its title confirmed.

**The exam itself**

- [Salesforce Certified Data 360 Consultant Exam Guide](https://help.salesforce.com/s/articleView?id=005298940&type=1&language=en_US)
  — the outline, the weights, the Spring '26 alignment, the 70% pass mark and the SDC101/SDC301
  course names. A second id, `005314086`, also surfaces in search; `005298940` is the one that
  renders as the live guide.

**Zero-Copy** (zero deck questions)

- [Zero Copy Data Federation](https://help.salesforce.com/s/articleView?id=data.c360_a_byol_data_federation.htm&type=5&language=en_US)
  — Query versus File Federation, external/virtual DLOs, caching and acceleration, and the
  partner list.

**Retrieval and AI** (zero deck questions)

- [Retrieve Data](https://help.salesforce.com/s/articleView?id=data.c360_a_ai_retriever.htm&type=5&language=en_US)
  — the four data-prep stages, individual/ensemble/dynamic retrievers, the Retriever Playground,
  citations, row-level access, and the "AI Models (formerly Einstein Studio)" rename. Also the
  note that Data 360 no longer creates a default retriever automatically.

**Data graphs** (a distractor in the deck, never an answer)

- [Data Graphs](https://help.salesforce.com/s/articleView?id=data.c360_a_data_graphs.htm&type=5&language=en_US)
  — the read-only JSON-blob record, and the three real-time features data graphs enable.

Per-question citations live in the deck itself: every one of the 100 explanations ends in a
`References:` block with at least one rendered URL.

---

## 14. Using this with NotebookLM

Upload this file. Prompts that have produced useful output from the other guides in this repo:

- "Quiz me only on Zero-Copy data federation, retrievers and data graphs. All three are named
  exam objectives with no practice questions, so generate the questions from sections 5 and 7."
- "Give me the permission-set rename table from section 11 as flashcards, old name on the front
  and new name plus the one capability that decides it on the back."
- "List every item in this guide that is defective, contradicted by documentation, or
  unsettled. For each, tell me what to answer on the exam and what is actually true."
- "I have eight days. Compress the plan in section 12, keeping the principle that gaps come
  before consolidation."
- "Explain Query Federation versus File Federation as if I already understand a federated
  database. Then give me three scenarios where the wrong one would be the tempting answer."
- "Build me a decision tree for the activation-troubleshooting items in section 8: symptom in,
  cause out."
