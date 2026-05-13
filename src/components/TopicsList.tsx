import { useMemo } from 'react';
import { useQuiz } from '@/state/quizStore';
import { deriveTopics } from '@/lib/quiz';

export function TopicsList() {
  const questions = useQuiz((s) => s.questions);
  const currentIdx = useQuiz((s) => s.progress.currentIdx);
  const goTo = useQuiz((s) => s.goTo);
  const submitted = useQuiz((s) => s.progress.submitted);

  const topics = useMemo(() => deriveTopics(questions), [questions]);
  const currentCat = questions[currentIdx]?._cat ?? 'General';

  return (
    <div className="flex flex-col gap-0.5">
      {topics.map(({ name, count }) => {
        const active = name === currentCat;
        return (
          <button
            key={name}
            onClick={() => {
              const firstUnseen = questions.findIndex(
                (q, i) => q._cat === name && !submitted[i],
              );
              const target =
                firstUnseen >= 0
                  ? firstUnseen
                  : questions.findIndex((q) => q._cat === name);
              if (target >= 0) goTo(target);
            }}
            className="flex items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-left text-sm transition-colors"
            style={{
              background: active ? 'var(--bg-panel-hi)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <span
              className="h-[7px] w-[7px] shrink-0 rounded-full"
              style={{ background: active ? 'var(--accent)' : 'var(--text-faint)' }}
            />
            <span className="flex-1 truncate">{name}</span>
            <span
              className="font-mono text-[10px] tabular-nums"
              style={{ color: 'var(--text-faint)' }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
