import { useMemo } from 'react';
import { useQuiz } from '@/state/quizStore';
import { isCorrect } from '@/lib/quiz';

export function PerformanceCard() {
  const questions = useQuiz((s) => s.questions);
  const idx = useQuiz((s) => s.progress.currentIdx);
  const answers = useQuiz((s) => s.progress.answers);
  const submitted = useQuiz((s) => s.progress.submitted);
  const flagged = useQuiz((s) => s.progress.flagged);

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    const submittedIdxs = Object.keys(submitted)
      .map(Number)
      .sort((a, b) => a - b);
    for (const i of submittedIdxs) {
      if (isCorrect(answers[i], questions[i].correct)) correct++;
      else wrong++;
    }
    return {
      correct,
      wrong,
      answered: submittedIdxs.length,
      total: questions.length,
      accuracy: submittedIdxs.length > 0 ? correct / submittedIdxs.length : 0,
      flaggedCount: flagged.length,
    };
  }, [questions, answers, submitted, flagged]);

  // Sparkline: last 24 questions around currentIdx
  const start = Math.max(0, idx - 11);
  const end = Math.min(questions.length, start + 24);
  const cells: Array<{ kind: 'good' | 'bad' | 'cur' | 'pending'; height: number }> = [];
  for (let i = start; i < end; i++) {
    if (submitted[i]) {
      const ok = isCorrect(answers[i], questions[i].correct);
      cells.push({ kind: ok ? 'good' : 'bad', height: ok ? 90 : 70 });
    } else if (i === idx) {
      cells.push({ kind: 'cur', height: 40 });
    } else {
      cells.push({ kind: 'pending', height: 30 });
    }
  }

  return (
    <div
      className="rounded-[12px] border p-4"
      style={{
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ color: 'var(--text-faint)' }}
      >
        Performance
      </div>

      <dl className="mt-3 flex flex-col">
        <StatLine label="Answered" value={`${stats.answered} / ${stats.total}`} />
        <StatLine
          label="Correct"
          value={
            stats.answered > 0
              ? `${stats.correct} · ${Math.round(stats.accuracy * 100)}%`
              : '0 · 0%'
          }
          tone="good"
        />
        <StatLine label="Wrong" value={String(stats.wrong)} tone="bad" />
        <StatLine label="Flagged" value={String(stats.flaggedCount)} />
      </dl>

      <div className="mt-3 flex h-8 items-end gap-[2px]">
        {cells.map((c, i) => (
          <span
            key={i}
            className="flex-1 rounded-[1px]"
            style={{
              background:
                c.kind === 'good'
                  ? 'var(--success)'
                  : c.kind === 'bad'
                    ? 'var(--danger)'
                    : c.kind === 'cur'
                      ? 'transparent'
                      : 'var(--border-default)',
              boxShadow: c.kind === 'cur' ? '0 0 0 1px var(--accent)' : undefined,
              height: `${Math.max(2, c.height)}%`,
              minHeight: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StatLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'bad';
}) {
  return (
    <div
      className="flex items-baseline justify-between border-b py-1.5 font-mono text-[11px] last:border-0 last:pb-0"
      style={{
        color: 'var(--text-secondary)',
        borderColor: 'var(--border-subtle)',
        borderStyle: 'dashed',
      }}
    >
      <dt>{label}</dt>
      <dd
        className="font-medium tabular-nums"
        style={{
          color:
            tone === 'good'
              ? 'var(--success)'
              : tone === 'bad'
                ? 'var(--danger)'
                : 'var(--text-primary)',
        }}
      >
        {value}
      </dd>
    </div>
  );
}
