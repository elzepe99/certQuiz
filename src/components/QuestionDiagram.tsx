import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { diagramFor, type QuestionDiagram as Diagram } from '@/diagrams/registry';

/**
 * Renders the figure belonging to a question, if it has one.
 *
 * Sits between the stem and the options, which is where a reader looks for it
 * after the stem says "the diagram below". The drawing carries an `aria-label`
 * with the full description, and the same text is available to everyone behind
 * a disclosure — several of these items are unanswerable without the figure, so
 * the prose fallback is content, not a courtesy.
 *
 * With both sidebars showing, the question column is around 550px, which is not
 * enough for a five-lifeline sequence diagram at a legible type size. The inline
 * figure therefore scrolls sideways at `minWidth`, and Expand opens it over the
 * whole viewport where it fits at roughly 1:1.
 */
export function QuestionDiagram({
  questionId,
  compact = false,
}: {
  questionId: string | undefined;
  compact?: boolean;
}) {
  const [showText, setShowText] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const diagram = diagramFor(questionId);

  if (!diagram) return null;
  const { Svg, alt, caption, reconstructed, minWidth } = diagram;

  return (
    <figure
      className={`${compact ? 'mt-3' : 'mt-6'} overflow-hidden rounded-[12px] border`}
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-subtle)' }}
    >
      <div
        className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <span
          className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Diagram
        </span>
        {reconstructed ? <ReconstructedChip /> : null}
        <span className="flex-1" />
        <HeaderButton onClick={() => setShowText((v) => !v)}>
          {showText ? 'Hide description' : 'Describe in words'}
        </HeaderButton>
        <HeaderButton onClick={() => setExpanded(true)}>Expand</HeaderButton>
      </div>

      <div className="overflow-x-auto px-4 py-4">
        <div style={{ minWidth }}>
          <Svg />
        </div>
      </div>

      {showText ? (
        <p
          className="border-t px-4 py-3 text-[13px] leading-[1.6]"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          {alt}
        </p>
      ) : null}

      <figcaption
        className="border-t px-4 py-2.5 text-[12px] leading-[1.55]"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        {caption}
        {reconstructed ? (
          <span style={{ color: 'var(--text-faint)' }}>
            {' '}
            Reconstructed from the question&apos;s description; the original figure is
            not available.
          </span>
        ) : null}
      </figcaption>

      {expanded ? <Overlay diagram={diagram} onClose={() => setExpanded(false)} /> : null}
    </figure>
  );
}

/**
 * Full-viewport view of one figure.
 *
 * Portalled to `document.body` so no transformed ancestor can capture the fixed
 * positioning, and it swallows keystrokes in the capture phase because the quiz
 * binds Enter, the arrow keys and 1–5 on `window` — without this, paging through
 * an expanded diagram would answer the question underneath it.
 */
function Overlay({ diagram, onClose }: { diagram: Diagram; onClose: () => void }) {
  const { Svg, alt, caption, reconstructed } = diagram;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      e.stopPropagation();
    }
    window.addEventListener('keydown', onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: 'rgba(3, 6, 10, 0.88)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-[1600px] flex-col overflow-auto rounded-[14px] border p-5"
        style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-default)' }}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Diagram
          </span>
          {reconstructed ? <ReconstructedChip /> : null}
          <span className="flex-1" />
          <HeaderButton onClick={onClose}>Close · Esc</HeaderButton>
        </div>

        <div className="overflow-x-auto">
          <div style={{ minWidth: 900 }}>
            <Svg />
          </div>
        </div>

        <p
          className="mt-4 text-[13px] leading-[1.55]"
          style={{ color: 'var(--text-muted)' }}
        >
          {caption}
        </p>
      </div>
    </div>,
    document.body,
  );
}

function ReconstructedChip() {
  return (
    <span
      className="rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em]"
      style={{
        background: 'var(--warning-bg)',
        borderColor: 'var(--warning-border)',
        color: 'var(--warning)',
      }}
      title="No original figure survived with this question. This one was drawn from the question's own description."
    >
      Reconstructed
    </span>
  );
}

function HeaderButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[6px] border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors hover:brightness-125"
      style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
    >
      {children}
    </button>
  );
}
