import { Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuiz } from '@/state/quizStore';
import { isMultiCorrectPrompt, requiredAnswerCount } from '@/lib/quiz';

type Props = {
  onFinish: () => void;
};

export function ActionBar({ onFinish }: Props) {
  const idx = useQuiz((s) => s.progress.currentIdx);
  const total = useQuiz((s) => s.questions.length);
  const questions = useQuiz((s) => s.questions);
  const submitted = useQuiz((s) => s.progress.submitted);
  const answers = useQuiz((s) => s.progress.answers);
  const flagged = useQuiz((s) => s.progress.flagged);

  const submit = useQuiz((s) => s.submit);
  const next = useQuiz((s) => s.next);
  const prev = useQuiz((s) => s.prev);
  const skip = useQuiz((s) => s.skip);
  const toggleFlag = useQuiz((s) => s.toggleFlag);

  const isAnswered = !!submitted[idx];
  const isFlagged = flagged.includes(idx);
  const isLast = idx === total - 1;

  const q = questions[idx];
  const sel = answers[idx] ?? '';
  const selectedCount = sel ? sel.split(',').filter(Boolean).length : 0;
  const isMulti = q ? isMultiCorrectPrompt(q.question, q.correct) : false;
  const required = q ? requiredAnswerCount(q.question, q.correct) : 1;
  const selectionSatisfied = isMulti ? selectedCount === required : selectedCount > 0;

  const primaryLabel = !isAnswered
    ? 'Submit answer'
    : isLast
      ? 'Finish session'
      : 'Next question';

  const primaryDisabled = !isAnswered && !selectionSatisfied;

  const onPrimary = () => {
    if (!isAnswered) {
      submit();
    } else if (isLast) {
      onFinish();
    } else {
      next();
    }
  };

  return (
    <div
      className="mt-7 flex max-w-[760px] flex-wrap items-center gap-2 border-t pt-5"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <button
        onClick={toggleFlag}
        className="flex items-center gap-2 rounded-[8px] border px-3.5 py-2 text-[13px] font-medium transition-colors"
        style={
          isFlagged
            ? {
                background: 'var(--warning-bg)',
                borderColor: 'var(--warning-border)',
                color: 'var(--warning)',
              }
            : {
                background: 'transparent',
                borderColor: 'transparent',
                color: 'var(--text-secondary)',
              }
        }
      >
        <Flag size={13} fill={isFlagged ? 'currentColor' : 'none'} />
        {isFlagged ? 'Flagged' : 'Flag for review'}
      </button>

      {!isAnswered ? (
        <button
          onClick={skip}
          className="rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[color:var(--bg-panel-hi)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Skip
        </button>
      ) : null}

      <span className="flex-1" />

      <span
        className="font-mono text-[11px] tabular-nums"
        style={{ color: 'var(--text-faint)' }}
      >
        {String(idx + 1).padStart(3, '0')} / {total}
      </span>

      <button
        onClick={prev}
        disabled={idx === 0}
        className="flex items-center gap-1 rounded-[8px] border px-3.5 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: 'var(--bg-panel)',
          borderColor: 'var(--border-default)',
          color: 'var(--text-primary)',
        }}
      >
        <ChevronLeft size={14} />
        Previous
      </button>

      {!isAnswered && isMulti && (
        <span
          className="text-[12px] font-medium tabular-nums"
          style={{ color: selectionSatisfied ? 'var(--success)' : 'var(--text-secondary)' }}
        >
          {selectedCount} / {required} selected
        </span>
      )}

      <button
        onClick={onPrimary}
        disabled={primaryDisabled}
        className="flex items-center gap-2 rounded-[8px] border px-4 py-2 text-[13px] font-semibold transition-all disabled:cursor-not-allowed"
        style={
          primaryDisabled
            ? {
                background: 'var(--border-default)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-faint)',
              }
            : {
                background: 'var(--accent)',
                borderColor: 'var(--accent)',
                color: '#0d1117',
              }
        }
      >
        {primaryLabel}
        <ChevronRight size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
