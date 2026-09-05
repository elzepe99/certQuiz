/**
 * The narrator. A thin, defensive wrapper over the Web Speech API — chosen
 * because it is the only text-to-speech that costs nothing, needs no key, and
 * survives this app's constraint of being a static bundle with no backend.
 *
 * The API is old and quirky in ways that all show up here:
 *
 * - `getVoices()` is empty on first call in Chrome and fills in asynchronously,
 *   announced by a `voiceschanged` event that some builds fire more than once.
 * - An utterance that is only referenced by the call stack can be garbage
 *   collected mid-sentence, cutting the speech off. The live queue is therefore
 *   held in a module-level array until it finishes.
 * - Chrome stops speaking after roughly 15 seconds unless the synthesiser is
 *   nudged. `pause()` immediately followed by `resume()` on a timer is the
 *   long-standing workaround, and these stems are easily long enough to need it.
 * - `cancel()` fires `onend` on whatever was speaking. Every callback is
 *   therefore gated on a generation token, so a cancelled run cannot advance
 *   the run that replaced it.
 */
import { useEffect, useState } from 'react';

export type SpeakOptions = {
  voiceURI?: string | null;
  rate?: number;
  /** Called as each chunk starts, with its index in the array passed to `speak`. */
  onChunkStart?: (index: number) => void;
  /** Called once when the last chunk finishes — never after `cancel()`. */
  onDone?: () => void;
};

export type SpeakHandle = { cancel: () => void };

const KEEPALIVE_MS = 9000;
/** How often to check that the synthesiser is still actually working. */
const STALL_POLL_MS = 500;
/** Consecutive idle polls before a run is declared dead. */
const STALL_STRIKES = 3;
/**
 * Quiet time allowed at the very start before idle polls count. A cloud voice
 * — which is the good kind, see `voiceQuality` — has to reach a server before
 * it reports itself as speaking or pending, and cutting its reading short would
 * punish exactly the voices worth using.
 */
const STALL_GRACE_MS = 3000;

let generation = 0;
/** Holds the in-flight utterances so the browser cannot collect them mid-sentence. */
const liveQueue: SpeechSynthesisUtterance[] = [];
let keepAlive: ReturnType<typeof setInterval> | null = null;
let stallWatch: ReturnType<typeof setInterval> | null = null;

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function stopKeepAlive() {
  if (keepAlive !== null) {
    clearInterval(keepAlive);
    keepAlive = null;
  }
}

function stopStallWatch() {
  if (stallWatch !== null) {
    clearInterval(stallWatch);
    stallWatch = null;
  }
}

/**
 * Notice a narrator that has died and resolve the run anyway.
 *
 * A dropped `onend` is the failure that matters here: the caller starts the
 * clock when speech finishes, so silence with no callback leaves a question on
 * screen with no timer and no way forward. Polling `speaking`/`pending` catches
 * it in about a second, where a duration-based timeout would take minutes.
 *
 * The strike count is what keeps it from firing in the handover between two
 * queued utterances, and in the moment after `speak()` before the engine picks
 * the first one up — brief windows where both flags can read false. It
 * deliberately does not wait for speech to have started: a synthesiser that
 * drops the queue without ever speaking is the same failure from the caller's
 * side, and needs the same escape.
 */
function startStallWatch(onStalled: () => void) {
  stopStallWatch();
  const openedAt = Date.now();
  let strikes = 0;
  stallWatch = setInterval(() => {
    const s = window.speechSynthesis;
    // The keep-alive below pauses and resumes to dodge Chrome's cutoff, and on
    // some engines — iOS especially — the resume does not take. A paused
    // synthesiser still reports `speaking`, so nothing else here would notice:
    // the reading would hang with no clock and no way forward.
    if (s.paused) {
      s.resume();
      strikes = 0;
      return;
    }
    if (s.speaking || s.pending) {
      strikes = 0;
      return;
    }
    if (Date.now() - openedAt < STALL_GRACE_MS) return;
    strikes++;
    if (strikes >= STALL_STRIKES) {
      stopStallWatch();
      onStalled();
    }
  }, STALL_POLL_MS);
}

function startKeepAlive() {
  stopKeepAlive();
  keepAlive = setInterval(() => {
    const s = window.speechSynthesis;
    if (!s.speaking) {
      stopKeepAlive();
      return;
    }
    if (!s.paused) {
      s.pause();
      s.resume();
    }
  }, KEEPALIVE_MS);
}

/** Silence the narrator and invalidate any pending callbacks. */
export function cancelSpeech() {
  if (!speechSupported()) return;
  generation++;
  liveQueue.length = 0;
  stopKeepAlive();
  stopStallWatch();
  window.speechSynthesis.cancel();
}

/**
 * Speak an ordered list of chunks, resolving through `onDone` when the last one
 * ends. Returns a handle whose `cancel` is safe to call at any point, including
 * after the run has already finished.
 *
 * If speech is unsupported or the list is empty, `onDone` still fires — on a
 * later tick, so callers can rely on it never running before they have wired
 * up the rest of their effect.
 */
export function speak(chunks: Array<{ text: string }>, opts: SpeakOptions = {}): SpeakHandle {
  cancelSpeech();
  const myGeneration = generation;
  const done = () => {
    if (generation === myGeneration) opts.onDone?.();
  };

  if (!speechSupported() || chunks.length === 0) {
    const t = setTimeout(done, 0);
    return { cancel: () => clearTimeout(t) };
  }

  const synth = window.speechSynthesis;
  const voice = opts.voiceURI ? findVoice(opts.voiceURI) : null;

  const utterances = chunks.map((chunk, i) => {
    const u = new SpeechSynthesisUtterance(chunk.text);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.rate = clampRate(opts.rate);
    u.onstart = () => {
      if (generation === myGeneration) opts.onChunkStart?.(i);
    };
    if (i === chunks.length - 1) {
      const settle = () => {
        stopKeepAlive();
        stopStallWatch();
        done();
      };
      u.onend = settle;
      // A voice that fails mid-run must not strand the question with a clock
      // that never starts, so an error resolves the same way an end does.
      u.onerror = settle;
    }
    return u;
  });

  liveQueue.push(...utterances);
  for (const u of utterances) synth.speak(u);
  startKeepAlive();
  startStallWatch(() => {
    stopKeepAlive();
    done();
  });

  return { cancel: cancelSpeech };
}

/**
 * Unlock the synthesiser from inside a user gesture.
 *
 * Safari on iOS only lets speech start from a real user action, and it stays
 * unlocked for the rest of the page afterwards. Blitz's first real utterance
 * happens about three seconds after the Start button, once the 3-2-1 has run
 * and an effect fires — far too late to count as a gesture — so without this
 * the narrator would simply never speak on an iPhone, silently, with the clock
 * starting immediately instead.
 *
 * A silent space is enough to do the unlocking, and the run's own `speak()`
 * cancels the queue before saying anything real.
 */
export function primeSpeech() {
  if (!speechSupported()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    // An engine that refuses this will refuse the real utterance too; the
    // stall watch is what keeps the run moving in that case.
  }
}

/** Speak a single line, for the lobby's voice preview. */
export function speakSample(text: string, opts: SpeakOptions = {}): SpeakHandle {
  return speak([{ text }], opts);
}

function clampRate(rate: number | undefined): number {
  const n = Number(rate);
  if (!Number.isFinite(n)) return 1;
  return Math.min(2, Math.max(0.5, n));
}

function findVoice(uri: string): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  return window.speechSynthesis.getVoices().find((v) => v.voiceURI === uri) ?? null;
}

export type VoiceQuality = 'natural' | 'enhanced' | 'standard';

/**
 * How human a voice is likely to sound, read off its name.
 *
 * There is no API for this — `SpeechSynthesisVoice` exposes name, lang and
 * `localService`, and none of them says "neural". The vendors do label their
 * good voices in the name, though, and consistently enough to sort on:
 *
 * - Edge streams Microsoft's neural voices as "Microsoft Aria Online
 *   (Natural) - English (United States)". These are the best thing available in
 *   a browser for free, and the difference against the built-in Windows voices
 *   is not subtle.
 * - Apple marks its better voices "(Enhanced)" or "(Premium)".
 * - Chrome on Android and ChromeOS ships "Google …" voices, a clear step up
 *   from the old desktop ones.
 *
 * Everything else — notably the Microsoft David / Zira / Mark set that Chrome
 * on Windows exposes, which are SAPI5 voices from the 2000s — is `standard`,
 * which here is a polite word for robotic.
 */
export function voiceQuality(voice: SpeechSynthesisVoice): VoiceQuality {
  const name = voice.name;
  if (/\b(natural|neural)\b/i.test(name)) return 'natural';
  if (/\((enhanced|premium)\)/i.test(name) || /^Google\s/i.test(name)) return 'enhanced';
  return 'standard';
}

const QUALITY_RANK: Record<VoiceQuality, number> = { natural: 0, enhanced: 1, standard: 2 };

/**
 * Voices, best first: matching language before other English before the rest,
 * then by how human it sounds.
 *
 * Language outranks quality on purpose — a superb French voice reading an
 * English stem is worse than a plain English one. `localService` is only the
 * final tiebreak, and deliberately *not* higher: an earlier version preferred
 * local voices outright, which on Edge sorted all 400 neural voices below
 * Microsoft David and defaulted every new player to the worst option on the
 * machine.
 */
export function sortVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const uiLang = (typeof navigator !== 'undefined' ? navigator.language : 'en-US') || 'en-US';
  const langRank = (v: SpeechSynthesisVoice) => {
    if (v.lang === uiLang) return 0;
    if (v.lang.startsWith('en')) return 1;
    return 2;
  };
  return [...voices].sort(
    (a, b) =>
      langRank(a) - langRank(b) ||
      QUALITY_RANK[voiceQuality(a)] - QUALITY_RANK[voiceQuality(b)] ||
      Number(b.localService) - Number(a.localService) ||
      a.name.localeCompare(b.name),
  );
}

/** True when at least one voice on this machine is worth listening to. */
export function hasNaturalVoice(voices: SpeechSynthesisVoice[]): boolean {
  return voices.some((v) => voiceQuality(v) === 'natural');
}

/** Best default voice for a fresh install: the most human English one there is. */
export function defaultVoiceURI(voices: SpeechSynthesisVoice[]): string | null {
  const sorted = sortVoices(voices);
  return sorted.find((v) => v.lang.startsWith('en'))?.voiceURI ?? sorted[0]?.voiceURI ?? null;
}

/**
 * The voice list, kept current. Empty on the first render in Chrome — the
 * `voiceschanged` listener is what fills it, so components must tolerate a
 * frame or two with nothing in it rather than concluding speech is unavailable.
 */
export function useVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() =>
    speechSupported() ? sortVoices(window.speechSynthesis.getVoices()) : [],
  );

  useEffect(() => {
    if (!speechSupported()) return;
    const synth = window.speechSynthesis;
    const read = () => setVoices(sortVoices(synth.getVoices()));
    read();
    synth.addEventListener('voiceschanged', read);
    return () => synth.removeEventListener('voiceschanged', read);
  }, []);

  return voices;
}
