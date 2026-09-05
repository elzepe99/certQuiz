/**
 * The Blitz run — a small state machine, separate from `quizStore` on purpose.
 *
 * `quizStore` models an exam sitting: answers persist, questions can be
 * revisited, nothing is lost by walking away. A Blitz run is the opposite in
 * every respect — it is ephemeral, forward-only, and scored on speed — so
 * sharing a store would have meant every action in both growing a "but not in
 * blitz mode" branch. The two only meet at the deck JSON.
 *
 * Phases, in order:
 *
 *   lobby → countdown → reading → answering → feedback → (reading | done)
 *
 * `reading` is the phase that makes this mode work: the clock does not start
 * until the narrator has finished the question, so a 900-character stem is a
 * listening problem rather than a race. Answering during `reading` is allowed
 * and scores full marks — reading faster than the voice is a skill worth
 * rewarding.
 *
 * Side effects are split: sounds fire here, because they belong to the moment
 * the event happens, while speech and the timers live in the view, which is
 * where they can be cleaned up on unmount.
 */
import { create } from 'zustand';
import type { Question } from '@/types';
import { isCorrect, requiredAnswerCount, getOptions } from '@/lib/quiz';
import { diagramFor } from '@/diagrams/registry';
import { hasCode, scoreAnswer, timeBudgetSeconds } from '@/lib/blitz';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  recordBest,
  saveSettings,
  type BlitzSettings,
} from '@/lib/blitzStorage';
import { sfx, setMuted } from '@/lib/sfx';

export type BlitzPhase = 'lobby' | 'countdown' | 'reading' | 'answering' | 'feedback' | 'done';

export type BlitzResult = {
  /** Display index into the deck, so the podium can show the question again. */
  qIdx: number;
  /** Letters the player committed, comma-joined. Empty when the clock ran out. */
  selected: string;
  correct: boolean;
  timedOut: boolean;
  points: number;
  msUsed: number;
  msBudget: number;
};

type State = {
  deckId: string | null;
  questions: Question[];
  /** Display indices, in the order this run plays them. */
  order: number[];
  pos: number;
  phase: BlitzPhase;
  /** 3 → 2 → 1 → 0 ("GO"). Only meaningful during `countdown`. */
  countdown: number;
  budgetMs: number;
  /** Wall-clock ms at which the current question expires; null outside `answering`. */
  deadline: number | null;
  selected: string[];
  results: BlitzResult[];
  score: number;
  streak: number;
  bestStreak: number;
  /** Index into the current question's speech script, or -1 when silent. */
  speakingChunk: number;
  settings: BlitzSettings;
  /** True once the finished run has been checked against the stored record. */
  newBest: boolean;

  init: (deckId: string, questions: Question[]) => void;
  updateSettings: (patch: Partial<BlitzSettings>) => void;
  startRun: (order: number[]) => void;
  tickCountdown: () => void;
  beginReading: () => void;
  setSpeakingChunk: (i: number) => void;
  beginAnswering: () => void;
  select: (letter: string) => void;
  timeUp: () => void;
  advance: () => void;
  replayMisses: () => void;
  quit: () => void;
};

const COUNTDOWN_FROM = 3;

/** Phases in which a run is live and must not be thrown away. */
const IN_PROGRESS: readonly BlitzPhase[] = ['countdown', 'reading', 'answering', 'feedback'];

function emptyRunState() {
  return {
    order: [] as number[],
    pos: 0,
    countdown: COUNTDOWN_FROM,
    budgetMs: 0,
    deadline: null as number | null,
    selected: [] as string[],
    results: [] as BlitzResult[],
    score: 0,
    streak: 0,
    bestStreak: 0,
    speakingChunk: -1,
    newBest: false,
  };
}

export const useBlitz = create<State>((set, get) => ({
  deckId: null,
  questions: [],
  ...emptyRunState(),
  phase: 'lobby',
  settings: DEFAULT_SETTINGS,

  /**
   * Point the store at a deck. Idempotent by design.
   *
   * The caller is an effect whose dependency is a `useMemo` value, and React
   * treats memoized values as a discardable cache rather than a guarantee — so
   * this can be called again at any moment, including thirty questions into a
   * run. Re-initialising there would reset the phase to 'lobby' and throw the
   * score away, so a call naming the deck already loaded is ignored while a run
   * is live.
   *
   * `done` is deliberately *not* protected. Coming back to Blitz after finishing
   * a run should open the lobby, not the podium you already read — guarding it
   * would strand the next visit on a stale scoreboard.
   */
  init: (deckId, questions) => {
    const state = get();
    if (state.deckId === deckId && IN_PROGRESS.includes(state.phase)) return;
    const settings = loadSettings();
    setMuted(!settings.sound);
    set({ deckId, questions, settings, phase: 'lobby', ...emptyRunState() });
  },

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    saveSettings(settings);
    setMuted(!settings.sound);
    set({ settings });
  },

  startRun: (order) => {
    if (order.length === 0) return;
    set({ ...emptyRunState(), order, phase: 'countdown' });
  },

  /** One step of the 3-2-1. At zero the first question opens. */
  tickCountdown: () => {
    const { countdown, phase } = get();
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      get().beginReading();
      return;
    }
    set({ countdown: countdown - 1 });
  },

  beginReading: () => {
    const { questions, order, pos, settings } = get();
    const q = questions[order[pos]];
    if (!q) return;
    const seconds = timeBudgetSeconds(settings.seconds, {
      hasCode: hasCode(q),
      hasDiagram: !!diagramFor(q.id),
    });
    set({
      phase: 'reading',
      budgetMs: seconds * 1000,
      deadline: null,
      selected: [],
      speakingChunk: -1,
    });
  },

  setSpeakingChunk: (i) => set({ speakingChunk: i }),

  /** The narrator has finished (or was skipped). Start the clock. */
  beginAnswering: () => {
    const { phase, budgetMs } = get();
    if (phase !== 'reading') return;
    set({ phase: 'answering', deadline: Date.now() + budgetMs, speakingChunk: -1 });
  },

  /**
   * Tap an option.
   *
   * Single-answer questions lock in on the first tap — that instant commitment
   * is what separates this from the exam view, and it is the whole reason a
   * fast answer can be worth more than a slow one. Multi-answer questions
   * accumulate taps and lock when the required number is reached.
   */
  select: (letter) => {
    const state = get();
    const { phase, questions, order, pos } = state;
    if (phase !== 'reading' && phase !== 'answering') return;
    const q = questions[order[pos]];
    if (!q) return;

    const required = requiredAnswerCount(q.question, q.correct);
    const current = state.selected;
    const next = current.includes(letter)
      ? current.filter((l) => l !== letter)
      : [...current, letter];

    if (next.length < required) {
      sfx.select();
      set({ selected: next });
      return;
    }
    set({ selected: next });
    commit(get, set, { timedOut: false });
  },

  timeUp: () => {
    if (get().phase !== 'answering') return;
    commit(get, set, { timedOut: true });
  },

  /** Leave the verdict and open the next question, or end the run. */
  advance: () => {
    const state = get();
    if (state.phase !== 'feedback') return;
    const nextPos = state.pos + 1;
    if (nextPos >= state.order.length) {
      finish(get, set);
      return;
    }
    set({ pos: nextPos });
    get().beginReading();
  },

  /** A fresh run over only what was missed. Empty misses is a no-op. */
  replayMisses: () => {
    const misses = get()
      .results.filter((r) => !r.correct)
      .map((r) => r.qIdx);
    if (misses.length === 0) return;
    get().startRun(misses);
  },

  quit: () => set({ phase: 'lobby', ...emptyRunState() }),
}));

type Setter = (partial: Partial<State>) => void;
type Getter = () => State;

/**
 * Turn the current selection into a scored result and move to the verdict.
 *
 * Answering before the clock starts (during `reading`) counts as using none of
 * it, which is what makes reading ahead of the narrator worth doing.
 */
function commit(get: Getter, set: Setter, opts: { timedOut: boolean }) {
  const state = get();
  const q = state.questions[state.order[state.pos]];
  if (!q) return;

  const now = Date.now();
  const msLeft =
    state.deadline === null ? state.budgetMs : Math.max(0, Math.min(state.budgetMs, state.deadline - now));
  const selected = orderLetters(q, state.selected);
  const correct = !opts.timedOut && isCorrect(selected, q.correct);

  const { points } = scoreAnswer({
    correct,
    msLeft,
    msTotal: state.budgetMs,
    streakBefore: state.streak,
  });

  const streak = correct ? state.streak + 1 : 0;

  set({
    phase: 'feedback',
    deadline: null,
    speakingChunk: -1,
    results: [
      ...state.results,
      {
        qIdx: state.order[state.pos],
        selected,
        correct,
        timedOut: opts.timedOut,
        points,
        msUsed: state.budgetMs - msLeft,
        msBudget: state.budgetMs,
      },
    ],
    score: state.score + points,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
  });

  // Sound comes *after* the state is written, never before. `tone()` swallows
  // its own errors too, but the ordering is the part that matters: if making a
  // noise could throw before this `set`, a failed sound would drop the answer
  // and leave the question stuck on an expired clock, re-committing and
  // re-throwing on every tick.
  if (opts.timedOut) sfx.timeout();
  else if (correct) sfx.correct();
  else sfx.wrong();
}

/**
 * Selections are stored in tap order, but `isCorrect` compares sorted sets and
 * the podium prints the letters back. Sorting by the question's own option
 * order keeps "B, D" from ever rendering as "D, B".
 */
function orderLetters(q: Question, letters: string[]): string {
  const order = getOptions(q).map((o) => o.letter);
  return [...letters].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join(',');
}

function finish(get: Getter, set: Setter) {
  const state = get();
  sfx.finish();
  const correct = state.results.filter((r) => r.correct).length;
  const newBest = state.deckId
    ? recordBest(state.deckId, {
        score: state.score,
        questions: state.results.length,
        correct,
        bestStreak: state.bestStreak,
        at: new Date().toISOString().slice(0, 10),
      })
    : false;
  set({ phase: 'done', deadline: null, speakingChunk: -1, newBest });
}
