# CertPrep

A certification practice app: 14 question decks, a study guide for each, and two ways
to practise — a calm exam-style view and a fast, read-aloud game mode called Blitz.

It is a static site (Vite + React + TypeScript). There is no backend and no login;
your progress lives in your own browser. It is deployed to GitHub Pages under
`/certQuiz/`.

```sh
npm install
npm run dev      # http://localhost:5173/certQuiz/
```

---

## What's in it

### The decks — 1,866 questions

| Deck | Questions |
|---|---:|
| Salesforce Certified Administrator | 154 |
| Salesforce Certified Platform App Builder | 222 |
| Salesforce Certified Platform Developer II | 146 |
| Salesforce Certified Agentforce Specialist | 227 |
| Salesforce Certified Integration Architect | 146 |
| Salesforce Certified Identity and Access Management Architect | 116 |
| Salesforce Certified Sharing and Visibility Architect | 136 |
| Salesforce Certified Data Architect | 135 |
| Salesforce Development Lifecycle and Deployment Designer | 137 |
| Salesforce Revenue Cloud Consultant | 135 |
| Salesforce Certified Data Cloud Consultant | 100 |
| Salesforce Certified Slack Consultant | 37 |
| Databricks Certified Data Engineer Associate | 147 |
| Claude Certified Architect — Foundations | 28 |

Every answer has been checked against the vendor's official documentation, and every
explanation:

- says why the right answer is right,
- ends with a **"Why the other options are wrong"** section, one line per wrong option,
- links to the documentation page that settles it.

When an answer was changed after the question was first imported, the question shows an
amber **correction notice** under the explanation saying what changed and why (for
example `C → B`). A grey notice means the question was reviewed and the answer stands.

Decks live in `public/decks/` as plain JSON, listed in `public/decks/manifest.json`.

### Exam mode — `/deck/:deckId`

The main view. One question at a time, with the explanation revealed after you answer.

- **Sets.** Long decks are split into sets of 20, 30 or 40 questions (or all of them),
  so a session has an end. Your place is remembered per deck.
- **Flags and skips.** Flag a question to come back to it; skip one without answering.
- **Review** (`/deck/:deckId/review`) lists every question you got wrong, with its
  explanation, filterable by topic and to flagged questions only.
- **Diagrams.** A few questions depend on a figure; those are drawn in, and can be
  expanded full-screen.
- **Code** in questions and options is shown as a formatted code block.
- **Keyboard:** `1`–`5` pick an option · `Enter` submits, then moves on · `←` / `→`
  move between questions · `F` flags · `S` skips.

### Blitz mode — `/deck/:deckId/blitz`

A Kahoot-style game built for staying focused on long questions.

- **The question is read aloud** by your browser's voice. Choose question only,
  question and every option, or off.
- **The clock starts when the reading finishes**, not when the question appears, so
  long questions aren't a race against the narrator.
- **Big colour-and-shape tiles**, answered with one tap, each also labelled with its
  letter.
- **A podium at the end** offers a rematch on just the questions you missed.

Blitz scores are kept separately and **never count towards your deck progress**, so
the accuracy shown on the deck picker only reflects questions you answered in exam mode.

Voice quality depends on the browser. **Microsoft Edge** has natural-sounding voices
built in; Chrome on Windows only has the old robotic ones.

### Study guides — the **Guide** tab

Every deck has a study guide that opens in a new tab. The deck teaches you the questions;
the guide tells you whether those are the *right* questions. Each one:

- sets the deck against the **official exam outline**, domain by domain, showing where
  the deck over-drills and where it is thin,
- **teaches the topics the deck never asks about**, from the vendor's documentation,
- lists the numbers worth memorising and the tells that give away wrong options,
- flags where the exam and today's product disagree ("exam-right, production-wrong"),
- ends with a two-week revision plan and the official sources.

Guides are written in `study-guides/<name>.artifact.html` and built into standalone
pages under `public/guides/` by `npm run build:guide` (which also runs before every
production build).

### Reading preferences — the gear icon

Choose the font used for question text: Serif, Sans, System or Mono.

### Comments (optional)

An in-app comments panel, backed by Supabase. It switches on only when
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (copy `.env.example` to
`.env.local`). Without them the app works normally and the panel is simply hidden.

---

## Commands

```sh
npm run dev            # local dev server
npm run build          # production build (also rebuilds the guides)
npm run preview        # serve the production build
npm run build:guide    # rebuild the study guides only
npm run typecheck      # TypeScript check

npm run test:richtext  # code-block detection
npm run test:sets      # set-splitting arithmetic
npm run test:blitz     # Blitz scoring and the read-aloud script

npm run review-comments  # export in-app comments to Markdown (needs Supabase keys)
```

## Repository layout

```
src/                 the app
  components/        exam view, review, explanations, correction notices, settings
  components/blitz/  Blitz mode
  diagrams/          hand-drawn figures for the questions that need one
  lib/               question parsing, code detection, sets, speech, storage
public/decks/        the 14 decks + manifest.json
public/guides/       built study guides (generated — edit study-guides/ instead)
study-guides/        guide sources, plus the scripts that map each question to an
                     exam domain
scripts/             deck tooling: structural audit, duplicate finder, id minting,
                     question-text formatting, guide builder, test suites
.claude/skills/      the fact-checking and study-guide workflows used to maintain
                     the decks
```

## Adding a deck

1. Copy `public/decks/deck-template.json` to `public/decks/<deck-id>.json` and fill it in.
   Each question looks like this:

   ```ts
   type Question = {
     id: string;          // permanent; mint with `npm run add-ids`
     question: string;
     optionA: string;
     optionB: string;
     optionC: string;
     optionD?: string;
     optionE?: string;
     correct: string;     // 'B', or 'A,C' for choose-two
     explanation: string; // "\n" between paragraphs; a trailing "References:" line,
                          // then one URL per line
     _cat: string;        // topic
   };
   ```

2. Add an entry to `public/decks/manifest.json`:

   ```json
   {
     "id": "<deck-id>",
     "name": "Full deck name",
     "shortName": "Short label",
     "description": "...",
     "file": "<deck-id>.json",
     "accentColor": "#7AB8FF"
   }
   ```

3. Run `npm run add-ids` to give the new questions permanent ids. Never regenerate ids
   on a published deck — comments are attached to them.

No code changes are needed. `CLAUDE.md` describes how decks are fact-checked and how
guides are written.
