import { create } from 'zustand';
import type { DeckMeta, DeckProgress, Question } from '@/types';
import {
  emptyProgress,
  emptyProgressForQuestions,
  loadProgress,
  saveProgress,
  clearProgress,
} from '@/lib/storage';
import { isCorrect as isCorrectFn } from '@/lib/quiz';

function applyQuestionOrder(questions: Question[], order: number[]): Question[] {
  if (order.length !== questions.length) return questions;
  const seen = new Set<number>();
  for (const idx of order) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= questions.length || seen.has(idx)) {
      return questions;
    }
    seen.add(idx);
  }
  return order.map((idx) => questions[idx]);
}

function shuffleOrder(total: number): number[] {
  const out = Array.from({ length: total }, (_, i) => i);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type State = {
  deck: DeckMeta | null;
  questions: Question[];
  progress: DeckProgress;
  questionStartTime: number;

  loadDeck: (deck: DeckMeta, questions: Question[]) => void;
  selectOption: (letter: string) => void;
  toggleMultiSelect: (letter: string) => void;
  submit: () => void;
  goTo: (idx: number) => void;
  next: () => void;
  prev: () => void;
  toggleFlag: () => void;
  skip: () => void;
  setNote: (note: string) => void;
  restart: () => void;
  jumpToNextUnseen: () => void;

  // selectors
  status: (idx: number) => 'unseen' | 'correct' | 'wrong' | 'skipped';
};

export const useQuiz = create<State>((set, get) => ({
  deck: null,
  questions: [],
  progress: emptyProgress(0, []),
  questionStartTime: Date.now(),

  loadDeck: (deck, questions) => {
    const progress = loadProgress(deck.id, questions);
    const orderedQuestions = applyQuestionOrder(questions, progress.questionOrder);
    set({ deck, questions: orderedQuestions, progress, questionStartTime: Date.now() });
  },

  selectOption: (letter) => {
    const { progress, deck } = get();
    if (!deck) return;
    const idx = progress.currentIdx;
    if (progress.submitted[idx]) return; // locked
    const next: DeckProgress = {
      ...progress,
      answers: { ...progress.answers, [idx]: letter },
    };
    set({ progress: next });
    saveProgress(deck.id, next);
  },

  toggleMultiSelect: (letter) => {
    const { progress, deck } = get();
    if (!deck) return;
    const idx = progress.currentIdx;
    if (progress.submitted[idx]) return;
    const current = (progress.answers[idx] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const has = current.includes(letter);
    const updated = has ? current.filter((l) => l !== letter) : [...current, letter];
    const sorted = updated.sort();
    const next: DeckProgress = {
      ...progress,
      answers: { ...progress.answers, [idx]: sorted.join(',') },
    };
    set({ progress: next });
    saveProgress(deck.id, next);
  },

  submit: () => {
    const { progress, deck, questions, questionStartTime } = get();
    if (!deck) return;
    const idx = progress.currentIdx;
    const sel = progress.answers[idx];
    if (!sel || progress.submitted[idx]) return;
    const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
    const timeOnQ = [...progress.timeOnQ];
    timeOnQ[idx] = (timeOnQ[idx] ?? 0) + elapsed;
    void questions; // referenced for future per-question logic
    const next: DeckProgress = {
      ...progress,
      submitted: { ...progress.submitted, [idx]: true },
      timeOnQ,
    };
    set({ progress: next, questionStartTime: Date.now() });
    saveProgress(deck.id, next);
  },

  goTo: (idx) => {
    const { progress, deck, questions, questionStartTime } = get();
    if (!deck) return;
    if (idx < 0 || idx >= questions.length) return;

    // If leaving an unsubmitted question, accumulate time but discard selection
    // (per spec: "discard the selection — feels more like a real exam").
    const cur = progress.currentIdx;
    const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
    const timeOnQ = [...progress.timeOnQ];
    if (!progress.submitted[cur]) {
      timeOnQ[cur] = (timeOnQ[cur] ?? 0) + elapsed;
    }

    const answers = { ...progress.answers };
    if (!progress.submitted[cur] && cur !== idx) {
      delete answers[cur];
    }

    const next: DeckProgress = {
      ...progress,
      currentIdx: idx,
      timeOnQ,
      answers,
    };
    set({ progress: next, questionStartTime: Date.now() });
    saveProgress(deck.id, next);
  },

  next: () => {
    const { progress, questions } = get();
    const idx = progress.currentIdx;
    if (idx < questions.length - 1) {
      get().goTo(idx + 1);
    }
  },

  prev: () => {
    const { progress } = get();
    if (progress.currentIdx > 0) {
      get().goTo(progress.currentIdx - 1);
    }
  },

  toggleFlag: () => {
    const { progress, deck } = get();
    if (!deck) return;
    const idx = progress.currentIdx;
    const set_ = new Set(progress.flagged);
    if (set_.has(idx)) set_.delete(idx);
    else set_.add(idx);
    const next: DeckProgress = { ...progress, flagged: [...set_] };
    set({ progress: next });
    saveProgress(deck.id, next);
  },

  skip: () => {
    const { progress, questions, deck } = get();
    if (!deck) return;
    const idx = progress.currentIdx;
    if (progress.submitted[idx]) {
      get().next();
      return;
    }
    const set_ = new Set(progress.skipped);
    set_.add(idx);
    const next: DeckProgress = { ...progress, skipped: [...set_] };
    set({ progress: next });
    saveProgress(deck.id, next);
    if (idx < questions.length - 1) get().goTo(idx + 1);
  },

  setNote: (note) => {
    const { progress, deck } = get();
    if (!deck) return;
    const idx = progress.currentIdx;
    const next: DeckProgress = {
      ...progress,
      notes: { ...progress.notes, [idx]: note },
    };
    set({ progress: next });
    saveProgress(deck.id, next);
  },

  restart: () => {
    const { deck, questions } = get();
    if (!deck) return;
    clearProgress(deck.id);
    const fresh = emptyProgressForQuestions(questions);
    const nextOrder = shuffleOrder(questions.length);
    const shuffledQuestions = applyQuestionOrder(questions, nextOrder);
    const nextProgress: DeckProgress = { ...fresh, questionOrder: nextOrder };
    set({ questions: shuffledQuestions, progress: nextProgress, questionStartTime: Date.now() });
    saveProgress(deck.id, nextProgress);
  },

  jumpToNextUnseen: () => {
    const { progress, questions } = get();
    const total = questions.length;
    const start = progress.currentIdx;
    for (let off = 1; off < total; off++) {
      const i = (start + off) % total;
      if (!progress.submitted[i]) {
        get().goTo(i);
        return;
      }
    }
  },

  status: (idx) => {
    const { progress, questions } = get();
    if (!questions[idx]) return 'unseen';
    if (progress.submitted[idx]) {
      const sel = progress.answers[idx];
      const correct = questions[idx].correct;
      return isCorrectFn(sel, correct) ? 'correct' : 'wrong';
    }
    if (progress.skipped.includes(idx)) return 'skipped';
    return 'unseen';
  },
}));
