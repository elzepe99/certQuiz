import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { loadDeckQuestions, useManifest } from '@/lib/decks';
import { loadProgress } from '@/lib/storage';
import { isCorrect } from '@/lib/quiz';
import type { DeckMeta } from '@/types';
import { ChevronRight } from 'lucide-react';

type SummaryMap = Record<
  string,
  { total: number; answered: number; correct: number; accuracy: number } | null
>;

export function DeckPicker() {
  const manifest = useManifest();
  const [summaries, setSummaries] = useState<SummaryMap>({});

  useEffect(() => {
    if (manifest.status !== 'ready') return;
    let cancelled = false;
    (async () => {
      const out: SummaryMap = {};
      for (const deck of manifest.decks) {
        try {
          const qs = await loadDeckQuestions(deck);
          const p = loadProgress(deck.id, qs);
          const submittedIdxs = Object.keys(p.submitted).map(Number);
          if (submittedIdxs.length === 0) {
            out[deck.id] = { total: qs.length, answered: 0, correct: 0, accuracy: 0 };
            continue;
          }
          let correct = 0;
          for (const i of submittedIdxs) {
            if (qs[i] && isCorrect(p.answers[i], qs[i].correct)) correct++;
          }
          out[deck.id] = {
            total: qs.length,
            answered: submittedIdxs.length,
            correct,
            accuracy: correct / submittedIdxs.length,
          };
        } catch {
          out[deck.id] = null;
        }
      }
      if (!cancelled) setSummaries(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [manifest]);

  return (
    <div className="flex h-screen flex-col" style={{ background: 'var(--bg-canvas)' }}>
      <TopBar />
      <main className="flex-1 overflow-y-auto px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <h1
            className="font-serif text-[40px] leading-tight tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Pick a deck
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Self-paced certification practice. Pick up where you left off — your progress is
            saved per deck.
          </p>

          {manifest.status === 'loading' ? (
            <p className="mt-12 text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading decks…
            </p>
          ) : manifest.status === 'error' ? (
            <div
              className="mt-12 rounded-lg border p-6"
              style={{
                background: 'var(--bg-panel)',
                borderColor: 'var(--danger-border, rgba(248,113,113,0.35))',
                color: 'var(--text-secondary)',
              }}
            >
              <div className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
                Could not load deck manifest
              </div>
              <div className="mt-1 text-sm">{manifest.message}</div>
            </div>
          ) : manifest.decks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {manifest.decks.map((d) => (
                <DeckCard key={d.id} deck={d} summary={summaries[d.id] ?? null} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DeckCard({
  deck,
  summary,
}: {
  deck: DeckMeta;
  summary: { total: number; answered: number; correct: number; accuracy: number } | null;
}) {
  const accent = deck.accentColor || '#7AB8FF';
  const pct = summary && summary.total > 0 ? Math.round((summary.answered / summary.total) * 100) : 0;
  const accuracyPct = summary && summary.answered > 0 ? Math.round(summary.accuracy * 100) : null;

  return (
    <Link
      to={`/deck/${deck.id}`}
      className="group block rounded-lg border p-5 transition-all hover:-translate-y-0.5"
      style={{
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2
            className="font-serif text-[22px] leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {deck.name}
          </h2>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {deck.description}
          </p>
        </div>
        <ChevronRight
          size={18}
          className="mt-1 shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ color: 'var(--text-muted)' }}
        />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <div
          className="flex items-baseline justify-between font-mono text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>
            {summary
              ? `${summary.answered} / ${summary.total} answered`
              : 'No attempts yet'}
          </span>
          {accuracyPct !== null ? (
            <span>
              <span style={{ color: 'var(--text-secondary)' }}>{accuracyPct}%</span> accuracy
            </span>
          ) : null}
        </div>
        <div
          className="h-1 overflow-hidden rounded-full"
          style={{ background: 'var(--border-subtle)' }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%`, background: accent }}
          />
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div
      className="mt-12 rounded-lg border p-8"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-default)' }}
    >
      <h2
        className="font-serif text-2xl"
        style={{ color: 'var(--text-primary)' }}
      >
        No decks yet
      </h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Drop a JSON file into <code className="font-mono">public/decks/</code> and add an entry
        to <code className="font-mono">manifest.json</code> to get started.
      </p>
      <pre
        className="mt-4 overflow-x-auto rounded-md p-4 font-mono text-xs leading-relaxed"
        style={{ background: 'var(--bg-panel-hi)', color: 'var(--text-secondary)' }}
      >
        {`{
  "decks": [
    {
      "id": "my-cert",
      "name": "My Certification",
      "shortName": "My Cert",
      "description": "...",
      "file": "my-cert.json"
    }
  ]
}`}
      </pre>
    </div>
  );
}
