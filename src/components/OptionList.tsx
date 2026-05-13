import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { useQuiz } from '@/state/quizStore';
import { getOptions, isMultiCorrectPrompt } from '@/lib/quiz';

export function OptionList() {
  const questions = useQuiz((s) => s.questions);
  const idx = useQuiz((s) => s.progress.currentIdx);
  const submitted = useQuiz((s) => s.progress.submitted);
  const answers = useQuiz((s) => s.progress.answers);
  const selectOption = useQuiz((s) => s.selectOption);
  const toggleMultiSelect = useQuiz((s) => s.toggleMultiSelect);

  const q = questions[idx];
  const options = useMemo(() => (q ? getOptions(q) : []), [q]);
  const isAnswered = !!submitted[idx];
  const sel = answers[idx] ?? '';
  const isMulti = q ? isMultiCorrectPrompt(q.question, q.correct) : false;
  const correctSet = useMemo(() => {
    if (!q) return new Set<string>();
    return new Set(q.correct.split(',').map((s) => s.trim().toUpperCase()));
  }, [q]);
  const selectedSet = useMemo(
    () => new Set(sel.split(',').map((s) => s.trim()).filter(Boolean)),
    [sel],
  );

  if (!q) return null;

  return (
    <div className="flex max-w-[760px] flex-col gap-2.5">
      {options.map(({ letter, text }) => {
        const isSelected = selectedSet.has(letter);
        const isCorrectOption = correctSet.has(letter);
        const showCorrect = isAnswered && isCorrectOption;
        const showWrong = isAnswered && isSelected && !isCorrectOption;
        const dimmed = isAnswered && !showCorrect && !showWrong;

        return (
          <button
            key={letter}
            onClick={() => {
              if (isAnswered) return;
              if (isMulti) toggleMultiSelect(letter);
              else selectOption(letter);
            }}
            disabled={isAnswered}
            className={`relative flex items-start gap-4 rounded-[12px] border px-5 py-4 text-left transition-all ${
              !isAnswered ? 'hover:border-[color:var(--border-strong)]' : ''
            } ${dimmed ? 'opacity-55' : ''}`}
            style={optionStyle(isSelected, showCorrect, showWrong)}
          >
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border font-mono text-xs font-medium"
              style={letterStyle(isSelected, showCorrect, showWrong)}
            >
              {letter}
            </span>
            <span
              className="whitespace-pre-line pt-1 text-[15px] leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              {text}
            </span>
            <Indicator isSelected={isSelected} showCorrect={showCorrect} showWrong={showWrong} />
          </button>
        );
      })}
    </div>
  );
}

function Indicator({
  isSelected,
  showCorrect,
  showWrong,
}: {
  isSelected: boolean;
  showCorrect: boolean;
  showWrong: boolean;
}) {
  if (showCorrect) {
    return (
      <span
        className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full"
        style={{ background: 'var(--success)', color: '#0d1117' }}
      >
        <Check size={14} strokeWidth={3} />
      </span>
    );
  }
  if (showWrong) {
    return (
      <span
        className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full"
        style={{ background: 'var(--danger)', color: '#0d1117' }}
      >
        <X size={14} strokeWidth={3} />
      </span>
    );
  }
  return (
    <span
      className="absolute right-4 top-4 h-[18px] w-[18px] rounded-full border-[1.5px] transition-all"
      style={{
        borderColor: isSelected ? 'var(--accent)' : 'var(--border-strong)',
        background: isSelected ? 'var(--accent)' : 'transparent',
        boxShadow: isSelected ? 'inset 0 0 0 4px var(--bg-canvas)' : 'none',
      }}
    />
  );
}

function optionStyle(
  isSelected: boolean,
  showCorrect: boolean,
  showWrong: boolean,
): React.CSSProperties {
  if (showCorrect) {
    return {
      background: 'var(--success-bg)',
      borderColor: 'var(--success-border)',
      boxShadow: '0 0 0 1px var(--success-border)',
    };
  }
  if (showWrong) {
    return { background: 'var(--danger-bg)', borderColor: 'var(--danger-border)' };
  }
  if (isSelected) {
    return {
      background: 'var(--accent-bg)',
      borderColor: 'var(--accent)',
      boxShadow:
        '0 0 0 1px var(--accent-border), 0 0 24px -8px rgba(122, 184, 255, 0.6)',
    };
  }
  return { background: 'var(--bg-panel)', borderColor: 'var(--border-default)' };
}

function letterStyle(
  isSelected: boolean,
  showCorrect: boolean,
  showWrong: boolean,
): React.CSSProperties {
  if (showCorrect) {
    return {
      background: 'var(--success)',
      borderColor: 'var(--success)',
      color: '#0d1117',
      fontWeight: 600,
    };
  }
  if (showWrong) {
    return {
      background: 'var(--danger)',
      borderColor: 'var(--danger)',
      color: '#0d1117',
      fontWeight: 600,
    };
  }
  if (isSelected) {
    return {
      background: 'var(--accent)',
      borderColor: 'var(--accent)',
      color: '#0d1117',
      fontWeight: 600,
    };
  }
  return {
    background: 'var(--bg-canvas)',
    borderColor: 'var(--border-default)',
    color: 'var(--text-secondary)',
  };
}
