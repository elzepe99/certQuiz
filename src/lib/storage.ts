import type { DeckProgress, Question } from '@/types';

export const PROGRESS_KEY = (deckId: string) => `quiz:progress:${deckId}`;

function buildQuestionOrder(total: number): number[] {
  return Array.from({ length: total }, (_, i) => i);
}

// Unit-separator joiner — must match the separator used in buildQuestionSignatures
// so the single-question helpers below produce identical signatures.
const SIG_SEP = String.fromCharCode(31);

/**
 * Deterministic *content* fingerprint for a single question. Superseded by the
 * question's `id` as the durable key (see questionKey) — retained because it is
 * how keys were derived before ids existed, and is still needed to migrate
 * progress saved under the old scheme.
 */
export function questionSignature(q: Question): string {
  return [
    q.question,
    q.optionA,
    q.optionB,
    q.optionC,
    q.optionD ?? '',
    q.optionE ?? '',
    q.correct,
    q._cat ?? '',
  ].join(SIG_SEP);
}

/**
 * Compact, URL/DB-friendly hash (FNV-1a, 32-bit, hex) of a question signature.
 * Used as `question_hash` when storing comments so a row stays bound to the
 * exact question content regardless of its index in the deck.
 */
export function hashSignature(sig: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < sig.length; i++) {
    h ^= sig.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * The durable key for a question: its assigned `id` when present, otherwise a
 * hash of its current content.
 *
 * Every question's id was seeded with exactly that content hash, so the two
 * branches agree for un-edited questions — which is what lets ids be adopted
 * without migrating a single stored comment. Once a question is edited, only
 * the id branch stays stable, which is the whole point.
 */
export function questionKey(q: Question): string {
  return q.id ?? hashSignature(questionSignature(q));
}

/** Compact stable key for a single question, stored as `question_hash`. */
export function questionHash(q: Question): string {
  return questionKey(q);
}

/**
 * Persisted identity for each question, in deck order. Keyed on `id` so that
 * correcting a question's answer no longer scrambles which questions you have
 * already worked through.
 */
function buildQuestionSignatures(questions: Question[]): string[] {
  return questions.map(questionKey);
}

function remapIndexRecord<T>(
  input: Record<number, T> | undefined,
  indexMap: Map<number, number>,
): Record<number, T> {
  if (!input) return {};
  const out: Record<number, T> = {};
  for (const [k, v] of Object.entries(input)) {
    const oldIdx = Number(k);
    if (!Number.isInteger(oldIdx)) continue;
    const nextIdx = indexMap.get(oldIdx);
    if (nextIdx !== undefined) out[nextIdx] = v;
  }
  return out;
}

function remapIndexArray(input: number[] | undefined, indexMap: Map<number, number>): number[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const oldIdx of input) {
    const nextIdx = indexMap.get(oldIdx);
    if (nextIdx === undefined || seen.has(nextIdx)) continue;
    seen.add(nextIdx);
    out.push(nextIdx);
  }
  return out;
}

function remapTimeOnQ(
  input: number[] | undefined,
  total: number,
  indexMap: Map<number, number>,
): number[] {
  const out = Array(total).fill(0);
  if (!Array.isArray(input)) return out;
  for (let oldIdx = 0; oldIdx < input.length; oldIdx++) {
    const nextIdx = indexMap.get(oldIdx);
    if (nextIdx === undefined) continue;
    out[nextIdx] = Number.isFinite(input[oldIdx]) ? Number(input[oldIdx]) : 0;
  }
  return out;
}

function remapQuestionOrder(
  input: number[] | undefined,
  total: number,
  indexMap: Map<number, number>,
): number[] {
  if (!Array.isArray(input)) return buildQuestionOrder(total);
  const mapped = input
    .map((oldIdx) => indexMap.get(oldIdx))
    .filter((idx): idx is number => idx !== undefined);
  if (mapped.length !== total) return buildQuestionOrder(total);
  const seen = new Set<number>(mapped);
  if (seen.size !== total) return buildQuestionOrder(total);
  return mapped;
}

/**
 * Bring signatures persisted under the pre-`id` scheme into the current key
 * space. Those were raw content strings joined by SIG_SEP; hashing one yields
 * exactly the id that question was seeded with, so old progress keeps matching.
 */
function normalizeStoredSignatures(sigs: string[]): string[] {
  return sigs.map((sig) => (sig.includes(SIG_SEP) ? hashSignature(sig) : sig));
}

function buildIndexMap(oldSigs: string[], nextSigs: string[]): Map<number, number> {
  const slots = new Map<string, number[]>();
  for (let i = 0; i < nextSigs.length; i++) {
    const sig = nextSigs[i];
    const arr = slots.get(sig) ?? [];
    arr.push(i);
    slots.set(sig, arr);
  }
  const map = new Map<number, number>();
  for (let oldIdx = 0; oldIdx < oldSigs.length; oldIdx++) {
    const sig = oldSigs[oldIdx];
    const arr = slots.get(sig);
    if (!arr || arr.length === 0) continue;
    const nextIdx = arr.shift();
    if (nextIdx !== undefined) map.set(oldIdx, nextIdx);
  }
  return map;
}

export function emptyProgress(total: number, questionSignatures?: string[]): DeckProgress {
  return {
    answers: {},
    submitted: {},
    flagged: [],
    skipped: [],
    notes: {},
    currentIdx: 0,
    sessionStartTime: Date.now(),
    accumulatedSessionSeconds: 0,
    timeOnQ: Array(total).fill(0),
    questionOrder: buildQuestionOrder(total),
    questionSignatures: questionSignatures ?? [],
  };
}

export function emptyProgressForQuestions(questions: Question[]): DeckProgress {
  return emptyProgress(questions.length, buildQuestionSignatures(questions));
}

export function loadProgress(deckId: string, questions: Question[]): DeckProgress {
  const total = questions.length;
  const signatures = buildQuestionSignatures(questions);
  if (typeof window === 'undefined') return emptyProgress(total, signatures);
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY(deckId));
    if (!raw) return emptyProgress(total, signatures);
    const parsed = JSON.parse(raw) as Partial<DeckProgress>;
    const base = emptyProgress(total, signatures);
    const storedSigs = Array.isArray(parsed.questionSignatures) ? parsed.questionSignatures : null;
    if (!storedSigs || storedSigs.length === 0) return base;
    const parsedSigs = normalizeStoredSignatures(storedSigs);

    const sameSignatures = parsedSigs.every((sig, i) => sig === signatures[i]);
    if (sameSignatures) {
      return {
        ...base,
        ...parsed,
        accumulatedSessionSeconds: typeof parsed.accumulatedSessionSeconds === 'number' ? parsed.accumulatedSessionSeconds : 0,
        timeOnQ:
          Array.isArray(parsed.timeOnQ) && parsed.timeOnQ.length === total
            ? parsed.timeOnQ
            : base.timeOnQ,
        flagged: Array.isArray(parsed.flagged) ? parsed.flagged : [],
        skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
        notes: parsed.notes ?? {},
        answers: parsed.answers ?? {},
        submitted: parsed.submitted ?? {},
        questionOrder:
          Array.isArray(parsed.questionOrder) && parsed.questionOrder.length === total
            ? parsed.questionOrder
            : base.questionOrder,
        questionSignatures: signatures,
      };
    }

    const indexMap = buildIndexMap(parsedSigs, signatures);
    const answers = remapIndexRecord(parsed.answers, indexMap);
    const submitted = remapIndexRecord(parsed.submitted, indexMap);
    const notes = remapIndexRecord(parsed.notes, indexMap);
    const flagged = remapIndexArray(parsed.flagged, indexMap);
    const skipped = remapIndexArray(parsed.skipped, indexMap);
    const timeOnQ = remapTimeOnQ(parsed.timeOnQ, total, indexMap);
    const questionOrder = remapQuestionOrder(parsed.questionOrder, total, indexMap);

    return {
      ...base,
      ...parsed,
      currentIdx: Math.min(Math.max(Number(parsed.currentIdx) || 0, 0), Math.max(0, total - 1)),
      accumulatedSessionSeconds: typeof parsed.accumulatedSessionSeconds === 'number' ? parsed.accumulatedSessionSeconds : 0,
      answers,
      submitted,
      notes,
      flagged,
      skipped,
      timeOnQ,
      questionOrder,
      questionSignatures: signatures,
    };
  } catch {
    return emptyProgress(total, signatures);
  }
}

export function saveProgress(deckId: string, p: DeckProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_KEY(deckId), JSON.stringify(p));
  } catch {
    // ignore quota errors
  }
}

export function clearProgress(deckId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PROGRESS_KEY(deckId));
}

export type ProgressSummary = {
  answered: number;
  correct: number;
  total: number;
  accuracy: number; // 0-1
};

export function summarizeProgress(
  deckId: string,
  questions: Question[],
  isCorrectFn: (qIdx: number, selected: string) => boolean,
): ProgressSummary | null {
  const p = loadProgress(deckId, questions);
  const total = questions.length;
  const submittedIdxs = Object.keys(p.submitted).map(Number);
  if (submittedIdxs.length === 0) return null;

  let correct = 0;
  for (const i of submittedIdxs) {
    const sel = p.answers[i];
    if (sel && isCorrectFn(i, sel)) correct++;
  }
  return {
    answered: submittedIdxs.length,
    correct,
    total,
    accuracy: submittedIdxs.length > 0 ? correct / submittedIdxs.length : 0,
  };
}
