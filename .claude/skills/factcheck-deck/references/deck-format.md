# Deck format, corrections, and the findings file

## Deck JSON

Each deck is an array of question objects in `public/decks/`, registered in
`public/decks/manifest.json`.

```ts
type Question = {
  id: string;          // permanent, content-hashed; comments bind to it
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD?: string;
  optionE?: string;
  correct: string;     // 'A' | 'B' | ... | 'B,D' for multi-correct
  explanation: string; // "\n" for paragraph breaks; trailing "References:" parsed out
  _cat: string;        // exam domain — drives topic nav, completion breakdown, review filter
  corrected?: {        // present only if the question has been changed
    date: string;      // YYYY-MM-DD
    via: 'comments' | 'validation';
    note: string;
    from?: string;     // previous key, only when the answer actually moved
    to?: string;
  };
};
```

### `id` is load-bearing

Ids come from `scripts/add-question-ids.mjs`, which hashes
`question + optionA..E + correct + _cat`. Comments in the app bind to the id, not
to content. Two consequences:

- **Editing an option or the key changes nothing about an existing id** — the id
  is written once and then frozen. Never hand-edit or regenerate ids on a deck
  that is already published, or you orphan its comments.
- `explanation` is deliberately **not** part of the hash, so rewriting an
  explanation is always safe.

Address questions by `id` in a findings file, never by position — decks get
deduplicated and reordered.

## How the app renders an explanation

`src/lib/quiz.ts` splits the explanation on the first `References:` line
(case-insensitive, at the start of a line), then treats **each remaining line as
one reference**. So the shape that works is:

```
Prose paragraph.
Another paragraph.
References:
https://help.salesforce.com/...
https://developer.salesforce.com/...
```

Anything before that marker renders as the explanation body; the URLs render as a
links list. A `corrected` record renders as a separate notice under the
explanation, showing `from → to` when the answer moved and just the date and note
when it did not.

## Correction stamps

`scripts/lib/corrections.mjs` exports `stampCorrection(q, { via, note, from, date })`.

- `via: 'validation'` for a documentation-driven pass; `'comments'` when a user
  comment surfaced the problem.
- `from` is recorded **only** when it differs from the new key, so a
  reasoning-only fix produces a stamp with no misleading arrow.
- A stamp is a warning shown mid-study. Do not stamp one for prose that was
  merely thin — see the verdict table below.
- `date` defaults to the repo-wide `CORRECTION_DATE`. Pass it explicitly for a
  later pass so the stamp records when the review actually happened.
- **Only one record is stored per question.** Correcting a question that was
  already corrected overwrites the previous note — read it first and fold
  anything still worth keeping into the new one.

## The findings file

```json
{
  "deck": "public/decks/integration_architect_questions_corrected.json",
  "reviewed": "2026-08-08",
  "findings": [
    { "id": "c19a756b", "verdict": "confirmed",
      "references": ["https://help.salesforce.com/..."] },

    { "id": "7a1c0d94", "verdict": "clarified",
      "explanation": "Rewritten prose, no References block — the script appends it.",
      "references": ["https://developer.salesforce.com/..."] },

    { "id": "b054672a", "verdict": "reasoning",
      "explanation": "Rewritten prose stating the documented mechanism.",
      "references": ["https://developer.salesforce.com/..."],
      "note": "Answer stands; the explanation taught a governor limit that does not exist." },

    { "id": "9f21ab03", "verdict": "corrected",
      "was": "A", "correct": "C,D",
      "explanation": "Why the new key is right and why the old one failed.",
      "references": ["https://help.salesforce.com/..."],
      "note": "What the documentation established." }
  ]
}
```

**Verdicts**

| Verdict | Meaning | Requires | Stamps a correction |
|---|---|---|---|
| `confirmed` | Answer right, reasoning sound | `references` | no |
| `clarified` | Answer right, explanation improved but nothing it said was false | `explanation`, `references` (a `note` is rejected) | no |
| `reasoning` | Answer right, explanation *wrong* — or the item itself is defective | `explanation`, `references`, `note` | yes, no arrow |
| `corrected` | Answer wrong | `was`, `correct`, `explanation`, `references`, `note` | yes, with arrow |

The split between `clarified` and `reasoning` is what keeps the notice meaningful.
Ask whether a learner who believed the old explanation would now hold a false
belief. If yes — a fabricated limit, an argument for the option the key does not
name, a retired capability, a broken item — it is `reasoning`, and the note says
which belief. If the prose merely reads better now, it is `clarified` and the
question shows nothing. Notices that all say "explanation adjusted" train the
reader to skip the one that says the answer moved.

Write the `explanation` as prose only. `apply-findings.mjs` appends the
`References:` block and merges with any references already on the question, so
hand-writing one produces duplicates.

**Why `was` is required on a correction:** it makes stale findings fail loudly.
If another pass changed that key in the meantime, the script refuses rather than
silently reverting someone's work.

## Useful commands

```bash
node scripts/audit-deck.mjs public/decks/<deck>.json          # structural leads
node .claude/skills/factcheck-deck/scripts/check-urls.mjs urls.txt
node .claude/skills/factcheck-deck/scripts/apply-findings.mjs findings.json --dry
node scripts/add-question-ids.mjs                             # only for a NEW deck
```

On Windows, prefix Python dumps with `PYTHONIOENCODING=utf-8` — deck text contains
em dashes and arrows that crash the default console codec with a `charmap` error.
That failure is a console limitation, not corrupt data; confirm by counting
`�` in the file, which should be zero.
