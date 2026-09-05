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
 *   collected mid-sentence, cutting the speech off. The one in flight is
 *   therefore held in a module-level reference until it finishes.
 * - `cancel()` fires `onend` on whatever was speaking. Every callback is
 *   therefore gated on a generation token, so a cancelled run cannot advance
 *   the run that replaced it.
 * - An utterance can fail, and a whole queue handed to the engine at once can
 *   be dropped when one of its members does.
 *
 * That last one is why chunks are spoken **one at a time**, each starting the
 * next from its own `onend`, rather than being queued together. Queueing was
 * the first design and it cut long questions off mid-sentence: a single failed
 * chunk — routine with the streamed neural voices, which fetch audio per
 * utterance — took the rest of the reading with it, and the more chunks a
 * question had, the likelier it was to happen. Speaking them one at a time
 * means a bad chunk costs one chunk.
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

/** How often to check that the synthesiser is still actually working. */
const STALL_POLL_MS = 500;
/**
 * Silence for this long, with the engine reporting nothing in flight, counts as
 * a chunk that will never finish.
 *
 * Deliberately generous. The good voices are streamed — Edge fetches audio from
 * a server for every utterance — so a gap of a second or two between chunks is
 * normal, not a fault. The earlier value of 1.5s tripped on those gaps and cut
 * long questions off part-way through.
 */
const STALL_IDLE_MS = 4000;

let generation = 0;
/** Holds the utterance in flight so the browser cannot collect it mid-sentence. */
const liveUtterance: SpeechSynthesisUtterance[] = [];
let stallWatch: ReturnType<typeof setInterval> | null = null;

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function stopStallWatch() {
  if (stallWatch !== null) {
    clearInterval(stallWatch);
    stallWatch = null;
  }
}

/** Silence the narrator and invalidate any pending callbacks. */
export function cancelSpeech() {
  if (!speechSupported()) return;
  generation++;
  liveUtterance.length = 0;
  stopStallWatch();
  window.speechSynthesis.cancel();
}

/**
 * Speak an ordered list of chunks, resolving through `onDone` when the last one
 * ends. Returns a handle whose `cancel` is safe to call at any point, including
 * after the run has already finished.
 *
 * Chunks are spoken one at a time. A chunk that errors is skipped rather than
 * ending the reading, and a chunk that goes silent without reporting anything
 * is stepped over by the stall watch — so the worst a broken utterance costs is
 * itself, not everything after it.
 *
 * If speech is unsupported or the list is empty, `onDone` still fires — on a
 * later tick, so callers can rely on it never running before they have wired up
 * the rest of their effect.
 */
export function speak(chunks: Array<{ text: string }>, opts: SpeakOptions = {}): SpeakHandle {
  cancelSpeech();
  const myGeneration = generation;
  const mine = () => generation === myGeneration;

  let settled = false;
  const finish = () => {
    if (settled || !mine()) return;
    settled = true;
    stopStallWatch();
    opts.onDone?.();
  };

  if (!speechSupported() || chunks.length === 0) {
    const t = setTimeout(finish, 0);
    return { cancel: () => clearTimeout(t) };
  }

  const synth = window.speechSynthesis;
  const voice = opts.voiceURI ? findVoice(opts.voiceURI) : null;
  const rate = clampRate(opts.rate);

  let index = -1;
  let lastActivity = Date.now();
  const markActive = () => {
    lastActivity = Date.now();
  };

  const speakAt = (i: number) => {
    if (!mine()) return;
    if (i >= chunks.length) {
      finish();
      return;
    }
    index = i;
    markActive();

    const u = new SpeechSynthesisUtterance(chunks[i].text);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.rate = rate;
    u.onstart = () => {
      markActive();
      if (mine()) opts.onChunkStart?.(i);
    };
    // Both handlers check `i === index`: an utterance the stall watch has
    // already stepped past must not move the pointer a second time. Without
    // that, a chunk that was merely slow rather than dead would fire `onend`
    // after we had moved on, re-queueing the next chunk — and each duplicate
    // would advance again, so the rest of the question came out twice.
    u.onend = () => {
      markActive();
      if (mine() && i === index) speakAt(i + 1);
    };
    u.onerror = (event) => {
      markActive();
      if (!mine() || i !== index) return;
      // `cancel()` reports itself as an error on whatever was speaking. That is
      // us stopping the run, not a fault, and must not restart it.
      const reason = (event as SpeechSynthesisErrorEvent).error;
      if (reason === 'canceled' || reason === 'interrupted') return;
      // Anything else is one bad chunk. Keep reading.
      speakAt(i + 1);
    };

    liveUtterance.length = 0;
    liveUtterance.push(u);
    synth.speak(u);
  };

  // The engine can also go quiet without reporting anything at all — a dropped
  // stream, a voice that simply stops. Nothing else here would notice, and the
  // question would sit half-read. Stepping to the next chunk always makes
  // progress, so this cannot loop.
  stopStallWatch();
  stallWatch = setInterval(() => {
    if (!mine()) {
      stopStallWatch();
      return;
    }
    const live = window.speechSynthesis;
    if (live.paused) {
      live.resume();
      markActive();
      return;
    }
    if (live.speaking || live.pending) {
      markActive();
      return;
    }
    if (Date.now() - lastActivity < STALL_IDLE_MS) return;
    markActive();
    // Take the stuck chunk off the engine before queuing the next one.
    // `speak()` appends rather than replaces, so without this the stalled
    // utterance would still be sitting there and could play — and finish —
    // behind the chunk we just moved on to. Its `canceled` error is ignored by
    // the handler above.
    live.cancel();
    speakAt(index + 1);
  }, STALL_POLL_MS);

  speakAt(0);

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

/**
 * Only the English voices, because every question in every deck is English.
 *
 * A machine can list a couple of hundred voices across forty languages, and a
 * Spanish voice reading a Salesforce stem is unusable — so offering them is
 * offering a way to break the mode. The whole list comes back if there is no
 * English voice at all, since a bad voice beats an empty picker.
 */
export function englishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  return english.length > 0 ? english : voices;
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
