/**
 * Blitz's own corner of localStorage.
 *
 * Deliberately separate from `quiz:progress:*`. A rushed eight-second guess is
 * not the same event as an exam-style answer, and letting one write into the
 * other would quietly make the accuracy figure on the deck picker — the number
 * this whole repo's deck work exists to keep honest — mean something else.
 * Blitz keeps a score; the quiz keeps a record.
 */
import {
  DEFAULT_FEEDBACK_SECONDS,
  DEFAULT_SECONDS,
  type BlitzSource,
} from '@/lib/blitz';

export const BLITZ_SETTINGS_KEY = 'quiz:blitz:settings';
export const BLITZ_BEST_KEY = (deckId: string) => `quiz:blitz:best:${deckId}`;

export type BlitzSettings = {
  seconds: number;
  readAloud: boolean;
  voiceURI: string | null;
  rate: number;
  sound: boolean;
  /** Seconds the verdict is held. `0` waits for a keypress instead. */
  feedbackSeconds: number;
  source: BlitzSource;
};

export const DEFAULT_SETTINGS: BlitzSettings = {
  seconds: DEFAULT_SECONDS,
  readAloud: true,
  voiceURI: null,
  rate: 1.05,
  sound: true,
  feedbackSeconds: DEFAULT_FEEDBACK_SECONDS,
  source: 'set',
};

/** A run good enough to keep. One per deck — the best, not the last. */
export type BlitzBest = {
  score: number;
  questions: number;
  correct: number;
  bestStreak: number;
  /** ISO date of the run. */
  at: string;
};

function num(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function loadSettings(): BlitzSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(BLITZ_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<BlitzSettings>;
    return {
      seconds: Math.max(5, Math.floor(num(parsed.seconds, DEFAULT_SETTINGS.seconds))),
      readAloud: parsed.readAloud !== false,
      voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : null,
      rate: Math.min(2, Math.max(0.5, num(parsed.rate, DEFAULT_SETTINGS.rate))),
      sound: parsed.sound !== false,
      feedbackSeconds: Math.max(
        0,
        Math.floor(num(parsed.feedbackSeconds, DEFAULT_SETTINGS.feedbackSeconds)),
      ),
      source:
        parsed.source === 'deck' || parsed.source === 'random' || parsed.source === 'set'
          ? parsed.source
          : DEFAULT_SETTINGS.source,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: BlitzSettings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BLITZ_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota errors
  }
}

export function loadBest(deckId: string): BlitzBest | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BLITZ_BEST_KEY(deckId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BlitzBest>;
    if (!Number.isFinite(Number(parsed.score))) return null;
    return {
      score: num(parsed.score, 0),
      questions: num(parsed.questions, 0),
      correct: num(parsed.correct, 0),
      bestStreak: num(parsed.bestStreak, 0),
      at: typeof parsed.at === 'string' ? parsed.at : '',
    };
  } catch {
    return null;
  }
}

/**
 * Record a run if it beats the stored one, and say whether it did.
 *
 * Compared on raw score rather than accuracy, so a longer run can always take
 * the record — a five-question sprint at 100% should not lock out the board.
 */
export function recordBest(deckId: string, run: BlitzBest): boolean {
  if (typeof window === 'undefined') return false;
  const prev = loadBest(deckId);
  if (prev && prev.score >= run.score) return false;
  try {
    window.localStorage.setItem(BLITZ_BEST_KEY(deckId), JSON.stringify(run));
  } catch {
    return false;
  }
  return true;
}
