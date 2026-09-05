/**
 * Reading preferences — the small settings behind the gear in the top bar.
 *
 * These are *display* choices, not progress, so they live under their own
 * localStorage keys and are shared by every deck rather than stored per deck.
 *
 * The chosen font is published as a CSS custom property on the root element
 * rather than threaded through React. Question text appears in three unrelated
 * places — the exam view, the Blitz stage and the review list — and none of
 * them needs to re-render when the setting changes: the variable repaints them.
 * That also means the value is applied once, before the first render, so a
 * reader who has picked a font never sees a flash of the default.
 */

export const QUESTION_FONT_KEY = 'quiz:prefs:question-font';
export const QUESTION_FONT_VAR = '--font-question';

export type QuestionFontId = 'serif' | 'sans' | 'system' | 'mono';

export type QuestionFont = {
  id: QuestionFontId;
  label: string;
  /** One line on who it is for, shown under the label. */
  hint: string;
  stack: string;
};

/**
 * Every stack here is already loaded, or needs no loading at all. Adding a face
 * that has to be fetched would put a font download in front of the question a
 * reader is waiting to read, which is the opposite of the point.
 */
export const QUESTION_FONTS: QuestionFont[] = [
  {
    id: 'serif',
    label: 'Serif',
    hint: 'The original. Elegant, a little thin on long stems.',
    stack: '"Instrument Serif", ui-serif, Georgia, serif',
  },
  {
    id: 'sans',
    label: 'Sans',
    hint: 'Plainer and heavier. Easiest on a long question.',
    stack: '"Source Sans 3", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'system',
    label: 'System',
    hint: 'Your device’s own font. Nothing to download.',
    stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  {
    id: 'mono',
    label: 'Mono',
    hint: 'Even letter widths. Some readers track lines better.',
    stack: '"JetBrains Mono", ui-monospace, monospace',
  },
];

export const DEFAULT_QUESTION_FONT: QuestionFontId = 'serif';

export function questionFont(id: QuestionFontId): QuestionFont {
  return QUESTION_FONTS.find((f) => f.id === id) ?? QUESTION_FONTS[0];
}

export function loadQuestionFont(): QuestionFontId {
  if (typeof window === 'undefined') return DEFAULT_QUESTION_FONT;
  try {
    const raw = window.localStorage.getItem(QUESTION_FONT_KEY);
    return QUESTION_FONTS.some((f) => f.id === raw)
      ? (raw as QuestionFontId)
      : DEFAULT_QUESTION_FONT;
  } catch {
    return DEFAULT_QUESTION_FONT;
  }
}

/** Push the choice into the stylesheet. Safe to call before React mounts. */
export function applyQuestionFont(id: QuestionFontId) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(QUESTION_FONT_VAR, questionFont(id).stack);
}

export function saveQuestionFont(id: QuestionFontId) {
  applyQuestionFont(id);
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(QUESTION_FONT_KEY, id);
  } catch {
    // A font that does not survive a reload still beats failing the click.
  }
}
