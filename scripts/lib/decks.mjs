/**
 * Small deck helpers shared by the scripts in scripts/ and .claude/skills/.
 */
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DECKS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'decks');

/** Deck file names in a decks directory: every .json except the manifest and the template. */
export function listDeckFiles(dir = DECKS_DIR) {
  return readdirSync(dir).filter((f) => f.endsWith('.json') && !/manifest|deck-template/.test(f));
}

/**
 * Where an explanation's reference list starts. This MUST stay the same
 * expression as `parseExplanation` in src/lib/quiz.ts — it is what decides
 * whether the app renders a References block at all.
 */
export const REF_MARKER = /(^|\n)\s*References?\s*:?\s*\n?/i;

/** True when an explanation carries a reference marker with its colon. */
export function hasRefMarker(text) {
  return /(^|\n)\s*References?\s*:/i.test(text ?? '');
}

/** Split an explanation into prose and its existing reference list. */
export function splitExplanation(text) {
  const m = (text ?? '').match(REF_MARKER);
  if (!m || m.index === undefined) return { body: (text ?? '').trim(), refs: [] };
  return {
    body: text.slice(0, m.index).trim(),
    refs: text
      .slice(m.index + m[0].length)
      .trim()
      .split(/\n+/)
      .map((l) => l.replace(/^[\s•\-*]+/, '').trim())
      .filter(Boolean),
  };
}
