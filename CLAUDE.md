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
| "audit / structurally check a deck" (no doc lookups) | `node scripts/audit-deck.mjs <deck>` | Phase 1 of the skill, standalone. Cheap. Leads, not verdicts. Takes a **path**, not a bare filename. |
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
  audit-deck.mjs      structural audit — skill Phase 1. Its duplicate-option check
                      compares options with operators intact; the prose normalizer
                      it uses elsewhere flattens `<=` and `>` (and `=` and `==`) to
                      the same string, which on a code deck reports the two answers
                      as identical when the operator IS the question
  find-duplicates.mjs near-duplicate detector — see "Duplicates"
  remove-questions.mjs  removes questions by id; refuses ids bound in
                        src/diagrams/registry.ts. Until 2026-08-17 its indent
                        detection matched the first indented `"`, which is the
                        *second* nesting level, so every run doubled the file's
                        indentation — that is why agentforce, integration, iam and
                        sharing-visibility sit at 4 spaces while every other deck
                        is at 2. Cosmetic, and left alone rather than reformatted
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
freecram-scraper/     scrape_freecram.py — the scraper only. It cannot see options
                      rendered as IMAGES: freecram serves "which code snippet"
                      questions as screenshots, and those rows arrive with empty
                      optionA–E. The scraper warns ("correct answer X has no option
                      text"); the fix is to read the images and transcribe. See
                      databricks-option-images.json for the letter→image mapping
                      from the 2026-08-15 import
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

**A figure is for a diagram, not for code.** The Databricks import arrived with six
questions whose *options* were code screenshots. Those were transcribed into real
`optionA`–`optionE` text, not drawn: `lib/richtext.ts` already renders fenced code in
options, and an SVG of code is unselectable, unsearchable and uncopyable. Only one of
the six needed the registry — `e15b1b0a`, whose *stem* referenced a table-format
exhibit that had no text equivalent.

**All five current figures are redrawn from the original exam images**, which
the repo owner supplied on 2026-08-11 (and, for `e15b1b0a`, recovered from the
source page during the 2026-08-15 scrape). Two of them had first been drawn from the
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

## Deck state — as of 2026-08-17

1,619 questions across 13 decks. **1,128 (70%) carry a reference with an actual URL,
and the reference gap is now zero** — every question that renders a References block
has a link in it.

+136 of that is the sharing-visibility pass on 2026-08-17, taking that deck from
0/136 to 136/136 — the second citations-and-corrections pass over an existing deck,
after revenue-cloud.

An **agentforce pass ran in the same working tree on the same day** and finished at
121/121, which is the rest of the jump. Coverage moved 1,020 → 1,033 → 1,091 across
three measurements in a single session while that pass was running, so re-measure with
the command below rather than copying any number out of this file.

`git show HEAD:public/decks/claude_questions.json` recovers the removed deck below,
and restores its ids with it — so Supabase comments left on those questions would
rebind rather than stay orphaned.

**The claude-questions deck was removed on 2026-08-17** at the repo owner's request —
74 questions of Claude/Anthropic product trivia, uncited and, in their words, "wrong
in many ways". It was never a certification deck and nothing in the app referenced it
beyond its manifest entry. That removal is why the totals dropped from 1,697 / 14 decks.

**Three more questions went the same day, in a separate pass.** Two revenue-cloud
copies (`ac4ee893`, `f5adf9ac`) and one platform-developer-2 copy (`c74b1c3e`), each
a pair its own fact-check had turned from `DIFFERS` into `SAME`. Nothing was lost —
all three pairs were identical in options and in key. That pass also repaired eight
admin reference blocks against rendered documentation (see the admin row).

The jump from 697 is the revenue-cloud pass on 2026-08-15: +137 cited, taking that
deck from 0/137 to 137/137. No new questions arrived — this is the first pass in the
repo that only added citations and corrections to an existing deck rather than
importing one. Before it, the jump from 1,549 / 549 was the Databricks deck arriving
fully checked the same day: +148 questions, all 148 cited, the first non-Salesforce
deck in the repo and the first fact-checked in the same pass that imported it.

Measure coverage with a URL test, not by looking for the `References:` marker. The
app's parser (`src/lib/quiz.ts`) treats **every** non-empty line after the marker as
a reference and does not require a URL, so a question can render a References section
with nothing clickable in it — prose like "Salesforce Agentforce Documentation: SDR
Agent Setup > Channels", plus the occasional empty block. It degrades gracefully
(`linkifySegments` only linkifies real URLs) but it is unverifiable by a learner and it
inflates any naive coverage count.

**That gap is closed as of 2026-08-18: 1,091 marker blocks, 1,091 with a URL.** The
last of it went with the agentforce pass (24 questions, 88 prose lines) and the admin
reference repair (3). Keep measuring it anyway — the check is cheap, and the next
scraped import brings the problem straight back.

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
| databricks-data-engineer-associate | 148 | 148 | **Fully checked** (2026-08-15) — 8 keys moved, 11 reasoning fixes, in the same pass that imported it. First non-Salesforce deck |
| salesforce-platform-developer-2 | 147 | 147 | **Fully checked** — 8 rounds, 2 keys moved. Deduped 148 → 147 on 2026-08-17 |
| salesforce-integration-architect | 133 | 133 | **Fully checked** — 37 stamps, 15 keys moved. Spot-rechecked 2026-08-10: citations sound, content current, 0 wrong answers found. Its **27 in-app comments were already worked through** — they are the largest comment set in the repo and read like open disputes ("It is B", "Might be D"), but the repo owner confirmed on 2026-08-17 that they were addressed. Do not re-triage them as new signal |
| salesforce-iam-architect | 116 | 116 | **Fully checked** (2026-08-10) — 3 keys moved, 7 reasoning fixes |
| salesforce-admin | 154 | 36 | Partial; 13 keys moved (ADM-201 merge pass). **8 questions had their references repaired on 2026-08-17**, and the repair found more than line-wrapping: of the 9 distinct `sf.` article ids those blocks cited, **only `sf.security_networkaccess` still renders**. The rest 404 behind HTTP 200 — see failure pattern 4b |
| salesforce-agentforce-specialist | 121 | 121 | **Fully checked** (2026-08-17) — 16 keys moved across 6 batches. Started from 0 cited, with 26 questions rendering a References block of prose only. One duplicate removed (`b7ffd87e`), resolving the pair this file flagged |
| salesforce-revenue-cloud | 135 | 135 | **Fully checked** (2026-08-15) — 2 keys moved, 88 explanations rewritten. Its defect was **fabricated citations, not wrong answers**: 73 explanations quoted invented "Exact Extracts". 9 questions could not be settled and say so in their own prose. Deduped 137 → 135 on 2026-08-17 |
| salesforce-data-cloud-consultant | 100 | 0 | Uncited; 4 keys moved via comments |
| salesforce-sharing-visibility | 136 | 136 | **Fully checked** (2026-08-17) — 2 keys moved, 6 reasoning fixes, 19 silent clarifications. The 4 earlier 2026-08-04 validation stamps are preserved |
| salesforce-app-builder | 119 | 119 | **Fully checked** (2026-08-11) — 4 keys moved, 27 reasoning fixes, 3 defective option sets repaired. Q1–50 spot-rechecked: 10 sampled, 1 defect (a mechanism stated backwards), so the earlier batches read sound |
| salesforce-dld | 138 | 0 | **Untouched** |
| salesforce-data-architect | 135 | 0 | **Untouched** |
| salesforce-slack-consultant | 37 | 37 | **Fully checked** (2026-08-18) — 1 key moved, 3 reasoning fixes, 12 silent clarifications. First non-Salesforce, non-Databricks vendor. **Read the caveat below: only 15 of its 37 questions are decidable by any Slack page**, so the N/N here means less than it does on other decks |

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

Clean across all 14 decks right now: zero `U+FFFD` replacement characters, zero
literal `"Option B"` placeholder strings, zero keys pointing at empty options,
zero missing ids.

**The Databricks deck is the counter-example to the IAM trap above, and worth
reading as one.** It also reaches N/N coverage, but its pass moved 8 keys and
rewrote 11 explanations across 153 questions — a ~12% correction rate in the first
two batches, tapering to ~0% in the middle of the deck. That distribution is what a
real pass looks like. Two of its corrections were *invented mechanisms* (a
breakpoint claimed to raise type errors; a bare `TBLPROPERTIES PII` that is a syntax
error), and one was a default reported as a ceiling — the same three shapes this
file already lists under Recurring failure patterns, now confirmed on a second
vendor.

**Revenue Cloud is a third shape again, and its row will look wrong if you apply the
rule above without reading this.** Its pass moved only **2 keys in 137** — a ~1.5%
correction rate that, by the "a pass that corrects nothing is a red flag" heuristic,
should read as a lazy pass. It was not. The defect in that deck was not in the answer
key at all: **73 of 137 explanations quoted fabricated "Exact Extracts" from Salesforce
guides that do not exist** ("Salesforce Revenue Cloud Platform Concepts", "Revenue Cloud
Fulfillment Architecture Notes"), and the quoted sentences return no matches anywhere.
88 explanations were rewritten to strip them.

**Those 49 rewrites no longer carry a per-question correction notice, and this
paragraph is the record.** The stripped fabrication is text no learner will ever
see, the key stands and the current explanation is properly cited, so the notice
gave a reader nothing to act on — while firing on 49 of 137 questions, which
trains a reader to skip the notices that do matter. Revenue Cloud now stamps 31:
3 answer moves, 4 items that could not be settled, 8 defective items, and 16 that
flag residual uncertainty about the key. (33 until the 2026-08-17 dedupe removed
`f5adf9ac` and dropped `f12dffa3`'s notice, which once its twin was gone announced a
contradiction no reader could still see.) The same call was applied to
`0327f145` in the Databricks deck, whose old citation was live but did not support
its claim. Per-question provenance for all 50 is in the findings files and in git.

So the deck was generated with a *sound key and invented supporting prose* — the exact
mirror of the IAM trap, where citations were attached to keys nobody had checked. The
generalised rule is therefore **not** "few corrections means a bad pass" but: *ask which
layer the generator got wrong.* A pass that moves few keys but rewrites most
explanations is as real as one that moves many keys. Check the rewrite count alongside
the correction count before judging either.

**Sharing-visibility (2026-08-17) is a fourth shape: a mostly-sound deck whose defects
were concentrated in what the explanations *denied*.** Only 2 of 136 keys moved, but
six explanations asserted things the documentation contradicts, and one of those
turned a choose-three into an unanswerable item. Its correction rate looks lazy by the
heuristic above and is not; read the reasoning-fix count as the signal here.

**It also produced the pass's best argument for rendering the doc rather than
reasoning from one.** An item keys "override the Edit action on mobile only, no change
for desktop", and three separate sources pointed the other way — `lightning:action
Override` takes effect in "Lightning Experience, Experience Builder Sites, Salesforce
Mobile App", the Aura guide says you override "in **both** Lightning Experience and
mobile", and Considerations for Overriding Standard Buttons says "Button overrides
affect everywhere that action or behavior is available". A key change was one step
away. Assign Action Overrides settles it in the opposite direction: "Specify the
override option for **each user experience**", with a worked example where "the mobile
override specifies the Salesforce Classic override, so mobile users see the Visualforce
page". A separate mobile slot exists. Three plausible-sounding pages agreeing is not
the same as the page that documents the Setup screen.

**Slack Consultant (2026-08-18) is a fifth shape, and the one that most needs its
caveat read: a deck where most questions are not checkable at all.** Only 15 of its
37 questions turn on a fact any Slack page states. The other 22 are consulting and
training judgment against strawman distractors ("Replace their computer's sound
card", "read the user manual during the session"), recoverable by elimination and
settleable by no documentation. It reaches 37/37 coverage, and **that number carries
less weight here than on any other deck in this table** — 12 of those citations are
topical rather than decisive, and are marked as such in the pass report. This is the
IAM trap's cousin: not citations attached to unchecked answers, but citations
attached to answers *no citation could check*. When a deck's subject is advice, ask
what fraction of it documentation could settle before reading its coverage number.

Where the documentation did bite, it bit hard. One key moved (`47e8ec41` C→A: the
keyed option described a channel-creation "justification" setting Slack does not
have — pattern 2, an invented capability, wearing process-advice clothing), and
three explanations taught something false: that Compliance Exports *preserve* data
for legal hold (Slack's actual mechanism is the native **Legal Holds** feature, and
it is absent from that item's options), that Slack offers an IP allowlist confining
member sign-in to an office network (it does not — the documented control is proxy
header based), and that a propose-then-approve channel workflow is a Slack setting
(no native channel-creation approval queue exists). Two of those three are invented
*absences and presences* around the same feature area, which is worth remembering
the next time a channel-governance item looks reasonable.

**Its five duplicate pairs are a detector blind spot that is the mirror of the
documented one, and they were left in place.** `find-duplicates.mjs` reports zero
pairs on this deck, but `#15`/`#34` (both key Org Owner), `#24`/`#32` (both
Workspace Admin), `#5`/`#17` (both channel naming conventions), `#9`/`#16` (both
hands-on workshop) and `#2`/`#28` (both channel-activity analytics) are the same
question reworded, scoring 0.13–0.32 on stem-token Jaccard — far below the 0.72
gate. The documented blind spot is near-identical stems one decisive word apart
scoring as SAME; this is reworded stems with an identical keyed answer not
surfacing at all. **Comparing keyed option text would catch it; stem tokens cannot.**
The fact-check confirmed both copies of every pair are correct, so these are
redundancy rather than error — removing them is the repo owner's call, not a
fact-check outcome, which is why the deck still has 37.

### What to work on next

Ordered as of 2026-08-18, after the agentforce and sharing-visibility passes landed.
The audit-lead counts come from `node scripts/audit-deck.mjs <deck>` and are leads,
not verdicts — but a deck with many of them and no citations is where a pass pays best.

| # | Deck | Q | Cited | Audit leads | Why it is here |
|---|---|---:|---:|---:|---|
| 1 | data-architect | 135 | 0 | 3 | Untouched, and the largest uncited deck |
| 2 | dld | 138 | 0 | 1 | Untouched, large, 2 duplicate pairs |
| 3 | data-cloud-consultant | 100 | 0 | 2 | 4 user comments waiting, 1 duplicate pair |
| 4 | admin | 154 | 36 | 3 | 118 questions still uncited. The 2026-08-17 reference repair covered 8 of them; the rest of the deck has never been checked, and its `sf.` citations are the ones most likely to be dead |

Two things that are **not** deck passes but are queued:

- **The 7 remaining Salesforce near-duplicate pairs** below — each needs the
  documentation to say which copy is right, except where the option *text* already
  agrees (check that first; that is what `f62513eb`/`c74b1c3e` turned out to be).
- **The admin deck's remaining citations have not been rendered.** Eight blocks were
  repaired and 8 of the 9 `sf.` ids behind them were dead. The other 25 cited admin
  questions were never checked that way, so treat that 36 as unverified.

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

**A fact-check can turn a `DIFFERS` pair into a `SAME` pair.** On the Databricks
deck, five pairs read as `DIFFERS` only because one copy carried a wrong key. Once
the documentation moved those keys, the pairs agreed and became true duplicates —
so **re-run `find-duplicates.mjs` after a fact-check pass**, not just before one.
Five were removed on 2026-08-15 for exactly this reason, and two more from
revenue-cloud on 2026-08-17 — `ac4ee893` and `f5adf9ac`, the pairs the revenue-cloud
pass had just settled. Both keepers were checked against the blind spot below before
removal: identical option sets, identical reference lists, no `src/diagrams/registry.ts`
binding, and no comments on either dropped id.

**`weight()` does not look at option quality, and it picked the wrong keeper once.**
In the Databricks PII pair it favoured `472fcdb7` for having the longer explanation,
but that copy's options were scrape garbage (`COMMENT "Contains PIT` truncated,
another option reduced to `511`) while its twin held a clean five-option set. The
fix was to move the explanation onto the clean copy and drop the corrupted one.
**Check both option sets before accepting the suggested keeper** — a long
explanation is easy to transfer, a destroyed option set is not.

**7 Salesforce pairs remain and must not be merged.** They read alike but their keys
point at genuinely different option text, so one of each pair is either wrong or a
distinct question — resolving them is a fact-check, not a dedupe:

| Deck | Pair |
|---|---|
| agentforce-specialist | `e6949181` vs `63afa960` — Model Playground vs Testing Center |
| agentforce-specialist | `0b45cf29` vs `b7ffd87e` |
| data-cloud-consultant | `b16bbc31` vs `e652607d` — "takes up to 24 hours" vs "available soon" |
| dld | `2b7730d8` vs `42760192`; `a0fc764b` vs `ece03577` |
| iam-architect | `cfcdee5c` vs `717f2404` |
| sharing-visibility | `b3eeee28` vs `c095ab36`; `681f22f4` vs `7d2c8e5f` — partner *manager* vs *individual* partner users |

Four Databricks pairs also remain, all checked and all legitimately distinct:
`7e554787` vs `17bff8a1` differ in their *stems* (`ON VIOLATION FAIL UPDATE` vs
`DROP ROW`), so both keys are right; `d96fcc04` vs `5da4fd9e` grant on a *table*
versus a *database*; `1b743a58` vs `b8d8ba3d` are the same repair action worded as
"Repair the task" and "Repair the run" (the second matches the documented UI label);
`c41ece0b` vs `0327f145` are the same question under the old and new names for
Catalog Explorer. Both copies of the last two are annotated with the naming note.

`find-duplicates.mjs` labelled two of the original eleven `SAME`, and the shape of
its blind spot is worth knowing: `6f99fe4e`/`ac4ee893` differed only in the noun
("AI prompt template" vs "contract extraction template") and `681f22f4`/`7d2c8e5f`
only in the qualifier ("partner *manager* users" vs "*individual* partner users").
One decisive word inside two otherwise identical sentences scores as agreement.
**Read both copies; never remove on the label.**

**`6f99fe4e`/`ac4ee893` has since been resolved, and it is the worked example of why
these pairs are a fact-check rather than a dedupe.** The two carried identical stems
and options with opposite keys, so one had to be wrong. The documentation settled it —
a contract extraction template is *defined* as the thing holding attribute mapping and
context mapping, while the AI prompt template shapes model instructions — so on
2026-08-15 `6f99fe4e` moved B→A to match `ac4ee893`. That made them a true duplicate,
and `ac4ee893` was removed on 2026-08-17; `6f99fe4e` kept the longer explanation and
its notice was rewritten to stand on its own now that the twin it named is gone. The
renewal pair `f5adf9ac`/`f12dffa3` went the same way on the same day — `f5adf9ac`
removed, `f12dffa3` keeping the category (`Subscriptions`) the rest of the
renew-an-asset items use. This is the same effect the Databricks deck showed —
a fact-check turning a `DIFFERS` pair into a `SAME` one — now confirmed on Salesforce.

**The platform-developer-2 pair `f62513eb`/`c74b1c3e` was also resolved on 2026-08-17,
and it needed no documentation at all.** Both asked the same aggregate-50,000-contacts
question and both keyed Batchable + Schedulable; only the option *wording* differed
("Implement Database.Batchable interface" against a bare "Database.Batchable"), which
is why the letters disagreed and the tool called it `DIFFERS`. `f62513eb` was kept for
the fuller option text and a clean explanation; `c74b1c3e`'s stamp (it had invented an
`@future` "50 records per method call" limit) went with it, the limit having never
appeared in the keeper. Reference sets were identical and the deck has no comments.
**So check whether a `DIFFERS` pair actually keys the same option text before booking
it as a fact-check** — this one was a dedupe wearing a fact-check's label.

**Comments orphan silently, so check them before every removal.** Supabase stores
them keyed on question id. It was not configured when the 16 were removed on
2026-08-11, so that pass went unchecked; it *is* configured now (`.env.local`), and
the 2026-08-17 dedupe ran `npm run review-comments salesforce-revenue-cloud` first —
36 comments exist repo-wide, 4 of them on revenue-cloud (`f6c30064`, `6f59e427`,
`f769f864`), none on a removed id. Do the same before the next one.

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

### 4a. Vendor-specific: how a doc site fails is itself a fact to check
Before trusting any URL check on a **new vendor**, test it: fetch a real article and
a deliberately invented one and compare. `docs.databricks.com` returns an honest
**404** for an invented id, so a status check there is reliable and cheap — the
opposite of Salesforce Help. Assuming the Salesforce failure mode everywhere wastes
effort; assuming the Databricks one everywhere ships dead links.

Two Databricks-specific catches: in a *browser* a 404 renders a friendly "We can't
find the article" page under the generic title `Databricks on AWS`, so it looks soft
while the status underneath is a real 404; and several live pages redirect into
`/archive/` (the JDBC connector page does), which renders fine today and should not
be cited.

**Slack, tested 2026-08-18, is a third data point and a new sub-shape.**
`slack.com/help` fails honestly like Databricks — an invented article id returns a
real **HTTP 404** with no body — so a status check is reliable there. But the URL
*slug is cosmetic*: resolution is by numeric id alone, and
`115001915507-Totally-Wrong-Slug-Here` returns the genuine article with its
canonical title. So on this vendor a plausible-looking slug is no evidence at all,
and a stale slug is **not** a dead link to be "repaired" — Slack renames articles
under stable ids. Verify by rendered title, never by slug.

**One more thing that pass established, and it constrains the queued admin work:**
from a cloud container, `help.salesforce.com` is **not verifiable via `WebFetch`**.
The real `sf.security_networkaccess` and an invented id both return HTTP 200 with
the same "Sorry to interrupt / CSS Error" shell, because WebFetch does not execute
the SPA. Salesforce URL checking needs a real browser; the recipe in 4b still
applies, but not from a plain fetch tool.

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

### 4b. Salesforce moved a lot of Help articles from `sf.` to `platform.`
Found on 2026-08-17 while repairing eight admin questions. Of the nine distinct
`sf.` article ids those blocks cited, **eight are dead and one lives**
(`sf.security_networkaccess`). Some have a live `platform.` twin at the same id
(`platform.login_ip_ranges`, `platform.lightning_page_components_visibility`), some
were renamed outright (`sf.flow_concepts_scheduled_start` →
`platform.flow_concepts_trigger_schedule`), and some have no equivalent at all
(`sf.flow_builder_overview`). **Swapping the prefix is not a fix — it is another
guess.** `platform.flow_builder_overview` and `platform.workflow_outbound_messages`
are both dead too. Not every live article is `platform.` either:
`sf.adding_actions_using_ple`, `sf.customize_supportrules` and
`sf.security_controlling_access_using_hierarchies` all render today.

Checking is cheap and there is a working recipe. Open the URL in the in-app browser
pane, wait for the SPA, and read `document.title`: a real article gives its own title
("Restrict Login IP Addresses in Profiles | Salesforce Help"), a dead id gives the
generic `Salesforce Help | Article` plus "We looked high and low". One
`javascript_tool` call per URL also greps the rendered text for the term the citation
is supposed to support, which is failure pattern 11 in the same pass —
`platform.sharing_model_fields` renders fine but never says "Grant Access Using
Hierarchies", so it was the wrong page for the question citing it.

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

**Two Apex facts every deck in this repo still teaches the old way**, both found on
sharing-visibility 2026-08-17 and both likely wrong in the Dev II, app-builder and
admin decks too:

- **`runAs` and FLS.** Using the runAs Method now says a runAs block enforces "the
  user's sharing rules and **object-level and field-level permissions**… regardless
  of the sharing mode of the test class". The legacy "runAs only enforces record
  sharing" is no longer documented anywhere. Two items here keyed on that legacy
  reading; both were left keyed (it is what the exam tests) and flagged as defective,
  because the option set now contains more than one true statement.
- **Apex's default access mode.** "In API version **66.0 and earlier**, Apex runs in
  system mode by default… In API version **67.0 and later**, Apex runs in **user
  mode** by default." Separately, an `@AuraEnabled` class that declares no sharing
  keyword has long used an implicit `with sharing`. So a flat "Apex runs in system
  mode, therefore you must enforce visibility yourself" is version-dependent.

### 9a. An invented *absence* — the mirror of an invented limit
Pattern 2 covers explanations that fabricate a limit. The sharing-visibility pass
found the inverse: an explanation asserting a capability **does not exist** when the
vendor's own comparison table says it does. The Enterprise Territory Management item
claimed "you cannot create a public group with Territory or share a report/dashboard
folder with a territory"; Salesforce's Original-TM-vs-ETM table marks both **Yes for
both generations**, which turned a choose-three into five true options.

A fabricated negative is harder to notice than a fabricated number, because it reads
as the explanation being appropriately strict. Check the denials, not only the claims.

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

`gh` CLI **is installed** (`C:/Program Files/GitHub CLI/gh`) and authenticated as
`elzepe99` from the keyring, with `repo`, `workflow`, `read:org` and `gist` scopes —
enough to push a branch and open a PR without further setup. This file claimed the
opposite until 2026-08-17; check `gh auth status` rather than trusting either
statement. Never paste tokens into chat.
