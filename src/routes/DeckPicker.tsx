import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { loadDeckQuestions, useManifest } from '@/lib/decks';
import { loadProgress } from '@/lib/storage';
import { isCorrect } from '@/lib/quiz';
import type { DeckMeta } from '@/types';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

type SummaryMap = Record<
  string,
  { total: number; answered: number; correct: number; accuracy: number } | null
>;

const PAGE_SIZE = 9;

export function DeckPicker() {
  const manifest = useManifest();
  const [summaries, setSummaries] = useState<SummaryMap>({});
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const decks = manifest.status === 'ready' ? manifest.decks : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return decks;
    return decks.filter((d) =>
      [d.name, d.shortName, d.description]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q)),
    );
  }, [decks, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp page whenever the filtered set shrinks (e.g. after typing a query).
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleDecks = useMemo(
    () => filtered.slice(pageStart, pageStart + PAGE_SIZE),
    [filtered, pageStart],
  );

  // Reset to the first page when the search query changes.
  useEffect(() => {
    setPage(1);
  }, [query]);

  // Only compute progress for the decks currently on screen — avoids fetching
  // every deck file up front, which does not scale as the catalog grows.
  useEffect(() => {
    if (manifest.status !== 'ready' || visibleDecks.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const deck of visibleDecks) {
        if (cancelled) return;
        try {
          const qs = await loadDeckQuestions(deck);
          const p = loadProgress(deck.id, qs);
          const submittedIdxs = Object.keys(p.submitted).map(Number);
          let correct = 0;
          for (const i of submittedIdxs) {
            if (qs[i] && isCorrect(p.answers[i], qs[i].correct)) correct++;
          }
          const summary = {
            total: qs.length,
            answered: submittedIdxs.length,
            correct,
            accuracy: submittedIdxs.length ? correct / submittedIdxs.length : 0,
          };
          if (!cancelled) setSummaries((prev) => ({ ...prev, [deck.id]: summary }));
        } catch {
          if (!cancelled) setSummaries((prev) => ({ ...prev, [deck.id]: null }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manifest.status, visibleDecks]);

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

          {manifest.status === 'ready' && manifest.decks.length > 0 ? (
            <div className="relative mt-8 max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search decks…"
                aria-label="Search decks"
                className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--text-muted)]"
                style={{
                  background: 'var(--bg-panel)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          ) : null}

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
          ) : filtered.length === 0 ? (
            <p className="mt-12 text-sm" style={{ color: 'var(--text-muted)' }}>
              No decks match “{query.trim()}”.
            </p>
          ) : (
            <>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleDecks.map((d) => (
                  <DeckCard key={d.id} deck={d} summary={summaries[d.id] ?? null} />
                ))}
              </div>
              {totalPages > 1 ? (
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              ) : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const btnStyle = {
    background: 'var(--bg-panel)',
    borderColor: 'var(--border-default)',
    color: 'var(--text-secondary)',
  };

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Deck pagination"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:border-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        style={btnStyle}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => {
        const active = p === page;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={active ? 'page' : undefined}
            className="flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 font-mono text-sm transition-colors hover:border-[var(--text-muted)]"
            style={
              active
                ? {
                    background: 'var(--text-primary)',
                    borderColor: 'var(--text-primary)',
                    color: 'var(--bg-canvas)',
                  }
                : btnStyle
            }
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:border-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        style={btnStyle}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
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
