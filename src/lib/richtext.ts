/**
 * Splits question / option / explanation text into prose and code segments so
 * code can be rendered in a monospace block instead of the surrounding serif.
 *
 * Deck JSON stores code inline in plain strings with no delimiters, mixed
 * freely with prose. Two ways a code block gets recognised, in priority order:
 *
 *   1. Explicit ``` fences. If a string contains any, they are the only source
 *      of truth and the heuristic never runs — that is the escape hatch for
 *      questions the heuristic gets wrong.
 *   2. A line-by-line heuristic tuned to what the decks actually contain:
 *      Apex, SOQL/SOSL, Visualforce/LWC markup.
 *
 * The heuristic is deliberately conservative: a run of lines is only promoted
 * to a code block if at least one line is a *strong* match. Misreading prose as
 * code is worse than leaving a snippet as prose, because prose in a 12px
 * monospace block is harder to read than code in a serif.
 */

export type RichSegment =
  | { kind: 'text'; value: string }
  | { kind: 'code'; value: string; lang?: string };

const FENCE_RE = /^[ \t]*```([\w-]*)[ \t]*$/;

/** An optional `01 ` or `01:` listing gutter — both styles appear in the decks.
 *  Kept in the output, since options refer to these numbers ("Add
 *  System.runAs(user1) to line 12"), but stripped before classifying so the
 *  number does not mask the code underneath. */
const LINE_NUMBER_RE = /^\s*\d{2}:?(?=\s|$)/;

/**
 * Lines that are unmistakably code — a declaration, an annotation, a markup
 * tag, a query. Keyword rules are deliberately case-sensitive: Apex writes
 * `public`/`final`/`return` in lowercase, while prose capitalises sentences
 * ("Public groups…", "Final step…", "Where should the admin…").
 */
const HIGH_CONFIDENCE_RULES: RegExp[] = [
  // Apex member / type declarations, with or without sharing modifiers.
  /^\s*(public|private|global|protected)\s+(static\s+|final\s+|virtual\s+|abstract\s+|override\s+|transient\s+|with\s+sharing\s+|without\s+sharing\s+|inherited\s+sharing\s+)*(class|interface|enum|void|[A-Z]\w*(\[\])?|List\s*<|Map\s*<|Set\s*<)[\s<]/,
  /^\s*(static|final|virtual|abstract|override|transient)\s+(void|class|[A-Z]\w*|List\s*<|Map\s*<|Set\s*<)/,
  /^\s*(class|interface|enum)\s+[A-Z]\w*/,
  /^\s*trigger\s+\w+\s+on\s+\w+/,
  // Apex annotations, by name — a bare `@word` would also catch @mentions.
  /^\s*@(isTest|IsTest|TestSetup|TestVisible|AuraEnabled|future|Future|InvocableMethod|InvocableVariable|RestResource|HttpGet|HttpPost|HttpPut|HttpDelete|HttpPatch|ReadOnly|RemoteAction|SuppressWarnings|Deprecated|NamespaceAccessible|JsonAccess|api|track|wire)\b/,
  // Collection / sObject declarations.
  /^\s*(List|Map|Set)\s*<[\w\s,.<>]+>\s+\w+/,
  // Inline SOQL/SOSL.
  /\[\s*(SELECT|FIND)\b[\s\S]*\b(FROM|IN|RETURNING)\b/i,
  // Markup: <apex:…>, <lightning-…>, <template>, <aura:…>, <c-…>.
  /^\s*<\/?[a-zA-Z][\w:.-]*[\s/>]/,
  // A brace on its own line.
  /^\s*[{}]\s*[;)]?\s*$/,
];

/** Lines that are code in context — real code, but weaker on their own. */
const SUPPORTING_RULES: RegExp[] = [
  // `Account acct = new Account(…);` — the tail requirement keeps out English
  // imperatives that happen to fit the shape, e.g. "Set size='12' for tablet".
  /^\s*[A-Z]\w*(\[\])?\s+\w+\s*=[^=].*(;|\bnew\b|\[\s*SELECT)/,
  /^\s*(if|else|for|while|do|try|catch|finally|switch|when|return|throw|break|continue)\b.*[;{(]/,
  /^\s*(insert|update|delete|upsert|undelete|merge)\s+\w+\s*;/,
  // Member assignment: `anAccount.OwnerId = region.Manager__c`.
  /^\s*\w+(\.\w+)+\s*=[^=]/,
  /^\s*(System|Database|Test|Schema|Trigger|Limits|JSON|ApexPages|UserInfo)\.\w+/,
  /\{\s*$/,
  /;\s*$/,
  /^\s*\/\//,
  /^\s*\/\*/,
];

/** Query clauses. Only code once a SELECT/FIND has opened a query in the same
 *  string — otherwise "Where should the developer…" reads as SOQL. */
const QUERY_CLAUSE_RE =
  /^\s*(FROM|WHERE|ORDER\s+BY|GROUP\s+BY|HAVING|LIMIT|OFFSET|RETURNING|USING\s+SCOPE|WITH\s+SECURITY_ENFORCED)\b/i;

/** Lines absorbed into a block only when they sit between two strong lines. */
const WEAK_RULES: RegExp[] = [
  /^\s*$/,
  /^\s{2,}\S/,
  /[=!<>]=|&&|\|\||\+\+|=>/,
  /^\s*\)/,
];

type LineKind = 'high' | 'strong' | 'weak' | 'prose';

/**
 * Prose that happens to trip a strong rule. A sentence ending in `?` is a
 * question stem, never code; a long sentence ending in `.` with no code
 * punctuation is prose even if it opens with a keyword like "Select".
 */
function isProseVeto(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.endsWith('?')) return true;

  // A sentence that opens with a tag or an annotation and then explains it —
  // "<apex:messages> displays all messages…", "@AuraEnabled(cacheable=true)
  // allows client-side caching." — is prose about code. Strip the code-looking
  // opener and judge what is left. Lines ending in code punctuation are exempt,
  // as are queries, which have no sentence terminator to confuse them with.
  if (t.endsWith('.') && !/[;{]$/.test(t.slice(0, -1))) {
    const stripped = t
      .replace(/<[^>]*>/g, ' ')
      .replace(/^@\w+(\([^)]*\))?/, ' ')
      .trim();
    if (stripped.split(/\s+/).filter(Boolean).length >= 5) return true;
  }
  return false;
}

function classify(
  line: string,
  next: string | undefined,
  inQuery: boolean,
): LineKind {
  const body = line.replace(LINE_NUMBER_RE, '');
  const trimmed = body.trim();

  if (!trimmed) return 'weak';
  if (isProseVeto(body)) return 'prose';

  // A bare SELECT/FIND is only a query when the same or following line
  // continues it — "Select two of the following" must stay prose.
  if (/^\s*(SELECT|FIND)\b/i.test(body)) {
    if (/\b(FROM|IN\s+ALL\s+FIELDS|RETURNING)\b/i.test(body)) return 'high';
    if (next && /^\s*(\d{2}\s+)?(FROM|IN|RETURNING)\b/i.test(next)) return 'high';
    return 'prose';
  }

  for (const re of HIGH_CONFIDENCE_RULES) {
    if (re.test(body)) return 'high';
  }
  if (inQuery && QUERY_CLAUSE_RE.test(body)) return 'strong';
  for (const re of SUPPORTING_RULES) {
    if (re.test(body)) return 'strong';
  }
  for (const re of WEAK_RULES) {
    if (re.test(body)) return 'weak';
  }
  return 'prose';
}

/** Reject a run that is really prose that happened to trip a supporting rule.
 *  Kept if any line is high-confidence, or if the run carries enough code
 *  punctuation to be implausible as a sentence. */
function isPlausibleCode(lines: string[], kinds: LineKind[]): boolean {
  const text = lines.join('\n');

  // A one-liner needs real code punctuation, a bind variable, or a full query
  // to earn a block — otherwise short option labels like "@future annotation"
  // get boxed up as if they were a listing.
  if (lines.length === 1) {
    const t = text.trim();
    // An orphaned brace is a leftover, not a listing worth its own block.
    if (/^[{}();\s]*$/.test(t)) return false;
    const hasCodePunct = /[{}();=<>[\]]/.test(t);
    const hasBindVar = /:\w/.test(t);
    const isQuery = /\b(SELECT|FIND)\b[\s\S]*\b(FROM|RETURNING)\b/i.test(t);
    if (!hasCodePunct && !hasBindVar && !isQuery) return false;

    // A sentence that merely opens with an API name — "Test.fixedSearchResults()
    // method to set up expected data" — is prose about code, not code.
    if (!isQuery && /[A-Za-z]$/.test(t) && !/[;>}]/.test(t)) {
      if (t.split(/\s+/).length >= 5) return false;
    }
  }

  if (kinds.some((k) => k === 'high')) return true;
  const punct = (text.match(/[{}();=<>[\]]/g) || []).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  return words > 0 && punct / words >= 0.25;
}

/** Widest gap of non-strong lines that a block will bridge. */
const MAX_GAP = 2;

function detectCodeLines(lines: string[]): boolean[] {
  const kinds: LineKind[] = [];
  let inQuery = false;
  for (let i = 0; i < lines.length; i++) {
    const kind = classify(lines[i], lines[i + 1], inQuery);
    kinds.push(kind);
    if (/^\s*(\d{2}\s+)?(SELECT|FIND)\b/i.test(lines[i])) inQuery = true;
    else if (kind === 'prose') inQuery = false;
  }

  const isCode = kinds.map((k) => k === 'high' || k === 'strong');

  // Bridge short weak-only runs that sit between two code lines, so a blank
  // line inside a method body does not split it into two blocks.
  let i = 0;
  while (i < kinds.length) {
    if (isCode[i]) {
      let j = i + 1;
      while (j < kinds.length && !isCode[j]) j++;
      if (j < kinds.length) {
        const gap = j - i - 1;
        const allWeak = kinds.slice(i + 1, j).every((k) => k === 'weak');
        if (gap > 0 && gap <= MAX_GAP && allWeak) {
          for (let k = i + 1; k < j; k++) isCode[k] = true;
        }
      }
      i = j;
    } else {
      i++;
    }
  }

  // Demote runs that do not hold up as code.
  i = 0;
  while (i < isCode.length) {
    if (!isCode[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j < isCode.length && isCode[j]) j++;
    if (!isPlausibleCode(lines.slice(i, j), kinds.slice(i, j))) {
      for (let k = i; k < j; k++) isCode[k] = false;
    }
    i = j;
  }

  return isCode;
}

function pushText(out: RichSegment[], value: string) {
  if (value.trim()) out.push({ kind: 'text', value: value.replace(/^\n+|\n+$/g, '') });
}

function pushCode(out: RichSegment[], value: string) {
  const trimmed = value.replace(/^\s*\n|\n\s*$/g, '');
  if (trimmed.trim()) out.push({ kind: 'code', value: trimmed });
}

function parseFenced(raw: string): RichSegment[] {
  const out: RichSegment[] = [];
  const lines = raw.split('\n');
  let buf: string[] = [];
  let inCode = false;
  let lang: string | undefined;

  for (const line of lines) {
    const m = line.match(FENCE_RE);
    if (m) {
      if (inCode) {
        pushCode(out, buf.join('\n'));
        if (lang) {
          const last = out[out.length - 1];
          if (last?.kind === 'code') last.lang = lang;
        }
        inCode = false;
        lang = undefined;
      } else {
        pushText(out, buf.join('\n'));
        inCode = true;
        lang = m[1] || undefined;
      }
      buf = [];
      continue;
    }
    buf.push(line);
  }

  // An unterminated fence: treat the remainder as code rather than dropping it.
  if (inCode) pushCode(out, buf.join('\n'));
  else pushText(out, buf.join('\n'));

  return out;
}

function parseHeuristic(raw: string): RichSegment[] {
  const lines = raw.split('\n');
  const isCode = detectCodeLines(lines);
  const out: RichSegment[] = [];

  let buf: string[] = [];
  let mode = isCode[0] ?? false;

  for (let i = 0; i < lines.length; i++) {
    if (isCode[i] !== mode) {
      if (mode) pushCode(out, buf.join('\n'));
      else pushText(out, buf.join('\n'));
      buf = [];
      mode = isCode[i];
    }
    buf.push(lines[i]);
  }
  if (mode) pushCode(out, buf.join('\n'));
  else pushText(out, buf.join('\n'));

  return out;
}

/** Split a string into prose and code segments. */
export function parseRichText(raw: string): RichSegment[] {
  if (!raw) return [];
  if (FENCE_RE.test(raw) || /^[ \t]*```/m.test(raw)) return parseFenced(raw);
  return parseHeuristic(raw);
}

/** Split prose on `backtick` spans for inline monospace. */
export function splitInlineCode(
  value: string,
): Array<{ code: boolean; value: string }> {
  if (!value.includes('`')) return [{ code: false, value }];
  const out: Array<{ code: boolean; value: string }> = [];
  const re = /`([^`\n]+)`/g;
  let last = 0;
  for (const m of value.matchAll(re)) {
    if (m.index === undefined) continue;
    if (m.index > last) out.push({ code: false, value: value.slice(last, m.index) });
    out.push({ code: true, value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < value.length) out.push({ code: false, value: value.slice(last) });
  return out;
}
