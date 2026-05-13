import { useMemo } from 'react';
import { useQuiz } from '@/state/quizStore';
import { isCorrect, parseExplanation, linkifySegments } from '@/lib/quiz';

type Props = {
  onOpenInPanel?: () => void;
};

export function ExplanationBlock({ onOpenInPanel }: Props) {
  const questions = useQuiz((s) => s.questions);
  const idx = useQuiz((s) => s.progress.currentIdx);
  const submitted = useQuiz((s) => s.progress.submitted);
  const answers = useQuiz((s) => s.progress.answers);

  const q = questions[idx];
  const isAnswered = !!submitted[idx];

  const parsed = useMemo(() => parseExplanation(q?.explanation ?? ''), [q]);

  if (!q || !isAnswered) return null;
  if (!parsed.body && parsed.references.length === 0) return null;

  const correct = isCorrect(answers[idx], q.correct);

  return (
    <div
      key={idx}
      className="mt-6 max-w-[760px] animate-slide-down rounded-[12px] border p-5"
      style={{
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="block h-3 w-[3px] rounded-full"
            style={{ background: correct ? 'var(--success)' : 'var(--danger)' }}
          />
          <h3
            className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
            style={{ color: correct ? 'var(--success)' : 'var(--danger)' }}
          >
            {correct ? '✓ Correct' : '✗ Incorrect'} — Explanation
          </h3>
        </div>
        {onOpenInPanel ? (
          <button
            onClick={onOpenInPanel}
            className="font-mono text-[10px] uppercase tracking-[0.12em] transition-colors hover:text-[color:var(--text-primary)]"
            style={{ color: 'var(--text-muted)' }}
          >
            Open in side panel ↗
          </button>
        ) : null}
      </div>

      {parsed.body ? (
        <div
          className="mt-3 max-h-[280px] overflow-y-auto whitespace-pre-line pr-3 text-[14px] leading-[1.65]"
          style={{ color: 'var(--text-primary)' }}
        >
          {parsed.body}
        </div>
      ) : null}

      {parsed.references.length > 0 ? (
        <div className="mt-4">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: 'var(--text-faint)' }}
          >
            References
          </div>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {parsed.references.map((r, i) => (
              <li
                key={i}
                className="leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {linkifySegments(r).map((seg, j) =>
                  seg.kind === 'link' ? (
                    <a
                      key={j}
                      href={seg.value}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--accent)' }}
                      className="underline-offset-2 hover:underline"
                    >
                      {seg.value}
                    </a>
                  ) : (
                    <span key={j}>{seg.value}</span>
                  ),
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
