export type Question = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD?: string;
  optionE?: string;
  correct: string; // 'A' | 'B' | 'C' | 'D' | 'E', or comma-separated for multi-correct
  explanation: string;
  _cat: string;
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
