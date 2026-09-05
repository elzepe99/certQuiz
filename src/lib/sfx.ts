/**
 * The sounds. Synthesised with the Web Audio API rather than shipped as audio
 * files, for the same reason the narrator uses the browser's own voice: this
 * app is a static bundle with no backend, and a set of MP3s would be more bytes
 * than the entire JavaScript payload.
 *
 * Everything is a short envelope over one or two oscillators. Keep them under
 * half a second — these fire between questions, and a sound the player is still
 * waiting out is a sound they will turn off.
 *
 * An `AudioContext` created before a user gesture starts suspended in every
 * modern browser, so `unlock()` is called from the Start button rather than at
 * module load.
 */

let ctx: AudioContext | null = null;
let muted = false;

type Ctor = typeof AudioContext;

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctor: Ctor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

/** Call from a click handler before the first sound of a session. */
export function unlockAudio() {
  const c = audioCtx();
  if (c && c.state === 'suspended') void c.resume();
}

export function setMuted(value: boolean) {
  muted = value;
}

type ToneSpec = {
  freq: number;
  /** Seconds from now. */
  at?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  /** Glide to this frequency across the note, for sirens and thuds. */
  slideTo?: number;
};

/**
 * Play one note, and never throw doing it.
 *
 * The try/catch is the important part. These sounds are fired from the Blitz
 * store at the moment an answer is committed, so an exception here — an
 * AudioContext that has been closed or is otherwise unusable will reject
 * `createOscillator` — would escape into game logic that has not yet written
 * its state. A failure to make a noise must never be able to swallow the
 * player's answer.
 */
function tone(spec: ToneSpec) {
  const c = audioCtx();
  if (!c || muted) return;
  try {
    const start = c.currentTime + (spec.at ?? 0);
    const dur = spec.dur ?? 0.12;
    const peak = spec.gain ?? 0.14;

    const osc = c.createOscillator();
    osc.type = spec.type ?? 'sine';
    osc.frequency.setValueAtTime(spec.freq, start);
    if (spec.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.slideTo), start + dur);
    }

    // A ramped envelope rather than a raw start/stop: switching an oscillator on
    // at full amplitude produces an audible click on every sound.
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  } catch {
    // A silent game is a working game.
  }
}

export const sfx = {
  /** One step of the 3-2-1. `final` is the "GO". */
  countdown(final = false) {
    if (final) tone({ freq: 880, dur: 0.22, type: 'triangle', gain: 0.16 });
    else tone({ freq: 440, dur: 0.1, type: 'triangle', gain: 0.12 });
  },

  /** Fires while the clock is draining, once a second in the last few. */
  tick() {
    tone({ freq: 1200, dur: 0.04, type: 'square', gain: 0.05 });
  },

  /** A tap on an option, before it is locked in. */
  select() {
    tone({ freq: 660, dur: 0.05, type: 'sine', gain: 0.07 });
  },

  correct() {
    tone({ freq: 523.25, dur: 0.1, type: 'sine' });
    tone({ freq: 659.25, at: 0.08, dur: 0.1, type: 'sine' });
    tone({ freq: 783.99, at: 0.16, dur: 0.2, type: 'sine' });
  },

  wrong() {
    tone({ freq: 200, slideTo: 110, dur: 0.3, type: 'sawtooth', gain: 0.1 });
  },

  /** Ran out of clock — deliberately flatter than a wrong answer. */
  timeout() {
    tone({ freq: 300, slideTo: 90, dur: 0.4, type: 'triangle', gain: 0.1 });
  },

  /** End of run. */
  finish() {
    tone({ freq: 523.25, dur: 0.14 });
    tone({ freq: 659.25, at: 0.12, dur: 0.14 });
    tone({ freq: 783.99, at: 0.24, dur: 0.14 });
    tone({ freq: 1046.5, at: 0.36, dur: 0.34 });
  },
};
