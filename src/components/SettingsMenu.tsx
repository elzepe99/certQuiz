import { useEffect, useRef, useState } from 'react';
import { Settings, Check } from 'lucide-react';
import {
  QUESTION_FONTS,
  loadQuestionFont,
  saveQuestionFont,
  type QuestionFontId,
} from '@/lib/prefs';

/**
 * The gear in the top bar. Until now it was decorative.
 *
 * It holds reading preferences rather than study settings: things that change
 * how a question looks, not what counts as an answer. Per-deck study settings
 * stay in the sidebar where the deck is, and Blitz's own settings stay in its
 * lobby, because both are about a session rather than about the reader.
 */
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [font, setFont] = useState<QuestionFontId>(() => loadQuestionFont());
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (id: QuestionFontId) => {
    setFont(id);
    saveQuestionFont(id);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 transition-colors hover:bg-[color:var(--bg-panel-hi)]"
        style={{ color: open ? 'var(--accent)' : 'var(--text-secondary)' }}
      >
        <Settings size={16} />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-[280px] max-w-[calc(100vw-24px)] rounded-lg border p-3 shadow-xl"
          style={{
            background: 'var(--bg-panel-hi)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div className="label-uppercase mb-2">Question font</div>
          <div className="flex flex-col gap-1">
            {QUESTION_FONTS.map((f) => {
              const active = f.id === font;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => choose(f.id)}
                  aria-pressed={active}
                  className="flex items-start gap-2.5 rounded-[8px] border px-2.5 py-2 text-left transition-colors"
                  style={{
                    background: active ? 'var(--accent-bg)' : 'transparent',
                    borderColor: active ? 'var(--accent-border)' : 'transparent',
                  }}
                >
                  <span className="mt-[3px] w-3.5 shrink-0" style={{ color: 'var(--accent)' }}>
                    {active ? <Check size={13} /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    {/* The label is set in the face it names, so the choice can
                        be made by looking rather than by reading a word. */}
                    <span
                      className="block text-[16px] leading-snug"
                      style={{
                        fontFamily: f.stack,
                        color: active ? 'var(--accent)' : 'var(--text-primary)',
                      }}
                    >
                      {f.label} — which two options apply?
                    </span>
                    <span
                      className="mt-0.5 block text-[11px] leading-snug"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {f.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p
            className="mt-2.5 border-t pt-2.5 text-[11px] leading-relaxed"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-faint)' }}
          >
            Applies to question text everywhere — practice, review and Blitz. Saved on this
            device.
          </p>
        </div>
      ) : null}
    </div>
  );
}
