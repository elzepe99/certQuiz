/**
 * Focus music — composed live in the browser, never played back.
 *
 * Why generative rather than a few tracks: the ask was music that does not get
 * repetitive, and any finite playlist does, while this app is a static bundle
 * where a handful of MP3s would outweigh all of its JavaScript. So nothing is
 * downloaded and nothing loops. Three layers, each driven by chance:
 *
 *  - a **pad** of soft seventh chords, chosen by a small Markov chain over the
 *    key's diatonic chords, each held 12–20 seconds and cross-faded;
 *  - sparse **bell notes** on the key's pentatonic scale, walking up and down
 *    at random intervals, with long silences now and then;
 *  - a **key change** every three to six minutes, by a fourth or a fifth, so no
 *    harmonic colour settles in for the whole session.
 *
 * The pentatonic is a deliberate choice: it has no semitones, so a bell note
 * can land over any of the diatonic chords without a clash, which is what lets
 * the melody be random without ever sounding wrong.
 *
 * Like `sfx.ts`, every call into Web Audio is wrapped so a failure is silence,
 * never an exception, and the context is created or resumed only from a click.
 * This module has its own `AudioContext`, separate from the game sounds, so
 * Blitz muting its effects never touches the music.
 */

type Ctor = typeof AudioContext;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bus: GainNode | null = null;
let filter: BiquadFilterNode | null = null;

let playing = false;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let volume = 0.6;

// Composition state. Times are in AudioContext seconds.
let keyRoot = 50; // D3, as a MIDI note
let degree = 0; // current chord, 0 = I
let nextChordAt = 0;
let nextNoteAt = 0;
let nextModulationAt = 0;
let melodyIdx = 5;

/**
 * Lookahead. Events are scheduled this far ahead of the audio clock, which is
 * what keeps the music steady when the interval driving it fires late — a
 * hidden tab can delay timers by a second, and an audible one is exempt from
 * Chrome's harsher throttling anyway.
 */
const LOOKAHEAD = 3;
const TICK_MS = 250;
const MAX_GAIN = 0.55;

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const PENTATONIC = [0, 2, 4, 7, 9];

/** Which chords may follow which, by scale degree (0 = I … 5 = vi). */
const NEXT: Record<number, number[]> = {
  0: [3, 5, 1, 2, 4, 3, 5],
  1: [4, 3, 5],
  2: [5, 3],
  3: [0, 1, 5, 4, 0],
  4: [5, 0, 3],
  5: [3, 1, 0, 2, 3],
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const C: Ctor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
  if (!C) return null;
  try {
    ctx = new C();
  } catch {
    return null;
  }
  return ctx;
}

/** A few seconds of decaying stereo noise: a cheap, convincing room. */
function impulse(c: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
  }
  return buf;
}

/**
 * voices → bus → lowpass → (dry + reverb) → master → speakers. The lowpass
 * drifts slowly on its own, so even a held chord keeps moving a little.
 */
function ensureGraph(c: AudioContext) {
  if (master) return;
  master = c.createGain();
  master.gain.value = 0.0001;
  master.connect(c.destination);

  filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1400;
  filter.Q.value = 0.4;

  const lfo = c.createOscillator();
  lfo.frequency.value = 0.03;
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 500;
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  const dry = c.createGain();
  dry.gain.value = 0.55;
  const wet = c.createGain();
  wet.gain.value = 0.6;
  const reverb = c.createConvolver();
  reverb.buffer = impulse(c, 4.5);

  bus = c.createGain();
  bus.connect(filter);
  filter.connect(dry).connect(master);
  filter.connect(reverb).connect(wet).connect(master);
}

function scaleNote(deg: number, octave = 0): number {
  const o = Math.floor(deg / 7);
  return keyRoot + MAJOR[((deg % 7) + 7) % 7] + 12 * (o + octave);
}

/** One sustained voice: two slightly detuned oscillators under a slow swell. */
function padVoice(c: AudioContext, midi: number, start: number, end: number, peak: number) {
  if (!bus) return;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + rand(3, 5));
  g.gain.setValueAtTime(peak, end);
  g.gain.exponentialRampToValueAtTime(0.0001, end + 6);
  g.connect(bus);
  for (const [type, cents] of [
    ['sine', -4],
    ['triangle', 5],
  ] as const) {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = hz(midi);
    o.detune.value = cents;
    o.connect(g);
    o.start(start);
    o.stop(end + 6.2);
  }
}

function scheduleChord(c: AudioContext, at: number): number {
  if (at >= nextModulationAt) {
    // Up a fourth or a fifth, folded back into a comfortable register.
    keyRoot += pick([5, 7, -5, -7]);
    while (keyRoot > 55) keyRoot -= 12;
    while (keyRoot < 45) keyRoot += 12;
    degree = 0;
    nextModulationAt = at + rand(180, 360);
  } else {
    degree = pick(NEXT[degree]);
  }

  const dur = rand(12, 20);
  // Seventh chord, root dropped an octave as a soft bass, the rest spread out.
  const notes = [
    scaleNote(degree, -1),
    scaleNote(degree + 2),
    scaleNote(degree + 4),
    scaleNote(degree + 6),
  ];
  if (Math.random() < 0.5) notes.push(scaleNote(degree + 8)); // add the ninth
  const peak = 0.05 / Math.sqrt(notes.length);
  for (const n of notes) padVoice(c, n, at, at + dur, peak);

  // The next chord swells in under the tail of this one.
  return at + dur - 3;
}

function scheduleBell(c: AudioContext, at: number): number {
  if (!bus) return at + 4;
  melodyIdx += pick([-2, -1, -1, 1, 1, 2, 0]);
  melodyIdx = Math.max(0, Math.min(11, melodyIdx));
  const step = PENTATONIC[melodyIdx % 5] + 12 * Math.floor(melodyIdx / 5);
  const midi = keyRoot + 19 + step; // two octaves up, give or take

  const peak = rand(0.02, 0.045);
  const decay = rand(2.5, 4.5);
  for (const [mult, level] of [
    [1, 1],
    [2, 0.25],
    [3, 0.08],
  ] as const) {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = hz(midi) * mult;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak * level, at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, at + decay / mult);
    o.connect(g).connect(bus);
    o.start(at);
    o.stop(at + decay + 0.1);
  }

  // Mostly a few seconds apart, sometimes a long rest so it never becomes a tune.
  return at + (Math.random() < 0.22 ? rand(8, 16) : rand(1.4, 5));
}

function tick() {
  const c = ctx;
  if (!c || !playing) return;
  try {
    const horizon = c.currentTime + LOOKAHEAD;
    while (nextChordAt < horizon) nextChordAt = scheduleChord(c, nextChordAt);
    while (nextNoteAt < horizon) nextNoteAt = scheduleBell(c, nextNoteAt);
  } catch {
    // A dropped chord is better than a stuck page.
  }
}

/** Call from a click. Fades in over three seconds. */
export function startMusic() {
  const c = audioCtx();
  if (!c) return;
  try {
    if (c.state === 'suspended') void c.resume();
    ensureGraph(c);
    const now = c.currentTime;
    if (nextChordAt < now) {
      nextChordAt = now + 0.1;
      nextNoteAt = now + rand(3, 6);
      if (nextModulationAt < now) nextModulationAt = now + rand(180, 360);
    }
    master!.gain.cancelScheduledValues(now);
    master!.gain.setValueAtTime(Math.max(0.0001, master!.gain.value), now);
    master!.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * MAX_GAIN), now + 3);
    playing = true;
    if (!tickTimer) tickTimer = setInterval(tick, TICK_MS);
    tick();
  } catch {
    playing = false;
  }
}

/** Fades out over two and a half seconds; what is already ringing dies away. */
export function stopMusic() {
  playing = false;
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
  const c = ctx;
  if (!c || !master) return;
  try {
    const now = c.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
  } catch {
    // Already silent is fine.
  }
}

/** 0..1. Applied smoothly so dragging the slider does not crackle. */
export function setMusicVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  const c = ctx;
  if (!c || !master || !playing) return;
  try {
    master.gain.setTargetAtTime(Math.max(0.0001, volume * MAX_GAIN), c.currentTime, 0.15);
  } catch {
    // ignore
  }
}

/** Call from any click so a later chime can sound. */
export function unlockFocusAudio() {
  const c = audioCtx();
  if (c && c.state === 'suspended') void c.resume();
}

/**
 * The bell between phases. It goes straight to the speakers rather than
 * through the music's master, so it is heard with the music off.
 * `down` closes a focus block, `up` calls the reader back from a break.
 */
export function chime(direction: 'down' | 'up') {
  const c = audioCtx();
  if (!c) return;
  try {
    const notes = direction === 'down' ? [79, 76, 72] : [72, 76, 79];
    notes.forEach((midi, i) => {
      const at = c.currentTime + 0.05 + i * 0.32;
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = hz(midi);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.16, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.8);
      o.connect(g).connect(c.destination);
      o.start(at);
      o.stop(at + 1.9);
    });
  } catch {
    // A missed bell still leaves the timer right.
  }
}
