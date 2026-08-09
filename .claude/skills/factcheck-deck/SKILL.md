---
name: factcheck-deck
description: Fact-check a certification quiz deck in public/decks/ against official vendor documentation — verify every answer, correct the wrong ones, and attach the documentation URL that settles each question into its explanation. Use this whenever the user wants a deck verified, fact-checked, validated, reviewed for correctness, or wants sources/references/citations added to explanations; whenever they name a deck or certification and ask "are the answers right", "check these against the docs", "add sources", or "verify this deck"; and whenever they mention wrong answers, stale limits, or questionable explanations in a quiz deck. Also use it after importing or scraping a new deck, since freshly scraped answer keys are the most likely to be wrong.
---

# Fact-check a deck against the documentation

A scraped deck arrives with an answer key and an explanation that were produced
together, usually by the same generator. That matters more than anything else in
this skill: **when the explanation agrees with the answer, that is not evidence
the answer is right.** Both can be — and repeatedly have been — wrong in the same
direction. On the ADM-201 deck, five answers survived a careful read precisely
because their explanations were internally consistent, and all five turned out to
be wrong once checked against Salesforce's documentation.

So the job is not "read the deck and see if it makes sense." It is: for each
question, find what the vendor actually documents, and let that decide.

The deliverable is a deck where every question has been checked, wrong answers
are corrected with a stated reason, and **every question carries the
documentation URL that settles it** — including the ones that were already right.
A confirmed answer with a citation is worth more than a confirmed answer without
one: it lets the user check the reasoning themselves, and it tells the next
reviewer what has already been established rather than making them re-derive it.

So a question that is correct still gets a `confirmed` verdict and a reference.
"Nothing to change here" is not a reason to leave it uncited.

## Before starting

Confirm three things with the user if they are not obvious from the request:

- **Which deck.** A path in `public/decks/`, or a certification name you can map
  to one via `public/decks/manifest.json`.
- **Batch size.** Default 25. Use 50 when a deck clusters tightly on a few topics
  (many questions resolved by the same doc), which makes the per-question cost
  much lower. Smaller batches are better for decks that range widely.
- **Where to start.** If a checkpoint exists from an earlier run, offer to resume
  rather than redo.

Tell the user the question count and roughly how many batches that is, so a long
run does not feel open-ended.

## Phase 1 — Structural audit (cheap, do it first)

```bash
node scripts/audit-deck.mjs public/decks/<deck>.json
```

This finds places where a question contradicts *itself*: an explanation arguing
for options the key does not name, an answer count that disagrees with "choose
two", keys pointing at options that do not exist, duplicated option text,
duplicate stems. None of it requires domain knowledge, and it is where errors
concentrate — on ADM-201 the contradiction check alone found three wrong answers.

Two things to hold on to:

- Its findings are **leads, not verdicts**. Expect false positives where an
  explanation discusses an option in order to reject it.
- A clean run means "nothing self-evidently broken", **not** "the answers are
  right". Do not let a clean audit shorten the documentation pass.

Also check whether questions already carry a `corrected` record from a previous
round. Read those notes before re-litigating anything — a previous pass may have
settled a question deliberately, and reversing it without new evidence is churn.
Note that `stampCorrection` stores only one record per question, so correcting a
question again **overwrites** the earlier note. If the old note holds reasoning
worth keeping, fold it into the new one.

## Phase 2 — Work through the deck in batches

For each batch of N questions:

1. **Dump the batch** — stem, options, key, and enough explanation to see the
   reasoning. On Windows, prefix Python with `PYTHONIOENCODING=utf-8`, or an em
   dash will crash the dump with a `charmap` error.

2. **Group the batch by topic before looking anything up.** This is the single
   biggest time saver. Ten questions about platform events resolve to two or
   three documentation pages; looking those up once and applying them to the
   whole group is dramatically cheaper than ten independent lookups. Check
   `references/verified-docs.md` first — it holds URLs already confirmed to
   render, and reusing one costs nothing.

3. **For each question, find what the documentation says.** Prefer official
   vendor docs (`help.salesforce.com`, `developer.salesforce.com`,
   `trailhead.salesforce.com`, release notes). Community posts are acceptable for
   orientation but should not be the citation of record.

   The highest-yield targets are **checkable facts**: retention windows, timeouts,
   governor limits, batch sizes, API caps, which feature supports which
   capability, and which mechanism pairs with which (for example Registration
   Handler belongs with an Auth Provider, Just-in-Time provisioning with SAML).
   These are also what goes stale as the platform changes.

   Watch for a specific failure: a number that is a *default* being described as
   a *ceiling*. An Apex callout's 10-second timeout is the default and rises to
   120 seconds via `setTimeout()`; a deck asserting a "10-second ceiling" teaches
   a limit that does not exist, even when its answer happens to be right.

4. **Record a verdict per question** in the findings file (schema below). Every
   question gets one of:
   - `confirmed` — answer right, reasoning sound. Attach the reference.
   - `reasoning` — answer right, explanation wrong or imprecise. Rewrite the
     explanation, attach the reference, leave the key alone.
   - `corrected` — answer wrong. Supply the new key, a rewritten explanation, a
     reference, and a note saying what the documentation established.

5. **Write the findings file after every batch, not at the end.** A long run that
   dies at question 120 should resume, not restart.

Report briefly after each batch — how many confirmed, how many changed, anything
notable. The user is waiting through a long process and silence is unhelpful.

## Phase 3 — Verify every URL renders before citing it

Salesforce Help is a single-page app. It answers **every** article id — real or
invented — with HTTP 200 and an identical shell. A search-result listing is not
proof either. The only thing that establishes an article exists is loading it and
seeing the article.

This has already produced one dead citation that shipped into a deck before being
caught, so treat it as a real hazard rather than a formality:

```bash
node .claude/skills/factcheck-deck/scripts/check-urls.mjs urls.txt
```

That triages into `DEAD`, `ALIVE`, and `NEEDS_BROWSER`. For anything marked
`NEEDS_BROWSER` — all of `help.salesforce.com`, `trailhead.salesforce.com`, and
`developer.salesforce.com/docs/*` (the atlas developer guides are client-rendered
too, and answer any book or section id with the generic title "Salesforce
Developers") — open it and confirm the title and opening text match the article
you meant to cite:

```
mcp__Claude_Browser__navigate  { url, tabId }
mcp__Claude_Browser__javascript_tool { text: "document.title + ' :: ' + document.body.innerText.slice(0,300)" }
```

A "We looked high and low but couldn't find that page" body is a 404 wearing a
200. Drop a URL you cannot confirm rather than shipping it — a question with one
verified link is worth more than a question with three hopeful ones.

**This is not a hypothetical.** An IAM deck reviewed without this step reached
122/122 coverage with **15 of its 41 URLs dead** — plausible-looking article ids
with invented suffixes (`security_login_flow_overview` for the real
`security_login_flow`) sitting beside genuine ones. Nothing about the deck looked
wrong. If you are checking someone else's citations, sample before you trust:
four dead in the first eight is your answer.

To repair a deck once bad URLs are already in it, use `replace-refs.mjs` —
`apply-findings.mjs` only ever adds references and cannot remove one:

```bash
node .claude/skills/factcheck-deck/scripts/replace-refs.mjs <deck.json> <map.json> --dry
```

`map.json` maps a distinctive substring of the bad URL (usually the article id)
to a verified replacement, or to `null` to drop it. It refuses to leave any
question with zero references unless you pass `--allow-uncited`.

**Add every newly confirmed URL to `references/verified-docs.md`.** That file is
the compounding asset here: each deck makes the next one faster.

## Phase 4 — Apply the findings

Do not hand-write a bespoke fix script per deck. Write `findings.json` and run:

```bash
# while batches are still in flight
node .claude/skills/factcheck-deck/scripts/apply-findings.mjs findings.json --dry

# on the final batch, once every question has a verdict
node .claude/skills/factcheck-deck/scripts/apply-findings.mjs findings.json --require-complete
```

`--require-complete` refuses to run unless every question in the deck has a
verdict. That is what turns "references on each explanation" from an intention
into a guarantee — without it, a question quietly skipped during a long pass ends
up with no citation and nothing says so. Every run also prints deck-wide coverage
(`Deck coverage: 137/137 question(s) carry at least one reference`), so progress
toward full citation is visible batch by batch.

The script enforces the invariants that are easy to forget under fatigue:

- A changed answer **must** ship a rewritten explanation. Otherwise the deck shows
  the new key above prose still arguing for the old one — which happened on
  ADM-201 and is worse than the original error, because it looks authoritative.
- Every touched question **must** carry at least one `https://` reference.
- `was` must match the deck's current key, so stale findings fail loudly instead
  of overwriting newer work.
- References merge with any already present instead of duplicating, and are
  emitted as a trailing `References:` block — one URL per line, which is what the
  app's parser expects.

See `references/deck-format.md` for the deck schema, the findings schema, and how
the app parses explanations and correction stamps.

## Phase 5 — Validate and report

Re-run the structural audit, and confirm:

- question count unchanged, ids unique and unchanged for untouched questions
- every key points at a non-empty option
- **deck coverage is N/N** — every question carries at least one reference
- references parse cleanly out of every explanation, and each is a live URL that
  was actually rendered, not merely search-listed
- no `�` replacement characters anywhere (an encoding regression)

Then report: total checked, confirmed, reasoning-only fixes, answers corrected —
and for each corrected answer, one line on what the documentation established.
Say plainly which questions you could not settle, rather than quietly leaving them
as `confirmed`. An unresolved question the user knows about is fine; one
misreported as verified is not.

Leave the deck uncommitted unless the user asks otherwise, and mention that other
work may be in progress in the same tree.

## Judgment calls

Some questions are genuinely ambiguous, or their option set is defective — a
"choose 2" whose second correct option is simply absent. Two rules:

- **Do not resolve ambiguity by picking whichever answer the explanation already
  agreed with.** That is the trap this whole skill exists to avoid. Go to the
  documentation; if it settles the question, follow it even against a
  self-consistent explanation.
- If the documentation genuinely does not settle it, say so in the note, pick the
  best-supported option, and flag it to the user in the report. Recording "this
  item is defective and here is why" is a legitimate outcome and more useful than
  a confident guess.
