import { create } from 'zustand';
import {
  DEFAULT_DIFFICULTY,
  IDLE_RUSH,
  isDifficulty,
  applyAnswer,
  applyJackpot,
  endRush,
  isExpired,
  spin,
  startRush,
  survivedMs,
  type Difficulty,
  type Reels,
  type RushState,
} from '@/lib/rush';
import { sfx, unlockAudio } from '@/lib/sfx';
import { isCorrect } from '@/lib/quiz';
import { useQuiz } from '@/state/quizStore';

/**
 * Jackpot Rush: a survival clock over the normal exam view, started from the
 * casino dock in the bottom-right corner.
 *
 * It does not keep its own questions. It watches the quiz store and scores
 * whatever the reader submits there, so the answers are ordinary answers and
 * land in `quiz:progress:*` exactly as they would without the clock — unlike
 * Blitz, nothing here is a guess against a timer that the deck's accuracy
 * figure would have to absorb. Its own keys are `quiz:rush:settings` (the
 * chosen difficulty) and `quiz:rush:best:<deckId>:<difficulty>`.
 *
 * A run lives in memory: a reload or leaving the deck ends it.
 */

/** Kept in step with the reel stops in RushDock (0.7s, 1.05s, 1.4s). */
export const SPIN_MS = 1400;

export type RushBest = { correct: number; survivedMs: number; bestStreak: number };

type Flash = { kind: 'correct' | 'wrong' | 'jackpot' | 'tincho'; id: number };

type Store = RushState & {
  deckId: string | null;
  now: number;
  reels: Reels;
  /** Where the reels will land; read by the dock to stop them one by one. */
  target: Reels;
  spinning: boolean;
  /** The latest +/- event, for the floating "+1:00" toast. */
  flash: Flash | null;
  best: RushBest | null;
  /** Whether the run just finished beat the stored best. */
  newBest: boolean;

  bind: (deckId: string) => void;
  start: () => void;
  setDifficulty: (d: Difficulty) => void;
  reset: () => void;
};

const SETTINGS_KEY = 'quiz:rush:settings';

function loadDifficulty(): Difficulty {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    const d = raw ? (JSON.parse(raw) as { difficulty?: unknown }).difficulty : undefined;
    return isDifficulty(d) ? d : DEFAULT_DIFFICULTY;
  } catch {
    return DEFAULT_DIFFICULTY;
  }
}

/** A best is per difficulty: a long easy run says nothing about a hard one. */
function bestKey(deckId: string, d: Difficulty) {
  return `quiz:rush:best:${deckId}:${d}`;
}

function readBest(deckId: string, d: Difficulty): RushBest | null {
  try {
    const raw = window.localStorage.getItem(bestKey(deckId, d));
    if (!raw) return null;
    const b = JSON.parse(raw) as Partial<RushBest>;
    return typeof b.correct === 'number' ? (b as RushBest) : null;
  } catch {
    return null;
  }
}

function writeBest(deckId: string, d: Difficulty, best: RushBest) {
  try {
    window.localStorage.setItem(bestKey(deckId, d), JSON.stringify(best));
  } catch {
    // A best score that does not survive a reload is still a best score today.
  }
}

let flashSeq = 0;
let spinSeq = 0;

export const useRush = create<Store>((set, get) => ({
  ...IDLE_RUSH,
  difficulty: loadDifficulty(),
  deckId: null,
  now: Date.now(),
  reels: ['seven', 'seven', 'seven'],
  target: ['seven', 'seven', 'seven'],
  spinning: false,
  flash: null,
  best: null,
  newBest: false,

  bind: (deckId) => {
    if (get().deckId === deckId) return;
    get().reset();
    set({ deckId, best: readBest(deckId, get().difficulty) });
  },

  start: () => {
    unlockAudio();
    spinSeq++;
    set({
      ...startRush(Date.now(), get().difficulty),
      now: Date.now(),
      spinning: false,
      flash: null,
      newBest: false,
    });
    sfx.countdown(true);
    syncTicker();
  },

  setDifficulty: (d) => {
    if (get().phase === 'running') return;
    const deckId = get().deckId;
    set({ difficulty: d, best: deckId ? readBest(deckId, d) : null, newBest: false });
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ difficulty: d }));
    } catch {
      // The choice still holds for this visit.
    }
  },

  reset: () => {
    spinSeq++;
    set({
      ...IDLE_RUSH,
      difficulty: get().difficulty,
      spinning: false,
      flash: null,
      newBest: false,
      now: Date.now(),
    });
    syncTicker();
  },
}));

/** End the run, from the live state or from one `applyAnswer` already ended. */
function finish(now: number, from: Store = useRush.getState()) {
  const s = from;
  if (s.phase === 'idle') return;
  if (s.phase === 'over' && useRush.getState().phase === 'over') return;
  const over = s.phase === 'over' ? s : endRush(s, now);
  const run: RushBest = {
    correct: over.correct,
    survivedMs: survivedMs(over, now),
    bestStreak: over.bestStreak,
  };
  const prev = s.best;
  const beat =
    run.correct > 0 &&
    (!prev || run.correct > prev.correct || (run.correct === prev.correct && run.survivedMs > prev.survivedMs));
  spinSeq++;
  // State first, then the sound — never the other way round (see sfx.ts).
  useRush.setState({ ...over, now, spinning: false, best: beat ? run : prev, newBest: beat });
  if (beat && s.deckId) writeBest(s.deckId, over.difficulty, run);
  syncTicker();
  sfx.finish();
}

function flash(kind: Flash['kind']): Flash {
  return { kind, id: ++flashSeq };
}

/**
 * Spin, then settle. The reels animate in the component while `spinning` is
 * true; the result is decided here, up front, and only revealed when the spin
 * ends. A spin that outlives its run (quit, reset, a new run) is dropped by the
 * sequence check.
 */
function runSpin() {
  const id = ++spinSeq;
  const { reels, jackpot, tincho } = spin();
  useRush.setState({ spinning: true, target: reels });
  window.setTimeout(() => {
    if (id !== spinSeq) return;
    const s = useRush.getState();
    if (s.phase !== 'running') return;
    if (jackpot) {
      useRush.setState({
        ...applyJackpot(s, tincho),
        reels,
        spinning: false,
        flash: flash(tincho ? 'tincho' : 'jackpot'),
      });
      sfx.jackpot();
      if (tincho) sfx.tincho();
    } else {
      useRush.setState({ reels, spinning: false });
    }
  }, SPIN_MS);
}

/** Score every answer the reader submits in the exam view while a run is live. */
useQuiz.subscribe((state, prev) => {
  const rush = useRush.getState();
  if (rush.phase !== 'running') return;
  if (!state.deck || state.deck.id !== prev.deck?.id || state.deck.id !== rush.deckId) return;
  const idx = state.progress.currentIdx;
  if (!state.progress.submitted[idx] || prev.progress.submitted[idx]) return;
  const q = state.questions[idx];
  if (!q) return;

  const right = isCorrect(state.progress.answers[idx], q.correct);
  const now = Date.now();
  const next = applyAnswer(rush, right, now);
  if (next.phase === 'over') {
    useRush.setState({ flash: flash('wrong') });
    finish(now, { ...rush, ...next });
    return;
  }
  useRush.setState({ ...next, now, flash: flash(right ? 'correct' : 'wrong') });
  if (right) runSpin();
});

/**
 * One interval while a run is live. It checks the deadline rather than
 * counting, and beeps once a second through the last ten.
 */
let ticker: ReturnType<typeof setInterval> | null = null;
let lastBeep = -1;

function onTick() {
  const s = useRush.getState();
  const now = Date.now();
  if (isExpired(s, now)) {
    finish(now);
    return;
  }
  useRush.setState({ now });
  const secs = Math.ceil((s.endsAt - now) / 1000);
  if (secs <= 10 && secs !== lastBeep) {
    lastBeep = secs;
    sfx.tick();
  }
}

function syncTicker() {
  const running = useRush.getState().phase === 'running';
  if (running && !ticker) {
    lastBeep = -1;
    ticker = setInterval(onTick, 200);
  }
  if (!running && ticker) {
    clearInterval(ticker);
    ticker = null;
  }
}
