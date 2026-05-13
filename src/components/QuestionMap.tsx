import { useMemo, useEffect, useRef } from 'react';
import { useQuiz } from '@/state/quizStore';

export function QuestionMap() {
  const questions = useQuiz((s) => s.questions);
  const progress = useQuiz((s) => s.progress);
  const status = useQuiz((s) => s.status);
  const goTo = useQuiz((s) => s.goTo);

  const flagged = useMemo(() => new Set(progress.flagged), [progress.flagged]);
  const skipped = useMemo(() => new Set(progress.skipped), [progress.skipped]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const curRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cur = curRef.current;
    if (!wrap || !cur) return;
    const cTop = cur.offsetTop;
    if (cTop < wrap.scrollTop || cTop > wrap.scrollTop + wrap.clientHeight - 30) {
      wrap.scrollTop = Math.max(0, cTop - wrap.clientHeight / 2);
    }
  }, [progress.currentIdx]);

  return (
    <div ref={wrapRef} className="max-h-[280px] overflow-y-auto pr-1">
      <div className="grid grid-cols-8 gap-1.5">
        {questions.map((q, i) => {
          const st = status(i);
          const isCur = i === progress.currentIdx;
          const isFlag = flagged.has(i);
          const isSkip = skipped.has(i);
          return (
            <button
              key={i}
              ref={isCur ? curRef : undefined}
              onClick={() => goTo(i)}
              title={`Q${i + 1} · ${st}${isFlag ? ' · flagged' : ''} · ${q._cat}`}
              className="relative flex aspect-square items-center justify-center rounded-[6px] border font-mono text-[10px] tabular-nums transition-all hover:scale-[1.05]"
              style={cellStyle(st, isCur, isSkip)}
            >
              <span style={{ color: cellTextColor(st, isCur) }}>{i + 1}</span>
              {isFlag ? (
                <span
                  className="absolute right-[2px] top-[2px] h-1 w-1 rounded-full"
                  style={{ background: 'var(--warning)' }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div
      className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[10px]"
      style={{ color: 'var(--text-muted)' }}
    >
      <LegendItem
        label="Correct"
        bg="var(--success-bg)"
        border="var(--success-border)"
      />
      <LegendItem label="Wrong" bg="var(--danger-bg)" border="var(--danger-border)" />
      <LegendItem label="Current" bg="var(--accent)" border="var(--accent)" />
      <LegendItem
        label="Flagged"
        bg="transparent"
        border="var(--border-default)"
        dot
      />
    </div>
  );
}

function LegendItem({
  label,
  bg,
  border,
  dot,
}: {
  label: string;
  bg: string;
  border: string;
  dot?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="relative h-[10px] w-[10px] shrink-0 rounded-[2px] border"
        style={{ background: bg, borderColor: border }}
      >
        {dot ? (
          <span
            className="absolute right-[1px] top-[1px] h-[3px] w-[3px] rounded-full"
            style={{ background: 'var(--warning)' }}
          />
        ) : null}
      </span>
      {label}
    </div>
  );
}

function cellStyle(
  st: 'unseen' | 'correct' | 'wrong' | 'skipped',
  isCur: boolean,
  isSkip: boolean,
): React.CSSProperties {
  if (isCur) {
    return {
      background: 'var(--accent)',
      borderColor: 'var(--accent)',
      boxShadow: '0 0 0 2px rgba(122, 184, 255, 0.2)',
      fontWeight: 600,
    };
  }
  if (st === 'correct') {
    return {
      background: 'var(--success-bg)',
      borderColor: 'var(--success-border)',
    };
  }
  if (st === 'wrong') {
    return {
      background: 'var(--danger-bg)',
      borderColor: 'var(--danger-border)',
    };
  }
  if (st === 'skipped' || isSkip) {
    return {
      background: 'transparent',
      borderColor: 'var(--border-default)',
      borderStyle: 'dashed',
    };
  }
  return {
    background: 'transparent',
    borderColor: 'var(--border-default)',
  };
}

function cellTextColor(
  st: 'unseen' | 'correct' | 'wrong' | 'skipped',
  isCur: boolean,
): string {
  if (isCur) return '#0d1117';
  if (st === 'correct') return 'var(--success)';
  if (st === 'wrong') return 'var(--danger)';
  return 'var(--text-secondary)';
}
