# Slack Consultant Field Guide

Built from the 37 questions in the practice deck, measured against the official exam outline
and the Slack documentation those questions cite, on 2026-09-28.

**Read §3 before anything else.** Every question in this deck carries a citation, but **only
15 of the 37 turn on a fact any Slack page states.** Twelve are consulting and training
judgment against strawman distractors, answerable by elimination and settled by no
documentation. The deck is also **smaller than the exam**, and three whole outline bullets —
workflows, SSO and the admin support model — have no question at all.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Salesforce Certified Slack Consultant |
| Content | **60 scored** multiple-choice / multiple-select, plus up to 5 unscored |
| Time | **90 minutes** |
| Passing score | **67%** — 41 of 60 |
| Prerequisite | None; at least a year managing implementation projects is recommended |
| Fee | US$200, retake US$100 |
| Aligned to | **Summer '24** |
| Maintenance | One Trailhead maintenance module a year |
| Exam guide | Help article `005298991` |

**A consulting exam, and a deck that can only half-teach it.** This certification tests how
you run a Slack engagement — discovery, design, migration, governance, training — more than
which toggle does what. Most of what the deck asks is advice, and its wrong options are often
absurd enough to eliminate without knowing anything.

### How the outline was found — the part that generalises

The obvious place to look is Slack's own site; the outline is not there. **Slack's consultant
credential is a Salesforce certification now**, and its exam guide is a Salesforce Help
article in the same `0052989xx` block as the others, beside Slack Developer (`005298987`) and
Slack Administrator (`005298990`). One web search restricted to `help.salesforce.com` found
it, and its top hit was a **named Trailhead redirect** —
`trailhead.salesforce.com/help?article=` followed by the guide's title with hyphens — that
lands on the numeric id. That form is worth trying first for any Salesforce exam. The guide
renders fully with `get_page_text`; there is no PDF.

**The audience list tells you what kind of exam this is**: implementation consultant,
engagement manager, enablement consultant, change management consultant, learning
consultant. The guide recommends a single Trailmix and says to search Help for the outline's
topics. There is no list of documents that would settle this exam.

---

## 2. Where the points actually are

The deck's eleven `_cat` tags split what the outline treats as one domain: analytics,
identity, compliance, app approval and channel-creation permissions are **all** Policies and
Settings. The deck column is an independent re-classification
(`study-guides/reclassify-slack.mjs`). "Judgment" counts items no Slack page can decide.

| Domain | Exam | ≈ Qs | Deck | Judgment | Verdict |
|---|---:|---:|---:|---:|---|
| Delivery and Migration | 17% | ~10 | 3 · 8.1% | 1 | **under** |
| Discovery | 10% | ~6 | 4 · 10.8% | 3 | about right |
| Grid Design | 15% | ~9 | 2 · 5.4% | 0 | **badly under** |
| Policies and Settings | 22% | ~13 | 13 · 35.1% | 0 | over by share |
| Channel Strategy | 10% | ~6 | 3 · 8.1% | 0 | **no workflows** |
| Governance Structure | 8% | ~5 | 2 · 5.4% | 0 | **one twin pair** |
| Learning and Enablement | 18% | ~11 | 10 · 27.0% | 8 | **mostly judgment** |

**The deck is smaller than the exam.** 37 questions against 60, and five reworded pairs mean
it is really about 32 distinct questions. Every other deck in this repo but one over-drills
its exam; this one cannot. Where it has fewer items than the exam has questions — Delivery
and Migration (3 for ~10), Grid Design (2 for ~9), Governance (2 for ~5) — the deck is not
practice, it is a sample.

**Where the deck's weight actually sits.** Policies and Settings is its best domain:
thirteen items, none of them judgment, three of them the source of the deck's hardest-won
corrections (§7). Learning and Enablement looks well covered at ten, but **eight of the ten
are training advice against strawmen**; the two decidable ones are user troubleshooting.

### Outline bullets with no keyed deck item — 15

| Domain | Uncovered | Where |
|---|---|---|
| Delivery and Migration | Pre-migration activities (scheduling, user cleanup, comms) · executing a migration · the import and export tools | §4 |
| Discovery | Researching the client first · security and policy questions · success metrics | §5 |
| Grid Design | From discovery outputs to feasible options · sign-off | §6 |
| Policies and Settings | **SSO / SAML** · org-level security (session duration, 2FA) · Slack Connect beyond DLP · getting stakeholders to agree settings | §7 |
| Channel Strategy | **Workflows** — the outline names the onboarding and standup workflows | §8 |
| Governance Structure | **The admin support model** · admin processes that can move into Slack | §9 |
| Learning and Enablement | Creating learning materials · the rollout communication plan | §10 |

Confirmed by a keyword sweep over stems and options: "SSO", "SAML", "Workflow Builder",
"standup", "onboarding", "rollout", "schedul", "materials" and "sign-off" all return zero.
Two-factor authentication appears three times, always as a wrong option.

---

## 3. How much of this deck any page can check

Every one of the 37 questions has a rendered Slack URL in its references, so the deck reads
37/37 cited, the same number as a fully checked Salesforce deck. **Here it means less.** The
2026-08-18 fact-check sorted the deck into three kinds of question, and only the first is what
"cited" means elsewhere.

| Kind | Items | What the citation does |
|---|---:|---|
| **Decisive** | 15 | A Slack page states the fact the key turns on — roles, channel-management permissions, app approval, DLP, SCIM, troubleshooting. Or, for three items, states that the fact the deck assumed **is not true** |
| **Supported** | 10 | A page points the same way as the key — naming conventions, project channels, analytics columns, org-level policy — but choosing between options is still best practice |
| **Judgment** | 12 | **Orienting only.** Consulting and training advice; the reference is Slack's "launching Slack" resource or a migration blog post |

**The twelve judgment items.** Discovery: `70cfc31f`, `4c998d54`, `a401a105`. Migration:
`663ae7a0`. Learning and Enablement: `7cdb2278`, `20885bb7`, `9f6ca95b`, `0609296f`,
`24d2ac86`, `eaa94ffb`, `bd98bac0`, `0c94d85c`. Each says in its own explanation that its
reference is orienting rather than decisive.

**Why this matters for your score.** The judgment items are answerable because their wrong
options are strawmen — "read the user manual during the session", "replace their computer's
sound card". **Getting them right proves you can spot a bad option, not that you know the
good one.** The real exam's judgment items will have four plausible options.

### How to answer a judgment item when the options are all plausible

The pattern the twelve keys share, which is also the pattern Slack's own launch guidance
follows:

1. **Client-specific over generic.** Start from the client's goals, structure or pain points.
2. **Measurable over aspirational.** A vision statement with success metrics beats one
   without.
3. **Hands-on over told.** Experiential learning is the outline's own phrase.
4. **Phased and ongoing over one-off.** Basic then advanced, with refreshers and
   post-launch support.
5. **Balanced over extreme.** "Core global settings, regional adjustments on request"
   (`c2a30421`) beats "identical everywhere" and "each region on its own".

**The five reworded pairs are redundancy, not error:** `1d57f94c`/`ff8a88a6` (Org Owner),
`60708c05`/`cb206cbe` (Workspace Admin), `ad687de6`/`016036e7` (naming conventions),
`7cdb2278`/`0609296f` (hands-on workshop), `535baa2b`/`6b1ec162` (channel analytics). Both
copies are correct; the duplicate detector cannot see them because the stems were reworded.

---

## 4. Delivery and Migration

**17% of the exam — about ten questions — and three deck items**: a first step (a needs
analysis, `96be8a94`), who the client calls (`663ae7a0`) and after-care (`6b9124ed`). The
migration itself is missing.

### Roles on an engagement

The outline's second bullet is the division of labour between **Slack, the Partner and the
client**. In a partner-led migration, **the Partner's team is the client's first contact** and
escalates to Slack as needed (`663ae7a0`). The client owns decisions and internal comms; the
Partner runs the project; Slack supplies the platform and its own support.

### What the deck skips: the migration itself

No Slack page lays out a consultant's migration method, so this is **practice, not
documentation** — but it is what the outline's bullets name:

| Phase | The outline's words | What it means in practice |
|---|---|---|
| Pre-migration | "scheduling, user cleanup, comms" | Agree the cutover window and any content freeze; clean the user list (leavers deactivated, duplicates merged, emails matching the identity provider); tell users what changes and when |
| Execution | "migration status, migration issues, coordination with the client and Slack" | Track progress, triage and log issues, one channel with the client and one with Slack |
| After | (the deck's `6b9124ed`) | Support, extra training, check-ins |

The documented part is Slack's **import and export tools**: a standard export covers public
channels; a self-serve export of private channels and DMs needs Business+ or Enterprise; on
Enterprise the **Discovery API** is the route eDiscovery partners use.

---

## 5. Discovery

**10% of the exam — about six questions — and four deck items, three of them judgment.**

- **Articulate the value of Slack.** The one decidable item keys **integrations with the
  tools the client already uses** (`4953a8af`).
- **Ask about long-term goals and current pain**, not features (`70cfc31f`, `a401a105`).
- **A vision statement needs specific, measurable goals tied to business objectives**
  (`4c998d54`). The outline pairs it with **success metrics**, which no deck item names:
  adoption, engagement in channels rather than DMs, and a business metric the client already
  tracks.

**Two discovery bullets the deck never asks:** **research the client before the first
meeting**, and **ask about security and policy** — existing controls, compliance
obligations, the desired future state. The second feeds straight into §7.

---

## 6. Grid Design

**15% of the exam — about nine questions — and two deck items.**

"Grid" is Enterprise Grid: **one organisation holding several workspaces**. Org-level
policies apply across every workspace, and workspace-level settings sit underneath. A grid
design decides how many workspaces there are, what each is for, and which settings are fixed
at the org.

- **Mirror the organisation's structure** rather than a generic template (`a0bf9e87`).
- **Fix the core at org level, allow requested variation below it** (`c2a30421`).

**What the outline asks and the deck does not.** The four grid bullets are a sequence: use
**discovery outputs** for an initial recommendation, know the **best practices**, lay out
**feasible options** with trade-offs, and **support sign-off**. The deck tests the second
only. When stakeholders cannot agree, present options with trade-offs; do not decide for
them.

---

## 7. Policies and Settings

**22% of the exam — about 13 questions — and 13 deck items, none of them judgment.** The
deck's strongest domain, and where its fact-check did most of its work. Three items were
keyed on things Slack does not do.

**1 · Compliance Exports do not preserve anything — `296ced65`.** The item keys "Compliance
Exports" for legal hold. That name is not current Slack terminology, and an export
**retrieves** data; it does not **preserve** it. Slack's mechanism is the native **Legal
Holds** feature: on Enterprise, a member with the **Legal Holds Admin** role places a hold on
specific people, and their messages and files are kept **regardless of retention settings and
regardless of edits or deletions**. Legal Holds is not among the item's options, so the key
stands as the best of four — but where it is offered, it is the answer.

**2 · There is no IP allowlist for member sign-in — `10bdf793`.** Slack documents no
self-serve setting that limits **where members sign in from**. The documented network control
is **proxy-based**: your proxy inserts `X-Slack-Allowed-Workspaces-Requester` and
`X-Slack-Allowed-Workspaces` headers, which limit **which workspaces** people on your network
can reach. IP allowlisting exists only for **app OAuth and SCIM tokens**. Slack says
"allowlist" now, not "whitelist".

**3 · There is no channel-creation approval queue — `2169924a`, `47e8ec41`.** The setting is
a **permission**: owners choose which roles may create public channels, create private
channels, archive and unarchive. There is **no propose-and-approve queue**, **no
"justification" prompt**, and **no automatic archiving** of inactive channels. Slack's
approval queues are for **Slack Connect invitations, workspace invitations and app
requests**. `2169924a` keeps its key as an organisational process; `47e8ec41` had its key
moved **C → A** because its keyed "justification" setting does not exist.

### Administrative roles

| Role | What sets it apart |
|---|---|
| Org Primary Owner | **Exactly one** per Enterprise org; the only one who can transfer ownership |
| Org Owner | Everything but transferring ownership — the top role you assign (`1d57f94c`, `ff8a88a6`) |
| Org Admin | Manages org settings and policies, below the owners |
| Workspace Owner | Top of a single workspace; appoints Workspace Admins |
| Workspace Admin | Manages members and settings, but **"can't access the Billing page"** (`60708c05`, `cb206cbe`) |

Slack documents **no "Guest Admin" and no "User Group Admin"**.

### Identity and org-level security

- **SCIM provisioning** ties accounts to the directory (`d1ec6012`).
- **SAML SSO — not in the deck.** Set up by Workspace or Org Owners; **Business+ and
  Enterprise** (or Free and Pro with a connected Salesforce org).
- **Session duration — not in the deck.** All plans. Members are warned **two hours** and
  again **15 minutes** before sign-out; a change ends sessions at random across the chosen
  period.

### Compliance, DLP, Slack Connect, apps

- **DLP is Enterprise only**, and a rule can target **Slack Connect** conversations
  (`d1458b4b`).
- **Slack Connect approval settings — not in the deck.** On paid plans: **who approves**,
  **when approval is required**, **where requests go**, **when invitations are accepted
  automatically**.
- **App approval.** By default **members can install apps without approval**. Owners turn
  approval on and appoint App Managers; a regulated client reviews each app and routes
  installs through IT (`6bfcfbed`, `79e98f8f`). Slack says it "doesn't endorse or certify"
  Marketplace apps.
- **Analytics.** Channels tab: created, membership, messages posted, members who posted and
  viewed, reactions, huddles — on Pro and Business+, **public channels only** (`535baa2b`,
  `6b1ec162`).

---

## 8. Channel Strategy

**10% of the exam — about six questions — and three deck items**, all naming and project
channels. The fourth bullet, workflows, has none.

- **Naming conventions** with consistent prefixes (`ad687de6`, `016036e7`).
- **A channel per project** (`6febbd25`).

**Workflows — named in the outline, absent from the deck.** The outline names an
**onboarding workflow** and a **standup workflow**. They are built in **Workflow Builder**,
which automates everyday processes and can connect to other apps. By default **all members can
create workflows** and members and guests can use them; **paid plans**; start from a
**template** or from scratch. Expect an item where "every new joiner gets the same welcome" is
answered by a workflow, not a pinned message or a custom bot.

---

## 9. Governance Structure (Owner and Admin Roles)

**8% of the exam — about five questions — and two deck items, which are one question asked
twice** (the Org Owner).

### The admin support model — not in the deck

"Facilitate admin support model discussions (for example: request/help/approvals process
flows)." No Slack page prescribes one, so this is practice: **where members ask for help** (a
help channel), **how they request things** (a request workflow, not a DM to an admin), and
**who approves what**. The concrete approvals are the ones Slack queues — **app requests,
workspace invitations, Slack Connect invitations** — plus whatever you restricted by
permission.

### Admin processes that can move into Slack — not in the deck

Request-and-approve processes that run on email or forms become **Workflow Builder
workflows** with a form step and a channel for the approver.

**Assigning a role is Governance; knowing its permissions is Policies.** This guide files
"who should be assigned the top role" here and "which role can do X without billing" under
§7, following the outline's wording.

---

## 10. Learning and Enablement

**18% of the exam — about eleven questions — and ten deck items, eight of them judgment.**
Read §3's five-point pattern first.

- **Experiential learning**: users learn by doing real or simulated work in Slack — a
  hands-on workshop, a mock project, a role-play (`20885bb7`, `0609296f`, `24d2ac86`,
  `7cdb2278`).
- **Curricula differ for admins and users** (`0c94d85c`, `eaa94ffb`).
- **Phased and ongoing** (`9f6ca95b`, `bd98bac0`).

### The two decidable items: user troubleshooting

| Symptom | First step |
|---|---|
| Cannot hear others on a call | Check Slack's audio settings and the connected device (`e50e9a46`) |
| Slow loading, frequent disconnects | Clear the app's cache (`d7360bcf`) |

**Two bullets the deck skips:** **create learning materials** — quick references, short
videos, a tips channel; and **recommend a rollout communication plan, then enable the client
to run it**. The consultant enables the client's comms; they do not become its comms team.

---

## 11. Numbers to memorise

| Number | What it is |
|---|---|
| **60 / 90 / 67%** | Scored questions, minutes, pass mark. 41 of 60 |
| **17 / 10 / 15 / 22 / 10 / 8 / 18** | Domain weights in outline order |
| **Summer '24** | Exam alignment |
| **1** | Org Primary Owner per Enterprise org |
| **2 hours / 15 minutes** | Session-expiry warnings |
| **3 approval queues** | Slack Connect invitations, workspace invitations, app requests |
| **4 channel permissions** | Create public, create private, archive, unarchive |
| **Enterprise only** | DLP, Legal Holds, the Discovery API |
| **Business+ and Enterprise** | SAML SSO; self-serve export of private channels and DMs |
| **Public only** | Channel analytics on Pro and Business+ |
| **15 / 10 / 12** | This deck's decisive, supported and judgment items |

---

## 12. Distractor tells

**Read the question's own verb.** "Which **setting**" wants something that exists in Slack's
admin pages. "Which **approach**" or "what should the consultant **do**" is a judgment item:
apply §3's pattern. "Which **role**" wants a role that exists.

- **A setting that sounds balanced but does not exist** — justification on channel creation,
  automatic archiving, a channel approval queue, a sign-in IP allowlist.
- **A role that does not exist** — Guest Admin, User Group Admin.
- **An export offered as preservation.** Exports retrieve; Legal Holds preserve.
- **Two-factor authentication** as the answer to a location or compliance problem.
- **The extreme option** in a judgment item.
- **A plan-tier trap** — DLP and Legal Holds on a Pro workspace.

---

## 13. Where the deck is older than the exam

Both are old: the exam is aligned to **Summer '24**, and the deck's vocabulary is older still.
**No deck key is contradicted** by anything found for this guide.

| The deck says | Slack now says | Note |
|---|---|---|
| Enterprise Grid | Enterprise plan; **Enterprise org** | The outline still says "Grid Design" |
| Compliance Exports | Export tools, the **Discovery API**, **Legal Holds** | §7, item 1 |
| IP whitelisting | **Allowlist** — and not for sign-in | §7, item 2 |

**Exam-right, production-wrong.** `296ced65` keys Compliance Exports for legal hold;
`10bdf793` keys IP whitelisting; `2169924a` keys a propose-and-approve channel policy. Each
is the best of its four options and each explanation already says what Slack offers. Answer
the deck's key when those are the options; **recommend Legal Holds, proxy headers, and a
creation permission plus a request workflow** on a real engagement.

**How to verify any of this yourself.** `slack.com/help` fails honestly: an invented article
id returns a real HTTP 404. But **the URL slug is cosmetic** — the article resolves by its
number, and a bare `slack.com/help/articles/<id>` redirects to the current slug. A stale slug
is not a dead link, and a plausible one is no evidence. Check the rendered title.

---

## 14. Two-week revision plan

The deck takes under an hour. Week 1 learns the facts and the missing bullets; week 2
practises judgment.

**Week 1 — the facts, and what the deck skips**

1. **Day 1 · Diagnostic.** Read the outline; do all 37 deck questions; sort misses by §3's
   three kinds.
2. **Day 2–3 · Policies and Settings.** §7 in full, then the deck's 13 items.
3. **Day 4 · Channels and workflows.** §8. Build an onboarding and a standup workflow if you
   can.
4. **Day 5 · Grid and governance.** §6 and §9.
5. **Day 6 · Migration.** §4. A one-page pre-migration checklist from memory.
6. **Day 7 · Consolidate.** §11 and §12.

**Week 2 — judgment**

8. **Day 8 · Discovery.** §5. A vision statement with three success metrics.
9. **Day 9–10 · Learning and Enablement.** §10; draft an admin curriculum and a rollout comms
   plan.
11. **Day 11 · Generate harder judgment items** (§16) and answer them with §3's pattern.
12. **Day 12 · §13 in full.**
13. **Day 13 · Full deck in Blitz mode**, options read aloud off.
14. **Day 14 · Only the misses**, with §2's uncovered table as a checklist.

---

## 15. Sources

The exam guide and the four pages marked new were rendered in the browser on 2026-09-28 and
grepped for the facts cited; the rest were rendered in the 2026-08-18 fact-check.

- [Salesforce Certified Slack Consultant Exam Guide](https://help.salesforce.com/s/articleView?id=005298991&type=1&language=en_US) — outline, weights, Summer '24, 67%.
- [Create and manage legal holds](https://slack.com/help/articles/4401830811795-Create-and-manage-legal-holds) — the preservation mechanism.
- [Approve Slack workspaces for your network](https://slack.com/help/articles/360024821873-Approve-Slack-workspaces-for-your-network) — the proxy-header control.
- [Adjust channel management permissions](https://slack.com/help/articles/115004988303-Adjust-channel-management-permissions) — the four permissions; no approval queue.
- [Types of roles in Slack](https://slack.com/help/articles/360018112273-Types-of-roles-in-Slack) — the role hierarchy.
- [Set up SAML single sign-on for Slack](https://slack.com/help/articles/203772216-Set-up-SAML-single-sign-on-for-Slack) — new; who and which plans.
- [Manage session duration](https://slack.com/help/articles/115005223763-Manage-session-duration) — new; warnings and staggered expiry.
- [Manage Slack Connect channel approval settings](https://slack.com/help/articles/115005912706-Manage-Slack-Connect-channel-approval-settings-and-invitation-requests) — new; the four settings.
- [Guide to Slack Workflow Builder](https://slack.com/help/articles/360035692513-Guide-to-Slack-Workflow-Builder) — new; who can build, plans, templates.
- [Manage app approval for your workspace](https://slack.com/help/articles/222386767-Manage-app-approval-for-your-workspace) — defaults and App Managers.
- [Guide to Slack import and export tools](https://slack.com/help/articles/204897248-Guide-to-Slack-import-and-export-tools) — export paths and the Discovery API.
- [Launching Slack (Slack for admins)](https://slack.com/resources/slack-for-admins/launching-slack) — orienting source for the judgment items.

Per-question citations live in the deck itself: every one of the 37 explanations ends in a
`References:` block with at least one rendered URL — with the caveat in §3.

---

## 16. Using this with NotebookLM

Upload this file. NotebookLM is more useful for this exam than most, because the deck's
weakest area — judgment with plausible options — is what it can generate.

- *Write ten discovery and enablement scenario questions where all four options are
  reasonable consulting advice and only one is best. Explain each answer with the pattern in
  section 3.*
- *Quiz me on section 7's three corrections. For each, ask what the deck keys and what Slack
  actually offers.*
- *Give me twelve "which setting" questions where one option is a setting Slack does not
  have.*
- *Walk me through a partner-led migration from discovery to post-launch, asking at each
  phase what the consultant, the client and Slack each do.*
- *Drill the roles table in section 7 as flashcards, including the two roles that do not
  exist.*
- *I have one week. Compress section 14, keeping Policies and Settings and workflows first.*

*Measured 2026-09-28 against `public/decks/Salesforce_Slack_Consultant_Questions.json` and
Help article `005298991`. Re-run `node study-guides/reclassify-slack.mjs` before trusting §2.*
