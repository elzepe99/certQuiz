/**
 * JSON in localStorage, without the try/catch at every call site.
 *
 * Storage can be missing (private mode), full, or hold something that is no
 * longer valid JSON. None of that should ever break the page: a read that
 * fails is treated as "nothing saved", and a write that fails is dropped.
 */

/** The parsed value under `key`, or null when it is absent or unreadable. */
export function readJson(key: string): unknown {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Store `value` under `key`. Returns false when it could not be saved. */
export function writeJson(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
