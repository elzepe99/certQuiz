import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Flag } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { useDeck, useManifest } from '@/lib/decks';
import { loadProgress } from '@/lib/storage';
import { isCorrect, parseExplanation, getOptions } from '@/lib/quiz';

export function ReviewScreen() {
  const { deckId } = useParams<{ deckId: string }>();
  const manifest = useManifest();
  const deckLoad = useDeck(deckId);

  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const decks = manifest.status === 'ready' ? manifest.decks : undefined;

  const data = useMemo(() => {
    if (deckLoad.status !== 'ready' || !deckId) return null;
    const p = loadProgress(deckId, deckLoad.questions);
    const flaggedSet = new Set(p.flagged);
    const wrong: Array<{
      i: number;
      q: (typeof deckLoad.questions)[number];
      selected: string;
      flagged: boolean;
    }> = [];
    for (let i = 0; i < deckLoad.questions.length; i++) {
      if (!p.submitted[i]) continue;
      const q = deckLoad.questions[i];
      const sel = p.answers[i] ?? '';
      if (!isCorrect(sel, q.correct)) {
        wrong.push({ i, q, selected: sel, flagged: flaggedSet.has(i) });
      }
    }
    const topics = Array.from(new Set(wrong.map((w) => w.q._cat || 'General'))).sort();
    return { wrong, topics };
  }, [deckLoad, deckId]);

  if (deckLoad.status === 'loading' || !data) {
    return (
      <div className="flex h-screen flex-col" style={{ background: 'var(--bg-canvas)' }}>
        <TopBar />
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Loading…
        </div>
      </div>
    );
  }

  if (deckLoad.status !== 'ready') {
    return (
      <div className="flex h-screen flex-col" style={{ background: 'var(--bg-canvas)' }}>
        <TopBar />
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Could not load deck.
        </div>
      </div>
    );
  }

  const filtered = data.wrong.filter((w) => {
    if (topicFilter && (w.q._cat || 'General') !== topicFilter) return false;
    if (flaggedOnly && !w.flagged) return false;
    return true;
  });

  return (
    <div className="flex h-screen flex-col" style={{ background: 'var(--bg-canvas)' }}>
      <TopBar currentDeck={deckLoad.deck} decks={decks} />

      <main className="flex-1 overflow-y-auto px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-baseline justify-between gap-4">
            <h1
              className="font-serif text-[36px] leading-tight tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Review
            </h1>
            <Link
              to={`/deck/${deckLoad.deck.id}`}
              className="text-sm transition-colors hover:text-[color:var(--text-primary)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              ← Back to quiz
            </Link>
          </div>

          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {data.wrong.length} wrong-answered{' '}
            {data.wrong.length === 1 ? 'question' : 'questions'}
            {data.wrong.length === 0 ? ' — nothing to review yet.' : '.'}
          </p>

          {data.wrong.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <FilterChip
                active={topicFilter === null}
                onClick={() => setTopicFilter(null)}
              >
                All topics
              </FilterChip>
              {data.topics.map((t) => (
                <FilterChip
                  key={t}
                  active={topicFilter === t}
                  onClick={() => setTopicFilter(topicFilter === t ? null : t)}
                >
                  {t}
                </FilterChip>
              ))}
              <span
                className="mx-2 h-4 w-px"
                style={{ background: 'var(--border-default)' }}
              />
              <FilterChip
                active={flaggedOnly}
                onClick={() => setFlaggedOnly((v) => !v)}
              >
                <Flag size={11} className="mr-1 inline-block" />
                Flagged only
              </FilterChip>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2">
            {filtered.map(({ i, q, selected, flagged }) => {
              const open = !!expanded[i];
              const opts = getOptions(q);
              const parsed = parseExplanation(q.explanation);
              return (
                <div
                  key={i}
                  className="rounded-[12px] border"
                  style={{
                    background: 'var(--bg-panel)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <button
                    onClick={() => setExpanded((m) => ({ ...m, [i]: !m[i] }))}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left"
                  >
                    <span className="mt-0.5">
                      {open ? (
                        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                      ) : (
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </span>
                    <span className="flex-1">
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.14em]"
                        style={{ color: 'var(--text-faint)' }}
                      >
                        Q · {String(i + 1).padStart(3, '0')} · {q._cat || 'General'}
                        {flagged ? ' · flagged' : ''}
                      </span>
                      <span
                        className="mt-1 block whitespace-pre-line font-serif text-[18px] leading-snug"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {q.question}
                      </span>
                      <span
                        className="mt-2 block font-mono text-[11px] tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Your answer:{' '}
                        <span style={{ color: 'var(--danger)' }}>
                          {selected || '—'}
                        </span>{' '}
                        · Correct:{' '}
                        <span style={{ color: 'var(--success)' }}>{q.correct}</span>
                      </span>
                    </span>
                  </button>

                  {open ? (
                    <div
                      className="border-t px-4 pb-4 pt-3"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <ul className="flex flex-col gap-1.5">
                        {opts.map(({ letter, text }) => {
                          const isCorrectOpt = q.correct
                            .split(',')
                            .map((s) => s.trim())
                            .includes(letter);
                          const isYours = selected
                            .split(',')
                            .map((s) => s.trim())
                            .includes(letter);
                          return (
                            <li
                              key={letter}
                              className="flex items-start gap-2 rounded-[6px] border px-3 py-2 text-[13px]"
                              style={{
                                background: isCorrectOpt
                                  ? 'var(--success-bg)'
                                  : isYours
                                    ? 'var(--danger-bg)'
                                    : 'transparent',
                                borderColor: isCorrectOpt
                                  ? 'var(--success-border)'
                                  : isYours
                                    ? 'var(--danger-border)'
                                    : 'var(--border-subtle)',
                                color: 'var(--text-primary)',
                              }}
                            >
                              <span className="font-mono text-[11px] font-medium">
                                {letter}
                              </span>
                              <span className="whitespace-pre-line">{text}</span>
                            </li>
                          );
                        })}
                      </ul>

                      {parsed.body ? (
                        <div className="mt-4">
                          <div
                            className="font-mono text-[10px] uppercase tracking-[0.16em]"
                            style={{ color: 'var(--text-faint)' }}
                          >
                            Explanation
                          </div>
                          <div
                            className="mt-1.5 whitespace-pre-line text-[13px] leading-[1.65]"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {parsed.body}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-xs transition-colors"
      style={
        active
          ? {
              background: 'var(--accent-bg)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent)',
            }
          : {
              background: 'transparent',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
            }
      }
    >
      {children}
    </button>
  );
}
