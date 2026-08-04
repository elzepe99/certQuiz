/**
 * Shared helper for recording *why* a question was changed.
 *
 * Every correction stamps a `corrected` record onto the question so the app can
 * show, at the point of study, that this item was fixed and what prompted it —
 * rather than the change being invisible once the JSON is edited.
 */

/** Date the corrections in this repo were applied. */
export const CORRECTION_DATE = '2026-08-04';

/**
 * @param {object} q         the question, mutated in place
 * @param {object} opts
 * @param {'comments'|'validation'} opts.via  what surfaced the problem
 * @param {string} opts.note                  one-line human explanation
 * @param {string} [opts.from]                previous `correct` value, recorded
 *                                            only when the answer actually moved
 */
export function stampCorrection(q, { via, note, from }) {
  const corrected = {
    date: CORRECTION_DATE,
    via,
    note: note.trim(),
  };
  if (from && from !== q.correct) {
    corrected.from = from;
    corrected.to = q.correct;
  }
  q.corrected = corrected;
  return q;
}
