/**
 * The rules of Blitz mode — a Kahoot-shaped run over a deck: the question is
 * read aloud, a clock drains, and answering fast is worth more than answering
 * slowly.
 *
 * Everything here is pure. The browser-facing halves live next door in
 * `speech.ts` (the voice) and `sfx.ts` (the sounds), and the run itself is
 * driven by `state/blitzStore.ts`. Keeping the arithmetic separate is what lets
 * `scripts/test-blitz.mjs` pin it without a DOM.
 *
 * Two decisions here are load-bearing and easy to undo by accident:
 *
 * - **The clock starts when the reading finishes, not when the question
 *   appears.** These stems run to 900 characters; a timer racing the narrator
 *   would punish exactly the long questions the read-aloud exists to make
 *   bearable. `speechScript` therefore chunks the question so the caller knows
 *   when the last option has been spoken.
 * - **Option order is never shuffled.** Explanations refer to options by
 *   letter ("Option D is correct because…"), so reordering them would make the
 *   deck's own prose wrong. Only the question order is shuffled.
 */
import { getOptions } from '@/lib/quiz';
import { parseRichText } from '@/lib/richtext';
import type { Question } from '@/types';

/** Points a perfect, instant answer is worth before any streak bonus. */
export const BLITZ_BASE_POINTS = 1000;

/**
 * Floor of the speed curve. A correct answer given on the last tick still earns
 * half marks — the game rewards speed, it does not punish thinking.
 */
export const SPEED_FLOOR = 0.5;

/** Each consecutive correct answer after the first adds this, up to the cap. */
export const STREAK_BONUS_STEP = 100;
export const MAX_STREAK_STEPS = 5;

/** Seconds per question offered in the lobby. */
export const SECONDS_OPTIONS = [15, 20, 30, 45, 60];
export const DEFAULT_SECONDS = 30;

/**
 * Extra seconds for a question carrying code or a figure. Those cannot be
 * spoken, so the reader has to actually look at them — time the narrator saved
 * everyone else.
 */
export const VISUAL_BONUS_SECONDS = 10;

/** How long the verdict is held before the run moves on. `0` means "wait for me". */
export const FEEDBACK_SECONDS_OPTIONS = [3, 5, 8, 0];
export const DEFAULT_FEEDBACK_SECONDS = 5;

/** Spoken in place of a code block, which is unlistenable read character by character. */
export const CODE_SPOKEN_PLACEHOLDER = 'Code shown on screen.';

export type BlitzSource = 'set' | 'deck' | 'random';
export const RANDOM_RUN_SIZE = 20;

/**
 * Strip a deck string down to something worth listening to: code blocks become
 * a single spoken note, whitespace collapses, and stray backticks go.
 *
 * Reading a snippet aloud produces "open brace, public static void" — noise
 * that costs more attention than it gives. The snippet is on screen, and the
 * extra seconds from `timeBudgetSeconds` are what pay for reading it.
 */
export function speakableText(raw: string): string {
  if (!raw) return '';
  const out: string[] = [];
  for (const seg of parseRichText(raw)) {
    if (seg.kind === 'code') {
      if (out[out.length - 1] !== CODE_SPOKEN_PLACEHOLDER) out.push(CODE_SPOKEN_PLACEHOLDER);
      continue;
    }
    const text = seg.value.replace(/`+/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) out.push(text);
  }
  return out.join(' ').replace(/\s+/g, ' ').trim();
}

/** True when a question's stem or any option contains a code block. */
export function hasCode(q: Question): boolean {
  const strings = [q.question, ...getOptions(q).map((o) => o.text)];
  return strings.some((s) => parseRichText(s).some((seg) => seg.kind === 'code'));
}

/** Longest single utterance handed to the synthesiser. */
export const MAX_UTTERANCE_CHARS = 200;

/**
 * Break text into utterance-sized pieces, preferring sentence ends, then
 * clause breaks, and hard-wrapping at a word boundary only as a last resort.
 *
 * Two reasons, and the second is the one that bites. Short utterances sound
 * better — the synthesiser puts a real pause at each boundary instead of
 * running two sentences together. And several browsers silently truncate or
 * stall on a long one: the stems in these decks reach 1,200 characters, which
 * is around 80 seconds of speech, far past where that behaviour starts.
 */
export function splitForSpeech(text: string, maxLen = MAX_UTTERANCE_CHARS): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed ? [trimmed] : [];

  // Sentence ends, keeping the punctuation with the sentence it closes.
  const sentences = trimmed.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [trimmed];

  const out: string[] = [];
  let buffer = '';
  const flush = () => {
    const value = buffer.trim();
    if (value) out.push(value);
    buffer = '';
  };

  for (const sentence of sentences) {
    for (const piece of hardWrap(sentence.trim(), maxLen)) {
      if (buffer && buffer.length + piece.length + 1 > maxLen) flush();
      buffer = buffer ? `${buffer} ${piece}` : piece;
    }
  }
  flush();
  return out;
}

/** Split an over-long run on clause breaks, then on whitespace. */
function hardWrap(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return text ? [text] : [];

  const out: string[] = [];
  let buffer = '';
  for (const word of text.split(/\s+/)) {
    if (buffer && buffer.length + word.length + 1 > maxLen) {
      out.push(buffer);
      buffer = '';
    }
    buffer = buffer ? `${buffer} ${word}` : word;
    // A comma or semicolon is a natural place to breathe once the piece is
    // already long enough that the next word might not fit.
    if (/[,;:]$/.test(word) && buffer.length > maxLen * 0.6) {
      out.push(buffer);
      buffer = '';
    }
  }
  if (buffer) out.push(buffer);
  return out;
}

export type SpeechChunk =
  | { kind: 'stem'; text: string }
  | { kind: 'option'; optionIdx: number; letter: string; text: string };

/**
 * The question as a sequence of utterances rather than one blob.
 *
 * Chunking buys three things: the option being spoken can be highlighted, no
 * single utterance is long enough to run into a synthesiser's length ceiling,
 * and the listener gets a natural pause between options instead of one
 * unbroken sentence. An option that needs more than one utterance keeps the
 * same `optionIdx` across all of them, so the highlight stays put.
 */
export function speechScript(q: Question): SpeechChunk[] {
  const chunks: SpeechChunk[] = [];
  for (const text of splitForSpeech(speakableText(q.question))) {
    chunks.push({ kind: 'stem', text });
  }
  getOptions(q).forEach((opt, i) => {
    const spoken = speakableText(opt.text) || 'See screen.';
    // "Option A" rather than a bare "A", which several voices read as "uh".
    const pieces = splitForSpeech(spoken, MAX_UTTERANCE_CHARS - 12);
    pieces.forEach((text, pieceIdx) => {
      chunks.push({
        kind: 'option',
        optionIdx: i,
        letter: opt.letter,
        text: pieceIdx === 0 ? `Option ${opt.letter}. ${text}` : text,
      });
    });
  });
  return chunks;
}

/**
 * Seconds allowed for one question. A figure or a snippet buys extra time,
 * because that content is the one part the narrator cannot hand over.
 */
export function timeBudgetSeconds(
  baseSeconds: number,
  opts: { hasCode?: boolean; hasDiagram?: boolean } = {},
): number {
  const base = Number.isFinite(baseSeconds)
    ? Math.max(5, Math.floor(baseSeconds))
    : DEFAULT_SECONDS;
  const bonus = opts.hasCode || opts.hasDiagram ? VISUAL_BONUS_SECONDS : 0;
  return base + bonus;
}

export type Score = {
  /** Speed-weighted value of the answer itself, before the streak. */
  base: number;
  /** Bonus for the run of correct answers this one continues. */
  streakBonus: number;
  /** What actually goes on the board. */
  points: number;
};

/**
 * What one answer is worth.
 *
 * `streakBefore` is the number of consecutive correct answers *preceding* this
 * one, so the second correct answer in a row is the first to earn a bonus. A
 * wrong or timed-out answer scores nothing and resets the streak at the call
 * site — the multiplier is the thing you are protecting, which is what makes a
 * five-in-a-row run worth not guessing on.
 */
export function scoreAnswer(input: {
  correct: boolean;
  msLeft: number;
  msTotal: number;
  streakBefore: number;
}): Score {
  const { correct, msLeft, msTotal, streakBefore } = input;
  if (!correct) return { base: 0, streakBonus: 0, points: 0 };

  const total = msTotal > 0 ? msTotal : 1;
  const fracLeft = Math.min(1, Math.max(0, msLeft / total));
  const base = Math.round(BLITZ_BASE_POINTS * (SPEED_FLOOR + (1 - SPEED_FLOOR) * fracLeft));

  const steps = Math.min(Math.max(0, Math.floor(streakBefore)), MAX_STREAK_STEPS);
  const streakBonus = steps * STREAK_BONUS_STEP;

  return { base, streakBonus, points: base + streakBonus };
}

/** The most a run of this length could score, for the podium percentage. */
export function maxPossibleScore(questionCount: number): number {
  let total = 0;
  for (let i = 0; i < questionCount; i++) {
    total += BLITZ_BASE_POINTS + Math.min(i, MAX_STREAK_STEPS) * STREAK_BONUS_STEP;
  }
  return total;
}

/** Fisher–Yates. */
export function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Which questions a run covers, as display indices into the deck.
 *
 * `set` mirrors the study set the learner is already in, so Blitz and the exam
 * view stay talking about the same stretch of deck. Everything is shuffled —
 * running the same set twice in the same order turns recall into recitation.
 */
export function buildRunOrder(input: {
  source: BlitzSource;
  total: number;
  setStart: number;
  setEnd: number;
  size?: number;
}): number[] {
  const { source, total } = input;
  if (total <= 0) return [];

  if (source === 'set') {
    const start = Math.max(0, Math.min(input.setStart, total));
    const end = Math.max(start, Math.min(input.setEnd, total));
    const range = Array.from({ length: end - start }, (_, i) => start + i);
    return shuffled(range.length > 0 ? range : Array.from({ length: total }, (_, i) => i));
  }

  const all = shuffled(Array.from({ length: total }, (_, i) => i));
  if (source === 'random') {
    const size = Math.max(1, Math.min(input.size ?? RANDOM_RUN_SIZE, total));
    return all.slice(0, size);
  }
  return all;
}

export function formatPoints(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
