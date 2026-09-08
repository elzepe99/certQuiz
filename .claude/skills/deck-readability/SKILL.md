---
name: deck-readability
description: Make a deck in public/decks/ easier to read and to listen to — repair scraped punctuation in the question stems without changing a single word, and append a "Why the other options are wrong:" section giving every non-keyed option its own line. Use this whenever the user says the questions read badly, are hard to follow, are formatted poorly, or that the Blitz read-aloud voice runs sentences together; whenever they ask to fix punctuation, format stems, or clean up wording without changing the questions; and whenever they want explanations to say why each wrong answer was discarded, why the distractors are wrong, or want the reasoning behind the eliminated options. Not a fact-check: no answer key moves here.
---

# Make a deck readable

Two jobs, in this order. They are separable and the first is much cheaper, so a
user who asks only for one should get only that one.

1. **Stems** — repair the punctuation a scrape knocked out, without altering a
   single word.
2. **Explanations** — append a section giving every non-keyed option one line
   saying why it was discarded.

**Neither job may move an answer key.** If you discover a wrong answer while
writing discard lines — which does happen, because articulating why three
options fail is a good way to notice the fourth is wrong — stop and run
`factcheck-deck` on that question instead. Fixing it here would ship a key
change with no citation and no correction notice, which the repo's invariants
exist to prevent.

## Why the stem work is not cosmetic

`splitForSpeech` in `src/lib/blitz.ts` breaks the Blitz narration at **sentence
ends**. A scraped stem that reads

> …then there is no reason to invest in middleware Which three considerations
> should an Architect bring up to the CIO? Choose 3 answers

has one sentence boundary where it needs three, so the synthesiser is handed a
350-character run and the listener gets no pause where the question turns.
`hardWrap` does fall back to commas, semicolons and colons — but only once a
chunk has passed 60% of the 200-character cap, so punctuation only helps where
it lands late in a long run.

That is the payoff to measure. Count stems whose longest single sentence exceeds
200 characters, before and after.

## Phase 1 — Survey the stems

```bash
node scripts/audit-deck.mjs public/decks/<deck>.json      # baseline, write the number down
node .claude/skills/deck-readability/scripts/survey-stems.mjs public/decks/<deck>.json
```

The survey reports five shapes. Read its output as leads, not as a worklist —
two of the five over-fire badly:

| Shape | Reliable? |
|---|---|
| No terminal punctuation | Yes. Almost always a trailing "Choose N answers" |
| Missing space after punctuation | Yes |
| Fused words | **No** — it flags every long word. `Salesforcewith` and `anddoctors` are real; `considerations` and `recommendations` are not. Read the distinct-token list it prints and pick the joins out by eye |
| Missing sentence break | **No** — "to the Northern Trail Outfitters" trips it. Roughly a quarter are false |
| Over-long sentence | Yes, but see below |

For the over-long sentences, check whether each already has a comma past the
120-character mark. If it does, `hardWrap` can already breathe there and the
sentence needs nothing. What is worth fixing is the sentence that is long
*because its punctuation is wrong* — a comma splice, or a hyphen doing a full
stop's work. Those are errors on screen as well as aloud.

## Phase 2 — Reformat, with the guard doing the work

```bash
node scripts/reformat-stems.mjs edits.json --dry
node scripts/reformat-stems.mjs edits.json
```

`edits.json` is `{ "deck": "...", "edits": [ { "id": "...", "question": "..." } ] }`.
Options may be edited the same way with `optionA`–`optionE`.

The script refuses any edit where
`normalize(before) !== normalize(after)` — letters and digits in order, ignoring
case, whitespace and punctuation. **Do not work around that check.** It is the
only thing standing between a formatting pass and a silent content change on a
deck whose answers were verified against the original wording, and one violation
aborts the whole run rather than half-applying.

Consequences worth stating to the user up front:

- **A typo cannot be fixed here.** `batc` for "batch" and `al` for "all" both
  survive, correctly, because repairing them changes the words. Mention them in
  the report; do not smuggle them through.
- Adding punctuation, inserting spaces, splitting a fused word and changing
  capitalisation all pass.

Generate the mechanical edits by rule (append a full stop to any stem lacking
terminal punctuation) and hand-write only the judgment calls. That keeps the
hand-written set to roughly a dozen on a 140-question deck.

## Phase 3 — Discard lines, in batches

This is the long half: roughly 2.5 non-keyed options per question, so a
140-question deck is around 350 lines of writing. **Ask the user how deep they
want them before writing 350 of anything** — one clause per option and a full
paragraph per option are both reasonable, and the choice is not recoverable
cheaply.

Work in batches of about 18. For each batch, dump stem, options, key and the
**full** existing explanation — truncating the explanation is how you delete a
verified correction by accident.

Write each question as:

```
<why the keyed option is right>
Why the other options are wrong:
Option B (Outbound Messaging) — fire-and-forget SOAP with no transformation.
Option C (Apex REST Service) — exposes Salesforce as a provider; this is outbound.
```

Then apply:

```bash
node .claude/skills/deck-readability/scripts/apply-discards.mjs batch.mjs findings.json
node .claude/skills/factcheck-deck/scripts/apply-findings.mjs findings.json
```

`apply-discards.mjs` takes a module default-exporting `{ id: prose }`, carries
each question's existing references forward, and **refuses the batch if any
non-keyed option has no line** — which is the check you will otherwise fail
silently on a five-option question.

Six rules, all of them learned the hard way:

- **Verdict is `clarified`, always.** The answer was already right and nothing
  the old explanation said was false, so no correction notice fires. A notice on
  141 questions saying "explanation adjusted" trains the reader to skip the one
  that says an answer moved.
- **Name the option's content in brackets.** "Option B (Outbound Messaging)"
  rather than a bare "Option B" — the reader is looking at the explanation, not
  the option list.
- **Keep substantive corrections in the main prose, not in the lines.** Where an
  explanation already carries a real fact — a limit, a retirement date, a
  documented number — that belongs above the section, and the option's line stays
  short. This is what stops the pass quietly deleting verified work.
- **No markdown.** The app renders explanations as plain text, so `*emphasis*`
  prints its own asterisks. `apply-discards.mjs` strips them; do not rely on it.
- **Every non-keyed option gets a line, including the ones already covered in
  prose.** The point is a findable place, not new information.
- **Singular when there is one distractor**: "Why the other option is wrong:".
  A two-option question exists in most decks and a plural header reads as a bug.

## Phase 4 — Validate, and expect the audit to move

Re-run the structural audit. **It will probably go up, and that is a known
artefact of this pass, not a defect**: naming each distractor puts that
distractor's words in the explanation, which inflates `audit-deck.mjs`'s
keyword-overlap check for "explanation argues against its own key". On the
integration deck it went 3 → 4.

The cure is not to drop the section. It is to **open the explanation with the
keyed option's own vocabulary** rather than the mechanism's generic name:

> "A Case Trigger on after insert and after update that publishes the Platform
> Event is the solution…"

not

> "Platform Events are the canonical mechanism…"

when the keyed option prints as "Case Trigger after insert, after update to
publish the Platform Event". Doing that took integration to **1**, clearing two
findings that pre-dated the pass. Rewriting the opening sentence to name the key
in the key's own words is good practice anyway — it is failure pattern 1 in
`CLAUDE.md` in preventative form.

Then confirm:

```bash
npm run typecheck && npm run test:richtext && npm run test:blitz
```

- **The richtext block count must not move.** A discard line starting
  `Option B (…) —` is prose, but the code-fence heuristic is a heuristic; a spike
  means it has started eating your new sections.
- ids, keys and option text unchanged — diff them field by field, do not eyeball.
- Citation coverage unchanged at N/N.
- Correction stamps added: **0**.

Report the stem numbers as before/after pairs (no terminal punctuation, fused
words, over-long sentences), the discard-line count, the audit movement in both
directions, and any typos you deliberately left.

Leave the deck uncommitted unless asked.
