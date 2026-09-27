# Agentforce Revenue Management Field Guide

Built from the 135 questions in the practice deck, cross-checked against the official exam
outline and the documentation those questions cite. Measured 2026-09-26.

**Read this first: the certification you are studying for has been renamed, and the outline
was rebuilt with it.** The deck, its manifest entry and all 135 stems say "Revenue Cloud."
The exam is now the **Salesforce Certified Agentforce Revenue Management Consultant**, and
the product is now **Revenue Management** — Salesforce's own setup guide carries the note
"Revenue Cloud is now Revenue Management. You may see references to Revenue Cloud in
Salesforce applications and documentation." Nothing in the deck is wrong because of that,
but every Setup node, permission set and doc title you meet while revising now carries the
new name, and the exam's own domain names are new too.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Salesforce Certified Agentforce Revenue Management Consultant |
| Content | **60 scored** multiple-choice questions, plus up to 5 unscored |
| Time | **105 minutes** (1 minute 45 per question) |
| Passing score | **63%** — 38 of 60. The lowest pass mark of any deck in this repo |
| Prerequisite | None; 2–3 years of Product-to-Cash domain experience assumed |
| Fee | US$200, retake US$100 |
| Aligned to | **Summer '25** |
| Exam guide | Help article `005298978` |

Two structural facts matter more than any topic.

**63% is unusually forgiving.** You can miss 22 of 60 and still pass. That changes revision
strategy: there is no domain you must be perfect in, and the right move is to stop
over-polishing Asset Management (which the deck has already drilled into you) and buy cheap
marks in the two domains the deck barely touches.

**The exam is aligned to Summer '25, and the product has moved on since.** This is the
opposite risk from the App Builder guide. There, the exam was newer than the deck. Here the
exam is *older* than the documentation you will revise from — so when a current Help page
contradicts a deck item, the deck is often still what the exam wants. §12 lists every case
found.

---

## 2. Where the points actually are

The deck's own nine `_cat` tags (Product Catalog, Pricing & Discounts, Subscriptions,
Configuration, Quote & Order, Billing & Invoicing, Context Service, General, Integration &
API) are not the exam's domains and never were. The deck column below is an independent
re-classification of all 135 against the seven current domains
(`study-guides/reclassify-revenue-cloud.mjs`).

| Domain | Exam | ≈ Qs | Deck | Verdict |
|---|---:|---:|---:|---|
| Platform Concepts | 18% | ~11 | 18 · 13.3% | under |
| **Implementation Readiness** | **14%** | **~8** | **8 · 5.9%** | **badly under** |
| Catalog Management | 16% | ~10 | 22 · 16.3% | about right |
| Configure, Price, Quote | 18% | ~11 | 25 · 18.5% | about right |
| Contracts and Orders | 11% | ~7 | 19 · 14.1% | over |
| **Asset Management** | 16% | ~10 | **29 · 21.5%** | **over** |
| Invoice Management | 7% | ~4 | 14 · 10.4% | over |

**The gap to close: Implementation Readiness is 14% of the exam — about eight questions —
and 5.9% of the deck.** It is the second-heaviest domain after CPQ and Platform Concepts,
and the deck gives you eight questions on it, none of which is about producing a scoped
plan. "Scope of work" and "project plan" return zero hits anywhere in the deck. That is
roughly eight marks the deck cannot prepare you for, on an exam where 38 marks is a pass.

**The over-drill: Asset Management.** 29 deck questions against about ten real ones. The
deck will make you fluent in Asset State Periods, Asset Actions and the amend/renew/cancel
flow — genuinely the deck's strongest material — and that fluency is worth a sixth of the
exam, not a fifth of your revision time.

Two boundary rules were applied consistently, and they are worth knowing so you can
reproduce the table:

1. A question asking **which permission set or PSL unlocks a feature** is Platform Concepts
   (configuration). Implementation Readiness is reserved for project-lifecycle, methodology,
   stakeholder and deployment questions. Without that split, Implementation Readiness
   absorbs every access question and the thinness disappears.
2. Everything about **usage** — rate cards and tier rate entries, Usage Management
   ingestion, Usage Entitlement and Wallet — is Invoice Management, because in Salesforce's
   own documentation usage rating sits in the billing arc that ends at an invoice line.

---

## 3. Platform Concepts

18% of the exam, about eleven questions. The deck gives you 18, and they are good on Context
Service and thin-to-absent on three named items.

### Context Service — the deck's strength here

Six deck questions turn on context definitions, and they teach the mechanism properly.
What to hold:

- A **context definition** is the shared vocabulary that lets applications read and write
  the same data across the revenue lifecycle. It has **nodes**, **attributes** and
  **mappings**.
- The two valid actions on a *standard* context definition are **Extend** and **Clone**
  (`ea8501f7`). Extend inherits everything — nodes, attributes, mappings — and lets you add
  (`25acadca`, extending `SalesTransactionContext`).
- Mapping a CRM field into a transaction means mapping **node to node, then attribute to
  attribute** — Catalog Product to Product2, then the field (`e02f90f5`).
- The pricing procedure's context definition **must be the one selected on Product Discovery
  settings**. When they differ, quoting breaks in ways that look random (`42d9581e`).
- A new custom field added to a context definition needs a **tag** on the field attribute
  before a pricing procedure can use it (`464876c9`).
- **Persistence** is the mapping setting that makes an attribute value survive for
  downstream processes (`df8f0748`).
- Salesforce ships **Predefined Context Definitions** for Revenue Management; know that
  before you build one.

### Business Rules Engine — a named objective with zero deck questions

The outline names Business Rules Engine beside Context Service, Omnistudio and APIs. "BRE"
and "Business Rules Engine" return **zero hits** in the deck's stems, options *and*
explanations. Learn it from scratch:

- **BRE** is a suite of services, components and objects for business rules that perform
  complex lookups and calculations.
- **Expression sets** are the calculation engine: a series of steps in a logical flow, built
  from **variables, constants, conditions, calculations, lookups and aggregations**.
- **Decision matrices** match input values to a table row and return that row's output
  values. They accept **JSON in and return JSON out** to the digital processes that call
  them.
- Expression sets and lookup tables can be called from **Flow and Omnistudio**. Expression
  sets and digital procedures can call decision matrices.

Do not let the deck's three **decision table** questions (`11baead8`, `c59aa725`,
`b45b5d01`) convince you it covered this. A decision table is a different object from a
decision matrix, and the deck never mentions an expression set.

### Dashboards and KPIs — also near-zero

The outline asks you to "design context-aware dashboards and key performance indicators
using native Salesforce reporting tools." **"KPI" returns zero hits in the deck.** The two
dashboard items name a packaged app (`0b7cd50b`, Subscription and Revenue Lifecycle
Analytics) or an intelligence setup step (`b1cfb9c8`, Revenue Management Intelligence
requiring Data Cloud configuration plus a Dynamic dashboard package). Neither asks you to
design a report. Expect at least one item that does.

The reporting objects the deck *does* teach are worth memorising, because they are the ones
a report has to be built on:

- Attribute runtime values at order activation → **Asset State Periods** and **Asset State
  Period Attributes** (`5b126341`).
- Ordered configurable attributes → **Order Products** and **Order Product Attributes**
  (`17453798`).

### Omnistudio — document generation only

Both Omnistudio hits (`38db2a91`, `832c6c98`) are Document Generation. No OmniScript, no
FlexCard, no Integration Procedure, no DataRaptor question exists, and the outline names
Omnistudio as an ARM feature without qualification.

### Core objects and identification

- **`HasLifecycleManagement`** distinguishes a Revenue Management record from a custom-app
  record (`5ebe00f0`).
- The **Application Usage Assignment** object with the value *Revenue Lifecycle Management*
  is how you tell which records Revenue Management created (`9bac03e6`).
- A contract that activates without its assets attached is missing its **Revenue Lifecycle
  Management record** (`cdfa1139`).

---

## 4. Implementation Readiness

**14% of the exam. The deck's weakest domain by a wide margin, at 8 questions of 135.**
This section is the reason this guide exists. Everything below is from Salesforce's own
implementation documentation, not from the deck.

### The named preparation activities

Salesforce's *Get Ready for Your Revenue Management Implementation* lists these, and an
exam item asking "what should the consultant do first" is drawn from this shape:

1. Learn the features and **technical architecture**.
2. Assemble a **dedicated implementation team**.
3. **Investigate pain points** and assess current priorities.
4. **Solicit input from key stakeholders**.
5. Define clear **business objectives**.
6. Establish **realistic milestones** to guide the project.

Note the order: understanding before team, team before requirements, requirements before
milestones. The deck's `2fd9af4b` keys "assemble a team with Quote-to-Cash expertise, create
a phased plan covering core setup" and `41493562` keys "set up environments for development,
testing and production, and choose a deployment tool" — both consistent with this, both
correct, and between them the whole of the deck's project coverage.

### The doc set to know by name

- **Plan Your Implementation** — gather business requirements, **sequence feature
  deployment**, set project milestones, import data, work with business users.
- **Build Your Implementation Team** — job roles and areas of knowledge to grow and
  maintain in the organisation.
- **Limits and Considerations** — read before designing or running the quote-to-cash
  lifecycle.
- **Preconfiguration Steps** — complete these *before* configuration begins. This is where
  the outline's "prerequisite feature toggles" live, and the deck has nothing on it.
- **Set Up Revenue Management** — enable revenue settings, create profiles and users,
  assign permission sets, set up procedures.
- **Glossary** and **Explore the Revenue Management Data Model**.

### Licences and permission sets you can be asked about

The deck only ever asks about these as troubleshooting ("the admin can view but not edit"),
so learn them as prerequisites too:

- **Product Catalog Management Designer** PSL — required to *edit* catalog records, not just
  view them (`2a61d2aa`).
- **Product Discovery User** — without it the Browse Products button does not appear on the
  quote page layout (`894e7d14`).
- **Product Configurator** — required to configure a bundle from the Transaction Line Table
  or Browse Catalog (`4c19bd08`).
- **Customer Asset Lifecycle Management** — required to generate Asset Actions and Asset
  State Periods and edit Lifecycle Asset fields during migration (`6d3a68c2`).
- **Place Supplemental Orders** — required to change an activated order (`d38922f8`).
- **Billing Administrator** — required to suspend invoicing on a delinquent account
  (`2ec8b053`).
- **Microsoft 365 Word Designer / User** — required to insert clauses into a Salesforce
  Contracts template (`832c6c98`; see §12, this is a judgment call).

### Roles and responsibilities

The outline asks for **cross-product** stakeholder roles. The deck has one item
(`6d2955d5`), and it is catalog-scoped: Catalog Administrator manages classifications and
attributes, Product Designer defines product structures and bundles. That split is correct
and worth knowing — Salesforce's Product Catalog Management Personas page states it — but
it is not the cross-product project-team question the bullet describes.

### Deployment

`11baead8` is the deck's only deployment item: to move a custom decision table to a staging
sandbox, deploy the custom object **and** the decision table, then map the decision table in
the default pricing procedure. Generalise it — a deployed ARM artefact usually needs
re-pointing at something in the target org after it lands, and the deck's `1092afe5` is the
same lesson for flows (a duplicated amend/renew/cancel flow does nothing until Revenue
Settings points at the new one).

---

## 5. Catalog Management

16% of the exam, 22 deck questions — the best-matched domain in the deck, and it is largely
trustworthy. Compressed:

### Structure and reuse

- Lead with a **shared catalog with reusable components, attributes and selling models
  tailored per business** rather than a catalog per line of business (`43661ef6`).
- Use **product classifications** for attribute reuse; apply **selling models at the product
  level** to support one-time, term-based and evergreen (`231e4a3f`).
- Use **Product Attributes to rationalise** a catalog that would otherwise need thousands of
  SKUs (`bc9001d5`, 30,000 consultants by role and skill).
- The **Product Selling Model** and **Product Selling Model Option** are how lease-versus-buy
  and payment-frequency variants collapse into one product (`69e0bfd0`, `0010599f` — Term
  Monthly for 12 equal instalments).
- Establish the Salesforce Product Catalog as the **single source of truth** when product
  data is scattered across a PIM and other systems (`21608eee`).

### Bundles and cardinality

- **Local Cardinality** on a component carries its minimum and maximum quantity
  (`c3716756` — set max to three).
- When a bundle needs a per-component maximum *and* a bundle-wide total, define local
  cardinality on each component and the total on the parent (`cc6acf9f`).
- Quantity scaling is **Proportional** (scales with the parent) or **Constant** (fixed
  regardless) — `09695b88`, VPN License proportional, Classroom Training constant.
- A **configurable bundled product** is the one that lets users customise components *and*
  attributes (`32f0b06f`).

### Making products findable — the deck's most useful cluster

Five separate items are the same lesson from different angles, and they are exam-shaped:

| Symptom | Cause |
|---|---|
| New product not appearing in search | **Rebuild Index** (`4b7a292c`) |
| Product2 custom field not searchable | Index and Search Configuration, mark searchable, **Rebuild Index** (`03439ed7`) |
| Products invisible while quoting | Wrong **context definition** in Product Discovery Settings (`94a4585c`) |
| Products invisible in Browse Catalog | No active **price book entry** in the price book on the quote (`df19fa7d`) |
| Users forced to pick a catalog every time | Set a **default catalog** in Product Discovery Settings (`a98e5518`) |
| Flow changes not appearing | Add the **Flow Name** in Product Discovery Setup (`910c3b97`) |

### Other catalog facts

- **Product Usage Grant** defines a default entitlement such as data storage (`995de54c`).
- Control availability by country with a **disqualification rule** (`05d04dbc`).
- **Attribute categories** display in the sequence defined on the attribute category
  records, with uncategorised attributes last (`a1290dae`).
- Enable **data translation** and supply values via the Product List and Product Details
  APIs for multi-language browsing (`da605d37`).
- Decision-table evaluation criteria for eligibility are **Product Qualification** or
  **Product Category Qualification** (`c59aa725`).
- The auto-renew default lives on the **Product Selling Model** (`f769f864`) — see §12, this
  key moved in the 2026-09-15 re-check.

---

## 6. Configure, Price, Quote

18% of the exam, 25 deck questions. Well matched by volume, and the single most important
thing to know is what the deck does *not* contain.

### Agentforce — the largest single gap in this deck

The CPQ objective reads: "Given a set of customer requirements, **including using
Agentforce**, configure and generate an accurate pricing quote." **The word "Agentforce"
appears in zero of the 135 stems and option sets.** On an exam named after it, this is the
gap to close first. From Salesforce's *Set Up Agentforce for Revenue Management*:

- **Licensing**: Enterprise, Unlimited or Developer edition of Revenue Management with the
  **Revenue Cloud Advanced** licence **plus the Agentforce Employee Agent add-on**.
- **Permission to create an agent**: **Manage AI Agents** OR **Customize Application**.
- **Prerequisites**: set up Einstein Generative AI, turn on Agentforce, set up the required
  Revenue solutions — in that order.
- **Four shipped templates**: **Revenue Quote Management**, **Billing Employee Assistance**,
  **Billing Service Assistance**, **Approval Agent**.
- **Every Revenue template is an Employee Agent template.** If an option offers a Service
  Agent for an internal revenue task, that is the wrong shape.
- **Do not mix template topics.** Salesforce explicitly warns against including topics
  belonging to one template into another, for performance reasons.
- External links must be added manually to **trusted URLs**; enable messaging to create
  customer channels.
- Grant users access with a **custom permission set**, turn on **audit trails** to track
  Agentforce action usage, then **activate** the agent. An agent that works in sandbox does
  nothing in production until it is activated.

The shipped subagents, worth recognising by name: Product Selection, Quote Management,
Consumption Management, Invoice Line Explanation, Billing Collections Management, Billing
Inquiries, Approval Management, Search Approval Record, Summarize Multiple Approval Work
Items, Product Description Generation.

### Pricing procedures

- **Simulate** traces the price waterfall when a quote total is unexpected (`394bdad2`).
- The **Pricing Operations Console** is where you verify calculated prices against the
  procedure's logic (`ca1076cd`).
- **Discount Distribution Service** spreads a calculated discount evenly across line items,
  and must be the **last step** of the procedure (`2f16d956`).
- The **Proration element** handles a mid-cycle upgrade (`e3a70193`).
- **Derived Price** with **Derived Pricing Scope = Transactional** prices one product as a
  percentage of another's price within the same transaction (`9de3e0b9`).
- **Bundle-Based Price** plus a **Price Adjustment Matrix** gives a bundle a discounted
  price against the sum of its parts (`e2f73f23`).
- **Sales Transaction Type** plus **Volume-Based Pricing** handles bulk discounts across
  channels (`0821ddcd`).
- **Contracted Pricing** on the contract holds negotiated product-specific rates
  (`a5f8cfae`).
- Attribute-based pricing matrix rows = the product of the option counts: 3 memory sizes × 2
  terms = **6** rows (`cd2224b8`).
- To use an inherited attribute for pricing, edit it **at the product level** and set **Is
  Price Impacting** (`f6c30064`).
- Ramp deals: **Product Ramp Segment** with segment types **Free Trial, Yearly, Custom**
  (`a4b16e2c`; "Monthly" is not a segment type — see §12).
- Ramp MRR is the segment's annual value over 12: `(20 × $1000) / 12` (`43e0f10a`).

### Product Configurator and CML

Constraint Modeling Language shows up four times and is worth drilling because the syntax is
recognisable:

- A relation with cardinality: `relation rooms : Room[0..5];` and a `require(...)` clause
  (`015f552d`).
- Cross-product requirement at quote level: relations for each product plus
  `require(desktop[...], monitor[...])` (`eac1d453`).
- A warning when an attribute exceeds a threshold → **constraint rule in the Constraint
  Model at the Product Level** (`244c6aa0`).
- A context-aware rule can reference a parent-record field such as the Opportunity's
  industry (`747d4014`).
- To add a child product to a live constraint model, **create a new type in the CML Editor,
  then import it** (`abd04873`).
- A **global constant** lets a value be referenced consistently across rules (`fc7a413b`) —
  though see §12; this wording is not settled.

### Quote mechanics

- **Transaction Line Editor** provides **filtering** (`122cab6a`) — All Lines, Errored Lines,
  Ramped Lines, Unconfigured Lines, plus advanced filters of up to five conditions. Custom
  fields are exposed by adding them as selected fields to the component in the Lightning
  record page (`66577d14`).
- Force quotes to have an Opportunity: Quote Settings → **Create Quotes Without a Related
  Opportunity = False** (`89816cb1`).
- **Start Sync** is the quick action that makes the opportunity forecast follow the quote
  (`1ba9f913`).
- **Smart Approvals**: a step conditioned on "when the stage starts" behind a decision node
  is ineligible; the fix is to make the step's condition match the stage's (`a152b80a` — the
  key moved here in 2026-09-15, see §12).

---

## 7. Contracts and Orders

11% of the exam, 19 deck questions — over-represented, and the material is easy, so this is
a domain to revise quickly and leave.

### Salesforce Contracts and CLM

- Contract authoring and **collaborative redlining** run through an integration with
  **Microsoft 365**, so the cloud provider is **Microsoft Azure** (`6f59e427`). Templates are
  built with Microsoft 365 Word as the template type; negotiation happens in Word via the
  Salesforce Contracts Connector add-in.
- Very large contracts are broken up with a **section in a document template** (`db7c75c3`).
- **Obligations** can be assigned Owners and Tasks, which is why you create them to track
  contractual commitments (`3764c8f5`).
- **Contracts AI / contract extraction template**: define **attribute mapping and context
  mapping** to pull a new field out of a PDF (`6f99fe4e`, `db199ded`).
- Quote-to-contract conversion is customised by modifying the screen flow **Create Contract
  From Quote** (`747e0c6b`).
- Adding clauses to a template needs the **Microsoft 365 Word Designer** permission set
  (`832c6c98`) — judgment call, §12.

### Order Management and DRO

- Changing line items after submission but before fulfilment requires that **the entire
  order is activated** (`92f06ccd`); changing an *activated* order needs **Place Supplemental
  Order** (`d38922f8`).
- **Dynamic Revenue Orchestrator** automates the order lifecycle and streamlines fulfilment
  (`86417498`), and is the answer when each component of a bundle needs a different
  fulfilment process (`ef6c3e48`).
- Decomposition at **Order Line Item** scope creates **one fulfilment order line item per
  decomposition rule** per decomposing order line (`d815a350`).
- A **2-day delay** between hardware delivery and software provisioning is **Future-Dated
  Steps in DRO settings** (`a49cf7c1`).
- **Technical products** carry things the customer should not see as a quote line but that
  fulfilment needs: shipping services (`37ee4c5f`), user manuals with decomposition rules
  (`3655d2ba`), installation details (`2a788a0c`).
- Carrying specifications from a commercial product to its fulfilment counterpart is
  **Field & Attributes Mapping** (`1742b9ef`).

---

## 8. Asset Management

16% of the exam, **29 deck questions** — the deck's biggest over-drill. You will know this
material cold after working the deck; the job here is to confirm it and move on.

### The asset object graph

Memorise the four-object set, because it is the answer to both the migration question and
the "what must work" question: **Asset, Asset Action, Asset State Period, Asset Action
Source** (`f92918e7`).

- **Asset Action** = a change event. **Asset State Period** = a dated window of state.
- A subscription bought once for a term produces **one Asset Action and one Asset State
  Period per term year**: 36 months → one action, three periods (`6f5c6ce5`).
- Amending it adds an action: two changes → **two Asset Actions and two Asset State
  Periods** (`f63e3f43`).
- Three custom ramp segments → **one Asset record with three Asset State Periods** matching
  the segment dates (`3d12dbca`).
- **Asset Action Source** records trace a renewal price back to the original Net Unit Price
  (`e7f19278`).
- Attribute runtime values at activation live on **Asset State Periods** and **Asset State
  Period Attributes** (`5b126341`).

### Assetization

- Assets are created automatically by the **Assetize Order flow** (`6f6cf302`).
- For a user to manage assets, products must be **assetizable** and the
  **`createOrUpdateAssetFromOrder`** flow action must be in place (`2a7b5f37`).
- Migrating subscriptions from Salesforce CPQ: convert them to order lines and use the
  **Create or Update Asset From Order Item Action API** (`39a152e8`).

### Amend, renew, cancel

- Renewing an asset: **create a renewal quote with the asset, create the order, activate the
  order** (`c74d7076`).
- **Renewal Flow Templates** create renewal opportunities and quotes/orders out of the box
  (`435f2087`).
- **`InitiateRenewal`** is the invocable action to wrap in a screen flow and expose as a
  quick action (`6243552e`).
- Expired assets are renewed by using **Override Renewal Term** first (`1b631e67`,
  `b0621262`).
- A ramped asset renewed via `InitiateRenew` has its **ramped quote lines recreated** on the
  renewal quote (`36c657a7`).
- Keeping varying historical quantities and prices through a renewal → **Lot-based or As-is
  Renewals** (`c41101a6`).
- Price-impacting attribute changes without touching the contract → **Standard Amendment**
  (`4b342cdb`).
- Repricing to new list prices → amend the original asset, keep the quantity, reprice, run
  quote-to-order (`74259f96`).
- Partial cancellation of a product bought repeatedly at different prices uses **LIFO**
  (`c9a0acc7`).
- Restricting cancel: **unassign the `InitiateCancellation` API permission** (`c60cb035`).
- A duplicated amend/renew/cancel flow does nothing until **Revenue Settings** points at it
  (`1092afe5`).

### The Managed Assets UI

- Add the **Managed Asset Viewer** to the Account record page in Lightning App Builder and
  tick the checkbox (`e242341d`).
- To surface a custom Asset field during selection, modify the **Managed Asset Viewer**
  component (`9bb4967d`).
- To remove the renewal-term override option, modify the **Amend, Renew, and Cancel Assets**
  flow's screen component (`87836da2`) — judgment call, §12.

### Contract linkage

To capture the latest active Contract for an Asset: build a **Contract lookup on Asset** and
use automation on Asset update to find the latest-dated Asset Action Source (`0fc81879`).

---

## 9. Invoice Management

Only **7% of the exam** — about four questions — against 14 in the deck. The lightest domain
on the exam and the one to revise last.

### Billing schedules and runs

- A **Billing Schedule Group** groups related Billing Schedules under a single order product,
  **even across amendments** (`6a9ce9dd`).
- Changing a customer's monthly billing date: select the **Billing Schedule Group** for that
  asset and change it there (`99592626`) — key moved 2026-09-15, §12.
- Recurring invoices every Monday at 6:00 → schedule a **Recurring Invoice Run** with Weekly
  frequency and that start time (`826bd7e2`).
- **Advance** is the billing timing that collects before the service period (`ba4a4163`).
- **Billing Treatment at the Order Product level overrides the Product level** (`1ab5f73e`).

### Proration, addresses, tax, legal entity

- Proration multiplier = **remaining days in the period ÷ total days in the period**
  (`ab527e42`).
- Billing address precedence: **the transaction's own values win**, then the associated
  billing profile, then the account's default profile, then org defaults — so an order with
  its own billing address bills to that address (`287332c0`; key moved 2026-09-15).
- Custom tax logic integrates through the **Billing `TaxEngineAdapter` Apex interface**
  (`9462b116`).
- **Legal Entity** is the construct for multi-country tax rules and invoicing regulations
  (`ab6a9e3d`).
- Negative amends and cancellations are captured as a **Credit Memo** (`234fe505`).
- Stop invoicing a delinquent account: **Billing Administrator** permission set, then
  **Suspend** on the account (`2ec8b053`).

### Usage

- **Usage Management** ingests, aggregates and rates consumption against the products
  (`0ff325db`).
- Usage-based rates by consumption band are **tier rate entries** on a Tier Rate Card, each
  with a lower bound, upper bound and adjustment (`bac3a61d`).
- After activating a usage-based order, expect **Usage Entitlement Account**, **Usage
  Entitlement Bucket** and **Wallet** (`841f964e`).

---

## 10. Numbers to memorise

Short list, because this exam has few hard numbers — which is itself worth knowing, since an
option that quotes a precise limit is often invented.

| Number | What it is |
|---|---|
| **60 / 105 / 63%** | Scored questions, minutes, pass mark. 38 of 60 to pass |
| **2–3 years** | Product-to-Cash domain experience the guide assumes |
| **18 / 14 / 16 / 18 / 11 / 16 / 7** | Domain weights in outline order. They sum to 100 |
| **Summer '25** | Exam alignment. Older than current docs |
| **6 rows** | 3 memory options × 2 contract terms in an attribute pricing matrix (`cd2224b8`) |
| **4 templates** | Agentforce for Revenue: Quote Management, Billing Employee Assistance, Billing Service Assistance, Approval |
| **4-row precedence** | Billing address: transaction → billing profile → account default → org default |
| **3 ramp segment types** | Free Trial, Yearly, Custom |
| **2 actions** | On a standard context definition: Extend, Clone |
| **1 asset, N periods** | A term subscription makes one Asset State Period per term year |
| **last step** | Where Discount Distribution Service goes in a pricing procedure |

---

## 11. Distractor tells

**Read the question's own verb.** This exam's stems are long and scenario-heavy, and the verb
is usually the discriminator. "Which **objects** should the consultant base the report on"
wants object names, not a feature. "What is the **first** step" wants the earliest action, not
the most important one. "Which **permission**" wants a permission set, not a profile.

Patterns that recur in this deck's wrong answers:

- **The plausible Setup node that does not exist.** The deck's own fact-check found this
  repeatedly. If an option names a settings page you cannot picture, distrust it.
- **The workaround where a documented feature exists.** Salesforce ships Renewal Flow
  Templates, `InitiateRenewal`, Assetize Order, Usage Management. An option proposing a
  custom flow or a batch job to do one of those is nearly always wrong.
- **The right mechanism at the wrong level.** Billing Treatment exists at product *and*
  order-product level; attributes exist at class *and* product level; cardinality is local
  *and* parent. Options often offer the correct feature at the level that does not win.
- **A precise-sounding number with no page behind it.** See §10 — this exam has few real
  numbers.
- **Service Agent for an internal task.** Every Agentforce template in Revenue Management is
  an **Employee Agent** template.
- **"Sync" versus "create."** Start Sync links a quote to an opportunity forecast; it does
  not create the opportunity.

---

## 12. Where the deck is older than the exam

This deck has been fact-checked **twice** — 2026-08-15 and again 2026-09-15 — and the second
pass moved **7 keys on a deck already marked "fully checked."** That history matters more
here than on any other deck in the repo, so read this section before trusting a remembered
answer.

### The renames

| The deck says | Salesforce now says |
|---|---|
| Revenue Cloud (66 stems) | **Revenue Management** — "Revenue Cloud is now Revenue Management" |
| Revenue Cloud Consultant | **Agentforce Revenue Management Consultant** |
| (nothing) | **Agentforce** is now named in the CPQ objective |

Answer with the deck's vocabulary on the exam — it is aligned to Summer '25 — but expect the
new names on every doc page and Setup node.

### The seven keys that moved on 2026-09-15

Worth re-reading because if you worked the deck before that date you learned the old answers:

| Question | Moved | Now |
|---|---|---|
| `d38922f8` | C → B | **Place Supplemental Orders** is the permission set for changing an activated order |
| `287332c0` | B → A | The order's own billing address wins over the attached billing account |
| `99592626` | C → A | Billing date changes are edited on the **Billing Schedule Group**, not routed through a change order |
| `f769f864` | B → A | The product-level auto-renew default is on the term-based **Product Selling Model** |
| `a152b80a` | A → B | Smart Approvals: **mismatched** stage/step conditions are the cause; matching them is the cure |
| `832c6c98` | A → C | Clauses are inserted via the **Microsoft 365 Word Designer/User** permission sets |
| `87836da2` | C → B | There is one registered **Amend, Renew, and Cancel** flow, not a separate Renew Assets flow |

**Two of those are judgment calls the repo owner may reverse.**
`832c6c98` — OmniStudio Admin also appears in the CLM permission-combination table for
document generation, so the Microsoft 365 answer is defensible rather than certain.
`87836da2` — the managed package could hold a subflow named for renewals that no
documentation shows. If you meet either on the exam, note that both options have a claim.

### Two items that are genuinely unsettled

- **`fc7a413b`** — the CML "global constant" wording rests on no page that states it.
- **`355a06ae`** — the safe-harbor item (design only against generally available features)
  is sound practice and not documented as a rule.

Do not spend revision time trying to resolve these; know that the deck flags them.

### Exam-right, production-wrong

Items where the deck's key is what the exam wants and the product has moved:

- **`c41101a6`** — the Asset's Pricing Source field *is* a documented prerequisite of
  lot-based renewal; the old explanation denied it.
- **`fddbd719`** — backdating a cancellation *is* now supported (*Backdate Asset
  Transactions*). The item keeps the exam's legacy answer with a note.
- **`38db2a91`** — Document Builder is no longer contract-only; *Document Builder for Quotes*
  exists, so two options are defensible and OmniStudio Document Generation is the keyed one.
- **`a4b16e2c`** — **Monthly is not a ramp segment type.** The three are Free Trial, Yearly
  and Custom.
- **`ef770e8b`** — had labelled its distractor with the key's own letter; fixed.

### Defective items

- **`09695b88`** — the audit's "answer count does not match choose N" finding on this item is
  a known false positive: one option names both things.
- **`464876c9`** — cleared in the readability pass; its explanation now opens in the keyed
  option's own vocabulary.

### How to verify any of this yourself

**On this vendor, pull the table of contents before searching the web.** `help.salesforce.com`
renders its whole left-hand TOC on every article page, and from any one `ind.` article you
can walk the shadow DOM for `a[href*=articleView]` and get the entire Agentforce Revenue
Management doc set — **1,308 titled entries in a single call**, confirmed again on
2026-09-26:

```js
function walk(root, out) {
  root.querySelectorAll('a[href*=articleView]').forEach(a => {
    const t = (a.textContent || '').trim();
    const m = (a.getAttribute('href') || '').match(/id=([^&]+)/);
    if (m && t) out.push(t + ' :: ' + m[1]);
  });
  root.querySelectorAll('*').forEach(e => { if (e.shadowRoot) walk(e.shadowRoot, out); });
  return out;
}
[...new Set(walk(document, []))];
```

This is the technique that made the 2026-09-15 re-check work. Ten of the twelve items the
first pass had marked "could not settle" turned out to be articles that existed under titles
web search never surfaced — *Turn On Future Dated Steps*, *Manage Suspend and Resume
Billing*, *Use Lot-Based Renewals*, *Backdate Asset Transactions*. Two caveats: run one
top-level `navigate` per article and poll for a real title **and** a body over ~1,500
characters, because a framed or half-loaded page reports live articles as dead; and
`WebFetch` does not work on this host from a cloud container — it returns the SPA's "CSS
Error" shell for both real and invented ids.

---

## 13. Two-week revision plan

The shape is set by three facts: the pass mark is 63%, the deck over-trains Asset Management,
and two domains worth 32% of the exam are under-covered by the deck.

**Week 1 — close the gaps the deck cannot close.**

1. **Day 1–2 · Implementation Readiness (14%, deck 5.9%).** Read *Get Ready for Your Revenue
   Management Implementation* and its six children end to end: Plan Your Implementation,
   Build Your Implementation Team, Limits and Considerations, Preconfiguration Steps, Set Up
   Revenue Management, the Glossary. Write out the six preparation activities from memory.
   This is the highest-yield reading in the whole plan.
2. **Day 3 · Agentforce for Revenue Management.** Read *Set Up Agentforce for Revenue
   Management* and the Revenue Subagent Reference. Memorise the four templates, the licence
   stack (Revenue Cloud Advanced + Agentforce Employee Agent add-on), and that every template
   is an Employee Agent template.
3. **Day 4 · Business Rules Engine.** Expression sets versus decision matrices versus
   decision tables. Know what each takes in and returns, and who can call it.
4. **Day 5 · Platform Concepts, the rest.** Context Service properly — nodes, attributes,
   mappings, Extend versus Clone. Then build one report on Order Products and Order Product
   Attributes so the reporting objects stick.
5. **Day 6–7 · Work the deck's Catalog Management and CPQ sets.** 47 questions. Read every
   explanation, not just the wrong ones.

**Week 2 — consolidate what the deck is good at.**

6. **Day 8 · Asset Management, once.** Work all 29 of its deck items in one sitting. If you
   score above 85%, do not come back to it — it is 16% of the exam.
7. **Day 9 · Contracts and Orders.** 19 deck questions, 11% of the exam. Quick pass.
8. **Day 10 · Invoice Management.** 14 deck questions, 7% of the exam. Quicker pass.
9. **Day 11 · §12 in full.** Re-read the seven moved keys and the two judgment calls. This is
   where a remembered answer will betray you.
10. **Day 12 · §10 and §11.** Numbers and distractor tells.
11. **Day 13 · Full deck in Blitz mode**, options read aloud off. Note every miss.
12. **Day 14 · Only the misses**, plus the Implementation Readiness notes from Day 1–2.

---

## 14. Sources

Every URL below was rendered in a browser on 2026-09-26 and its title confirmed. `WebFetch`
does not resolve `help.salesforce.com` from a cloud container — it returns an identical "CSS
Error" shell for real and invented ids alike — so a title check there means a browser.

**The exam itself**

- [Salesforce Certified Agentforce Revenue Management Consultant Exam Guide](https://help.salesforce.com/s/articleView?id=005298978&type=1&language=en_US)
  — the outline, the weights, the Summer '25 alignment and the 63% pass mark. Note the article
  title still reads "Revenue Management Consultant" while the body says "Agentforce Revenue
  Management."

**Implementation readiness** (the domain the deck under-covers)

- [Get Ready for Your Revenue Management Implementation](https://help.salesforce.com/s/articleView?id=ind.setup_revenue_cloud.htm&type=5&language=en_US)
  — the six preparation activities, and the note that Revenue Cloud is now Revenue Management.

**Agentforce in Revenue Management** (zero deck questions)

- [Set Up Agentforce for Revenue Management](https://help.salesforce.com/s/articleView?id=ind.rev_agent_setup.htm&type=5&language=en_US)
  — licensing, the four templates, the Employee Agent constraint, trusted URLs, activation.

**Business Rules Engine** (zero deck questions)

- [Business Rules Engine](https://help.salesforce.com/s/articleView?id=ind.business_rules_engine.htm&type=5&language=en_US)
  — expression sets as the calculation engine.
- [Decision Matrices](https://help.salesforce.com/s/articleView?id=sf.decision_matrices.htm&type=5&language=en_US)
  — JSON in, JSON out, row matching.

**Supporting**

- [Decision Tables for Business Rules Engine](https://help.salesforce.com/s/articleView?id=sf.decision_tables.htm&type=5&language=en_US)
  — the object the deck *does* test, so you can keep it distinct from a matrix.

Per-question citations live in the deck itself: every one of the 135 explanations ends in a
`References:` block with at least one rendered URL.

---

## 15. Using this with NotebookLM

Upload this file. It is written to be a single source a notebook can answer from — the domain
weights, the gap list and the moved keys are all stated as facts rather than implied.

Prompts that have produced useful output from the other guides in this repo:

- "Quiz me only on Implementation Readiness and Business Rules Engine. Both are named exam
  objectives with almost no practice questions, so generate the questions yourself from the
  documentation described in sections 4 and 3."
- "List every fact in this guide that the guide itself says is unsettled, a judgment call, or
  exam-right-but-production-wrong. For each, tell me what to answer on the exam and what is
  true in a current org."
- "I have eight days, not fourteen. Compress the plan in section 13, keeping the ordering
  principle that gaps come before consolidation."
- "Build me a table of every permission set and permission set licence named in this guide,
  with the one thing it unlocks."
- "Explain the difference between an expression set, a decision matrix and a decision table
  as if I already know Flow. Then give me three scenarios where picking the wrong one would
  be the tempting answer."
- "For each of the seven keys that moved on 2026-09-15, state the old answer and the new one,
  and tell me which single document settled it."
