import { useEffect, useState } from 'react';
import { Check, ChevronDown, Flame, Timer, X } from 'lucide-react';
import { useRush, SPIN_MS } from '@/state/rushStore';
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  HEAT_LABEL,
  SYMBOLS,
  formatClock,
  heatFor,
  remainingMs,
  survivedMs,
  type Reels,
} from '@/lib/rush';
import { sfx } from '@/lib/sfx';
import { SlotSymbol } from './SlotSymbol';

/**
 * Jackpot Rush, the visible half. The game itself lives in state/rushStore.ts
 * and scores whatever the reader submits in the ordinary exam view.
 *
 * Three pieces, because the game has two homes:
 *   - `RushEffects` — mounted once by QuizView: binds the deck, ends the run on
 *     leaving it, and paints the click-through streak lights and jackpot burst.
 *   - `RushPanel` — the full cabinet, in the "Rush" tab of the right sidebar.
 *     This is the real home; that sidebar only exists at `xl`.
 *   - `RushDock` — the small corner card, kept for narrower screens only.
 */

export function RushEffects({ deckId }: { deckId: string }) {
  const bind = useRush((s) => s.bind);
  const reset = useRush((s) => s.reset);
  const phase = useRush((s) => s.phase);
  const streak = useRush((s) => s.streak);

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

  return (
    <>
      {heat > 0 ? <div className="rush-lights" aria-hidden /> : null}
      <JackpotBurst />
    </>
  );
}

/** The tab label: just "Rush" at rest, the live clock while a run is on. */
export function RushTabLabel() {
  const phase = useRush((s) => s.phase);
  const left = useRush((s) => (s.phase === 'running' ? remainingMs(s, s.now) : 0));
  if (phase !== 'running') return <>Rush</>;
  return (
    <span className="whitespace-nowrap tabular-nums" style={{ color: left <= 10_000 ? 'var(--danger)' : 'var(--warning)' }}>
      Rush {formatClock(left)}
    </span>
  );
}

// ── The cabinet, for the sidebar tab ────────────────────────────────────────

export function RushPanel() {
  const phase = useRush((s) => s.phase);
  const streak = useRush((s) => s.streak);
  const heat = phase === 'running' ? heatFor(streak) : 0;

  return (
    <div className="rush-cabinet rounded-[14px] p-3" data-heat={heat}>
      <div className="rush-marquee rounded-[10px] px-3 py-2 text-center">
        <div className="rush-bulb-row" aria-hidden />
        <div className="rush-title text-[17px] font-black uppercase tracking-[0.22em]">Jackpot Rush</div>
        <div className="rush-bulb-row" aria-hidden />
      </div>

      <div className="mt-3">
        <Display big />
      </div>

      <div className="mt-3">
        <SlotMachine big />
      </div>

      {phase === 'running' ? <StreakMeter /> : null}
      {phase === 'running' ? <Tally big /> : null}
      {phase === 'over' ? <Results /> : null}
      {phase !== 'running' ? (
        <div className="mt-3">
          <DifficultyPicker />
          <Rules />
          <BestLine />
          <Lever label={phase === 'over' ? 'Play again' : 'Pull the lever'} big />
          <p className="mt-2 text-center text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
            Answer in the normal view — your answers count as usual.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** The LED readout: the clock while running, a headline otherwise. */
function Display({ big }: { big?: boolean }) {
  const s = useRush();
  const left = remainingMs(s, s.now);
  let text: string;
  let tone: 'ok' | 'warn' | 'danger' = 'ok';
  if (s.phase === 'running') {
    text = formatClock(left);
    tone = left <= 10_000 ? 'danger' : left <= 30_000 ? 'warn' : 'ok';
  } else if (s.phase === 'over') {
    text = "TIME'S UP";
    tone = 'danger';
  } else {
    text = formatClock(DIFFICULTIES[s.difficulty].startMs);
  }
  return (
    <div className="rush-led relative rounded-[8px] px-3 py-2 text-center">
      <div
        className={`rush-led-digits rush-led-${tone} font-mono font-bold tabular-nums leading-none ${
          big ? (s.phase === 'over' ? 'text-[30px]' : 'text-[46px]') : 'text-[30px]'
        }`}
      >
        {text}
      </div>
      <FlashToast />
    </div>
  );
}

function StreakMeter() {
  const streak = useRush((s) => s.streak);
  const heat = heatFor(streak);
  const lit = Math.min(streak, 8);
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
        <span className="flex items-center gap-1" style={{ color: streak > 0 ? 'var(--warning)' : 'var(--text-faint)' }}>
          <Flame size={12} /> Streak {streak}
        </span>
        <span style={{ color: heat ? '#f0abfc' : 'var(--text-faint)' }}>{HEAT_LABEL[heat] || '3 to heat up'}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-8 gap-1">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={`rush-meter-bulb ${i < lit ? `rush-meter-on rush-meter-${i < 3 ? 1 : i < 5 ? 2 : 3}` : ''}`} />
        ))}
      </div>
    </div>
  );
}

function Tally({ big }: { big?: boolean }) {
  const correct = useRush((s) => s.correct);
  const wrong = useRush((s) => s.wrong);
  const jackpots = useRush((s) => s.jackpots);
  return (
    <div
      className={`mt-3 grid grid-cols-3 gap-1.5 font-mono tabular-nums ${big ? 'text-[13px]' : 'text-[11px]'}`}
    >
      <TallyCell icon={<Check size={13} />} color="var(--success)" value={correct} label="Right" />
      <TallyCell icon={<X size={13} />} color="var(--danger)" value={wrong} label="Wrong" />
      <TallyCell icon={<SlotSymbol id="seven" size={14} />} color="var(--warning)" value={jackpots} label="Jackpots" />
    </div>
  );
}

function TallyCell({
  icon,
  color,
  value,
  label,
}: {
  icon: React.ReactNode;
  color: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rush-chip flex items-center justify-center gap-1.5 rounded-[8px] py-1.5" title={label}>
      <span style={{ color }}>{icon}</span>
      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

function DifficultyPicker() {
  const difficulty = useRush((s) => s.difficulty);
  const setDifficulty = useRush((s) => s.setDifficulty);
  return (
    <div className="grid grid-cols-3 gap-1">
      {DIFFICULTY_ORDER.map((d) => {
        const active = d === difficulty;
        return (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`rush-diff rounded-[8px] px-1 py-1.5 text-center ${active ? 'rush-diff-on' : ''}`}
          >
            <div className="text-[12px] font-semibold">{DIFFICULTIES[d].label}</div>
            <div className="font-mono text-[10px] tabular-nums opacity-75">{formatClock(DIFFICULTIES[d].startMs)}</div>
          </button>
        );
      })}
    </div>
  );
}

function Rules() {
  const r = DIFFICULTIES[useRush((s) => s.difficulty)];
  return (
    <ul className="mt-2.5 space-y-1 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
      <RuleRow icon={<Timer size={13} />} label="Starting clock" value={formatClock(r.startMs)} color="var(--text-primary)" />
      <RuleRow icon={<Check size={13} />} label="Right answer" value={`+${formatClock(r.correctMs)}`} color="var(--success)" />
      <RuleRow icon={<X size={13} />} label="Wrong answer" value={`−${formatClock(r.wrongMs)}`} color="var(--danger)" />
      <RuleRow
        icon={
          <span className="flex -space-x-1">
            <SlotSymbol id="seven" size={13} />
            <SlotSymbol id="seven" size={13} />
            <SlotSymbol id="seven" size={13} />
          </span>
        }
        label="Three of a kind"
        value={`+${formatClock(r.jackpotMs)}`}
        color="var(--warning)"
      />
    </ul>
  );
}

function RuleRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <li className="flex items-center gap-2">
      <span className="flex w-[38px] justify-center" style={{ color: 'var(--text-muted)' }}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <b className="font-mono tabular-nums" style={{ color }}>
        {value}
      </b>
    </li>
  );
}

function BestLine() {
  const best = useRush((s) => s.best);
  const difficulty = useRush((s) => s.difficulty);
  if (!best) return null;
  return (
    <div className="mt-2 text-center font-mono text-[10.5px] tabular-nums" style={{ color: 'var(--text-faint)' }}>
      Best on {DIFFICULTIES[difficulty].label} · {best.correct} right · {formatClock(best.survivedMs)} survived
    </div>
  );
}

function Lever({ label, big }: { label: string; big?: boolean }) {
  const start = useRush((s) => s.start);
  return (
    <button
      onClick={start}
      className={`rush-lever mt-3 w-full rounded-[10px] font-bold uppercase tracking-[0.12em] ${
        big ? 'py-2.5 text-[13px]' : 'py-2 text-[12px]'
      }`}
    >
      {label}
    </button>
  );
}

function Results() {
  const s = useRush();
  return (
    <div className="mt-3 text-center">
      {s.newBest ? (
        <div className="rush-newbest mb-2 inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
          New best on {DIFFICULTIES[s.difficulty].label}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-1.5 text-left font-mono text-[11px] tabular-nums">
        <Stat label="Survived" value={formatClock(survivedMs(s, s.now))} />
        <Stat label="Right" value={String(s.correct)} />
        <Stat label="Best streak" value={String(s.bestStreak)} />
        <Stat label="Jackpots" value={String(s.jackpots)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rush-chip rounded-[8px] px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-faint)' }}>
        {label}
      </div>
      <div className="mt-0.5 text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

// ── The reels ───────────────────────────────────────────────────────────────

/** Each reel stops in turn; the store reveals the result at `SPIN_MS`. */
const REEL_STOPS = [SPIN_MS / 2, (SPIN_MS * 3) / 4, SPIN_MS];

function SlotMachine({ big }: { big?: boolean }) {
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
    <div className={`rush-machine relative grid grid-cols-3 gap-1.5 rounded-[10px] p-1.5 ${win ? 'rush-machine-win' : ''}`}>
      {shown.map((sym, i) => (
        <div
          key={i}
          className={`rush-reel flex items-center justify-center rounded-[7px] ${big ? 'h-[84px]' : 'h-[52px]'} ${
            stopped[i] ? '' : 'rush-reel-spin'
          }`}
        >
          <SlotSymbol id={sym} size={big ? 54 : 34} />
        </div>
      ))}
      <div className="rush-payline" aria-hidden />
    </div>
  );
}

function FlashToast() {
  const flash = useRush((s) => s.flash);
  const rules = DIFFICULTIES[useRush((s) => s.difficulty)];
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
      ? `JACKPOT +${formatClock(rules.jackpotMs)}`
      : flash.kind === 'correct'
        ? `+${formatClock(rules.correctMs)}`
        : `−${formatClock(rules.wrongMs)}`;
  return (
    <div key={flash.id} className={`rush-toast rush-toast-${flash.kind} font-mono text-[14px] font-bold`}>
      {text}
    </div>
  );
}

/** A screen-wide gold flash and a shower of coins when three of a kind lands. */
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
      {Array.from({ length: 22 }, (_, i) => (
        <span
          key={i}
          className="rush-coin"
          style={{ left: `${(i * 47) % 100}%`, animationDelay: `${(i % 7) * 0.07}s` }}
        />
      ))}
    </div>
  );
}

// ── The corner card, for screens without the right sidebar ─────────────────

export function RushDock() {
  const phase = useRush((s) => s.phase);
  const reset = useRush((s) => s.reset);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // While the card is up, the question column gets room at the bottom so the
  // action bar can always be scrolled clear of it.
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
        className="rush-pill fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] shadow-lg"
        title="Jackpot Rush — survive the clock"
      >
        <SlotSymbol id="seven" size={16} />
        Jackpot Rush
      </button>
    );
  }

  return (
    <div className="rush-cabinet fixed bottom-4 right-4 z-40 w-[260px] max-w-[calc(100vw-32px)] rounded-[16px] p-3 shadow-2xl">
      <div className="flex items-center justify-between">
        <span className="rush-title font-mono text-[10.5px] font-black uppercase tracking-[0.2em]">Jackpot Rush</span>
        {phase === 'running' ? (
          <IconButton label={collapsed ? 'Expand' : 'Collapse'} onClick={() => setCollapsed((c) => !c)}>
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
      </div>
      <div className="mt-2">
        <Display />
      </div>
      {phase === 'running' && collapsed ? null : (
        <div className="mt-2">
          <SlotMachine />
        </div>
      )}
      {phase === 'running' && !collapsed ? <Tally /> : null}
      {phase === 'over' ? <Results /> : null}
      {phase !== 'running' ? (
        <div className="mt-2">
          <DifficultyPicker />
          <Lever label={phase === 'over' ? 'Play again' : 'Pull the lever'} />
        </div>
      ) : null}
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
