/**
 * Splitting a deck into *sets* — contiguous runs of ~40 questions that give a
 * study session a visible start, end and score.
 *
 * Two rules shape the arithmetic:
 *
 * - Sets are **balanced**, not fixed-width. A strict 40 leaves the 141-question
 *   integration deck ending on a set of 1, which reads as a bug. Instead we pick
 *   the fewest sets that keep every set at or under `maxSize`, then spread the
 *   remainder one question at a time, so 141 becomes 36·35·35·35.
 * - The active set is **derived from `currentIdx`**, never stored. Persisting it
 *   too would let it desync from the position it describes — most sharply in the
 *   `loadProgress` remap branch, where the deck's length can change underneath a
 *   stored set index.
 *
 * Everything here is pure and dependency-free so `scripts/test-sets.mjs` can
 * import it through esbuild without pulling in React.
 */

/** Max questions per set when the learner has not chosen otherwise. */
export const DEFAULT_SET_SIZE = 40;

/** Offered in the sidebar. `0` means "no chunking — the whole deck is one set". */
export const SET_SIZE_OPTIONS = [20, 30, 40, 0];

export type SetInfo = {
  /** Start offsets plus a trailing `total`; set `n` is `[boundaries[n], boundaries[n+1])`. */
  boundaries: number[];
  /** How many sets the deck splits into. Always >= 1 for a non-empty deck. */
  count: number;
  /** Index of the set containing the question this info was resolved for. */
  setIdx: number;
  /** First question index of that set. */
  start: number;
  /** One past the last question index of that set. */
  end: number;
  /** Number of questions in that set. */
  size: number;
};

/**
 * Start offsets for every set, with `total` appended as a closing bound.
 * A deck of 0 questions yields `[0]` — one empty range rather than none, so
 * callers never have to special-case an empty deck.
 */
export function setBoundaries(total: number, maxSize: number): number[] {
  const n = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  if (n === 0) return [0];

  const cap = Number.isFinite(maxSize) ? Math.floor(maxSize) : 0;
  const count = cap > 0 ? Math.max(1, Math.ceil(n / cap)) : 1;

  const base = Math.floor(n / count);
  const remainder = n % count;

  const out: number[] = [0];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    cursor += base + (i < remainder ? 1 : 0);
    out.push(cursor);
  }
  return out;
}

/** Which set a question index falls in. Out-of-range indices clamp to the ends. */
export function setIndexOf(qIdx: number, boundaries: number[]): number {
  const count = Math.max(0, boundaries.length - 1);
  if (count === 0) return 0;
  if (!Number.isFinite(qIdx) || qIdx < 0) return 0;
  for (let i = 0; i < count; i++) {
    if (qIdx < boundaries[i + 1]) return i;
  }
  return count - 1;
}

/**
 * Bring a set number into range. Use this on anything that arrives from outside
 * — a `?set=` query parameter, say. Note the argument is a *set* index, not a
 * question index: `setIndexOf` is the one that takes a question.
 */
export function clampSetIndex(setIdx: number, boundaries: number[]): number {
  const count = Math.max(0, boundaries.length - 1);
  if (count === 0) return 0;
  if (!Number.isFinite(setIdx)) return 0;
  return Math.min(Math.max(Math.floor(setIdx), 0), count - 1);
}

/** The half-open index range of one set. */
export function setRange(setIdx: number, boundaries: number[]): { start: number; end: number } {
  const count = Math.max(0, boundaries.length - 1);
  if (count === 0) return { start: 0, end: 0 };
  const i = clampSetIndex(setIdx, boundaries);
  return { start: boundaries[i], end: boundaries[i + 1] };
}

/**
 * Everything a caller needs about the set holding `currentIdx`. This is the one
 * function the store, the action bar and the keyboard shortcuts all go through,
 * so their notion of "last question of the set" cannot drift apart.
 */
export function setInfoFor(total: number, maxSize: number, currentIdx: number): SetInfo {
  const boundaries = setBoundaries(total, maxSize);
  const count = Math.max(1, boundaries.length - 1);
  const setIdx = setIndexOf(currentIdx, boundaries);
  const { start, end } = setRange(setIdx, boundaries);
  return { boundaries, count, setIdx, start, end, size: end - start };
}

/**
 * Reorder items by a display order (`displayIdx -> originalIdx`), returning the
 * input untouched if the order is not a clean permutation of it.
 *
 * Lives here rather than in the store because three screens outside the store
 * need it: saved progress is indexed by *display* position, so anything reading
 * `progress` against a freshly fetched deck must apply this first.
 */
export function applyQuestionOrder<T>(items: T[], order: number[] | undefined): T[] {
  if (!Array.isArray(order) || order.length !== items.length) return items;
  const seen = new Set<number>();
  for (const idx of order) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= items.length || seen.has(idx)) {
      return items;
    }
    seen.add(idx);
  }
  return order.map((idx) => items[idx]);
}
