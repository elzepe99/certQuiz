import { create } from 'zustand';
import {
  BREAK_MINUTES,
  DEFAULT_BREAK_MINUTES,
  DEFAULT_FOCUS_MINUTES,
  FOCUS_MINUTES,
  IDLE,
  advance,
  isDue,
  isRunning,
  pause as pauseTimer,
  resume as resumeTimer,
  startFocus,
  type TimerState,
} from '@/lib/pomodoro';
import {
  chime,
  setMusicVolume,
  startMusic,
  stopMusic,
  unlockFocusAudio,
} from '@/lib/focusMusic';

/**
 * Focus mode: an optional Pomodoro and generative music, behind the timer
 * button in the top bar.
 *
 * It never reads or writes `quiz:progress:*`. A focus block is about the
 * reader's attention, not about the deck, so it is shared by every deck and
 * survives navigating between them — which is also why it lives in a module
 * store rather than in a component that unmounts with its route.
 *
 * The music is independent of the timer by design: it plays until it is
 * switched off, through breaks included.
 */

const SETTINGS_KEY = 'quiz:focus:settings';
const TIMER_KEY = 'quiz:focus:timer';

type Settings = { focusMin: number; breakMin: number; volume: number };

type FocusState = TimerState &
  Settings & {
    musicOn: boolean;
    /** Ticks once a second while a phase runs, so subscribers repaint. */
    now: number;
    start: () => void;
    pause: () => void;
    resume: () => void;
    skip: () => void;
    reset: () => void;
    setFocusMin: (m: number) => void;
    setBreakMin: (m: number) => void;
    toggleMusic: () => void;
    setVolume: (v: number) => void;
  };

function read<T>(key: string): Partial<T> {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<T>) : {};
  } catch {
    return {};
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A timer that forgets itself on reload still works today.
  }
}

function loadSettings(): Settings {
  const s = read<Settings>(SETTINGS_KEY);
  return {
    focusMin: (FOCUS_MINUTES as readonly number[]).includes(s.focusMin as number)
      ? (s.focusMin as number)
      : DEFAULT_FOCUS_MINUTES,
    breakMin: (BREAK_MINUTES as readonly number[]).includes(s.breakMin as number)
      ? (s.breakMin as number)
      : DEFAULT_BREAK_MINUTES,
    volume: typeof s.volume === 'number' ? Math.max(0, Math.min(1, s.volume)) : 0.6,
  };
}

/**
 * Restore a timer saved before a reload, catching up on any phase that ran out
 * while the page was closed — measured from when it *ended*, not from now, so
 * a break that would already be over is not handed back in full. No chime for
 * those: the reader was not here to hear the moment pass.
 */
function loadTimer(breakMin: number): TimerState {
  const t = { ...IDLE, ...read<TimerState>(TIMER_KEY) };
  if (!['idle', 'focus', 'break', 'breakDone'].includes(t.phase)) return IDLE;
  let out: TimerState = t;
  const now = Date.now();
  while (isDue(out, now)) out = advance(out, breakMin, out.endsAt!);
  return out;
}

const settings = loadSettings();
setMusicVolume(settings.volume);

export const useFocus = create<FocusState>((set, get) => {
  const saveTimer = () => {
    const { phase, endsAt, pausedRemaining, roundsDone } = get();
    write(TIMER_KEY, { phase, endsAt, pausedRemaining, roundsDone });
  };
  const saveSettings = () => {
    const { focusMin, breakMin, volume } = get();
    write(SETTINGS_KEY, { focusMin, breakMin, volume });
  };
  const timer = (t: TimerState) => {
    set({ ...t, now: Date.now() });
    saveTimer();
    syncTicker();
  };

  return {
    ...settings,
    ...loadTimer(settings.breakMin),
    musicOn: false,
    now: Date.now(),

    start: () => {
      unlockFocusAudio();
      timer(startFocus(get(), get().focusMin, Date.now()));
    },
    pause: () => timer(pauseTimer(get(), Date.now())),
    resume: () => {
      unlockFocusAudio();
      timer(resumeTimer(get(), Date.now()));
    },
    skip: () => {
      const t = get();
      timer(advance({ ...t, pausedRemaining: null }, t.breakMin, Date.now()));
    },
    reset: () => timer({ ...IDLE }),

    setFocusMin: (m) => {
      set({ focusMin: m });
      saveSettings();
    },
    setBreakMin: (m) => {
      set({ breakMin: m });
      saveSettings();
    },

    toggleMusic: () => {
      const on = !get().musicOn;
      if (on) startMusic();
      else stopMusic();
      set({ musicOn: on });
    },
    setVolume: (v) => {
      setMusicVolume(v);
      set({ volume: v });
      saveSettings();
    },
  };
});

/**
 * One interval for the whole app, alive only while a phase runs. It checks the
 * deadline rather than counting, so a throttled background tab is late by a
 * tick at worst, never wrong.
 */
let ticker: ReturnType<typeof setInterval> | null = null;

function onTick() {
  const s = useFocus.getState();
  const now = Date.now();
  if (isDue(s, now)) {
    const next = advance(s, s.breakMin, now);
    // State first, then the bell: a best-effort sound never goes ahead of the
    // change it announces.
    useFocus.setState({ ...next, now });
    write(TIMER_KEY, {
      phase: next.phase,
      endsAt: next.endsAt,
      pausedRemaining: next.pausedRemaining,
      roundsDone: next.roundsDone,
    });
    chime(s.phase === 'focus' ? 'down' : 'up');
    syncTicker();
    return;
  }
  useFocus.setState({ now });
}

function syncTicker() {
  const running = isRunning(useFocus.getState());
  if (running && !ticker) ticker = setInterval(onTick, 1000);
  if (!running && ticker) {
    clearInterval(ticker);
    ticker = null;
  }
}

syncTicker();
