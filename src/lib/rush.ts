/**
 * Jackpot Rush — the pure half. A survival clock laid over the normal exam
 * view: four minutes to start, +60s for every right answer, −15s for every
 * wrong one, and a slot machine that spins on each right answer and pays
 * another +60s on three of a kind.
 *
 * No React, no timers, no storage here, so `scripts/test-rush.mjs` can drive it
 * with a fixed clock and a seeded dice.
 *
 * Time is a deadline (`endsAt`), never a counter — the Blitz verdict-screen
 * lesson. A throttled background tab is late repainting, never wrong.
 */

export const START_MS = 4 * 60_000;
export const CORRECT_BONUS_MS = 60_000;
export const WRONG_PENALTY_MS = 15_000;
export const JACKPOT_BONUS_MS = 60_000;
/** Probability that a spin lands three of a kind. */
export const JACKPOT_ODDS = 1 / 8;

export const SYMBOLS = ['🍒', '🍋', '🔔', '⭐', '💎', '7️⃣'] as const;
export type Symbol = (typeof SYMBOLS)[number];
export type Reels = [Symbol, Symbol, Symbol];

export type RushPhase = 'idle' | 'running' | 'over';

export type RushState = {
  phase: RushPhase;
  endsAt: number;
  /** Frozen remaining time once the run is over, for the results card. */
  finalMs: number;
  streak: number;
  bestStreak: number;
  correct: number;
  wrong: number;
  jackpots: number;
  /** Total time earned on top of the starting four minutes. */
  bonusMs: number;
  startedAt: number;
  endedAt: number;
};

export const IDLE_RUSH: RushState = {
  phase: 'idle',
  endsAt: 0,
  finalMs: 0,
  streak: 0,
  bestStreak: 0,
  correct: 0,
  wrong: 0,
  jackpots: 0,
  bonusMs: 0,
  startedAt: 0,
  endedAt: 0,
};

export function startRush(now: number): RushState {
  return { ...IDLE_RUSH, phase: 'running', endsAt: now + START_MS, startedAt: now };
}

export function remainingMs(s: RushState, now: number): number {
  if (s.phase === 'over') return s.finalMs;
  if (s.phase !== 'running') return START_MS;
  return Math.max(0, s.endsAt - now);
}

export function isExpired(s: RushState, now: number): boolean {
  return s.phase === 'running' && now >= s.endsAt;
}

export function endRush(s: RushState, now: number): RushState {
  if (s.phase !== 'running') return s;
  return { ...s, phase: 'over', finalMs: Math.max(0, s.endsAt - now), endedAt: now };
}

/**
 * Score one submitted answer. A wrong answer that takes the clock below zero
 * ends the run on the spot rather than leaving it to the next tick.
 */
export function applyAnswer(s: RushState, correct: boolean, now: number): RushState {
  if (s.phase !== 'running' || now >= s.endsAt) return s;
  if (correct) {
    const streak = s.streak + 1;
    return {
      ...s,
      endsAt: s.endsAt + CORRECT_BONUS_MS,
      bonusMs: s.bonusMs + CORRECT_BONUS_MS,
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
      correct: s.correct + 1,
    };
  }
  const next: RushState = {
    ...s,
    endsAt: s.endsAt - WRONG_PENALTY_MS,
    streak: 0,
    wrong: s.wrong + 1,
  };
  return now >= next.endsAt ? endRush(next, now) : next;
}

export function applyJackpot(s: RushState): RushState {
  if (s.phase !== 'running') return s;
  return {
    ...s,
    endsAt: s.endsAt + JACKPOT_BONUS_MS,
    bonusMs: s.bonusMs + JACKPOT_BONUS_MS,
    jackpots: s.jackpots + 1,
  };
}

/**
 * Spin the three reels. Independent reels over six symbols would pay 1 in 36,
 * which makes the jackpot a rumour; instead the triple is rolled first at
 * exactly `JACKPOT_ODDS`, and a losing spin is redrawn until it is not three of
 * a kind. Two of a kind still happens often, which is the near miss that keeps
 * a slot machine fun.
 */
export function spin(rand: () => number = Math.random): { reels: Reels; jackpot: boolean } {
  const pick = () => SYMBOLS[Math.floor(rand() * SYMBOLS.length) % SYMBOLS.length];
  if (rand() < JACKPOT_ODDS) {
    const s = pick();
    return { reels: [s, s, s], jackpot: true };
  }
  for (;;) {
    const reels: Reels = [pick(), pick(), pick()];
    if (!(reels[0] === reels[1] && reels[1] === reels[2])) return { reels, jackpot: false };
  }
}

/**
 * How hot the run is, from the current streak. Drives the lights: 0 is calm,
 * 1 a glow at the screen edge, 2 colour cycling, 3 the whole stage warping.
 */
export type Heat = 0 | 1 | 2 | 3;

export function heatFor(streak: number): Heat {
  if (streak >= 8) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1;
  return 0;
}

export const HEAT_LABEL: Record<Heat, string> = {
  0: '',
  1: 'Heating up',
  2: 'On fire',
  3: 'Unstoppable',
};

/** m:ss, rounding up so the clock never shows 0:00 while time is left. */
export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Survival time is the score: how long the run lasted. */
export function survivedMs(s: RushState, now: number): number {
  if (s.phase === 'idle') return 0;
  const end = s.phase === 'over' ? s.endedAt : Math.min(now, s.endsAt);
  return Math.max(0, end - s.startedAt);
}
