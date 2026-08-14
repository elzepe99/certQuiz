# CertPrep — working brief

A static certification practice quiz. Vite + React 18 + TypeScript + Tailwind,
Zustand for per-deck state, React Router v6, progress in localStorage. No backend
and no auth: the whole app is 13 JSON decks in `public/decks/` rendered by a small
React app, deployable to any static host.

**The decks are the product.** The app is stable and rarely needs work; the
valuable, error-prone, ongoing task is making the question content *correct*. Most
sessions here are deck work, not app work.

```sh
npm install && npm run dev     # http://localhost:5173
```

Supabase is optional. It gates an in-app comments feature behind
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (see `.env.example`); with no keys
the app runs fine and comments degrade off. Never treat missing Supabase config as
a bug.

---

## Skill routing — what to invoke when I ask

| When I say something like | Invoke | Notes |
|---|---|---|
| "clean up / fact-check / verify this deck", "are these answers right?", "check these against the docs", "add sources / references / citations", "I found a wrong answer in deck X" | **`factcheck-deck`** | The primary workflow of this repo. Read it in full before touching deck content — it encodes failures that already happened here. |
| "I just scraped / imported a new deck" | **`factcheck-deck`** | Freshly scraped answer keys are the most likely to be wrong. Run `add-question-ids.mjs` first to mint ids, then fact-check. |
| "audit / structurally check a deck" (no doc lookups) | `node scripts/audit-deck.mjs <deck>` | Phase 1 of the skill, standalone. Cheap. Leads, not verdicts. |
| "what did users comment on?" | `npm run review-comments` | Needs Supabase keys configured. |
| "build me a chart / dashboard of deck progress" | `dataviz` | |
| "make this a shareable page / artifact" | `artifact-design` | |

**Do not** hand-roll a bespoke deck-fixing script. That is how this repo
accumulated eleven single-use `fix-*.mjs` files (now deleted). The path is:
write a findings JSON → `apply-findings.mjs`. It enforces invariants that are easy
to forget under fatigue.

---

## Repo map

```
src/                  the app — components, lib/quiz.ts (explanation parsing),
                      lib/richtext.ts (code-block detection)
src/diagrams/         hand-authored SVG figures, keyed by question id in
                      registry.ts — see "Questions that need a figure" below
public/decks/         13 decks + manifest.json + deck-template.json
scripts/
  audit-deck.mjs      structural audit — skill Phase 1
  add-question-ids.mjs  mints permanent ids; NEW decks only
  review-comments.mjs   exports in-app comments to markdown
  test-richtext.mjs     regression suite for the code-fence heuristic
  lib/corrections.mjs   stampCorrection() — LOAD-BEARING, see below
.claude/skills/factcheck-deck/
  SKILL.md            the deck workflow
  references/deck-format.md    deck + findings schema
  references/verified-docs.md  URLs already confirmed to render — the
                               compounding asset; always check here first
  scripts/            apply-findings.mjs, check-urls.mjs, replace-refs.mjs
freecram-scraper/     scrape_freecram.py — the scraper only
```

`scripts/lib/corrections.mjs` is resolved by absolute path from
`apply-findings.mjs` as `<repo>/scripts/lib/corrections.mjs`. **Never move or
rename it** without updating that resolution, or every findings application breaks.

Raw scrape dumps, past `findings-*.json`, and the one-shot fix scripts were
removed in the Aug 2026 cleanup. They live in git history — recover any with
`git show f9058ab:findings-dev2.json`. Their durable lessons are below; prefer
this file to archaeology.

### Verification commands

```sh
npm run typecheck        # tsc --noEmit
npm run test:richtext    # 28 tests; run after ANY richtext.ts rule change
npm run build            # tsc -b && vite build
```

The richtext suite ends with a deck-wide sweep whose block count spikes if a
detection rule starts over-firing. A rule change that leaves the count flat and
the tests green is safe; a spike means the heuristic now eats prose.

### Questions that need a figure

Some scraped items were written against a diagram that did not survive the
scrape. The earlier workaround flattened the picture into a bracketed
`[Diagram — sequence. A -> B: ...]` blob welded onto the stem, which is
unreadable and, for anything whose answer turns on nesting or timing, does not
actually carry the mechanism. **Do not add more of those.** Draw the figure.

`src/diagrams/registry.ts` maps a question `id` to a hand-authored inline SVG.
Nothing changes in the deck JSON — ids are permanent, so the binding survives
stem edits, and an SVG inlined into a deck file would make the content
uneditable. `primitives.tsx` holds the sequence-diagram vocabulary (lifelines,
activation bars, self-calls, leg chips); the two component-style figures are
bespoke.

**All four current figures are redrawn from the original exam images**, which
the repo owner supplied on 2026-08-11. Two of them had first been drawn from the
stem alone, and comparing them against the originals moved real details — most
sharply in `0ae13744`, where the lettered legs sit on the participant that is
*waiting* (A on the UI Component, B/D/F on the Middleware as it makes each
sub-call), not on the participant being called, which is where a from-the-prose
reading naturally puts them. **Ask for the source image before drawing from a
stem.** The answer key did not move, but the figure was teaching the wrong
convention.

Four rules the existing four follow:

- **Paint with the CSS variables, never literal hex.** The figure should
  inherit the palette, not sit on top of it.
- **No mark may single out the keyed option.** These render *above* the
  options, before the reader has committed. State the mechanism; leave the
  reasoning alone. Captions say how to read the notation, not what the answer
  works out to.
- **Mark a reconstruction as one.** Set `reconstructed: true` when no original
  figure survived and you drew it from the stem. It renders a chip and a
  figcaption note; a reader deserves to know it is not the exam's own artwork.
  No current figure sets it — the flag exists for the next one drawn blind, and
  comes off once the original turns up and the drawing is checked against it.
- **Do not reproduce the source's typos.** The eligibility figure misspells
  "Eligibility" three times; the redrawing spells it correctly. Fidelity is to
  the structure, not the proofreading.
- **Verify geometry in the browser, not by eye in the source.** Coordinates
  computed while writing collide in practice. Load the question and compare
  every `<text>` bounding box in *screen* space — `getBBox()` ignores `<g
  transform>` and will report false overlaps for anything inside the legend.

The question column is ~550px with both sidebars open, so a five-lifeline
diagram cannot fit legibly. Figures scroll sideways at their `minWidth` and
Expand opens them full-viewport. That overlay stops keystrokes in the capture
phase on purpose — `lib/shortcuts.ts` binds Enter, the arrows and 1–5 on
`window`, so without it paging an expanded diagram would answer the question
underneath.

---

## Deck state — as of 2026-08-11

1,549 questions across 13 decks. **549 (35%) carry a reference with an actual URL.**

That is down from 1,565 / 559 because 16 intra-deck duplicates were removed on
2026-08-11 (see "Duplicates" below), not because anything was decited.

Measure coverage with a URL test, not by looking for the `References:` marker. The
app's parser (`src/lib/quiz.ts`) treats **every** non-empty line after the marker as
a reference and does not require a URL, so 598 questions render a References section
but only 559 have a link in it. The **39-question gap** is real content: prose like
"Salesforce Agentforce Documentation: SDR Agent Setup > Channels" rendered under a
References heading with nothing to click, plus a handful of empty blocks. It degrades
gracefully — `linkifySegments` only linkifies real URLs — but it is unverifiable by a
learner and it inflates any naive coverage count. The gap is **agentforce 26,
revenue-cloud 10, admin 3**.

That corrects a figure this file previously carried. The old row claimed a
106-question gap split agentforce 73 / revenue-cloud 30 / admin 3. Measured per
question, the gap is 39; 73 is close to agentforce's count of URL-less reference
*lines* (79), so the old number appears to have counted lines and labelled them
questions. Count questions, and re-measure rather than copying the previous row:

```sh
node -e "const fs=require('fs'),p=require('path');const d='public/decks';let m=0,c=0;fs.readdirSync(d).filter(f=>f.endsWith('.json')&&!/manifest|deck-template/.test(f)).forEach(f=>{const qs=JSON.parse(fs.readFileSync(p.join(d,f),'utf8'));if(!Array.isArray(qs))return;qs.forEach(q=>{const e=q.explanation||'';const i=e.search(/^References:/mi);if(i>=0){m++;if(/https:\/\//.test(e.slice(i)))c++;}})});console.log('marker',m,'cited',c,'gap',m-c)"
```
Reference coverage is a *necessary* signal but **not a sufficient one** — the skill
requires a citation on every verdict including `confirmed`, so a fully checked deck
always reaches N/N, but a deck can reach N/N without its answers ever having been
checked. The IAM row below is the worked example. Read the Verification status
column, not the Cited column.

| Deck | Q | Cited | Verification status |
|---|---:|---:|---|
| salesforce-platform-developer-2 | 148 | 148 | **Fully checked** — 8 rounds, 2 keys moved |
| salesforce-integration-architect | 133 | 133 | **Fully checked** — 37 stamps, 15 keys moved. Spot-rechecked 2026-08-10: citations sound, content current, 0 wrong answers found |
| salesforce-iam-architect | 116 | 116 | **Fully checked** (2026-08-10) — 3 keys moved, 7 reasoning fixes |
| salesforce-admin | 154 | 33 | Partial; 13 keys moved (ADM-201 merge pass). 3 more render a References block whose URL is broken across lines — one shows a bare `htm` |
| salesforce-agentforce-specialist | 122 | **0** | **Not cited at all.** 26 questions render a References block containing prose only (79 such lines), no URLs |
| salesforce-revenue-cloud | 137 | **0** | **Not cited at all.** 10 questions render a References block with no URL — 2 carry prose, 8 are empty |
| salesforce-data-cloud-consultant | 100 | 0 | Uncited; 4 keys moved via comments |
| salesforce-sharing-visibility | 136 | 0 | Uncited; 4 reasoning stamps |
| salesforce-app-builder | 119 | 119 | **Fully checked** (2026-08-11) — 4 keys moved, 27 reasoning fixes, 3 defective option sets repaired. Q1–50 spot-rechecked: 10 sampled, 1 defect (a mechanism stated backwards), so the earlier batches read sound |
| salesforce-dld | 138 | 0 | **Untouched** |
| salesforce-data-architect | 135 | 0 | **Untouched** |
| claude-questions | 74 | 0 | **Untouched** |
| salesforce-slack-consultant | 37 | 0 | **Untouched** (smallest — good next target) |

**The IAM deck used to be the trap in this table, and the lesson survives it.**
Before 2026-08-10 it read as complete at 122/122 cited, but those citations came
from a pass that verified *structure*, not answers — only `c18bee92` had ever been
settled against documentation, and 15 of its original 41 URLs were dead. A full
documentation pass then found **3 wrong answers and 7 imprecise explanations** in
the 121 questions that had never been checked. So the rule holds generally:
**full citation coverage is not evidence of correctness.** When a "Cited" number
looks reassuring, check what the pass that produced it actually verified.

The three keys that moved, as a flavour of what full coverage was hiding:
`f5a4335a` C→A (a Connected App's trusted-IP field is scoped to the web server
flow, so profile Login IP Ranges are what restrict a username-password
integration), `efc3d13e` B→C (one MFA prompt across mixed login paths comes from
session security levels, not the org-wide MFA setting), `9f507c0e` A,B→B,D
(Embedded Login is not one of the four documented login page types).

Clean across all 13 decks right now: zero `U+FFFD` replacement characters, zero
literal `"Option B"` placeholder strings, zero keys pointing at empty options,
zero missing ids.

### Duplicates

Cross-deck repeats are fine and deliberate — the same item legitimately appears
in more than one certification. **Only intra-deck duplicates are defects.**

This file used to claim one intra-deck duplicate, in IAM. That was measured with
an exact-match check, which is close to useless here: freecram serves the same
item twice with the options shuffled and OCR noise in the text (`ReplaylD` for
`ReplayId`, `CRH` for `CRM`, `accountsusing`), so no two copies are ever byte-
identical. A token-overlap check found **28 near-duplicate pairs**. Measure with
similarity, never equality:

```sh
# intra-deck pairs, Jaccard >= 0.72 on stem tokens longer than 3 chars
node scripts/find-duplicates.mjs
```

**16 were removed on 2026-08-11** — same question, and the *keyed option text*
matched even where the letter did not. The keeper was the copy with the longer
stem and explanation and more references; one reference held only by a dropped
copy was merged into its keeper first. Use `scripts/remove-questions.mjs`, which
refuses any id still bound in `src/diagrams/registry.ts`.

**11 pairs remain and must not be merged.** They read alike but their keys point
at genuinely different option text, so one of each pair is either wrong or a
distinct question — resolving them is a fact-check, not a dedupe:

| Deck | Pair |
|---|---|
| agentforce-specialist | `e6949181` vs `63afa960` — Model Playground vs Testing Center |
| agentforce-specialist | `0b45cf29` vs `b7ffd87e` |
| data-cloud-consultant | `b16bbc31` vs `e652607d` — "takes up to 24 hours" vs "available soon" |
| revenue-cloud | `6f99fe4e` vs `ac4ee893` — AI prompt template vs contract extraction template |
| revenue-cloud | `f5adf9ac` vs `f12dffa3` |
| dld | `2b7730d8` vs `42760192`; `a0fc764b` vs `ece03577` |
| iam-architect | `cfcdee5c` vs `717f2404` |
| platform-developer-2 | `f62513eb` vs `c74b1c3e` — **probably a true duplicate**: "Implement Database.Batchable interface" and "Database.Batchable" are the same answer differently worded. Left in place only because both copies are fully cited with ~3,000-character explanations, so pick the keeper deliberately |
| sharing-visibility | `b3eeee28` vs `c095ab36`; `681f22f4` vs `7d2c8e5f` — partner *manager* vs *individual* partner users |

`find-duplicates.mjs` labels two of those eleven `SAME`. It is wrong on both, and
they are worth knowing as the shape of its blind spot: `6f99fe4e`/`ac4ee893`
differ only in the noun ("AI prompt template" vs "contract extraction template")
and `681f22f4`/`7d2c8e5f` only in the qualifier ("partner *manager* users" vs
"*individual* partner users"). One decisive word inside two otherwise identical
sentences scores as agreement. **Read both copies; never remove on the label.**

**Comments are the unhandled risk.** Supabase stores them keyed on question id,
so removing a question orphans its comments. Supabase was not configured when the
16 were removed, so this went unchecked — run `npm run review-comments` before
the next removal pass.

---

## Recurring failure patterns

Distilled from every fact-check pass run on this repo. These are the mistakes that
actually happened, most frequent first. Check for them by default.

### 1. The explanation defends an option the key does not name
The single most common defect — five questions in the Platform Developer II deck
alone, plus the one wrong key the IAM audit caught this way. Forms it takes:
- Explanation opens `"Option D is correct because..."` while `correct` is `B`.
- Explanation declares `"Option B (Client-side validation) is correct"`, then
  lists the actual key among options that are `"not directly related"`.
- Explanation walks the options and concludes `"The answer is D"` — but its first
  sentence said C, so anyone skimming takes away the wrong answer.

The first sentence must name the answer the key names. `audit-deck.mjs` catches
some of these by keyword overlap, but its threshold is conservative.

### 2. Invented governor limits
Explanations state limits that do not exist, in a confident register:
- `@future` "has a limit of 50 records per method call" — no such limit. The real
  number is 50 *methods* with the future annotation per Apex invocation.
- The 10,000-row DML governor described as a *per-statement* ceiling. It is
  transaction-wide — and the same deck's cascading-trigger question depended on
  the transaction-wide reading, so the two explanations contradicted each other.

Any number in an explanation is a checkable fact. Verify it.

### 3. A default described as a ceiling
An Apex callout's 10-second timeout is the *default*; `setTimeout()` raises it to
120. A deck asserting a "10-second ceiling" teaches a limit that does not exist —
even when its answer is right.

### 4. Dead citation URLs that return HTTP 200
`help.salesforce.com` is a single-page app and answers **every** article id — real
or invented — with 200 and an identical shell. `developer.salesforce.com/docs/*`
atlas guides do the same, answering any book id with the generic title
"Salesforce Developers". A search-result listing is not proof either.

The IAM deck reached 122/122 coverage with **15 of 41 URLs dead**: plausible ids
with invented suffixes (`security_login_flow_overview` for the real
`security_login_flow`) sitting beside genuine ones. Nothing looked wrong.

Render every URL and confirm the title matches. `"We looked high and low but
couldn't find that page"` is a 404 wearing a 200. Drop a URL you cannot confirm —
one verified link beats three hopeful ones. Then add confirmed URLs to
`references/verified-docs.md`.

### 5. Scrape damage in options and code
Freecram scrapes arrive corrupted in specific ways:
- Options that are the literal strings `"Option B"`, `"Option C"`, `"Option D"`.
- Empty-string options, so a four-option question presents three.
- OCR garbage: `"Test. fixsdSsarchReaulta [)"`, `"Teat.loadData"`.
- Mangled code: missing object names in SOQL, statements shown outside their loop,
  stems wrapped in stray double quotes, truncated fragments.
- A stem referring to "this step" from a **diagram lost in scraping** — the item
  is unanswerable as printed, no matter what the key says.

When repairing, prefer recovering the real option set from a sibling item asking
the same question in different syntax. If you author distractors instead, say so
in the note: "treat the distractors as authored, not original."

### 6. Non-existent API members cited as real
`Test.fixedSearchResults()` does not exist; the method is
`Test.setFixedSearchResults()`. An explanation claimed
`"Opportunities don't have a ContactId field"` — the Object Reference documents
`Opportunity.ContactId` as a standard read-only field. Look up every member name.

### 7. Test-context misconceptions
Recurring and always wrong: that `Test.startTest()` "ensures DML operations are
committed". **A test never commits DML.** Related inversion: the rule is that a
callout goes *inside* `Test.startTest`/`stopTest` while DML stays *outside* — not
"all callouts are made before any DML operations in a transaction".

### 8. Exam-dump sites cited as authority
One explanation cited ExamTopics as its source. Dumps are not sources. Where a
legacy exam key conflicts with current vendor guidance, keep the exam key if that
is what the exam tests, and note the modern recommendation alongside it — e.g.
User-Agent flow is the legacy answer for mobile while Salesforce now favours Web
Server flow with PKCE.

### 9. Stale platform facts
Content rots. Salesforce removed the outbound-message session id in **February
2026**, so "contains the session ID" describes a retired capability and must not
be taught as a reason to pick an answer — even though outbound messaging remained
the correct mechanism for that question. Retention windows, limits, and
feature-capability pairings are the highest-yield things to re-check.

### 10. Defective items that no key can fix
Some questions are broken, not wrong: a "choose 2" whose second correct option is
absent; an item where the key is right but a *distractor is also true*; a printed
test snippet that queries `AccountHistory` directly, so no change inside the
method under test would make it pass; a recursion-guard snippet that declares a
static flag but never checks it. Recording "this item is defective and here is
why" is a legitimate outcome and more useful than a confident guess. Flag it to
me in the report.

### 11. A live citation that doesn't support its claim
Distinct from a dead URL and harder to catch, because every automated check
passes: the link renders, it's an official vendor page, and it's on the right
topic. It just doesn't contain the fact.

IAM `#23` cited "SMS Identity Verification" for a claim about how Identity
Verification Credits are consumed. The article renders fine and is topically
adjacent — but **the word "credit" does not appear on it once**. The article that
settles it is "Identity Verification Credits Add-On License Considerations"
(25,000 SMS/month, 300,000 credits/year).

So URL verification has two steps, not one: confirm the page renders *and*
confirm the specific assertion is on it. Grep the rendered text for the key term
before citing — if the term is absent, it is the wrong page.

### 12. Later passes overturning earlier notes
Because `stampCorrection` stores **one record per question**, correcting a
question again *overwrites* the earlier note. This has already caused three
supersessions where a round-2 conclusion was reversed in round 6–8 on deeper
reading. Read the existing `corrected` note first and fold anything still worth
keeping into the new one. Do not re-litigate a settled question without new
evidence — that is churn.

---

### 13. A pass that confirms everything and corrects nothing
The strongest single red flag, and it is now quantified in this repo.

The IAM deck's round-1 pass (2026-08-09) recorded **115 confirmed, 7 reasoning, and
0 corrected** across 122 questions, reaching 122/122 coverage. Round 2 re-checked the
same deck against rendered documentation and found **3 wrong answers and 7 imprecise
explanations — all ten of them in questions round 1 had marked `confirmed`.**

So a verdict distribution with no corrections is not evidence of a clean deck; it is
evidence of a pass that attached citations without letting the documentation decide.
A genuine pass on scraped content finds *something*. When you inherit a fully cited
deck whose findings show zero corrections, sample it before trusting it.

The same pass also produced the dead-URL problem: 15 of its 41 URLs did not render.
Citing and verifying are different activities, and only one of them was done.

**A filing hazard that hid this for a while:** the round-1 findings lived in a file
named `findings-integration-architect.json`, but its `deck` field pointed at the IAM
deck and **all 122 of its findings were IAM ids**. The file was the IAM pass under the
wrong name. Trust the `deck` field and the ids, never the filename.

**The integration deck was then checked against this suspicion and cleared it** — see
its row above. Its findings file did not survive, but a 2026-08-10 spot-check found the
citation base sound and the content current. The lesson to carry is therefore narrower
than "distrust any deck without a findings file": distrust a *verdict distribution with
no corrections*. Integration moved 15 keys; IAM round 1 moved none. That difference,
not the missing file, was the real signal.

## Invariants

- **Never regenerate or hand-edit question `id`s** on a published deck. Ids hash
  `question + optionA..E + correct + _cat`, are written once, then frozen.
  In-app comments bind to the id, so regenerating orphans them. `explanation` is
  deliberately outside the hash, so rewriting prose is always safe.
- **Address questions by `id`, never by position.** Decks get deduped and reordered.
- **A changed key must ship a rewritten explanation.** A new key above prose still
  arguing the old one is worse than the original error, because it looks
  authoritative. `apply-findings.mjs` enforces this.
- **A confirmed answer still gets a citation.** "Nothing to change here" is not a
  reason to leave a question uncited.
- **Never resolve ambiguity by picking whatever the explanation already agreed
  with.** Explanation and key were generated together — agreement between them is
  not evidence. Go to the documentation.
- Explanations use `\n` for paragraph breaks and a trailing `References:` line,
  one URL per line after it. Write findings `explanation` as prose only —
  `apply-findings.mjs` appends the references block and merges duplicates.
- Adding a deck needs no code: drop JSON in `public/decks/`, add a manifest entry.
- Leave deck changes uncommitted unless I ask otherwise.

## Environment

Windows. Both PowerShell and Git Bash are available; this repo's tooling is Node
ESM (`.mjs`) and runs the same in either.

Prefix Python dumps with `PYTHONIOENCODING=utf-8` — deck text contains em dashes
and arrows that crash the default console codec with a `charmap` error. That is a
console limitation, not corrupt data; confirm by counting `U+FFFD` in the file,
which should be zero.

`gh` CLI is **not installed**. Install it and run `gh auth login` for PR work —
never paste tokens into chat.
