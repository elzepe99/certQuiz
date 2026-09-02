import { useMemo } from 'react';
import { useQuiz, useSetInfo } from '@/state/quizStore';
import { isCorrect } from '@/lib/quiz';

export function PerformanceCard() {
  const questions = useQuiz((s) => s.questions);
  const idx = useQuiz((s) => s.progress.currentIdx);
  const answers = useQuiz((s) => s.progress.answers);
  const submitted = useQuiz((s) => s.progress.submitted);
  const flagged = useQuiz((s) => s.progress.flagged);
  const { count, start: setStart, end: setEnd, size: setSize } = useSetInfo();

  // Scoped to the set being worked — this card answers "how is this sitting
  // going", and the deck-wide total sits on its own line below.
  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let answered = 0;
    let flaggedCount = 0;
    for (let i = setStart; i < setEnd; i++) {
      if (flagged.includes(i)) flaggedCount++;
      if (!submitted[i] || !questions[i]) continue;
      answered++;
      if (isCorrect(answers[i], questions[i].correct)) correct++;
      else wrong++;
    }
    let deckAnswered = 0;
    for (const key of Object.keys(submitted)) {
      if (questions[Number(key)]) deckAnswered++;
    }
    return {
      correct,
      wrong,
      answered,
      total: setSize,
      accuracy: answered > 0 ? correct / answered : 0,
      flaggedCount,
      deckAnswered,
      deckTotal: questions.length,
    };
  }, [questions, answers, submitted, flagged, setStart, setEnd, setSize]);

  // Sparkline: a 24-question window around currentIdx, held inside the set so
  // it never charts questions this sitting is not about.
  const windowStart = Math.max(setStart, Math.min(idx - 11, Math.max(setStart, setEnd - 24)));
  const start = windowStart;
  const end = Math.min(setEnd, start + 24);
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
        {count > 1 ? 'Performance · this set' : 'Performance'}
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
        {count > 1 ? (
          <StatLine label="Deck" value={`${stats.deckAnswered} / ${stats.deckTotal}`} />
        ) : null}
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
