# Development Lifecycle and Deployment Architect Field Guide

**Salesforce Certified Platform Development Lifecycle and Deployment Architect — Spring '23 item bank**

Built from the 137 questions in the practice deck, cross-checked against the official exam outline and the documentation those questions cite. **The deck files its questions under five old domains; the exam has eight**, and once every item is placed against those eight, this turns out to be the best-balanced deck of the architect set. The shortfall is **Operating**, at half its exam weight. The caveat is bigger than any gap: **two of the deck's old domains are methodology and governance that no vendor page settles**, and about thirty of its citations orient rather than decide. §13 says which.

| Questions | Time | Pass mark | Prerequisite | Aligned to |
|---|---|---|---|---|
| 60 (+5 unscored) | 105 (minutes) | 65% (39 of 60) | None (US$400) | Spring '23 (never rebuilt) |

---

## 1. The exam, factually

> **Two structural facts that matter more than any topic.** **65% is the highest bar in the architect set.** Data Architect and Sharing and Visibility pass at 58%; this one needs 39 of 60.
>
> **Much of this exam is judgment, not fact.** Methodology choice, governance bodies, risk, communication — no Salesforce page decides "which two roles should join the CoE". For those items, learn the reasoning in the explanation, not a citation, and expect the exam to reward the option that sounds like a mature programme rather than a shortcut.

| | |
|---|---|
| Official name | Salesforce Certified Platform Development Lifecycle and Deployment Architect |
| Content | **60 scored** multiple-choice items, plus up to 5 unscored |
| Time | **105 minutes** |
| Passing score | **65%** — 39 of 60 |
| Prerequisite | None |
| Fee | US$400, retake US$200 |
| Aligned to | **Spring '23** |
| Exam guide | Help article `005298968` |
| Not expected of you | Writing ANT or CLI migration scripts, setting up source control, setting up CI tools — the guide says so |

The app lists this deck as "Development Lifecycle and Deployment Designer", an older name. The exam guide calls it the **Platform Development Lifecycle and Deployment Architect**.

## 2. Where the points actually are

The deck's five `_cat` tags — ALM, Project & Release Management, Development & Testing, Deployment, Environment Management — are an older outline. The exam has eight domains with different boundaries. The deck column is an independent re-classification of all 137 against the eight (`study-guides/reclassify-dld.mjs`).

| Domain | Exam | ≈ Qs | Deck | Verdict |
|---|---|---|---|---|
| Application Lifecycle Management | 8% | ~5 | 11 · 8.0% | about right |
| Planning | 13% | ~8 | 21 · 15.3% | slightly over |
| System Design | 15% | ~9 | 29 · 21.2% | over |
| Building | 14% | ~8 | 18 · 13.1% | about right |
| Deploying | 14% | ~8 | 18 · 13.1% | about right |
| Testing | 13% | ~8 | 17 · 12.4% | about right |
| Releasing | 13% | ~8 | 16 · 11.7% | about right |
| Operating | 10% | ~6 | 7 · 5.1% | half |

### How the boundaries were drawn

Four rules, applied consistently. **Writing** unit tests and test data is Building; **choosing** a testing methodology is Testing. **Choosing** a sandbox type is System Design; **mapping** sandboxes onto a release plan, hotfixes included, is Releasing. Which deployment **tool** is System Design; how the Metadata API **behaves** is Deploying. A governance **body** is Planning, unless the question is which methodology to use.

### Sub-objectives the deck never asks

Found by reading all 137 against the outline, then confirmed by keyword sweep over stems, options *and* explanations on 2026-09-28.

1. **ALM maturity.** "Assess ALM maturity" and "governance strategies based on the customer maturity" are named in two domains. "Maturity" returns zero hits. §3, §4.
2. **DevOps Center.** Zero stems, zero options — it appears only in two explanations as a currency note. §5.
3. **Items the APIs can't deploy**, and the manual pre- and post-deployment steps they force. A named Deploying bullet; no item teaches it. §7.
4. **Coverage requirements**, named in the Testing domain. No item asks for the 75% rule; two explanations quote it. §8.
5. **Operating as a whole** — seven items against a 10% domain. §10.

## 3. Application lifecycle management

8% of the exam, 11 deck items. One bullet: weigh the methodologies against the project's risk, and recommend governance that fits the customer's maturity.

| Waterfall fits when | Agile fits when |
|---|---|
| Many systems and inter-dependencies; outside agencies must validate for compliance (`a0fc764b`) | An existing process must adjust quickly; heavy DevOps investment supports rapid test and deploy (`ece03577`) |
| Upfront due diligence makes milestones and estimates predictable; complex processes are documented before coding (`f3d07cd1`) | Later requirements are expected by design; many small releases let stakeholders see the work (`004b8e73`) |

- **Kanban** makes everything visible; **Scrum** lists openness among its five values (`bc9a1ad1`). Transparency about timing, planning and obstacles is a Scrum principle (`ade048ca`).
- A **steering committee** sets the criteria for choosing Agile or Waterfall, and approves deviations (`bdae5231`).
- Unknown requirements plus a fixed three-month promise is a feasibility risk even under Agile (`9c991e6c`).

> **Zero deck questions — maturity.** The bullet ends "based on the customer maturity", and Planning opens "assess ALM maturity". The deck never uses the word. What the exam wants is the reasoning: **recommend the lightest governance and tooling the customer can sustain today, and a path up**. A team with no source control is not ready for a package-based pipeline; a team already on CI is held back by change sets. This is judgment — no Salesforce page defines maturity levels.

## 4. Planning

13% of the exam, 21 deck items. Four bullets: maturity, risk, governance, and seasonal releases.

### Who decides what

| Body or role | What the deck keys it to |
|---|---|
| Executive sponsor | Approves changes to scope (`2de25757`); sits on the CoE (`17935246`) |
| Executive steering committee | Where a late risk is escalated (`4f44277d`) |
| Center of Excellence | Executive sponsors and the programme team (`17935246`); add a change manager against scope creep (`26ed97a3`); triage feature requests (`92fc13de`) |
| Architecture Review Board | Decisions that are costly to reverse: SAML versus delegated authentication, new object versus a record type (`3639bf51`) |
| Change Control Board | The technical architect approves the release for production (`2c90c553`) |

### Risk

- Unknown requirements with a fixed date (`376e5852`); parallel work-streams with dependencies (`b19ac21f`); late scope growth — escalate, then add resources or extend the timeline (`02921bb0`).
- A communication plan is consistent, to named stakeholders, and reports status, timelines and impact (`d292fd5d`).

### Seasonal releases — the most checkable part of this domain

- Refresh a sandbox **during the release preview window** to get the upcoming release, run regression there, and read the release notes for auto-enabled features (`ef3368a2`, `631e1af5`).
- About six weeks before go-live, make sure the sandbox will be on preview (`7f719fb9`).
- If the release must ship on the current version, ship before the upgrade (`cd632689`).

> **Zero deck questions — assessing ALM maturity.** "Given a complex customer scenario, assess ALM maturity and identify the people, technology, and processes required." Read a stem for the three: **people** (is there a release manager, a CoE, an ARB?), **technology** (source control, CI, sandboxes per stream?), **process** (a change policy, a cadence, a hotfix path?). The missing one is usually the answer. The deck's items on citizen developers (`70a0c1d5`) and a traceability matrix (`6a25c420`) are the nearest it comes.

## 5. System design

15% of the exam and 21% of the deck — over-drilled. Four bullets: agile tools, org strategy, sandbox strategy, deployment tools.

### Org strategy

- **Single org** for consistent processes, collaboration and one data location (`96992a86`) — at the cost of a more complex data model and stricter Apex governance (`c50db85c`).
- **Multi-org** when local law, language and process differ and innovation beats standardisation (`3079812f`), or for an unrelated business unit (`69a9ff36`).
- A 360° view across orgs: **hub-and-spoke** (`3f3e8dd7`) — see §13 for why its second keyed option is weak.

### Sandbox types

| Type | Refresh | Keyed for |
|---|---|---|
| **Full** | every 29 days | Performance diagnosis (`e06083f5`), staging as a full replica (`5c2251da`), production-bug analysis (`cb26f076`) |
| **Partial Copy** | every 5 days | A sampled data set via a sandbox template: weekly training (`50c2ae4b`), an integration benchmark (`db8dd0f5`) |
| **Developer / Developer Pro** | metadata only | One per developer or stream; clone one for a second stream (`46cb24ed`) |

After a refresh, script the fixes a copy of production needs — remapping external IDs to UAT-valid values, for one (`9ef00f77`).

### Deployment and agile tools

- **Change sets** are simple and declarative and deploy related components (`3a0f40db`). A CI build needs a migration tool or CLI, a CI server and source control (`19382561`); an automated pipeline to every sandbox and to production is a CI/CD tool (`0ab782ac`).
- An agile tool manages backlog and sprint and assigns work (`28e4ec67`), tracks effort (`c0976a29`), and is most useful wired to CI so a story shows its build and test status (`c4e0249f`).

> **Zero deck questions — DevOps Center.** Salesforce's own tool for the pipeline this domain describes, and the deck never asks about it.
>
> - "A pipeline defines the sequence of stages that work items progress as they go through the release lifecycle from development through to production." Each stage "corresponds to an environment (currently a Salesforce org), and a branch in the source control repository".
> - The template recommends **integration, UAT and staging** stages between development and production; UAT is "the bundling stage, where you version a group of related changes and move them together through the pipeline".
> - "The pipeline can't be modified after any changes have been promoted through it" — so plan the stages before the first promotion.
>
> On a Spring '23 exam, expect it as a named option rather than the subject of a question.

## 6. Building

14% of the exam, 18 deck items — well matched.

### Source control and branching

- Source control lets distributed teams work in isolation and backs up every change (`6e79fdb4`). Keep one entry point to production from the main branch, separate branches for minor and major releases, and one repository with branches per project (`42760192`).
- Several streams with separate timelines: the deck keys **GitHub flow** (`20a0373a`).
- A crowded shared sandbox: give each developer their own org plus a repository and CI, or coordinate strictly (`c7cb14ef`).

### Development model

- **Package development** improves collaboration, enables CI and replaces manual change tracking (`ae8b6e7f`); it lets merged teams release artefacts independently (`c60fdc56`).
- **Scratch orgs** for a fresh environment per project (`106ad44b`); moving to packages means enabling **Unlocked Packages and Second-Generation Managed Packages** in Setup (`2825c32c`).

### Quality

- **Static code analysis** in the pipeline before human review, plus written standards and training (`bf46c00b`, `4c9df2a3`). Salesforce's own tool is Code Analyzer.
- CI with automated tests, peer review, test-driven development (`0788a944`).
- The most common reason an AppExchange product fails security review: **CRUD and FLS** (`c4314d7d`).

### Unit tests and test data

- A **mock** is required for an HTTP callout, and isolates the unit from its dependencies (`1f8fa592`).
- Test data from a **CSV static resource** or a mock endpoint (`d1099662`).
- Run tests under several profiles, with positive *and* negative data (`0a6666e2`) — the outline's "positive, negative, permission-based".

## 7. Deploying

14% of the exam, 18 deck items. Three bullets: the Metadata and Tooling APIs, pre and post-deployment steps, and technical reference data. The deck covers the first and third well.

### Metadata API and Tooling API

- Metadata API deploys and retrieves up to **10,000 files** at once, with a **39 MB** maximum compressed .zip (`46826f40`).
- **Tooling API** for SOQL against smaller pieces of metadata from an application (`023258c0`).
- Deleting metadata needs **package.xml** and **destructiveChanges.xml** (`47bcc6c5`); scripted removal is the repeatable rollback (`821c2331`).
- **RunSpecifiedTests** plus **Quick Deploy** of a recent validation cuts deployment time (`96a9af62`). A validation's job ID "is valid for 10 days". Specified tests take classes, not methods, and each component still needs 75% coverage (`051864d9`).
- A deploy locks the target for metadata changes while users keep working with data (`7e0cf4e3`); field-type changes and profiles slow it (`1e158c90`, `45cad6f6`).
- A script pinned to an old API version fails on a field that only exists in a newer one (`acf27c9e`).
- Hand a release team a **package.xml** and the metadata .zip (`60b6639e`).

> **Zero deck questions — what the APIs can't deploy.** "Describe approaches to handle pre and post deployment steps, including items not supported via the APIs" is a named bullet. Salesforce states the constraint plainly: "Some Salesforce features have metadata types that aren't available in Metadata API. These metadata types can't be retrieved or deployed with Metadata API. **To make changes to these types, you must do it manually in each of your organizations.**" And "some metadata types may also be unsupported in source tracking, packaging, and change sets".
>
> So the architect's job is a **documented, rehearsed runbook** of manual steps, executed in every environment on the way up, and checked against the **Metadata Coverage** report before the plan is written. The deck's `41c787b2` gets close: a documented, approved manual step is auditable, and "some post-deployment configuration cannot be automated".

### Technical reference data — configuration stored as records

- Configuration that should travel with a deployment belongs in **custom metadata types**, not custom settings or records (`63d84f51`, `12f79a7f`).
- Moving related configuration records is limited by **circular relationships** and the **depth of nested relationships** (`82bf81bd`).
- For CPQ-style configuration objects, a third-party data-deployment product or the sfdmu plugin with version control (`f629a361`).

## 8. Testing

13% of the exam, 17 deck items. Three bullets: methodology, execution and coverage, and a unified test data strategy.

### Methodology

| The stem says | The test is |
|---|---|
| Page response time at 1,500 concurrent users | **Load** (`34e34718`) |
| A call centre must not slow down under volume | **Performance and load** (`d6c3d18a`) |
| New releases keep breaking old features | **Automated regression in CI** (`9164ffe1`, `9cb20e73`) |
| A seasonal release may break UI tests | **Browser tests**, broken by DOM changes (`065657fa`, `2d70511f`) |
| A data migration | Success criteria, manual and automated validation, ownership, associations, transformations (`a44349e1`, `91eb375c`) |

**Stress testing production is prohibited because it is a shared environment** (`11f1d00f`).

### Test data

Production data barred from sandboxes: **generate mock data** shaped like production, or **mask** a Full sandbox after refresh (`52e1dadf`). Automated loads run unattended and repeatably (`6156a463`).

> **No deck question asks it — coverage requirements.** Named in the execution bullet, and quoted only inside explanations. Unit tests "must cover at least 75% of your Apex code, and those tests must pass" — but "code coverage serves as one indication of test effectiveness", not proof (`6fcd633a`'s explanation). When you run specified tests during a deployment, "if the code coverage of an Apex component in the deployment is less than 75%, the deployment fails" (`051864d9`'s). Run everything in sandboxes and a chosen set in production (`4e87b7fd`).

## 9. Releasing

13% of the exam, 16 deck items. Three bullets: package types, sandboxes against a release plan, and release strategy.

| Package | When the deck keys it |
|---|---|
| **Unmanaged** | Hand over an app, IP and all, in the shortest time (`edf98922`, `69e82cf5`) |
| **Unlocked** | Internal apps in CI/CD; test before installing, check Metadata Coverage (`6d1e8ed6`, `7ae89b27`) |
| **Second-generation managed** | Two packages sharing a namespace expose methods with `@namespaceAccessible` (`947a218f`) |
| **Managed on AppExchange** | Objects and tabs don't count against edition limits (`36974ea1`) |

### Hotfixes and release plans

- A **dedicated hotfix sandbox** — Developer Pro is enough — for urgent production fixes during long projects (`b5cde063`, `d098ec60`, `7e6cdb08`). Never fix in the test sandbox and promote from there (`1e990e83`).
- UAT for a weekly minor release on Partial Copy, for a four-weekly major release on Full, because of the refresh intervals (`91f88d7e`).
- For production: a rollback strategy, an announced maintenance window, a configuration freeze (`2b7730d8`); no releases near peak season (`5e784c10`); a workflow-and-trigger change is a minor release with training (`d1940574`).

## 10. Operating

10% of the exam and 5% of the deck — the one real shortfall. Three bullets, and the seven items cover all three thinly. Learn the principle once, because it answers most of them.

> **The principle.** **A change made directly in production has to find its way back into source control, or the next deployment overwrites it.** Every Operating answer is some form of that.

- A minor-change policy for admins in production: downstream environments won't update automatically, changes must be documented on a cadence, and still tested (`bc626241`).
- Admins editing permission sets in production break SOQL: extract them, commit, merge, and run CI (`b00849d8`).
- Dashboards "rolling back" after each release: export report metadata daily and merge it into the developer branches (`058e3da6`).
- A regulated org: security review for every change including hotfixes, and explicit stakeholder approval (`41c787b2`).
- **Common artefacts across orgs**: an unlocked or managed package built once and installed everywhere (`716287d1`, `8771e8d4`, `b06f104c`).

> **Why this domain is short, and what to do about it.** The deck's old outline had no Operating domain; these seven were filed under Deployment and ALM. Expect about six real questions. Work the seven twice, and read every stem in §4 and §9 asking "was this change made in production?" — several releasing items turn on the same principle.

## 11. Numbers to memorise

| Number | What it is |
|---|---|
| **60 / 105 / 65%** | Scored items, minutes, pass mark. 39 of 60 to pass |
| **8 / 13 / 15 / 14 / 14 / 13 / 13 / 10** | Domain weights in outline order |
| **10,000 files / 39 MB** | Metadata API deploy or retrieve ceiling, and the compressed .zip maximum |
| **10 days** | How long a validation stays eligible for Quick Deploy |
| **75%** | Apex coverage required; per component when running specified tests |
| **29 days / 5 days** | Minimum refresh interval: Full sandbox / Partial Copy |
| **~6 weeks** | Before a go-live that straddles a seasonal release, secure a preview sandbox |

## 12. Distractor tells

> **Read the question's own verb.** "What is the **risk**" wants a consequence, not a fix. "Which **tool**" wants a product. "What should the architect **recommend**" wants the mature-programme answer. This deck mixes all three in its governance items.

- **Fix it in the test sandbox.** Always wrong: fixes start in development and move up (`1e990e83`, `7e6cdb08`).
- **A refresh interval the platform doesn't allow.** Any option relying on refreshing a Full sandbox more often than every 29 days is wrong (`cb26f076`, `cd632689`).
- **A Developer sandbox for data work.** Developer and Developer Pro copy metadata only; an option that ends in "and load the data with Data Loader every week" is the work a template removes.
- **"No manual steps at all."** An admirable target, not a requirement — some configuration can't be deployed (§7).
- **A retired tool as the answer.** On this exam the Ant Migration Tool can still be the key (§13).

## 13. Where the deck is older than the platform

The exam froze at Spring '23. Several keyed answers name tools that have since been retired; the exam still tests them.

> **An entire item on a retired tool — `9845d66b`.** Both keyed statements describe the **Lightning Testing Service**. Salesforce now says: "We used to recommend Lightning Testing Service (LTS) but it's deprecated and no longer supported", and points to Jest, UTAM, Jasmine, Mocha, Selenium and WebdriverIO. Answer with the key; **do not install LTS.** Its neighbour `59848aee`, on where Aura accessibility tests run, is from the same era.

> **Weak rather than wrong — `3f3e8dd7`.** Its second keyed option is the complete-graph multi-org topology, every org connected to every other. Salesforce's own org-strategy guidance warns where that goes: "before too long you have a spider web of integrations, data replication, and very brittle point-to-point connections". The item really asks which named topologies *can* deliver a 360° view, not which is advisable. Know the key; recommend hub-and-spoke.

> **Repaired from a dropped negation — `051864d9`.** The scrape turned "specifying the test method is **not** supported" into "is supported", leaving a fluent sentence that meant the opposite and an item with only one true option. It was repaired against Salesforce's *Running a Subset of Tests in a Deployment*: "You can specify only test classes. You can't specify individual test methods." The key is now A,B. The exam dumps key B,C, which is the option that page contradicts — if you have seen it elsewhere the other way round, this is why.

### Renamed or retired, answer unaffected

- **Ant Migration Tool** — retired Spring '24 (`93601ed1`, `8846055b`, `19382561`). Still the key on this exam.
- **sfdx-style commands** belong to the previous CLI generation (`0b8c5d16`).
- **Workflow Rules and Process Builder** reached end of support at the end of 2025 (`d1940574`, `feeeb5f2`).
- The classic **Development Lifecycle Guide** behind `1fca2746`'s vocabulary is retired; the lifecycle is now described through DevOps Center.
- **"Aloha"** is legacy vocabulary for the AppExchange limit exemption (`36974ea1`).
- **Data Mask** is now "(Legacy)", end of service 31 December 2026 (`52e1dadf`).

### Verification debt to be honest about

About thirty of this deck's citations are **topical rather than decisive**. The Planning and ALM items — steering committees, CoE membership, communication plans, risk — are governance practice no vendor page settles, and each says so in its own prose. Salesforce's Trailhead did settle a few outright: the Kanban and Scrum options in `bc9a1ad1` and `ade048ca` are verbatim from *Scrum and Kanban at Salesforce*. Read 137/137 citation coverage as weaker evidence on those domains than on Deploying, Building and Releasing, where the documentation decides.

## 14. Two-week revision plan

Set by three facts: the pass mark is 65%, the deck is well balanced except for Operating, and a third of the exam is judgment you learn from explanations rather than citations.

### Week 1 — the checkable domains

1. **Day 1 · Deploying**, 18 items, then §7's unsupported-metadata note. Learn the numbers in §11 today.
2. **Day 2 · Building**, 18 items.
3. **Day 3 · Releasing**, 16 items. The package table from memory.
4. **Day 4 · Testing**, 17 items, and the coverage rules.
5. **Day 5 · Operating**, all seven, twice. Then §10's principle applied to the releasing items.
6. **Day 6–7 · System design**, 29 items across two sittings, plus the DevOps Center pipeline.

### Week 2 — the judgment domains, then stop

1. **Day 8 · Planning**, 21 items. Write the governance table from memory.
2. **Day 9 · ALM**, 11 items, and the maturity reasoning in §3.
3. **Day 10 · §13 in full.**
4. **Day 11 · §11 and §12.**
5. **Day 12–13 · full deck in Blitz mode**, in two halves.
6. **Day 14 · only the misses.**

## 15. Sources

Every URL below was rendered in a browser on 2026-09-28 and its title confirmed. The other numbers in §11 come from the deck's own explanations, which cite the pages that state them.

- [Salesforce Certified Platform Development Lifecycle and Deployment Architect Exam Guide](https://help.salesforce.com/s/articleView?id=005298968&type=1&language=en_US) — The eight domains and weights, 65%, Spring '23, and what candidates are not expected to know.
- [Unsupported Metadata Types](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_unsupported_types.htm) — "To make changes to these types, you must do it manually in each of your organizations."
- [Plan Your Pipeline (DevOps Center)](https://help.salesforce.com/s/articleView?id=platform.devops_center_pipeline_plan.htm&language=en_US&type=5) — Stages, the recommended template, and that a pipeline can't change after the first promotion.
- [Running a Subset of Tests in a Deployment](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deploy_run_specific_tests.htm) — Classes not methods, and the per-component 75% rule. Cited by `051864d9`, whose dropped negation this page repaired.
- [Testing and Code Coverage](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_code_coverage_intro.htm) — The 75% requirement, and coverage as one indication of test effectiveness. Cited by `6fcd633a`.

Per-question citations live in the deck itself: every one of the 137 explanations ends in a `References:` block with at least one rendered URL.

## 16. Using this with NotebookLM

Upload `study-guides/salesforce-dld.md`.

- *Give me eight stems and ask which governance body decides each: executive sponsor, steering committee, CoE, ARB or CCB.*
- *Quiz me on the sandbox table in section 5. Include two stems where the refresh interval is what rules an option out.*
- *Walk me through a release with one step the Metadata API can't deploy. Where does the manual step go, and how is it tested?*
- *For every item in section 13, tell me the exam answer and what I would actually use today.*
- *I have eight days. Compress section 14, keeping Operating on day one.*

---

Measured 2026-09-28 against `public/decks/salesforce_dld_questions_corrected.json` and Help article `005298968`. Question counts and domain weights both have a short shelf life — re-run `node study-guides/reclassify-dld.mjs` before trusting the table in §2.
