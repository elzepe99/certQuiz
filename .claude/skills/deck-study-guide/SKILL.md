---
name: deck-study-guide
description: Write a study guide for a deck in public/decks/ — find the vendor's official exam outline, re-classify every question against it, name the sub-objectives the deck never asks, and teach those gaps from rendered documentation. Produces two hand-maintained files (a Markdown source for NotebookLM and a shell-less HTML fragment), wires them into scripts/build-guide.mjs and public/decks/manifest.json, and verifies the built page. Use this whenever the user asks for a study guide, revision guide, field guide, exam guide or cheat sheet for a deck or certification; whenever they ask what the deck does not cover, where the gaps are, or how the deck compares to the real exam outline; and whenever they ask to update, extend or rebuild an existing guide.
---

# Write a study guide for a deck

A fact-check makes the deck's answers right. A study guide answers a different
question: **is the deck the right set of questions at all?** Five guides now exist
and every one of them found the same thing — the deck is a scrape of an older
version of the exam, and the most valuable page in the guide is the list of
objectives the deck never asks about.

So the deliverable is not a summary of the deck. It is the deck measured against
the vendor's published outline, plus the missing material taught from the
documentation.

**This skill never moves an answer key.** If the documentation contradicts a deck
item while you are writing — and it will, that is the point of the exercise —
record it in the guide's "where the deck is older than the exam" section and tell
the user. Moving the key needs `factcheck-deck`, because a key change ships a
citation and a correction notice and a guide ships neither.

## Before starting

Confirm which deck, then tell the user two numbers up front: the deck's question
count and the exam's. They are usually very different (147 against 45 on
Databricks, 222 against 60 on App Builder) and the ratio sets how much the deck
over-drills.

## Phase 1 — Find the official exam outline

**This is the step that differs per vendor, and getting it wrong wastes the whole
pass**, because the domain weights are the spine of the guide.

### Salesforce

The outline lives in a Help article whose id clusters around `0052989xx` and
**the ids are not alphabetical** — `005298964` is App Builder, and its neighbours
are unrelated exams. Both WebFetch and Help's own search fail on these, so
**probe in the in-app browser**: navigate to
`https://help.salesforce.com/s/articleView?id=<id>&type=1&language=en_US` and read
`document.title`. One top-level navigate per id, no iframes (see failure pattern
4b in `CLAUDE.md`).

| Exam | Article id |
|---|---|
| Platform App Builder | `005298964` |

Add a row here every time you find one. That table is the compounding asset for
this skill, the way `references/verified-docs.md` is for `factcheck-deck`.

### Databricks, and the general rule

Databricks publishes the outline **twice, in the open**, and neither is a Help
article:

1. The certification landing page —
   `https://www.databricks.com/learn/certification/<exam-slug>` — carries the
   domain list with weights, the scored-question count, the time limit and the
   fee, in plain text. `get_page_text` on it is the whole of §1 and §2's left-hand
   column.
2. An **exam guide PDF** linked from that page, whose URL carries its own date
   (`...-exam-guide-may-2026-000.pdf`). This is the one that matters: it holds the
   **sub-objectives**, which are what Phase 4 diffs against. Find the link with
   `document.querySelectorAll('a')` filtered on `/guide|pdf/i` rather than
   guessing the path.

**The PDF will not render in the browser pane** — it triggers a download dialog.
Fetch it to the scratchpad with `curl` and extract the text with
`pdfminer` (`python -c "from pdfminer.high_level import extract_text; ..."`),
which is installed. A hand-rolled zlib-inflate of the PDF's content streams does
*not* work on these files: the text is in hex strings under a font CMap and you
get a page of `fi`/`fl` ligatures.

**The generalisable rule:** before assuming a vendor hides its outline behind a
search, open the certification page and look for a link. Salesforce is the
awkward one, not the norm. Record whichever you find here.

Read the PDF's **sample questions** too. Databricks' are labelled "retired from a
previous version of the exam" and one of them keys a legacy cluster mode — which
is direct evidence for the guide's exam-right/production-wrong section, from the
vendor's own hand.

## Phase 2 — Read the whole deck

Dump every question's stem, keyed option text and id:

```bash
node -e "const d=require('./public/decks/<deck>.json');d.forEach((q,i)=>{const k=String(q.correct).split(/[,\s]+/).filter(Boolean);console.log((i+1)+' '+q.id+' ['+q.correct+'] '+q.question.replace(/\s+/g,' ').slice(0,200));console.log('    KEY: '+k.map(L=>(q['option'+L]||'').replace(/\s+/g,' ').slice(0,110)).join(' | '))})"
```

Two hundred characters of stem and a hundred of keyed answer is enough to
classify. Do not dump explanations at this stage — they are the bulk of the file
and you do not need them to place a question in a domain.

## Phase 3 — Re-classify every question

**The deck's own `_cat` tags do not match the published domains, and sometimes
there are no tags at all** — the Databricks deck's 147 questions all carry one
tag naming the certification. Write `study-guides/reclassify-<deck>.mjs`, copying
the shape of the five that exist: a `CALLS` map of id to domain code, `EXAM` with
the weights, `NAMES`, an `UNCOVERED` array, and a runner behind the
`import.meta.url` guard that prints the table.

The runner must report **unclassified and stale ids**. That is what makes the
file survive the next import: run it again after questions are added and it tells
you exactly which ones you have not placed.

Three rules for the calls themselves:

- **Classify by what the question tests, not by the words in it.** A stem about
  Auto Loader that is really asking which cluster to run it on is a compute
  question.
- **Be consistent on boundary pairs.** Two near-identical items must get the same
  code; if `27d6e2a9` (cluster pools for a fast report) is compute selection then
  `e5b58f83` (cluster pools for slow job starts) is too, even though the second
  reads like troubleshooting. Inconsistency here shows up as noise in the table
  that the reader cannot see or correct.
- **A domain code per question, no "other" bucket.** Where a block of questions
  maps to no current sub-objective — the Databricks deck has three on notebook
  mechanics — assign the nearest domain and say so in prose. An escape hatch in
  the data hides the finding.

## Phase 4 — List the sub-objectives with zero questions

**This is the guide's most valuable section and the reason it exists.** Work
through the exam guide's sub-objective bullets and, for each, ask whether any deck
item tests it. Then confirm mechanically, because reading 147 questions leaves you
sure about things you only half-checked:

```bash
node -e "const d=require('./public/decks/<deck>.json');const hay=q=>[q.question,q.optionA,q.optionB,q.optionC,q.optionD,q.optionE,q.explanation].filter(Boolean).join(' ');for(const t of ['COPY INTO','column mask','ABAC','DENY','predictive optimization']){const re=new RegExp(t,'i');const h=d.filter(q=>re.test(hay(q)));console.log(String(h.length).padStart(3),t,h.length&&h.length<7?h.map(q=>q.id).join(' '):'')}"
```

**Read every nonzero hit before believing it.** On the Databricks deck,
"materialized view" returned two hits that were both a gloss on "live table"
inside an explanation, not a question about materialized views; "Volume" returned
three that were all "volume of queries". A keyword hit is evidence the term
appears, not that the objective is covered.

The sweep also catches the reverse — the fact-check's own prose already using the
vendor's new vocabulary while the option text does not, which is a §12 finding.

## Phase 5 — Teach the gaps from rendered documentation

Same standard as `factcheck-deck`: render the page, confirm it says what you are
about to claim. Quote the decisive sentence where a number or a rule turns on it.

`docs.databricks.com` **returns an honest HTTP 404 for an invented path**, so
`check-urls.mjs` from the factcheck skill is sufficient there and no browser is
needed — the opposite of Salesforce Help. Watch for live pages that redirect into
`/archive/`: they render fine and must not be cited. Test the vendor's 404
behaviour once at the start of a pass rather than assuming either shape.

```bash
node .claude/skills/factcheck-deck/scripts/check-urls.mjs urls.txt
```

Prefer the page with the **number** on it. A concept page explains liquid
clustering; the stage-page guide gives you "Max duration 50% more than the 75th
percentile", which is the thing a reader can hold and use.

## Phase 6 — Write the two files

**Every guide is TWO hand-maintained files that must be edited in parallel.**
There is no generator between them.

| File | Is |
|---|---|
| `study-guides/<out-slug>.md` | The readable source, and what gets uploaded to NotebookLM |
| `study-guides/<name>.artifact.html` | A **shell-less fragment** — no doctype, no `<head>`, no `<body>` — because it is also published as a Claude Artifact, which supplies its own skeleton |

`scripts/build-guide.mjs` reads **only the `.artifact.html`** and wraps it into
`public/guides/<out>.html`. **Editing the `.md` alone changes nothing a learner
sees, and the build reports success either way.** That is the single most
expensive mistake available here.

The two basenames differ: the `.md` is named after the build's **`out`** path
(`salesforce-app-builder.md`), the fragment after its **`source`**
(`app-builder.artifact.html`). `verify-guide.mjs` assumes that pairing.

### The section shape that has worked five times

1. The exam, factually — a vitals strip and a facts table
2. Where the points actually are — the domain table, then **the gap**
3..N One section per domain, in outline order, carrying that domain's gaps
N+1 Numbers to memorise
N+2 Distractor tells, plus "read the question's own verb"
N+3 Where the deck is older than the exam — renames, contradictions, and
    **exam-right, production-wrong**
N+4 Two-week revision plan
N+5 Sources
N+6 Using this with NotebookLM

Cross-reference deck items by `id` in `<code>` throughout. It is what turns the
guide from an essay into something a reader can drill against, and ids are
permanent so the references never rot.

### House style for the fragment

- `.call` for a note, `.call.trap` (amber) for a trap, `.call.alert` (crimson)
  for something that changes what you would answer. Each opens with a
  `<span class="tag">`.
- `.tw` wrapper around every `<table>`; `table.kv` for two-column ones.
- `ol.prose` for numbered lists, `h4` for small uppercase labels,
  `.linklist` with `.why` for the sources, `.prompts` for the NotebookLM prompts.
- `.verdict.gap` / `.over` / `.ok` chips and `.bar` / `.bar.deck` pairs in the
  domain table, both scaled to the largest value.
- `<code>` for question ids and identifiers. **HTML entities, never literal em
  dashes** — `&mdash;`, `&rarr;`, `&sect;`, `&asymp;`.
- **The content must be re-authored for the fragment, not pasted from the
  Markdown.** A Markdown table becomes a `.tw` table; a bolded aside becomes a
  `.call`.

**The six fragments share one stylesheet by copy** — lines 5 to 575 are
byte-identical across all of them. Start a new one by copying those lines rather
than retyping, and remember that a palette change has to be made in every file.

```bash
{ printf '%s\n' "$YOUR_TITLE_AND_LINK_LINES"; sed -n '5,575p' study-guides/app-builder.artifact.html; cat body.html; } > study-guides/<name>.artifact.html
```

### Two mechanical traps

- **Writing either file from Python with `newline='\n'` normalizes CRLF to LF**
  and produces a whole-file diff plus a ~1.8 KB size drop that looks like lost
  content and is not. This repo checks out CRLF (`core.autocrlf=true`). Use
  `io.open(p, 'w', encoding='utf-8', newline='')` and keep the endings you read.
- **Bash heredocs with three `<<'EOF'` blocks in one command fail to parse here.**
  Write commit messages and long appends to scratch files first.

## Phase 7 — Wire it up, build, and verify

Three edits, all easy to forget and all silent when missed:

1. **`scripts/build-guide.mjs`** — add a `{ source, out, lang }` entry to the
   `GUIDES` array. A guide missing from it is never built.
2. **`public/decks/manifest.json`** — add `"guide": "guides/<out>.html"` to the
   deck. Without it the app shows no Guide tab; `src/components/TopBar.tsx`
   renders one only when `deck.guide` is set.
3. Build and check:

```bash
npm run build:guide
grep -ic "<a new heading>" public/guides/<out>.html
node .claude/skills/deck-study-guide/scripts/verify-guide.mjs <out-slug>
```

**Verify with `grep`, never by trusting the build's "built" line** — it prints
for a file it did not need to change.

`verify-guide.mjs` does that grep for every section heading and also checks:
the fragment has no document shell; the `.md` exists and its sections match the
fragment's; the manifest entry exists; the stylesheet has not diverged; and
**the question count the guide states matches the deck**, which goes stale on
every import. Run it with no argument to check all guides at once.

It reports two kinds of finding and the difference matters: a **FAIL** is wiring
or a stale number, a **warn** is `.md`/`.artifact.html` section drift, which is
sometimes a deliberate difference in wording and sometimes an edit made to one
file only.

Finally, load the built page and confirm it renders:

```
mcp__Claude_Browser__preview_start { name: "cert-quiz" }
```

The dev server has a base URL of **`/certQuiz/`**, so the page is at
`http://localhost:5173/certQuiz/guides/<out>.html` — a bare `/guides/...` returns
a one-line "did you mean" page, not your guide. Assert on the DOM rather than a
screenshot: section count, rail link count, and that no `href="#..."` in the rail
points at a missing id.

## Phase 8 — Report

Give the user the domain table, the count of uncovered objectives, and —
separately and explicitly — **anything you found that contradicts the deck**,
flagged as work for `factcheck-deck` rather than done here.

Say where each number came from. The question count and the domain weights both
have a short shelf life, and a guide that does not say when it was measured
invites the next reader to trust a stale figure.

Leave the work uncommitted unless the user asks otherwise.
