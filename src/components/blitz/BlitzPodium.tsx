import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, RotateCcw, Sliders, Target, Trophy } from 'lucide-react';
import { RichText } from '@/components/RichText';
import { getOptions, parseExplanation } from '@/lib/quiz';
import { formatPoints, maxPossibleScore } from '@/lib/blitz';
import { useBlitz } from '@/state/blitzStore';
import type { DeckMeta } from '@/types';
import type { BlitzResult } from '@/state/blitzStore';

export function BlitzPodium({ deck, onReplaySame }: { deck: DeckMeta; onReplaySame: () => void }) {
  const results = useBlitz((s) => s.results);
  const questions = useBlitz((s) => s.questions);
  const score = useBlitz((s) => s.score);
  const bestStreak = useBlitz((s) => s.bestStreak);
  const newBest = useBlitz((s) => s.newBest);
  const replayMisses = useBlitz((s) => s.replayMisses);
  const quit = useBlitz((s) => s.quit);

  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const misses = results.filter((r) => !r.correct);
  const avgMs = total > 0 ? results.reduce((sum, r) => sum + r.msUsed, 0) / total : 0;
  const ceiling = maxPossibleScore(total);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-8">
      {newBest ? (
        <div
          className="mb-6 flex items-center gap-2.5 rounded-[12px] border px-4 py-3 text-sm"
          style={{
            background: 'var(--warning-bg)',
            borderColor: 'var(--warning-border)',
            color: 'var(--warning)',
          }}
        >
          <Trophy size={16} />
          New personal best on {deck.shortName}.
        </div>
      ) : null}

      <div className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-faint)' }}>
        Run complete · {deck.shortName}
      </div>
      <div
        className="mt-2 font-serif text-[64px] leading-none tracking-tight"
        style={{ color: 'var(--accent)' }}
      >
        {formatPoints(score)}
      </div>
      <div className="mt-1.5 font-mono text-[12px]" style={{ color: 'var(--text-muted)' }}>
        out of a possible {formatPoints(ceiling)}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Accuracy" value={`${accuracy}%`} sub={`${correct} of ${total}`} />
        <Stat label="Best streak" value={String(bestStreak)} sub="in a row" />
        <Stat
          label="Average pace"
          value={`${(avgMs / 1000).toFixed(1)}s`}
          sub="per question, after the reading"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {misses.length > 0 ? (
          <button
            type="button"
            onClick={replayMisses}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--accent)', color: '#08111c' }}
          >
            <Target size={15} />
            Rematch the {misses.length} you missed
          </button>
        ) : null}
        <button
          type="button"
          onClick={onReplaySame}
          className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-[14px] transition-colors hover:border-[color:var(--border-strong)]"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
        >
          <RotateCcw size={15} />
          Play again
        </button>
        <button
          type="button"
          onClick={quit}
          className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-[14px] transition-colors hover:border-[color:var(--border-strong)]"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
        >
          <Sliders size={15} />
          Change settings
        </button>
        <Link
          to={`/deck/${deck.id}`}
          className="flex items-center rounded-full px-4 py-2.5 text-[14px] underline underline-offset-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Back to the quiz
        </Link>
      </div>

      <h2 className="label-uppercase mt-12 mb-3">Every question</h2>
      <ol className="flex flex-col gap-1.5">
        {results.map((r, i) => (
          <ReviewRow key={`${r.qIdx}-${i}`} n={i + 1} result={r} question={questions[r.qIdx]} />
        ))}
      </ol>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      className="rounded-[12px] border p-4"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="label-uppercase">{label}</div>
      <div
        className="mt-1.5 font-mono text-[26px] font-semibold tabular-nums leading-none"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {sub}
      </div>
    </div>
  );
}

/**
 * One answered question, collapsed. Expanding shows the option set and the
 * deck's own explanation — the podium is the only place in this mode where
 * there is time to actually read one.
 */
function ReviewRow({
  n,
  result,
  question,
}: {
  n: number;
  result: BlitzResult;
  question: import('@/types').Question | undefined;
}) {
  const [open, setOpen] = useState(false);
  if (!question) return null;

  const tone = result.correct ? 'var(--success)' : 'var(--danger)';
  const options = getOptions(question);
  const correctLetters = question.correct.split(',').map((s) => s.trim().toUpperCase());
  const chosen = result.selected ? result.selected.split(',') : [];
  const explanation = parseExplanation(question.explanation).body;

  return (
    <li
      className="overflow-hidden rounded-[10px] border"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-subtle)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left"
        aria-expanded={open}
      >
        <span
          className="mt-[3px] h-2 w-2 shrink-0 rounded-full"
          style={{ background: tone }}
          aria-hidden="true"
        />
        <span className="font-mono text-[11px] tabular-nums" style={{ color: 'var(--text-faint)' }}>
          {String(n).padStart(2, '0')}
        </span>
        <span
          className="min-w-0 flex-1 truncate text-[13px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {question.question.replace(/\s+/g, ' ').trim()}
        </span>
        <span className="shrink-0 font-mono text-[11px] tabular-nums" style={{ color: tone }}>
          {result.timedOut ? 'timed out' : result.correct ? `+${formatPoints(result.points)}` : 'missed'}
        </span>
        <ChevronDown
          size={14}
          className="mt-0.5 shrink-0 transition-transform"
          style={{
            color: 'var(--text-faint)',
            transform: open ? 'rotate(180deg)' : undefined,
          }}
        />
      </button>

      {open ? (
        <div
          className="border-t px-3.5 py-3.5"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="text-[14px] leading-snug" style={{ color: 'var(--text-primary)' }}>
            <RichText text={question.question} size="sm" />
          </div>
          <ul className="mt-3 flex flex-col gap-1">
            {options.map((opt) => {
              const isKey = correctLetters.includes(opt.letter);
              const isChosen = chosen.includes(opt.letter);
              return (
                <li
                  key={opt.letter}
                  className="rounded-[6px] border px-2.5 py-1.5 text-[12.5px] leading-snug"
                  style={{
                    borderColor: isKey
                      ? 'var(--success-border)'
                      : isChosen
                        ? 'var(--danger-border)'
                        : 'var(--border-subtle)',
                    background: isKey
                      ? 'var(--success-bg)'
                      : isChosen
                        ? 'var(--danger-bg)'
                        : 'transparent',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className="font-mono text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    {opt.letter}
                    {isChosen ? ' · you' : ''}
                    {isKey ? ' · key' : ''}
                  </span>{' '}
                  <RichText text={opt.text} size="sm" />
                </li>
              );
            })}
          </ul>
          {explanation ? (
            <div
              className="mt-3 text-[13px] leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              <RichText text={explanation} size="sm" />
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
