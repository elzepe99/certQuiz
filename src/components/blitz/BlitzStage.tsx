import { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Pause, Play, SkipForward, X } from 'lucide-react';
import { RichText } from '@/components/RichText';
import { QuestionDiagram } from '@/components/QuestionDiagram';
import { OptionShape, optionStyle } from '@/components/blitz/OptionShape';
import { getOptions, parseExplanation, requiredAnswerCount } from '@/lib/quiz';
import { formatPoints, speechScript } from '@/lib/blitz';
import { cancelSpeech, speak, speechSupported } from '@/lib/speech';
import { sfx } from '@/lib/sfx';
import { useBlitz } from '@/state/blitzStore';

/** Seconds remaining at which the clock starts ticking audibly. */
const TICK_FROM = 5;

export function BlitzStage({ onQuit }: { onQuit: () => void }) {
  const phase = useBlitz((s) => s.phase);
  const countdown = useBlitz((s) => s.countdown);
  const questions = useBlitz((s) => s.questions);
  const order = useBlitz((s) => s.order);
  const pos = useBlitz((s) => s.pos);
  const settings = useBlitz((s) => s.settings);
  const selected = useBlitz((s) => s.selected);
  const results = useBlitz((s) => s.results);
  const score = useBlitz((s) => s.score);
  const streak = useBlitz((s) => s.streak);
  const budgetMs = useBlitz((s) => s.budgetMs);
  const deadline = useBlitz((s) => s.deadline);
  const speakingChunk = useBlitz((s) => s.speakingChunk);

  const tickCountdown = useBlitz((s) => s.tickCountdown);
  const beginAnswering = useBlitz((s) => s.beginAnswering);
  const setSpeakingChunk = useBlitz((s) => s.setSpeakingChunk);
  const select = useBlitz((s) => s.select);
  const timeUp = useBlitz((s) => s.timeUp);
  const advance = useBlitz((s) => s.advance);

  const q = questions[order[pos]];
  const options = useMemo(() => (q ? getOptions(q) : []), [q]);
  const script = useMemo(() => (q ? speechScript(q) : []), [q]);
  // Which option the narrator is on, or -1. Derived from the script rather than
  // assumed to be `chunk - 1`: a question with an empty stem produces no stem
  // chunk, and the highlight would then sit one tile off for the whole run.
  const speakingOption = (() => {
    const chunk = script[speakingChunk];
    return chunk && chunk.kind === 'option' ? chunk.optionIdx : -1;
  })();
  const required = q ? requiredAnswerCount(q.question, q.correct) : 1;
  const correctLetters = useMemo(
    () => (q ? q.correct.split(',').map((s) => s.trim().toUpperCase()) : []),
    [q],
  );
  const lastResult = phase === 'feedback' ? results[results.length - 1] : undefined;

  // ---- the 3-2-1 -------------------------------------------------------
  useEffect(() => {
    if (phase !== 'countdown') return;
    sfx.countdown(countdown === 0);
    const t = setTimeout(tickCountdown, countdown === 0 ? 550 : 750);
    return () => clearTimeout(t);
  }, [phase, countdown, tickCountdown]);

  // ---- the narrator ----------------------------------------------------
  // The clock is started by `onDone`, so a question is never racing its own
  // reading. Every exit from `reading` — answering early, skipping, unmounting
  // — runs the cleanup, which silences the voice.
  useEffect(() => {
    if (phase !== 'reading' || !q) return;
    if (!settings.readAloud || !speechSupported()) {
      beginAnswering();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      beginAnswering();
    };
    const handle = speak(script, {
      voiceURI: settings.voiceURI,
      rate: settings.rate,
      onChunkStart: setSpeakingChunk,
      onDone: finish,
    });
    // Backstop for the one failure `speech.ts` cannot see: a synthesiser that
    // reports itself as still speaking forever. Its own stall watch catches a
    // dead voice within a second or so; this catches a stuck one.
    const watchdog = setTimeout(finish, speechWatchdogMs(script, settings.rate));
    return () => {
      clearTimeout(watchdog);
      handle.cancel();
    };
  }, [
    phase,
    q,
    script,
    settings.readAloud,
    settings.voiceURI,
    settings.rate,
    beginAnswering,
    setSpeakingChunk,
  ]);

  useEffect(() => () => cancelSpeech(), []);

  // ---- the clock -------------------------------------------------------
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (phase !== 'answering' || deadline === null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [phase, deadline]);

  const msLeft =
    deadline === null ? budgetMs : Math.max(0, Math.min(budgetMs, deadline - now));
  const secondsLeft = Math.ceil(msLeft / 1000);
  const fracLeft = budgetMs > 0 ? msLeft / budgetMs : 1;

  useEffect(() => {
    if (phase === 'answering' && deadline !== null && msLeft <= 0) timeUp();
  }, [phase, deadline, msLeft, timeUp]);

  const lastTick = useRef<number>(-1);
  useEffect(() => {
    if (phase !== 'answering') {
      lastTick.current = -1;
      return;
    }
    if (secondsLeft <= TICK_FROM && secondsLeft > 0 && secondsLeft !== lastTick.current) {
      lastTick.current = secondsLeft;
      sfx.tick();
    }
  }, [phase, secondsLeft]);

  // ---- holding the verdict --------------------------------------------
  // The hold is a *deadline*, not a countdown held in state. An earlier version
  // kept the remaining milliseconds in state and advanced when they hit zero,
  // which skipped the verdict entirely: the effect that reset the counter and
  // the effect that read it ran in the same commit, so the check still saw the
  // zero left over from the previous question and moved on instantly.
  const [holdUntil, setHoldUntil] = useState<number | null>(null);
  const [holdLeft, setHoldLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const holdTotal = settings.feedbackSeconds * 1000;

  useEffect(() => {
    if (phase !== 'feedback') {
      setPaused(false);
      setHoldUntil(null);
      setHoldLeft(0);
      return;
    }
    setHoldLeft(holdTotal);
    setHoldUntil(holdTotal > 0 ? Date.now() + holdTotal : null);
  }, [phase, results.length, holdTotal]);

  useEffect(() => {
    if (phase !== 'feedback' || holdUntil === null || paused) return;
    const id = setInterval(() => {
      const left = holdUntil - Date.now();
      setHoldLeft(Math.max(0, left));
      if (left <= 0) advance();
    }, 100);
    return () => clearInterval(id);
  }, [phase, holdUntil, paused, advance]);

  // Pausing banks the remaining time; resuming spends it from now.
  const togglePause = () => {
    if (paused) {
      setHoldUntil(Date.now() + holdLeft);
      setPaused(false);
    } else {
      setHoldUntil(null);
      setPaused(true);
    }
  };

  // ---- keyboard --------------------------------------------------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (/^[1-9]$/.test(e.key)) {
        const opt = options[Number(e.key) - 1];
        if (opt) {
          e.preventDefault();
          select(opt.letter);
        }
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'reading') beginAnswering();
        else if (phase === 'feedback') advance();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onQuit();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [options, select, phase, beginAnswering, advance, onQuit]);

  if (!q) return null;

  const explanation = lastResult ? parseExplanation(q.explanation).body : '';

  return (
    <div className="flex h-screen flex-col [height:100dvh]" style={{ background: 'var(--bg-canvas)' }}>
      {phase === 'countdown' ? <Countdown value={countdown} /> : null}

      {/* Scoreboard */}
      <header
        className="flex shrink-0 items-center gap-3 border-b px-4 py-2.5 sm:gap-5 sm:px-6"
        style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-subtle)' }}
      >
        <span
          className="font-mono text-[11px] tabular-nums uppercase tracking-[0.14em]"
          style={{ color: 'var(--text-faint)' }}
        >
          {pos + 1} / {order.length}
        </span>
        <div className="hidden flex-1 sm:block">
          <RunDots results={results} pos={pos} total={order.length} />
        </div>
        <span className="flex-1 sm:hidden" />
        {streak >= 2 ? (
          <span
            className="flex items-center gap-1 font-mono text-[12px] tabular-nums"
            style={{ color: 'var(--warning)' }}
          >
            <Flame size={13} />
            {streak}
          </span>
        ) : null}
        <span
          className="font-mono text-[15px] font-semibold tabular-nums"
          style={{ color: 'var(--accent)' }}
        >
          {formatPoints(score)}
        </span>
        <button
          type="button"
          onClick={onQuit}
          aria-label="End run"
          className="rounded-[6px] p-1.5 transition-colors hover:bg-[color:var(--bg-panel-hi)]"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={16} />
        </button>
      </header>

      {/* Clock */}
      <div className="relative h-1.5 shrink-0" style={{ background: 'var(--border-subtle)' }}>
        <div
          className="h-full transition-[width] duration-100 ease-linear"
          style={{
            width: phase === 'reading' ? '100%' : `${Math.max(0, fracLeft) * 100}%`,
            background:
              phase === 'reading'
                ? 'var(--text-faint)'
                : fracLeft > 0.5
                  ? 'var(--success)'
                  : fracLeft > 0.25
                    ? 'var(--warning)'
                    : 'var(--danger)',
          }}
        />
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-[6px] border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{
                background: 'var(--accent-bg)',
                borderColor: 'var(--accent-border)',
                color: 'var(--accent)',
              }}
            >
              {q._cat || 'General'}
            </span>
            {required > 1 ? (
              <span
                className="rounded-[6px] border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              >
                Pick {required}
              </span>
            ) : null}
            <span className="flex-1" />
            {phase === 'reading' ? (
              <button
                type="button"
                onClick={beginAnswering}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:border-[color:var(--border-strong)]"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              >
                <SkipForward size={12} />
                Skip reading
              </button>
            ) : phase === 'answering' ? (
              <span
                className="font-mono text-[26px] font-semibold tabular-nums leading-none"
                style={{
                  color:
                    fracLeft > 0.5
                      ? 'var(--text-primary)'
                      : fracLeft > 0.25
                        ? 'var(--warning)'
                        : 'var(--danger)',
                }}
              >
                {secondsLeft}
              </span>
            ) : null}
          </div>

          <h1
            key={`blitz-q-${pos}`}
            className="mt-4 animate-fade-in font-serif text-[24px] leading-[1.32] tracking-[-0.01em] sm:text-[29px]"
            style={{ color: 'var(--text-primary)' }}
          >
            <RichText text={q.question} size="md" />
          </h1>

          <QuestionDiagram questionId={q.id} compact />

          {/* Keyed on the position so each question gets fresh tiles. Without it
              React reuses the nodes across questions — the letters are the same
              — and `transition-all` smears the previous question's green
              "correct" tile into the next question's resting colour. */}
          <div key={`tiles-${pos}`} className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {options.map((opt, i) => (
              <OptionTile
                key={opt.letter}
                index={i}
                letter={opt.letter}
                text={opt.text}
                hotkey={i + 1}
                selected={selected.includes(opt.letter)}
                speaking={phase === 'reading' && speakingOption === i}
                reveal={
                  lastResult
                    ? correctLetters.includes(opt.letter)
                      ? 'correct'
                      : lastResult.selected.split(',').includes(opt.letter)
                        ? 'wrong'
                        : 'muted'
                    : null
                }
                disabled={phase === 'feedback'}
                onClick={() => select(opt.letter)}
              />
            ))}
          </div>

          {lastResult ? (
            <Verdict
              result={lastResult}
              correctLetters={correctLetters}
              explanation={explanation}
              holdFrac={holdTotal > 0 ? Math.max(0, holdLeft / holdTotal) : 0}
              paused={paused}
              canPause={holdTotal > 0}
              onTogglePause={togglePause}
              onNext={advance}
              isLast={pos + 1 >= order.length}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function Countdown({ value }: { value: number }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(11, 15, 20, 0.94)' }}
    >
      <div
        key={value}
        className="animate-fade-in font-serif text-[112px] leading-none"
        style={{ color: value === 0 ? 'var(--success)' : 'var(--accent)' }}
      >
        {value === 0 ? 'GO' : value}
      </div>
    </div>
  );
}

/** One dot per question: filled as the run goes, green or red once answered. */
function RunDots({
  results,
  pos,
  total,
}: {
  results: Array<{ correct: boolean }>;
  pos: number;
  total: number;
}) {
  // A long run would otherwise draw 140 dots into a 60px strip.
  if (total > 40) {
    const correct = results.filter((r) => r.correct).length;
    return (
      <span className="font-mono text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {correct} correct · {results.length - correct} missed
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {Array.from({ length: total }, (_, i) => {
        const r = results[i];
        const color = r
          ? r.correct
            ? 'var(--success)'
            : 'var(--danger)'
          : i === pos
            ? 'var(--accent)'
            : 'var(--border-default)';
        return (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: color }}
          />
        );
      })}
    </div>
  );
}

function OptionTile({
  index,
  letter,
  text,
  hotkey,
  selected,
  speaking,
  reveal,
  disabled,
  onClick,
}: {
  index: number;
  letter: string;
  text: string;
  hotkey: number;
  selected: boolean;
  speaking: boolean;
  reveal: 'correct' | 'wrong' | 'muted' | null;
  disabled: boolean;
  onClick: () => void;
}) {
  const style = optionStyle(index);

  let background = style.soft;
  let borderColor = style.color;
  let opacity = 1;

  // The verdict has to be readable at a glance, so it fills the tile rather
  // than tinting it — a 10%-alpha green wash is invisible next to an option
  // whose own resting colour is already green.
  if (reveal === 'correct') {
    background = 'var(--success)';
    borderColor = 'var(--success)';
  } else if (reveal === 'wrong') {
    background = 'var(--danger)';
    borderColor = 'var(--danger)';
  } else if (reveal === 'muted') {
    opacity = 0.28;
  } else if (selected) {
    background = style.color;
  }

  const onColour = reveal === 'correct' || reveal === 'wrong' || (selected && !reveal);
  const markColor = onColour ? '#0b0f14' : style.color;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex items-start gap-3 rounded-[12px] border-2 px-3.5 py-3 text-left transition-all disabled:cursor-default"
      style={{
        background,
        borderColor,
        opacity,
        boxShadow: speaking ? `0 0 0 3px ${style.color}44` : undefined,
      }}
    >
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center"
        style={{ color: markColor }}
      >
        <OptionShape shape={style.shape} size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{ color: onColour ? 'rgba(11,15,20,0.7)' : 'var(--text-faint)' }}
        >
          {letter}
          {/* The hotkey hint is noise on a phone, where there is no key to press. */}
          <span className="hidden sm:inline"> · press {hotkey}</span>
        </span>
        <span
          className="mt-0.5 block text-[14px] leading-snug"
          style={{ color: onColour ? '#0b0f14' : 'var(--text-primary)' }}
        >
          <RichText text={text} size="sm" />
        </span>
      </span>
    </button>
  );
}

function Verdict({
  result,
  correctLetters,
  explanation,
  holdFrac,
  paused,
  canPause,
  onTogglePause,
  onNext,
  isLast,
}: {
  result: { correct: boolean; timedOut: boolean; points: number };
  correctLetters: string[];
  explanation: string;
  holdFrac: number;
  paused: boolean;
  canPause: boolean;
  onTogglePause: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const tone = result.correct ? 'var(--success)' : 'var(--danger)';
  const headline = result.correct
    ? `Correct · +${formatPoints(result.points)}`
    : result.timedOut
      ? 'Out of time'
      : 'Not quite';

  return (
    <section
      className="mt-6 animate-slide-down overflow-hidden rounded-[12px] border"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-subtle)' }}
    >
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <span className="text-[15px] font-semibold" style={{ color: tone }}>
          {headline}
        </span>
        {!result.correct ? (
          <span className="font-mono text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            Answer: {correctLetters.join(', ')}
          </span>
        ) : null}
        <span className="flex-1" />
        {canPause ? (
          <button
            type="button"
            onClick={onTogglePause}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors hover:border-[color:var(--border-strong)]"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
          >
            {paused ? <Play size={11} /> : <Pause size={11} />}
            {paused ? 'Resume' : 'Hold'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
          style={{ background: 'var(--accent)', color: '#08111c' }}
        >
          {isLast ? 'See results' : 'Next'} ⏎
        </button>
      </div>

      {canPause ? (
        <div className="h-0.5" style={{ background: 'var(--border-subtle)' }}>
          <div
            className="h-full transition-[width] duration-100 ease-linear"
            style={{ width: `${holdFrac * 100}%`, background: paused ? 'var(--text-faint)' : tone }}
          />
        </div>
      ) : null}

      {explanation ? (
        <div
          className="max-h-[38vh] overflow-y-auto px-4 py-3.5 text-[13.5px] leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          <RichText text={explanation} size="sm" />
        </div>
      ) : null}
    </section>
  );
}

/**
 * How long to wait for a voice before giving up on it, from the length of what
 * it was asked to read. Generous — twice a slow reading, plus a fixed head
 * start — because cutting a working narrator off mid-question is worse than
 * waiting a few extra seconds for a broken one.
 */
function speechWatchdogMs(script: Array<{ text: string }>, rate: number): number {
  const chars = script.reduce((sum, c) => sum + c.text.length, 0);
  // Measured at roughly 14 characters a second at rate 1; 12 leaves margin,
  // and the 1.6x on top means a working narrator is never cut off.
  const charsPerSecond = 12 * Math.max(0.5, rate);
  return Math.min(150_000, (chars / charsPerSecond) * 1600 + 6000);
}
