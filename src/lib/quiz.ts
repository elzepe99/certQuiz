import type { Question, ParsedExplanation } from '@/types';

/** Parse an explanation into body + references list. */
export function parseExplanation(raw: string): ParsedExplanation {
  if (!raw) return { body: '', references: [] };

  // Look for "References:" or "References :" - case-insensitive, on its own
  // line or after a newline. Capture everything after as references.
  const match = raw.match(/(^|\n)\s*References?\s*:?\s*\n?/i);
  if (!match || match.index === undefined) {
    return { body: raw.trim(), references: [] };
  }

  const cutAt = match.index + match[0].length;
  const body = raw.slice(0, match.index).trim();
  const refsBlock = raw.slice(cutAt).trim();

  const references = refsBlock
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/^[\s•\-–—*·]+/, '')
        .replace(/^=+\s*$/, '')
        .trim(),
    )
    .filter((line) => line.length > 0 && !/^=+$/.test(line));

  return { body, references };
}

export function formatTime(seconds: number): string {
  const total = Math.max(0, seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatClock(seconds: number): string {
  const total = Math.max(0, seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Build an array of present options with their letter and text. */
export function getOptions(q: Question): Array<{ letter: string; text: string }> {
  const candidates: Array<[string, string | undefined]> = [
    ['A', q.optionA],
    ['B', q.optionB],
    ['C', q.optionC],
    ['D', q.optionD],
    ['E', q.optionE],
  ];
  return candidates
    .filter(([, t]) => typeof t === 'string' && t.trim().length > 0)
    .map(([letter, text]) => ({ letter, text: text! }));
}

/** Detect "Choose 2" / "Select 3" etc. in the prompt. */
export function isMultiCorrectPrompt(prompt: string, correct: string): boolean {
  if (correct.includes(',')) return true;
  return /\b(choose|select|pick)\s+(two|three|four|five|2|3|4|5)\b/i.test(prompt);
}

/** How many answers the question requires. Returns 1 for single-answer questions. */
export function requiredAnswerCount(prompt: string, correct: string): number {
  const fromCorrect = correct.split(',').filter(Boolean).length;
  if (fromCorrect > 1) return fromCorrect;
  const match = prompt.match(/\b(choose|select|pick)\s+(two|three|four|five|2|3|4|5)\b/i);
  if (match) {
    const word = match[2].toLowerCase();
    const map: Record<string, number> = { two: 2, three: 3, four: 4, five: 5, '2': 2, '3': 3, '4': 4, '5': 5 };
    return map[word] ?? 1;
  }
  return 1;
}

/** Compare a user's selection (string) against the correct answer.
 *  Both are letter strings; for multi-correct the comparison is set-equal.
 */
export function isCorrect(selected: string | null | undefined, correct: string): boolean {
  if (!selected) return false;
  const a = selected.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
  const b = correct.split(',').map((s) => s.trim().toUpperCase()).sort().join(',');
  return a === b;
}

/** Unique categories with counts, in descending count order then alpha. */
export function deriveTopics(questions: Question[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const q of questions) {
    const c = q._cat || 'General';
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
}

/** Auto-link bare URLs in a string. Returns array of segments for safe rendering. */
export function linkifySegments(input: string): Array<{ kind: 'text' | 'link'; value: string }> {
  const re = /(https?:\/\/[^\s)]+)/g;
  const out: Array<{ kind: 'text' | 'link'; value: string }> = [];
  let last = 0;
  for (const m of input.matchAll(re)) {
    if (m.index === undefined) continue;
    if (m.index > last) out.push({ kind: 'text', value: input.slice(last, m.index) });
    out.push({ kind: 'link', value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < input.length) out.push({ kind: 'text', value: input.slice(last) });
  return out;
}
