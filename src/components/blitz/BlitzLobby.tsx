import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Volume2, VolumeX, Trophy, Info } from 'lucide-react';
import type { DeckMeta } from '@/types';
import {
  FEEDBACK_SECONDS_OPTIONS,
  RANDOM_RUN_SIZE,
  SECONDS_OPTIONS,
  VISUAL_BONUS_SECONDS,
  buildRunOrder,
  formatPoints,
  type BlitzSource,
} from '@/lib/blitz';
import { loadBest } from '@/lib/blitzStorage';
import {
  cancelSpeech,
  defaultVoiceURI,
  englishVoices,
  hasNaturalVoice,
  primeSpeech,
  speechSupported,
  speakSample,
  useVoices,
  voiceQuality,
} from '@/lib/speech';
import { unlockAudio } from '@/lib/sfx';
import { useBlitz } from '@/state/blitzStore';

/**
 * The picker is grouped rather than sorted flat because the gap between the
 * tiers is the whole point: a machine can offer four hundred voices of which
 * three are worth listening to, and a long alphabetical list hides that.
 */
const VOICE_GROUPS = [
  { quality: 'natural' as const, label: 'Natural — closest to a real narrator' },
  { quality: 'enhanced' as const, label: 'Enhanced' },
  { quality: 'standard' as const, label: 'Standard — robotic' },
];

type Props = {
  deck: DeckMeta;
  total: number;
  setIdx: number;
  setCount: number;
  setStart: number;
  setEnd: number;
};

export function BlitzLobby({ deck, total, setIdx, setCount, setStart, setEnd }: Props) {
  const settings = useBlitz((s) => s.settings);
  const updateSettings = useBlitz((s) => s.updateSettings);
  const startRun = useBlitz((s) => s.startRun);
  const allVoices = useVoices();
  // Every deck is in English, so the picker is too — see `englishVoices`.
  const voices = useMemo(() => englishVoices(allVoices), [allVoices]);
  const supported = speechSupported();
  const best = useMemo(() => loadBest(deck.id), [deck.id]);

  // Voices arrive a frame or two after mount in Chrome, so the default cannot
  // be chosen at load time — it is filled in here, the first time a real list
  // exists.
  //
  // It also re-picks when the stored choice is not on the list, which is what
  // happens when the same person opens the app in a different browser: voice
  // URIs are per-engine, so a Chrome choice means nothing in Edge. Without this
  // the setting would silently point at nothing and every question would come
  // out in whatever the engine's default happens to be.
  useEffect(() => {
    if (voices.length === 0) return;
    const stored = settings.voiceURI;
    if (stored && voices.some((v) => v.voiceURI === stored)) return;
    const uri = defaultVoiceURI(voices);
    if (uri) updateSettings({ voiceURI: uri });
  }, [voices, settings.voiceURI, updateSettings]);

  // The "Hear it" preview outlives this component otherwise — leaving the
  // lobby mid-sample left the voice reading over whatever screen came next,
  // with nothing on it able to stop the voice.
  useEffect(() => () => cancelSpeech(), []);

  const setSize = Math.max(0, setEnd - setStart);
  const sources: Array<{ id: BlitzSource; label: string; hint: string; disabled?: boolean }> = [
    {
      id: 'set',
      label: setCount > 1 ? `Set ${setIdx + 1}` : 'Whole deck',
      hint: `${setCount > 1 ? setSize : total} questions · where you left off`,
    },
    { id: 'random', label: 'Quick 20', hint: `${Math.min(RANDOM_RUN_SIZE, total)} at random` },
    { id: 'deck', label: 'Everything', hint: `all ${total} questions` },
  ];

  const runLength =
    settings.source === 'set'
      ? setCount > 1
        ? setSize
        : total
      : settings.source === 'random'
        ? Math.min(RANDOM_RUN_SIZE, total)
        : total;

  const handleStart = () => {
    // Both the sound and the voice need a user gesture to be allowed to make
    // noise later, and this button is the only one guaranteed to happen first.
    // On iOS neither would ever be heard otherwise: the first question's speech
    // fires from an effect three seconds after this tap.
    unlockAudio();
    if (settings.readAloud !== 'off') primeSpeech();
    startRun(buildRunOrder({ source: settings.source, total, setStart, setEnd }));
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1
          className="font-serif text-[40px] leading-none tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Blitz
        </h1>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-faint)' }}>
          {deck.shortName}
        </span>
      </div>
      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        The question is read to you, a clock drains, and answering quickly is worth more than
        answering slowly. The clock does not start until the reading finishes — so you can listen
        to a long stem instead of grinding through it.
      </p>

      {best ? (
        <div
          className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-[12px] border px-4 py-3"
          style={{
            background: 'var(--bg-panel)',
            borderColor: 'var(--warning-border)',
          }}
        >
          <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--warning)' }}>
            <Trophy size={15} />
            Personal best
          </span>
          <span className="font-mono text-[13px] tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {formatPoints(best.score)} pts
          </span>
          <span className="font-mono text-[12px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {best.correct}/{best.questions} correct · best streak {best.bestStreak}
            {best.at ? ` · ${best.at}` : ''}
          </span>
        </div>
      ) : null}

      <Section title="What to play">
        <div className="grid gap-2 sm:grid-cols-3">
          {sources.map((s) => (
            <ChoiceCard
              key={s.id}
              active={settings.source === s.id}
              label={s.label}
              hint={s.hint}
              onClick={() => updateSettings({ source: s.id })}
            />
          ))}
        </div>
      </Section>

      <Section title="Seconds to answer">
        <div className="flex flex-wrap gap-2">
          {SECONDS_OPTIONS.map((n) => (
            <Pill key={n} active={settings.seconds === n} onClick={() => updateSettings({ seconds: n })}>
              {n}s
            </Pill>
          ))}
        </div>
        <Note>
          Questions carrying code or a figure get {VISUAL_BONUS_SECONDS} extra seconds — the voice
          can't read those to you, so you have to look.
        </Note>
      </Section>

      <Section title="Read aloud">
        <div className="flex flex-wrap items-center gap-2">
          <Pill
            active={settings.readAloud === 'question'}
            onClick={() => updateSettings({ readAloud: 'question' })}
          >
            <Volume2 size={13} /> Question only
          </Pill>
          <Pill
            active={settings.readAloud === 'all'}
            onClick={() => updateSettings({ readAloud: 'all' })}
          >
            <Volume2 size={13} /> Question + options
          </Pill>
          <Pill
            active={settings.readAloud === 'off'}
            onClick={() => updateSettings({ readAloud: 'off' })}
          >
            <VolumeX size={13} /> Off
          </Pill>
        </div>
        <Note>
          The stem is the long part, and the options are short and already on screen — so reading
          only the question is often the quicker way to play, not a lesser one. Whichever you pick,
          the clock waits until the reading finishes.
        </Note>

        {!supported ? (
          <Note>
            This browser has no speech synthesis, so the run will be silent. Chrome, Edge and Safari
            all have it.
          </Note>
        ) : settings.readAloud !== 'off' ? (
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex min-w-[240px] flex-1 flex-col gap-1.5">
              <span className="label-uppercase">Voice</span>
              <select
                value={settings.voiceURI ?? ''}
                onChange={(e) => updateSettings({ voiceURI: e.target.value || null })}
                className="w-full rounded-[8px] border px-2.5 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bg-panel)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                {voices.length === 0 ? <option value="">Loading voices…</option> : null}
                {VOICE_GROUPS.map(({ quality, label }) => {
                  const group = voices.filter((v) => voiceQuality(v) === quality);
                  if (group.length === 0) return null;
                  return (
                    <optgroup key={quality} label={label}>
                      {group.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} — {v.lang}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </label>

            <label className="flex w-[180px] flex-col gap-1.5">
              <span className="label-uppercase">Speed · {settings.rate.toFixed(2)}×</span>
              <input
                type="range"
                min={0.6}
                max={1.8}
                step={0.05}
                value={settings.rate}
                onChange={(e) => updateSettings({ rate: Number(e.target.value) })}
                className="w-full accent-[color:var(--accent)]"
              />
            </label>

            <button
              type="button"
              onClick={() =>
                speakSample(
                  'Which two capabilities does this deck test? Option A. Read the question aloud.',
                  { voiceURI: settings.voiceURI, rate: settings.rate },
                )
              }
              className="rounded-[8px] border px-3 py-2 text-[13px] transition-colors hover:border-[color:var(--border-strong)]"
              style={{
                background: 'var(--bg-panel)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }}
            >
              Hear it
            </button>
          </div>
        ) : null}

        {supported && settings.readAloud !== 'off' && voices.length > 0 && !hasNaturalVoice(voices) ? (
          <Note>
            Only the old system voices are available in this browser, which is why the narrator
            sounds like a satnav. Opening this same page in Microsoft Edge adds Microsoft's neural
            voices — the ones labelled “Online (Natural)” — which sound close to a real narrator.
            Nothing to install and no key to enter; they simply appear in the list above. They are
            streamed, so they need a connection.
          </Note>
        ) : null}
      </Section>

      <Section title="Sound effects">
        <div className="flex flex-wrap gap-2">
          <Pill active={settings.sound} onClick={() => updateSettings({ sound: true })}>
            On
          </Pill>
          <Pill active={!settings.sound} onClick={() => updateSettings({ sound: false })}>
            Off
          </Pill>
        </div>
      </Section>

      <Section title="Hold the answer for">
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_SECONDS_OPTIONS.map((n) => (
            <Pill
              key={n}
              active={settings.feedbackSeconds === n}
              onClick={() => updateSettings({ feedbackSeconds: n })}
            >
              {n === 0 ? 'Until I press next' : `${n}s`}
            </Pill>
          ))}
        </div>
      </Section>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleStart}
          disabled={total === 0}
          className="flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[15px] font-semibold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: 'var(--accent)',
            color: '#08111c',
            boxShadow: '0 0 34px -10px var(--accent)',
          }}
        >
          <Play size={17} fill="#08111c" />
          Start · {runLength} question{runLength === 1 ? '' : 's'}
        </button>
        <Link
          to={`/deck/${deck.id}`}
          className="text-[13px] underline underline-offset-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Back to the normal quiz
        </Link>
      </div>

      <p
        className="mt-8 flex items-start gap-2 text-[12px] leading-relaxed"
        style={{ color: 'var(--text-faint)' }}
      >
        <Info size={13} className="mt-0.5 shrink-0" />
        Blitz keeps its own score and never writes into your study progress, so a hurried guess
        here can't dent the accuracy figure on the deck list.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="label-uppercase mb-2.5">{title}</h2>
      {children}
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2.5 max-w-[62ch] text-[12px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
      {children}
    </p>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[12px] tabular-nums transition-colors"
      style={
        active
          ? {
              background: 'var(--accent-bg)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent)',
            }
          : {
              background: 'transparent',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
            }
      }
    >
      {children}
    </button>
  );
}

function ChoiceCard({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-[10px] border px-3.5 py-3 text-left transition-colors"
      style={{
        background: active ? 'var(--accent-bg)' : 'var(--bg-panel)',
        borderColor: active ? 'var(--accent-border)' : 'var(--border-default)',
      }}
    >
      <div
        className="text-[14px] font-medium"
        style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}
      >
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {hint}
      </div>
    </button>
  );
}
