/**
 * Focus mode's timer, as pure functions. The store in `state/focusStore.ts`
 * holds the state; this file only says what the state means.
 *
 * Time is a *deadline*, never a counter. A countdown kept in state drifts when
 * a background tab throttles its interval, and the Blitz verdict screen already
 * showed what a counter read in the same commit as its reset does. With a
 * deadline, the remaining time is always `endsAt - now`, however late the tick.
 */

export const FOCUS_MINUTES = [25, 45, 50, 60] as const;
export const BREAK_MINUTES = [5, 10, 15] as const;

export const DEFAULT_FOCUS_MINUTES = 25;
export const DEFAULT_BREAK_MINUTES = 5;

/**
 * `breakDone` is the one phase that waits: the break has ended and the next
 * focus block starts only when the reader says so. A focus block ending rolls
 * straight into its break, because that is the moment a reader most wants to
 * keep going and most needs to stop.
 */
export type Phase = 'idle' | 'focus' | 'break' | 'breakDone';

export type TimerState = {
  phase: Phase;
  /** Epoch ms the running phase ends. Null when idle, waiting or paused. */
  endsAt: number | null;
  /** Seconds left when paused; null when not paused. */
  pausedRemaining: number | null;
  roundsDone: number;
};

export const IDLE: TimerState = {
  phase: 'idle',
  endsAt: null,
  pausedRemaining: null,
  roundsDone: 0,
};

/** Whole seconds left in the running or paused phase. */
export function remainingSeconds(t: TimerState, now: number): number {
  if (t.pausedRemaining !== null) return t.pausedRemaining;
  if (t.endsAt === null) return 0;
  return Math.max(0, Math.ceil((t.endsAt - now) / 1000));
}

export function isRunning(t: TimerState): boolean {
  return (t.phase === 'focus' || t.phase === 'break') && t.endsAt !== null;
}

export function startFocus(t: TimerState, focusMin: number, now: number): TimerState {
  return { ...t, phase: 'focus', endsAt: now + focusMin * 60_000, pausedRemaining: null };
}

export function pause(t: TimerState, now: number): TimerState {
  if (!isRunning(t)) return t;
  return { ...t, endsAt: null, pausedRemaining: remainingSeconds(t, now) };
}

export function resume(t: TimerState, now: number): TimerState {
  if (t.pausedRemaining === null) return t;
  return { ...t, endsAt: now + t.pausedRemaining * 1000, pausedRemaining: null };
}

/**
 * What the phase that just finished (or was skipped) turns into. A completed
 * focus block counts as a round whether it ran out or was skipped, since a
 * skip is the reader deciding they are done with it.
 */
export function advance(t: TimerState, breakMin: number, now: number): TimerState {
  if (t.phase === 'focus') {
    return {
      phase: 'break',
      endsAt: now + breakMin * 60_000,
      pausedRemaining: null,
      roundsDone: t.roundsDone + 1,
    };
  }
  if (t.phase === 'break') {
    return { ...t, phase: 'breakDone', endsAt: null, pausedRemaining: null };
  }
  return t;
}

/** True when a running phase's deadline has passed. */
export function isDue(t: TimerState, now: number): boolean {
  return isRunning(t) && t.endsAt !== null && now >= t.endsAt;
}

export function formatMMSS(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
