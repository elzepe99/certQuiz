import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DeckMeta } from '@/types';

type Props = {
  currentDeck?: DeckMeta;
  decks?: DeckMeta[];
};

export function TopBar({ currentDeck, decks }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header
      className="flex h-[60px] shrink-0 items-center gap-2 border-b px-3 sm:gap-4 sm:px-4"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-subtle)' }}
    >
      <Link to="/" className="flex shrink-0 items-center gap-2">
        <span
          className="block h-4 w-4 rounded-[3px]"
          style={{
            background: 'var(--accent)',
            boxShadow: '0 0 12px rgba(122, 184, 255, 0.35)',
          }}
        />
        {/* The mark alone carries the home link on a phone; the wordmark is the
            cheapest thing to trade for the deck name staying readable. */}
        <span
          className="hidden font-serif text-[19px] tracking-tight sm:block"
          style={{ color: 'var(--text-primary)' }}
        >
          CertPrep
        </span>
      </Link>

      {currentDeck && decks ? (
        <div ref={ref} className="relative min-w-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-[color:var(--border-strong)]"
            style={{
              background: 'var(--bg-panel-hi)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="truncate">{currentDeck.shortName}</span>
            <ChevronDown size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
          </button>
          {open ? (
            <div
              className="absolute left-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-48px)] rounded-lg border p-1 shadow-xl"
              style={{
                background: 'var(--bg-panel-hi)',
                borderColor: 'var(--border-default)',
              }}
            >
              {decks.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setOpen(false);
                    if (d.id !== currentDeck.id) navigate(`/deck/${d.id}`);
                  }}
                  className="flex w-full flex-col gap-0.5 rounded-[6px] px-3 py-2 text-left text-sm transition-colors hover:bg-[color:var(--bg-panel)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className="font-medium">{d.name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {d.shortName}
                  </span>
                </button>
              ))}
              <div
                className="my-1 border-t"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="block rounded-[6px] px-3 py-2 text-xs transition-colors hover:bg-[color:var(--bg-panel)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Browse all decks →
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <nav className="ml-auto flex shrink-0 items-center gap-1">
        {currentDeck ? (
          <>
            <NavTab to={`/deck/${currentDeck.id}`} end>
              Practice
            </NavTab>
            <NavTab to={`/deck/${currentDeck.id}/review`}>Review</NavTab>
          </>
        ) : null}
      </nav>

      {/* Decorative only — no handler behind either control, so it is the first
          thing to drop when the bar runs out of room on a phone. */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <button
          aria-label="Settings"
          className="rounded-md p-1.5 transition-colors hover:bg-[color:var(--bg-panel-hi)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Settings size={16} />
        </button>
        <div
          className="h-7 w-7 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #6fb3ff 0%, #4a7fbf 100%)',
            border: '1px solid var(--border-default)',
          }}
        />
      </div>
    </header>
  );
}

function NavTab({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-md px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
          isActive ? '' : 'hover:bg-[color:var(--bg-panel-hi)]'
        }`
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        background: isActive ? 'var(--accent-bg)' : 'transparent',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      })}
    >
      {children}
    </NavLink>
  );
}
