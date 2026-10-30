import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useRush, SPIN_MS } from '@/state/rushStore';
import {
  CORRECT_BONUS_MS,
  HEAT_LABEL,
  JACKPOT_BONUS_MS,
  START_MS,
  SYMBOLS,
  WRONG_PENALTY_MS,
  formatClock,
  heatFor,
  remainingMs,
  survivedMs,
  type Reels,
} from '@/lib/rush';
import { sfx } from '@/lib/sfx';

/**
 * The casino in the corner. Jackpot Rush is started from here and runs over the
 * ordinary exam view — see state/rushStore.ts. It stays a small fixed card at
 * the bottom right so the question and options keep the whole stage; the
 * streak lights are drawn on a click-through layer and never cover a tile.
 */
export function RushDock({ deckId }: { deckId: string }) {
  const bind = useRush((s) => s.bind);
  const reset = useRush((s) => s.reset);
  const phase = useRush((s) => s.phase);
  const streak = useRush((s) => s.streak);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    bind(deckId);
  }, [deckId, bind]);

  // Leaving the deck ends the run; a clock nobody can answer against is just a
  // countdown to a disappointing score.
  useEffect(() => () => reset(), [reset]);

  const heat = phase === 'running' ? heatFor(streak) : 0;
  useEffect(() => {
    const root = document.documentElement;
    if (heat > 0) root.dataset.rushHeat = String(heat);
    else delete root.dataset.rushHeat;
    return () => {
      delete root.dataset.rushHeat;
    };
  }, [heat]);

  // While the card is up, the question column gets room at the bottom so the
  // action bar can always be scrolled clear of it — on a phone the card is
  // most of the width.
  const cardUp = phase !== 'idle' || open;
  useEffect(() => {
    const root = document.documentElement;
    if (cardUp) root.dataset.rushActive = '';
    else delete root.dataset.rushActive;
    return () => {
      delete root.dataset.rushActive;
    };
  }, [cardUp]);

  if (!cardUp) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rush-pill fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] shadow-lg transition-transform hover:-translate-y-0.5"
        title="Jackpot Rush — survive the clock"
      >
        <span className="text-[15px] leading-none">🎰</span>
        Jackpot Rush
      </button>
    );
  }

  return (
    <>
      {heat > 0 ? <div className="rush-lights" aria-hidden /> : null}
      <JackpotBurst />
      <div
        className="rush-card fixed bottom-4 right-4 z-40 w-[260px] max-w-[calc(100vw-32px)] rounded-[16px] border p-3.5 shadow-2xl"
        data-heat={heat}
      >
        <div className="rush-bulbs" aria-hidden />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="rush-title font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em]">
              🎰 Jackpot Rush
            </span>
            <span className="flex items-center gap-0.5">
              {phase === 'running' ? (
                <IconButton
                  label={collapsed ? 'Expand' : 'Collapse'}
                  onClick={() => setCollapsed((c) => !c)}
                >
                  <ChevronDown size={14} style={{ transform: collapsed ? 'rotate(180deg)' : undefined }} />
                </IconButton>
              ) : (
                <IconButton
                  label="Close"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                >
                  <X size={14} />
                </IconButton>
              )}
            </span>
          </div>

          {phase === 'idle' ? <Lobby /> : null}
          {phase === 'running' ? <Running collapsed={collapsed} /> : null}
          {phase === 'over' ? <GameOver /> : null}
        </div>
      </div>
    </>
  );
}

function Lobby() {
  const start = useRush((s) => s.start);
  const best = useRush((s) => s.best);
  return (
    <div className="mt-2.5">
      <ul className="space-y-1 text-[12px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
        <li>
          ⏱ <b style={{ color: 'var(--text-primary)' }}>{formatClock(START_MS)}</b> on the clock
        </li>
        <li>
          ✅ Right answer <b style={{ color: 'var(--success)' }}>+{formatClock(CORRECT_BONUS_MS)}</b>
        </li>
        <li>
          ❌ Wrong answer <b style={{ color: 'var(--danger)' }}>−{formatClock(WRONG_PENALTY_MS)}</b>
        </li>
        <li>
          🎰 Three of a kind <b style={{ color: 'var(--warning)' }}>+{formatClock(JACKPOT_BONUS_MS)}</b>
        </li>
      </ul>
      <p className="mt-2 text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
        Answer in the normal view. Your answers count as usual.
      </p>
      {best ? (
        <div className="mt-2 font-mono text-[10.5px] tabular-nums" style={{ color: 'var(--text-faint)' }}>
          Best · {best.correct} right · {formatClock(best.survivedMs)} survived
        </div>
      ) : null}
      <button onClick={start} className="rush-lever mt-3 w-full rounded-[10px] py-2 text-[13px] font-semibold">
        Pull the lever
      </button>
    </div>
  );
}

function Running({ collapsed }: { collapsed: boolean }) {
  const s = useRush();
  const left = remainingMs(s, s.now);
  const heat = heatFor(s.streak);
  const urgency = left <= 10_000 ? 'danger' : left <= 30_000 ? 'warn' : 'ok';

  return (
    <div className="mt-1.5">
      <div className="relative flex items-end justify-between">
        <div className={`rush-clock rush-clock-${urgency} font-mono text-[34px] font-semibold leading-none tabular-nums`}>
          {formatClock(left)}
        </div>
        <div className="text-right">
          <div className="font-mono text-[18px] font-semibold leading-none tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {s.streak > 0 ? `${'🔥'.repeat(Math.min(3, heat || 1))} ${s.streak}` : '—'}
          </div>
          <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-faint)' }}>
            {HEAT_LABEL[heat] || 'Streak'}
          </div>
        </div>
        <FlashToast />
      </div>

      {collapsed ? null : (
        <>
          <SlotMachine />
          <div className="mt-2.5 flex items-center justify-between font-mono text-[10.5px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            <span>✅ {s.correct}</span>
            <span>❌ {s.wrong}</span>
            <span>🎰 {s.jackpots}</span>
            <button
              onClick={() => {
                if (window.confirm('Cash out and end this run?')) s.quit();
              }}
              className="rounded-[6px] border px-2 py-0.5 uppercase tracking-[0.1em] transition-colors hover:bg-[color:var(--bg-panel-hi)]"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
            >
              Cash out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Each reel stops in turn; the store reveals the result at `SPIN_MS`. */
const REEL_STOPS = [SPIN_MS / 2, (SPIN_MS * 3) / 4, SPIN_MS];

function SlotMachine() {
  const reels = useRush((s) => s.reels);
  const target = useRush((s) => s.target);
  const spinning = useRush((s) => s.spinning);
  const [shown, setShown] = useState<Reels>(reels);
  const [stopped, setStopped] = useState([true, true, true]);

  useEffect(() => {
    if (!spinning) {
      setShown(reels);
      setStopped([true, true, true]);
      return;
    }
    const begun = performance.now();
    let landed = 0;
    setStopped([false, false, false]);
    const id = window.setInterval(() => {
      const t = performance.now() - begun;
      const done = REEL_STOPS.map((at) => t >= at);
      const nowLanded = done.filter(Boolean).length;
      if (nowLanded > landed) {
        sfx.reelStop(nowLanded - 1);
        landed = nowLanded;
      } else {
        sfx.reelTick();
      }
      setStopped(done);
      setShown(
        target.map((sym, i) =>
          done[i] ? sym : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ) as Reels,
      );
      if (nowLanded === 3) window.clearInterval(id);
    }, 70);
    return () => window.clearInterval(id);
  }, [spinning, target, reels]);

  const win = !spinning && reels[0] === reels[1] && reels[1] === reels[2];

  return (
    <div className={`rush-machine mt-3 grid grid-cols-3 gap-1.5 rounded-[10px] p-1.5 ${win ? 'rush-machine-win' : ''}`}>
      {shown.map((sym, i) => (
        <div
          key={i}
          className={`rush-reel flex h-[52px] items-center justify-center rounded-[7px] text-[28px] ${stopped[i] ? '' : 'rush-reel-spin'}`}
        >
          {sym}
        </div>
      ))}
    </div>
  );
}

function FlashToast() {
  const flash = useRush((s) => s.flash);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!flash) return;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 1300);
    return () => window.clearTimeout(id);
  }, [flash]);
  if (!flash || !visible) return null;
  const text =
    flash.kind === 'jackpot'
      ? `JACKPOT +${formatClock(JACKPOT_BONUS_MS)}`
      : flash.kind === 'correct'
        ? `+${formatClock(CORRECT_BONUS_MS)}`
        : `−${formatClock(WRONG_PENALTY_MS)}`;
  return (
    <div key={flash.id} className={`rush-toast rush-toast-${flash.kind} font-mono text-[13px] font-bold`}>
      {text}
    </div>
  );
}

/** A screen-wide gold flash when three of a kind lands. Click-through. */
function JackpotBurst() {
  const flash = useRush((s) => s.flash);
  const [id, setId] = useState<number | null>(null);
  useEffect(() => {
    if (flash?.kind !== 'jackpot') return;
    setId(flash.id);
    const t = window.setTimeout(() => setId(null), 1600);
    return () => window.clearTimeout(t);
  }, [flash]);
  if (id === null) return null;
  return (
    <div key={id} className="rush-burst" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          className="rush-coin"
          style={{
            left: `${(i * 53) % 100}%`,
            animationDelay: `${(i % 6) * 0.08}s`,
          }}
        >
          🪙
        </span>
      ))}
    </div>
  );
}

function GameOver() {
  const s = useRush();
  const start = s.start;
  return (
    <div className="mt-2 text-center">
      <div className="rush-title text-[20px] font-bold">Time's up!</div>
      {s.newBest ? (
        <div className="rush-newbest mx-auto mt-1 inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
          New best
        </div>
      ) : null}
      <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-left font-mono text-[11px] tabular-nums">
        <Stat label="Survived" value={formatClock(survivedMs(s, s.now))} />
        <Stat label="Right" value={String(s.correct)} />
        <Stat label="Best streak" value={String(s.bestStreak)} />
        <Stat label="Jackpots" value={String(s.jackpots)} />
      </div>
      {s.best && !s.newBest ? (
        <div className="mt-2 font-mono text-[10px] tabular-nums" style={{ color: 'var(--text-faint)' }}>
          Best · {s.best.correct} right · {formatClock(s.best.survivedMs)}
        </div>
      ) : null}
      <button onClick={start} className="rush-lever mt-3 w-full rounded-[10px] py-2 text-[13px] font-semibold">
        Play again
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border px-2 py-1.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-panel-hi)' }}>
      <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-faint)' }}>
        {label}
      </div>
      <div className="mt-0.5 text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-[6px] p-1 transition-colors hover:bg-[color:var(--bg-panel-hi)]"
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </button>
  );
}
