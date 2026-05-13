import { useEffect } from 'react';
import { useQuiz } from '@/state/quizStore';
import { getOptions, isMultiCorrectPrompt } from '@/lib/quiz';

type Handlers = {
  onFinish: () => void;
  onShowShortcuts?: () => void;
};

export function useShortcuts({ onFinish, onShowShortcuts }: Handlers) {
  const submit = useQuiz((s) => s.submit);
  const next = useQuiz((s) => s.next);
  const prev = useQuiz((s) => s.prev);
  const skip = useQuiz((s) => s.skip);
  const toggleFlag = useQuiz((s) => s.toggleFlag);
  const selectOption = useQuiz((s) => s.selectOption);
  const toggleMultiSelect = useQuiz((s) => s.toggleMultiSelect);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ignore shortcuts while user is typing in an input/textarea
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const state = useQuiz.getState();
      const idx = state.progress.currentIdx;
      const q = state.questions[idx];
      if (!q) return;
      const isAnswered = !!state.progress.submitted[idx];
      const hasSel = !!state.progress.answers[idx];
      const total = state.questions.length;
      const isLast = idx === total - 1;
      const opts = getOptions(q);
      const isMulti = isMultiCorrectPrompt(q.question, q.correct);

      // Number keys 1..5 -> select corresponding option
      if (/^[1-5]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        const opt = opts[i];
        if (opt && !isAnswered) {
          e.preventDefault();
          if (isMulti) toggleMultiSelect(opt.letter);
          else selectOption(opt.letter);
        }
        return;
      }

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (!isAnswered) {
            if (hasSel) submit();
          } else if (isLast) {
            onFinish();
          } else {
            next();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFlag();
          break;
        case 's':
        case 'S':
          if (!isAnswered) {
            e.preventDefault();
            skip();
          }
          break;
        case '?':
          e.preventDefault();
          onShowShortcuts?.();
          break;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    onFinish,
    onShowShortcuts,
    submit,
    next,
    prev,
    skip,
    toggleFlag,
    selectOption,
    toggleMultiSelect,
  ]);
}
