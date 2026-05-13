import { useEffect, useState } from 'react';
import { useQuiz } from '@/state/quizStore';
import { formatClock, formatTime } from '@/lib/quiz';

type Props = {
  /** Per-question budget in seconds; default 60s. */
  budget?: number;
};

export function SessionTimer({ budget = 60 }: Props) {
  const sessionStart = useQuiz((s) => s.progress.sessionStartTime);
  const questionStart = useQuiz((s) => s.questionStartTime);
  const idx = useQuiz((s) => s.progress.currentIdx);
  const submitted = useQuiz((s) => s.progress.submitted);
  const timeOnQ = useQuiz((s) => s.progress.timeOnQ);

  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const sessionElapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const accumulated = timeOnQ[idx] ?? 0;
  const live = !submitted[idx]
    ? Math.floor((Date.now() - questionStart) / 1000)
    : 0;
  const onQ = accumulated + live;

  // pace: if user is averaging > budget, they're behind
  const submittedCount = Object.keys(submitted).length;
  const totalLogged = timeOnQ.reduce((a, b) => a + b, 0);
  const avg = submittedCount > 0 ? totalLogged / submittedCount : 0;
  const delta = avg - budget; // negative = ahead, positive = behind
  const showPace = submittedCount >= 3;

  return (
    <div
      className="rounded-[12px] border p-4"
      style={{
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: 'var(--success)' }}
          />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: 'var(--text-faint)' }}
          >
            Session
          </span>
        </div>
        {showPace ? (
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{
              color: delta <= 0 ? 'var(--success)' : 'var(--warning)',
            }}
          >
            {delta <= 0 ? '−' : '+'}
            {formatTime(Math.abs(Math.round(delta)))}/q
          </span>
        ) : null}
      </div>

      <div
        className="mt-2 font-mono text-[28px] font-medium tabular-nums tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {formatClock(sessionElapsed)}
      </div>
      <div
        className="mt-1.5 font-mono text-[11px]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {formatTime(onQ)}
        </span>{' '}
        on this question
      </div>
    </div>
  );
}
