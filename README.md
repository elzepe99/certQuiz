# CertPrep

A focused, dark-themed certification practice quiz. Built from the design handoff
in `design_handoff_cert_quiz/`. Multi-deck: drop a JSON file into `public/decks/`
and add an entry to `manifest.json` to add a new deck.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS (with the design tokens from the handoff in `tailwind.config.js`)
- Zustand for per-deck state
- React Router v6 for routing
- localStorage for per-deck progress (keyed `quiz:progress:<deck-id>`)
- Lucide for icons; Inter / Instrument Serif / JetBrains Mono via Google Fonts

No backend, no auth — fully static, deployable to Vercel / Netlify / Cloudflare Pages.

## Getting started

```sh
npm install
npm run dev
```

Then open http://localhost:5173.

To build for production:

```sh
npm run build
npm run preview
```

## Adding a new deck

1. Drop `<deck-id>.json` into `public/decks/`. The shape:
   ```ts
   type Question = {
     question: string;
     optionA: string;
     optionB: string;
     optionC: string;
     optionD?: string;
     optionE?: string;
     correct: string;     // 'A' | 'B' | ... or comma-separated for multi-correct
     explanation: string; // \n for paragraph breaks; trailing "References:" parsed out
     _cat: string;        // topic / category
   };
   ```
   Quick start: copy `public/decks/deck-template.json` and replace the sample questions.
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
3. Redeploy. No code changes needed.

## Routes

| Path                            | View                    |
| ------------------------------- | ----------------------- |
| `/`                             | Deck picker             |
| `/deck/:deckId`                 | Quiz view (the main UI) |
| `/deck/:deckId/review`          | Review wrong answers    |
| `/deck/:deckId/complete`        | Completion screen       |

## Keyboard shortcuts

- `1`–`5` — select option A–E
- `Enter` — submit (if a selection is made) or next (if already submitted)
- `←` / `→` — previous / next
- `F` — toggle flag
- `S` — skip
- `?` — open shortcuts cheatsheet (TODO)

Shortcuts are disabled while the user is typing in an input or textarea.

## Notes on the implementation

- **Per-deck progress** is keyed by deck id in localStorage, so switching decks
  preserves each one's state independently. `Restart deck` only wipes that
  deck's key.
- **Selection discard on navigation**: if the user navigates away from an
  unsubmitted question without submitting, the in-progress selection is dropped.
  This matches the spec — feels closer to a real exam, no ghost-state.
- **Multi-correct support**: schema-ready. Detected when `correct` contains a
  comma OR the prompt contains "Choose N" / "Select N". Renders as multi-select.
  No questions in the current Revenue Cloud deck require it.
- **Reference parsing**: explanations are split at the first `References:` line.
  Bare URLs in references are auto-linked.
- **Reduced motion**: animations are gated by `prefers-reduced-motion`.

## What's stubbed / out of scope for v1

- "Mock Exam" and "History" tabs from the handoff are not yet wired (the
  TopBar surfaces "Practice" and "Review" only).
- Settings modal (theme, font size, shortcut toggle) is a Settings cog with no
  sheet behind it yet.
- Shortcuts cheatsheet (`?`) — handler exists but no modal yet.
- Below 1280px the right sidebar is hidden (per spec). Below 960px the left
  sidebar is hidden, but it does not yet collapse into a hamburger drawer —
  the question map and topics aren't reachable on mobile yet.
