const USERNAME_KEY = 'quiz:username';

/** Display name used to attribute comments. No auth — just a local label. */
export function getUsername(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(USERNAME_KEY)?.trim() ?? '';
  } catch {
    return '';
  }
}

export function setUsername(name: string): void {
  if (typeof window === 'undefined') return;
  const clean = name.trim();
  try {
    if (clean) window.localStorage.setItem(USERNAME_KEY, clean);
    else window.localStorage.removeItem(USERNAME_KEY);
  } catch {
    // ignore quota / privacy-mode errors
  }
}
