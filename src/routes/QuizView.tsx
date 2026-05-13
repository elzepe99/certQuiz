import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { QuestionMap } from '@/components/QuestionMap';
import { TopicsList } from '@/components/TopicsList';
import { OptionList } from '@/components/OptionList';
import { ExplanationBlock } from '@/components/ExplanationBlock';
import { ActionBar } from '@/components/ActionBar';
import { SessionTimer } from '@/components/SessionTimer';
import { PerformanceCard } from '@/components/PerformanceCard';
import { RightPanel, type RightPaneId } from '@/components/RightPanel';
import { useDeck, useManifest } from '@/lib/decks';
import { useQuiz } from '@/state/quizStore';
import { isMultiCorrectPrompt } from '@/lib/quiz';
import { useShortcuts } from '@/lib/shortcuts';

export function QuizView() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const manifest = useManifest();
  const deckLoad = useDeck(deckId);

  const loadDeck = useQuiz((s) => s.loadDeck);
  const idx = useQuiz((s) => s.progress.currentIdx);
  const questions = useQuiz((s) => s.questions);
  const restart = useQuiz((s) => s.restart);
  const jumpToNextUnseen = useQuiz((s) => s.jumpToNextUnseen);
  const submitted = useQuiz((s) => s.progress.submitted);
  const total = questions.length;

  const [paneTab, setPaneTab] = useState<RightPaneId>('notes');

  useEffect(() => {
    if (deckLoad.status === 'ready') {
      loadDeck(deckLoad.deck, deckLoad.questions);
    }
  }, [deckLoad, loadDeck]);

  const handleFinish = () => {
    if (deckId) navigate(`/deck/${deckId}/complete`);
  };

  useShortcuts({ onFinish: handleFinish });

  const q = questions[idx];
  const isMulti = useMemo(
    () => (q ? isMultiCorrectPrompt(q.question, q.correct) : false),
    [q],
  );
  const answeredCount = Object.keys(submitted).length;
  const sessionPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  if (deckLoad.status === 'loading') {
    return (
      <div className="flex h-screen flex-col" style={{ background: 'var(--bg-canvas)' }}>
        <TopBar />
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Loading deck…
        </div>
      </div>
    );
  }

  if (deckLoad.status === 'not-found') {
    return (
      <div className="flex h-screen flex-col" style={{ background: 'var(--bg-canvas)' }}>
        <TopBar />
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Deck not found.{' '}
          <Link to="/" className="ml-2 underline" style={{ color: 'var(--accent)' }}>
            Back to decks
          </Link>
        </div>
      </div>
    );
  }

  if (deckLoad.status === 'error') {
    return (
      <div className="flex h-screen flex-col" style={{ background: 'var(--bg-canvas)' }}>
        <TopBar />
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{ color: 'var(--danger)' }}
        >
          Failed to load deck: {deckLoad.message}
        </div>
      </div>
    );
  }

  if (!q) {
    return null;
  }

  const decks = manifest.status === 'ready' ? manifest.decks : undefined;

  return (
    <div className="flex h-screen flex-col" style={{ background: 'var(--bg-canvas)' }}>
      <TopBar currentDeck={deckLoad.deck} decks={decks} />

      <div className="grid h-[calc(100vh-60px)] grid-cols-1 md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_340px]">
        {/* Left sidebar */}
        <aside
          className="hidden overflow-y-auto border-r p-5 md:block"
          style={{
            background: 'var(--bg-panel)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {/* Deck progress card */}
          <div
            className="rounded-[12px] border p-3.5"
            style={{
              background:
                'linear-gradient(180deg, var(--bg-panel-hi), var(--bg-panel))',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div
              className="text-[14px] font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {deckLoad.deck.shortName}
            </div>
            <div
              className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-faint)' }}
            >
              {total} questions
            </div>
            <div className="mt-3 flex items-baseline justify-between font-mono text-[10.5px]">
              <span style={{ color: 'var(--text-secondary)' }}>Session progress</span>
              <span
                className="font-semibold tabular-nums"
                style={{ color: 'var(--accent)' }}
              >
                {sessionPct}%
              </span>
            </div>
            <div
              className="mt-1.5 h-1 overflow-hidden rounded-full"
              style={{ background: 'var(--border-subtle)' }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${sessionPct}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>

          {/* Question map */}
          <section className="mt-6">
            <h4 className="mb-2.5 flex items-center justify-between font-mono text-[10px] font-medium uppercase tracking-[0.16em]">
              <span style={{ color: 'var(--text-faint)' }}>Questions</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {answeredCount} / {total}
              </span>
            </h4>
            <QuestionMap />
          </section>

          {/* Topics */}
          <section className="mt-6">
            <h4
              className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
              style={{ color: 'var(--text-faint)' }}
            >
              Topics
            </h4>
            <TopicsList />
          </section>

          {/* Footer actions */}
          <section
            className="mt-5 flex flex-col gap-1 border-t pt-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <SidebarAction
              icon={<RotateCcw size={13} />}
              label="Restart deck"
              onClick={() => {
                if (window.confirm('Reset all progress for this deck?')) {
                  restart();
                }
              }}
            />
            <SidebarAction
              icon={<ArrowRight size={13} />}
              label="Jump to next unseen"
              onClick={jumpToNextUnseen}
            />
          </section>
        </aside>

        {/* Main content */}
        <main className="relative overflow-y-auto px-6 py-7 sm:px-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 60% -10%, rgba(122, 184, 255, 0.04), transparent 60%)',
            }}
          />
          <div className="relative">
            <Breadcrumbs
              deckName={deckLoad.deck.shortName}
              cat={q._cat || 'General'}
              idx={idx}
              total={total}
            />

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Chip accent>{q._cat || 'General'}</Chip>
              {isMulti ? <Chip>Multi-correct</Chip> : null}
              <span className="flex-1" />
              <Chip muted>
                Q · {String(idx + 1).padStart(3, '0')} / {total}
              </Chip>
            </div>

            <h1
              key={`q-${idx}`}
              className="mt-3 max-w-[60ch] animate-fade-in whitespace-pre-line font-serif text-[28px] leading-[1.3] tracking-[-0.012em] sm:text-[30px]"
              style={{ color: 'var(--text-primary)' }}
            >
              {q.question}
            </h1>

            <div className="mt-7">
              <OptionList />
            </div>

            <ExplanationBlock onOpenInPanel={() => setPaneTab('explanation')} />

            <ActionBar onFinish={handleFinish} />
          </div>
        </main>

        {/* Right sidebar */}
        <aside
          className="hidden flex-col gap-3 overflow-y-auto border-l p-5 xl:flex"
          style={{
            background: 'var(--bg-panel)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <SessionTimer />
          <PerformanceCard />
          <RightPanel active={paneTab} onChange={setPaneTab} />
        </aside>
      </div>
    </div>
  );
}

function Breadcrumbs({
  deckName,
  cat,
  idx,
  total,
}: {
  deckName: string;
  cat: string;
  idx: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em]">
      <span style={{ color: 'var(--text-secondary)' }}>{deckName}</span>
      <span style={{ color: 'var(--text-faint)' }}>/</span>
      <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
      <span style={{ color: 'var(--text-faint)' }}>/</span>
      <span style={{ color: 'var(--accent)' }}>
        Question {idx + 1} of {total}
      </span>
    </div>
  );
}

function Chip({
  children,
  accent,
  muted,
}: {
  children: React.ReactNode;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <span
      className="rounded-[6px] border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
      style={
        accent
          ? {
              background: 'var(--accent-bg)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent)',
            }
          : muted
            ? {
                background: 'transparent',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }
            : {
                background: 'var(--bg-panel)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }
      }
    >
      {children}
    </span>
  );
}

function SidebarAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-[color:var(--bg-panel-hi)]"
      style={{ color: 'var(--text-secondary)' }}
    >
      <span style={{ opacity: 0.85 }}>{icon}</span>
      {label}
    </button>
  );
}
