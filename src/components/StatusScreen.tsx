import type { ReactNode } from 'react';
import { TopBar } from '@/components/TopBar';

type Props = {
  children: ReactNode;
  /** `danger` for a load failure; everything else is a quiet muted line. */
  tone?: 'muted' | 'danger';
  /**
   * Size to the dynamic viewport. Blitz needs it: iOS reports `100vh` with the
   * toolbar hidden, which pushes a full-screen layout under the browser chrome.
   */
  dvh?: boolean;
};

/** The full-screen "Loading… / not found / failed" page shared by the deck routes. */
export function StatusScreen({ children, tone = 'muted', dvh = false }: Props) {
  return (
    <div
      className={dvh ? 'flex h-screen flex-col [height:100dvh]' : 'flex h-screen flex-col'}
      style={{ background: 'var(--bg-canvas)' }}
    >
      <TopBar />
      <div
        className="flex flex-1 items-center justify-center text-sm"
        style={{ color: tone === 'danger' ? 'var(--danger)' : 'var(--text-muted)' }}
      >
        {children}
      </div>
    </div>
  );
}
