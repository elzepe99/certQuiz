export type Question = {
  /**
   * Permanent identity for this question, assigned once in the deck JSON and
   * never recomputed. Comments and saved progress key off it, so editing the
   * stem, an option, or `correct` no longer detaches them. Seeded from the
   * question's original content hash — see scripts/add-question-ids.mjs.
   */
  id?: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD?: string;
  optionE?: string;
  correct: string; // 'A' | 'B' | 'C' | 'D' | 'E', or comma-separated for multi-correct
  explanation: string;
  _cat: string;
  /**
   * Set when this question has been corrected since it was imported. Surfaced
   * in the UI so a change is visible at the point of study rather than being
   * silently absorbed into the JSON.
   */
  corrected?: QuestionCorrection;
};

export type QuestionCorrection = {
  date: string; // YYYY-MM-DD
  via: 'comments' | 'validation';
  note: string;
  from?: string; // previous `correct` value, present only when the answer moved
  to?: string;
  /**
   * True when the question was reviewed against a comment and deliberately left
   * unchanged. Without this a reader meets their own objection with no sign it
   * was ever considered, which reads as an oversight rather than a decision.
   */
  upheld?: boolean;
};

export type DeckMeta = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  file: string;
  accentColor?: string;
};

export type DeckManifest = {
  decks: DeckMeta[];
};

export type DeckProgress = {
  answers: Record<number, string>; // qIdx -> selected letter(s)
  submitted: Record<number, true>; // qIdx that are locked
  flagged: number[];
  skipped: number[];
  notes: Record<number, string>;
  currentIdx: number;
  sessionStartTime: number;
  accumulatedSessionSeconds: number;
  timeOnQ: number[]; // seconds accumulated per question
  questionOrder: number[]; // displayed question index -> original deck index
  questionSignatures: string[]; // persisted identity for index remapping after deck edits
};

export type ParsedExplanation = {
  body: string;
  references: string[];
};

export type Comment = {
  id: string;
  deckId: string;
  questionHash: string;
  author: string;
  body: string;
  createdAt: string; // ISO timestamp
};
