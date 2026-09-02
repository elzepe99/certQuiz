import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { useDeck, useManifest } from '@/lib/decks';
import { clearProgress, loadProgress } from '@/lib/storage';
import { isCorrect, formatTime } from '@/lib/quiz';
import { applyQuestionOrder, clampSetIndex, setBoundaries, setRange } from '@/lib/sets';

export function CompletionScreen() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const manifest = useManifest();
  const deckLoad = useDeck(deckId);
  const [searchParams] = useSearchParams();
  const setParam = searchParams.get('set');

  const decks = manifest.status === 'ready' ? manifest.decks : undefined;

  const data = useMemo(() => {
    if (deckLoad.status !== 'ready' || !deckId) return null;
    const p = loadProgress(deckId, deckLoad.questions);
    // Progress is indexed by *display* position, so the deck has to be put into
    // display order before either can be read against the other.
    const questions = applyQuestionOrder(deckLoad.questions, p.questionOrder);

    const boundaries = setBoundaries(questions.length, p.setSize);
    const count = Math.max(1, boundaries.length - 1);
    // Scope to one set when we arrived from finishing it; otherwise report the
    // whole deck, which is what a direct visit to /complete means.
    const scoped = setParam !== null && count > 1;
    const setIdx = scoped ? clampSetIndex(Number(setParam), boundaries) : 0;
    const { start, end } = scoped
      ? setRange(setIdx, boundaries)
      : { start: 0, end: questions.length };

    let correct = 0;
    let answered = 0;
    let totalTime = 0;
    const byCat: Record<string, { total: number; answered: number; correct: number }> =
      {};
    for (let i = start; i < end; i++) {
      const q = questions[i];
      if (!q) continue;
      const cat = q._cat || 'General';
      byCat[cat] ??= { total: 0, answered: 0, correct: 0 };
      byCat[cat].total += 1;
      if (p.submitted[i]) {
        answered += 1;
        byCat[cat].answered += 1;
        if (isCorrect(p.answers[i], q.correct)) {
          correct += 1;
          byCat[cat].correct += 1;
        }
      }
      totalTime += p.timeOnQ[i] ?? 0;
    }
    const accuracy = answered > 0 ? correct / answered : 0;
    const avgPerQ = answered > 0 ? Math.round(totalTime / answered) : 0;
    return {
      scoped,
      setIdx,
      setCount: count,
      isFinalSet: setIdx === count - 1,
      total: end - start,
      answered,
      correct,
      accuracy,
      totalTime,
      avgPerQ,
      byCat: Object.entries(byCat)
        .filter(([, v]) => v.answered > 0)
        .sort((a, b) => b[1].total - a[1].total),
    };
  }, [deckLoad, deckId, setParam]);

  // If user lands here without any progress in the reported scope, send them
  // back to the deck — into that set, so the trip isn't lost.
  useEffect(() => {
    if (data && data.answered === 0 && deckId) {
      const to = data.scoped ? `/deck/${deckId}?set=${data.setIdx}` : `/deck/${deckId}`;
      navigate(to, { replace: true });
    }
  }, [data, deckId, navigate]);

  if (deckLoad.status !== 'ready' || !data) {
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

  const accuracyPct = Math.round(data.accuracy * 100);
  const message =
    accuracyPct >= 90
      ? `Excellent — ${data.correct} of ${data.answered} correct.`
      : accuracyPct >= 75
        ? `Strong pass range — ${data.correct} of ${data.answered} correct.`
        : accuracyPct >= 60
          ? `Getting there — ${data.correct} of ${data.answered} correct.`
          : `Keep practicing — ${data.correct} of ${data.answered} correct.`;

  const totalTimeStr = formatTime(data.totalTime);
  const avgStr = formatTime(data.avgPerQ);

  return (
    <div className="flex h-screen flex-col" style={{ background: 'var(--bg-canvas)' }}>
      <TopBar currentDeck={deckLoad.deck} decks={decks} />

      <main className="flex-1 overflow-y-auto px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <h1
            className="font-serif text-[40px] leading-tight tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {data.scoped
              ? `Set ${data.setIdx + 1} of ${data.setCount} complete`
              : 'Session complete'}
          </h1>

          <div className="mt-8 flex items-baseline gap-4">
            <span
              className="font-serif text-[88px] leading-none tracking-tight"
              style={{ color: 'var(--accent)' }}
            >
              {accuracyPct}%
            </span>
            <span
              className="font-mono text-[13px] tabular-nums"
              style={{ color: 'var(--text-secondary)' }}
            >
              {data.correct} / {data.answered} correct
            </span>
          </div>

          <p className="mt-4 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <Stat label="Total time" value={totalTimeStr} />
            <Stat label="Avg / question" value={avgStr} />
            <Stat label="Answered" value={`${data.answered} / ${data.total}`} />
          </div>

          <section className="mt-12">
            <h2
              className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
              style={{ color: 'var(--text-faint)' }}
            >
              By topic
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {data.byCat.map(([cat, v]) => {
                const pct = v.answered > 0 ? Math.round((v.correct / v.answered) * 100) : 0;
                return (
                  <div
                    key={cat}
                    className="rounded-[8px] border p-3"
                    style={{
                      background: 'var(--bg-panel)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span style={{ color: 'var(--text-primary)' }}>{cat}</span>
                      <span
                        className="font-mono tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {v.correct} / {v.answered}{' '}
                        <span style={{ color: 'var(--text-faint)' }}>· {pct}%</span>
                      </span>
                    </div>
                    <div
                      className="mt-2 h-[3px] overflow-hidden rounded-full"
                      style={{ background: 'var(--border-subtle)' }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            pct >= 75
                              ? 'var(--success)'
                              : pct >= 50
                                ? 'var(--accent)'
                                : 'var(--danger)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mt-12 flex flex-wrap gap-3">
            {data.scoped && !data.isFinalSet ? (
              <Link
                to={`/deck/${deckLoad.deck.id}?set=${data.setIdx + 1}`}
                className="rounded-[8px] border px-4 py-2.5 text-[13px] font-semibold transition-colors"
                style={{
                  background: 'var(--accent)',
                  borderColor: 'var(--accent)',
                  color: '#0d1117',
                }}
              >
                Start set {data.setIdx + 2} →
              </Link>
            ) : null}

            <Link
              to={
                data.scoped
                  ? `/deck/${deckLoad.deck.id}/review?set=${data.setIdx}`
                  : `/deck/${deckLoad.deck.id}/review`
              }
              className="rounded-[8px] border px-4 py-2.5 text-[13px] font-semibold transition-colors"
              style={
                data.scoped && !data.isFinalSet
                  ? {
                      background: 'transparent',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }
                  : {
                      background: 'var(--accent)',
                      borderColor: 'var(--accent)',
                      color: '#0d1117',
                    }
              }
            >
              {data.scoped ? 'Review wrong answers (this set) →' : 'Review wrong answers →'}
            </Link>

            {!data.scoped || data.isFinalSet ? (
              <button
                onClick={() => {
                  if (window.confirm('Reset all progress for this deck?')) {
                    if (deckId) {
                      clearProgress(deckId);
                      navigate(`/deck/${deckId}`);
                    }
                  }
                }}
                className="rounded-[8px] border px-4 py-2.5 text-[13px] font-medium transition-colors"
                style={{
                  background: 'transparent',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                Restart deck
              </button>
            ) : null}

            <Link
              to="/"
              className="rounded-[8px] px-4 py-2.5 text-[13px] font-medium transition-colors hover:text-[color:var(--text-primary)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Back to decks
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[8px] border p-3"
      style={{
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.14em]"
        style={{ color: 'var(--text-faint)' }}
      >
        {label}
      </div>
      <div
        className="mt-1.5 font-mono text-[18px] tabular-nums"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </div>
    </div>
  );
}
