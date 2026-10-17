import { useEffect, useRef, useState } from 'react';
import { Music, Pause, Play, RotateCcw, SkipForward, Timer } from 'lucide-react';
import { useFocus } from '@/state/focusStore';
import {
  BREAK_MINUTES,
  FOCUS_MINUTES,
  formatMMSS,
  remainingSeconds,
  type Phase,
} from '@/lib/pomodoro';

/**
 * Focus mode in the top bar: a Pomodoro and generative music, both optional
 * and both off until asked for. See `state/focusStore.ts`.
 *
 * It sits in the top bar rather than the right sidebar because that sidebar
 * only exists on wide screens, and a timer you cannot see on a phone or a
 * small laptop is a timer you cannot stop.
 */

const PHASE_COLOR: Record<Phase, string> = {
  idle: 'var(--text-secondary)',
  focus: 'var(--accent)',
  break: 'var(--success)',
  breakDone: 'var(--warning)',
};

const PHASE_LABEL: Record<Phase, string> = {
  idle: 'Ready',
  focus: 'Focus',
  break: 'Break',
  breakDone: 'Break over',
};

export function FocusMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const f = useFocus();
  const left = remainingSeconds(f, f.now);
  const paused = f.pausedRemaining !== null;
  const active = f.phase === 'focus' || f.phase === 'break';
  const clock = formatMMSS(left);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // The time in the tab title, so the block can be followed from another tab.
  useEffect(() => {
    const base = document.title.replace(/^(?:\d\d:\d\d|Break over) · /, '');
    if (active) {
      document.title = `${clock} · ${base}`;
    } else if (f.phase === 'breakDone') {
      document.title = `Break over · ${base}`;
    } else {
      document.title = base;
    }
  }, [active, paused, clock, f.phase]);

  // Restore a clean title when the bar unmounts between routes; the next one
  // writes it again on its first render.
  useEffect(
    () => () => {
      document.title = document.title.replace(/^(?:\d\d:\d\d|Break over) · /, '');
    },
    [],
  );

  const color = PHASE_COLOR[f.phase];
  const showBadge = f.phase !== 'idle';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Focus timer and music"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md px-1 py-1.5 transition-colors hover:bg-[color:var(--bg-panel-hi)] sm:px-1.5"
        style={{ color: open || showBadge ? color : 'var(--text-secondary)' }}
      >
        {/* On a phone the bar has no room to spare — the deck pill already
            shrinks to make way — so a running clock replaces the icon there
            instead of sitting beside it. */}
        <Timer size={16} className={showBadge ? 'hidden sm:block' : undefined} />
        {showBadge ? (
          <span
            className="font-mono text-[12px] tabular-nums"
            style={{ opacity: paused ? 0.6 : 1 }}
          >
            {f.phase === 'breakDone' ? 'Go' : clock}
          </span>
        ) : null}
        {f.musicOn ? (
          <Music size={12} className="hidden sm:block" style={{ color: 'var(--text-muted)' }} />
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-[300px] max-w-[calc(100vw-24px)] rounded-lg border p-3 shadow-xl"
          style={{ background: 'var(--bg-panel-hi)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex items-baseline justify-between">
            <div className="label-uppercase">Pomodoro</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color }}>
              {PHASE_LABEL[f.phase]}
              {paused ? ' · paused' : ''}
            </div>
          </div>

          <div
            className="mt-2 text-center font-mono text-[40px] font-medium tabular-nums tracking-tight"
            style={{ color: f.phase === 'idle' ? 'var(--text-primary)' : color }}
          >
            {f.phase === 'idle'
              ? formatMMSS(f.focusMin * 60)
              : f.phase === 'breakDone'
                ? formatMMSS(f.focusMin * 60)
                : clock}
          </div>
          {f.phase === 'breakDone' ? (
            <p className="text-center text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              Ready for the next block?
            </p>
          ) : null}

          <div className="mt-3 flex gap-1.5">
            {f.phase === 'idle' || f.phase === 'breakDone' ? (
              <PrimaryButton onClick={f.start} icon={<Play size={13} />}>
                {f.phase === 'idle' ? 'Start focus' : 'Start next block'}
              </PrimaryButton>
            ) : paused ? (
              <PrimaryButton onClick={f.resume} icon={<Play size={13} />}>
                Resume
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={f.pause} icon={<Pause size={13} />}>
                Pause
              </PrimaryButton>
            )}
            {active ? (
              <IconButton
                onClick={f.skip}
                label={f.phase === 'focus' ? 'Skip to break' : 'End break'}
              >
                <SkipForward size={14} />
              </IconButton>
            ) : null}
            {f.phase !== 'idle' ? (
              <IconButton onClick={f.reset} label="Reset">
                <RotateCcw size={14} />
              </IconButton>
            ) : null}
          </div>

          <ChipRow
            label="Focus"
            values={FOCUS_MINUTES}
            value={f.focusMin}
            onChange={f.setFocusMin}
          />
          <ChipRow
            label="Break"
            values={BREAK_MINUTES}
            value={f.breakMin}
            onChange={f.setBreakMin}
          />
          <div className="mt-2 font-mono text-[10px]" style={{ color: 'var(--text-faint)' }}>
            {f.roundsDone} {f.roundsDone === 1 ? 'block' : 'blocks'} done · new lengths apply
            to the next block
          </div>

          <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between">
              <div className="label-uppercase">Focus music</div>
              <button
                type="button"
                role="switch"
                aria-checked={f.musicOn}
                aria-label="Focus music"
                onClick={f.toggleMusic}
                className="relative h-5 w-9 rounded-full border transition-colors"
                style={{
                  background: f.musicOn ? 'var(--accent-bg)' : 'transparent',
                  borderColor: f.musicOn ? 'var(--accent-border)' : 'var(--border-default)',
                }}
              >
                <span
                  className="absolute top-[3px] h-3 w-3 rounded-full transition-[left]"
                  style={{
                    left: f.musicOn ? 19 : 3,
                    background: f.musicOn ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                />
              </button>
            </div>
            <label className="mt-2.5 flex items-center gap-2.5">
              <Music size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={f.volume}
                onChange={(e) => f.setVolume(Number(e.target.value))}
                aria-label="Music volume"
                className="flex-1"
                style={{ accentColor: 'var(--accent)' }}
              />
            </label>
            <p
              className="mt-2 text-[11px] leading-relaxed"
              style={{ color: 'var(--text-faint)' }}
            >
              Composed live as it plays — slow chords, sparse bells, a key change every few
              minutes — so it never loops. Nothing to download.
            </p>
          </div>

          <p
            className="mt-2.5 border-t pt-2.5 text-[11px] leading-relaxed"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-faint)' }}
          >
            Optional. Does not affect your answers or progress. Saved on this device.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function PrimaryButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border py-1.5 text-[13px] font-medium transition-colors"
      style={{
        background: 'var(--accent-bg)',
        borderColor: 'var(--accent-border)',
        color: 'var(--accent)',
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex w-9 items-center justify-center rounded-[8px] border transition-colors hover:bg-[color:var(--bg-panel)]"
      style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
    >
      {children}
    </button>
  );
}

function ChipRow({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: readonly number[];
  value: number;
  onChange: (m: number) => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <span
        className="w-11 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em]"
        style={{ color: 'var(--text-faint)' }}
      >
        {label}
      </span>
      <div className="flex flex-1 gap-1">
        {values.map((m) => {
          const on = m === value;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              aria-pressed={on}
              className="flex-1 rounded-[6px] border py-1 font-mono text-[11px] tabular-nums transition-colors"
              style={
                on
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
              {m}m
            </button>
          );
        })}
      </div>
    </div>
  );
}
