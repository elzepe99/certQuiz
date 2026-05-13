import { useEffect, useState } from 'react';
import type { DeckManifest, DeckMeta, Question } from '@/types';

const DECKS_BASE = `${import.meta.env.BASE_URL}decks`;
let manifestPromise: Promise<DeckManifest> | null = null;
const deckQuestionsPromiseCache = new Map<string, Promise<Question[]>>();

async function fetchManifest(): Promise<DeckManifest> {
  if (!manifestPromise) {
    manifestPromise = fetch(`${DECKS_BASE}/manifest.json`, { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`Manifest fetch failed: ${r.status}`);
      return r.json() as Promise<DeckManifest>;
    });
  }
  return manifestPromise;
}

async function fetchDeckQuestions(file: string): Promise<Question[]> {
  let p = deckQuestionsPromiseCache.get(file);
  if (!p) {
    p = fetch(`${DECKS_BASE}/${file}`, { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`Deck fetch failed: ${r.status}`);
      return r.json() as Promise<Question[]>;
    });
    deckQuestionsPromiseCache.set(file, p);
  }
  return p;
}

export async function loadManifest(): Promise<DeckMeta[]> {
  const manifest = await fetchManifest();
  return manifest.decks ?? [];
}

export async function loadDeckById(
  deckId: string,
): Promise<{ deck: DeckMeta; questions: Question[] } | null> {
  const decks = await loadManifest();
  const deck = decks.find((d) => d.id === deckId);
  if (!deck) return null;
  const questions = await fetchDeckQuestions(deck.file);
  return { deck, questions };
}

export async function loadDeckQuestions(deck: DeckMeta): Promise<Question[]> {
  return fetchDeckQuestions(deck.file);
}

type ManifestState =
  | { status: 'loading' }
  | { status: 'ready'; decks: DeckMeta[] }
  | { status: 'error'; message: string };

export function useManifest(): ManifestState {
  const [state, setState] = useState<ManifestState>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    loadManifest()
      .then((decks) => {
        if (!cancelled) setState({ status: 'ready', decks });
      })
      .catch((e: Error) => {
        if (!cancelled) setState({ status: 'error', message: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

type DeckLoadState =
  | { status: 'loading' }
  | { status: 'ready'; deck: DeckMeta; questions: Question[] }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

export function useDeck(deckId: string | undefined): DeckLoadState {
  const [state, setState] = useState<DeckLoadState>({ status: 'loading' });
  useEffect(() => {
    if (!deckId) {
      setState({ status: 'not-found' });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });

    (async () => {
      try {
        const loaded = await loadDeckById(deckId);
        if (!loaded) {
          if (!cancelled) setState({ status: 'not-found' });
          return;
        }
        if (!cancelled) setState({ status: 'ready', deck: loaded.deck, questions: loaded.questions });
      } catch (e) {
        if (!cancelled)
          setState({
            status: 'error',
            message: e instanceof Error ? e.message : String(e),
          });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deckId]);
  return state;
}
