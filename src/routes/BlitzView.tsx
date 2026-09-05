import { useCallback, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { BlitzLobby } from '@/components/blitz/BlitzLobby';
import { BlitzStage } from '@/components/blitz/BlitzStage';
import { BlitzPodium } from '@/components/blitz/BlitzPodium';
import { useDeck, useManifest } from '@/lib/decks';
import { loadProgress } from '@/lib/storage';
import { applyQuestionOrder, setInfoFor } from '@/lib/sets';
import { buildRunOrder, type BlitzSource } from '@/lib/blitz';
import { useBlitz } from '@/state/blitzStore';

/**
 * The Blitz route.
 *
 * It reads the deck's saved progress but never writes it: the display order and
 * the active set are borrowed so that "Set 3" means the same stretch of deck
 * here as it does in the quiz, while the answers given in a run stay in
 * `blitzStore` and die with it. That read-only relationship is the whole
 * contract between the two modes — see `lib/blitzStorage.ts`.
 */
export function BlitzView() {
  const { deckId } = useParams<{ deckId: string }>();
  const manifest = useManifest();
  const deckLoad = useDeck(deckId);
  const [searchParams] = useSearchParams();

  const phase = useBlitz((s) => s.phase);
  const init = useBlitz((s) => s.init);
  const quit = useBlitz((s) => s.quit);
  const startRun = useBlitz((s) => s.startRun);
  const updateSettings = useBlitz((s) => s.updateSettings);
  const settings = useBlitz((s) => s.settings);
  const resultCount = useBlitz((s) => s.results.length);

  // The deck in *display* order, which is what saved progress is indexed by.
  const prepared = useMemo(() => {
    if (deckLoad.status !== 'ready') return null;
    const progress = loadProgress(deckLoad.deck.id, deckLoad.questions);
    const questions = applyQuestionOrder(deckLoad.questions, progress.questionOrder);
    const info = setInfoFor(questions.length, progress.setSize, progress.currentIdx);
    return { questions, info };
  }, [deckLoad]);

  useEffect(() => {
    if (deckLoad.status !== 'ready' || !prepared) return;
    init(deckLoad.deck.id, prepared.questions);
  }, [deckLoad, prepared, init]);

  // `?source=set` lets the quiz sidebar send you straight here with the run
  // already scoped to the set you were working.
  //
  // Gated on the deck being ready so that it runs *after* `init`, never before.
  // Without the gate this fired on the first render, while the store still held
  // the defaults, and `updateSettings` wrote those defaults back to
  // localStorage — so following the sidebar link silently reset the reader's
  // voice, clock and hold settings every time.
  useEffect(() => {
    if (deckLoad.status !== 'ready' || !prepared) return;
    const raw = searchParams.get('source');
    if (raw === 'set' || raw === 'deck' || raw === 'random') {
      updateSettings({ source: raw as BlitzSource });
    }
  }, [deckLoad.status, prepared, searchParams, updateSettings]);

  // Memoised because `BlitzStage` binds its keyboard handler in an effect that
  // depends on this. The stage re-renders every 100ms while a clock or a
  // verdict hold is running, so a fresh closure here meant tearing down and
  // re-adding a window listener ten times a second for the whole run.
  const handleQuit = useCallback(() => {
    // Only worth interrupting for once there is something to lose.
    if (resultCount > 0 && !window.confirm('End this run? The score will be lost.')) return;
    quit();
  }, [resultCount, quit]);

  if (deckLoad.status !== 'ready' || !prepared) {
    return (
      <div className="flex h-screen flex-col [height:100dvh]" style={{ background: 'var(--bg-canvas)' }}>
        <TopBar />
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{
            color: deckLoad.status === 'error' ? 'var(--danger)' : 'var(--text-muted)',
          }}
        >
          {deckLoad.status === 'loading' ? (
            'Loading deck…'
          ) : deckLoad.status === 'error' ? (
            `Failed to load deck: ${deckLoad.message}`
          ) : (
            <>
              Deck not found.
              <Link to="/" className="ml-2 underline" style={{ color: 'var(--accent)' }}>
                Back to decks
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const { deck } = deckLoad;
  const { questions, info } = prepared;

  const replaySame = () => {
    startRun(
      buildRunOrder({
        source: settings.source,
        total: questions.length,
        setStart: info.start,
        setEnd: info.end,
      }),
    );
  };

  if (phase !== 'lobby' && phase !== 'done') {
    return <BlitzStage onQuit={handleQuit} />;
  }

  return (
    <div className="flex h-screen flex-col [height:100dvh]" style={{ background: 'var(--bg-canvas)' }}>
      <TopBar
        currentDeck={deck}
        decks={manifest.status === 'ready' ? manifest.decks : undefined}
      />
      <main className="flex-1 overflow-y-auto">
        {phase === 'done' ? (
          <BlitzPodium deck={deck} onReplaySame={replaySame} />
        ) : (
          <BlitzLobby
            deck={deck}
            total={questions.length}
            setIdx={info.setIdx}
            setCount={info.count}
            setStart={info.start}
            setEnd={info.end}
          />
        )}
      </main>
    </div>
  );
}
