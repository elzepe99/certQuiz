import { useMemo } from 'react';
import { parseRichText, splitInlineCode } from '@/lib/richtext';

type Size = 'md' | 'sm';

const CODE_SIZE: Record<Size, { fontSize: string; padding: string; margin: string }> = {
  md: { fontSize: '13px', padding: '13px 15px', margin: '14px 0' },
  sm: { fontSize: '12px', padding: '10px 12px', margin: '9px 0' },
};

/**
 * Renders deck text with embedded code snippets in a monospace block.
 *
 * Prose inherits the caller's typography — the question stem stays in the
 * display serif — while code moves to JetBrains Mono with its indentation
 * intact. The wrapper and the block are `span`/`code` rather than `div`/`pre`
 * because callers render this inside `<h1>` and `<button>`, which only accept
 * phrasing content.
 */
export function RichText({
  text,
  size = 'md',
  className,
}: {
  text: string;
  size?: Size;
  className?: string;
}) {
  const segments = useMemo(() => parseRichText(text ?? ''), [text]);

  if (segments.length === 0) return null;

  // Nothing to lift out: render as before so single-line prose keeps its
  // natural inline layout.
  if (segments.length === 1 && segments[0].kind === 'text') {
    return (
      <span className={`whitespace-pre-line ${className ?? ''}`}>
        <Prose value={segments[0].value} />
      </span>
    );
  }

  return (
    <span className={`block ${className ?? ''}`}>
      {segments.map((seg, i) =>
        seg.kind === 'code' ? (
          <CodeBlock key={i} value={seg.value} size={size} />
        ) : (
          <span key={i} className="block whitespace-pre-line">
            <Prose value={seg.value} />
          </span>
        ),
      )}
    </span>
  );
}

function CodeBlock({ value, size }: { value: string; size: Size }) {
  const s = CODE_SIZE[size];
  return (
    <code
      className="block overflow-x-auto rounded-[8px] border font-mono"
      style={{
        background: 'var(--bg-panel-hi)',
        borderColor: 'var(--border-default)',
        borderLeft: '2px solid var(--accent-border)',
        color: 'var(--text-primary)',
        whiteSpace: 'pre',
        fontSize: s.fontSize,
        lineHeight: 1.65,
        letterSpacing: '-0.005em',
        padding: s.padding,
        margin: s.margin,
        tabSize: 2,
      }}
    >
      {value}
    </code>
  );
}

function Prose({ value }: { value: string }) {
  const parts = useMemo(() => splitInlineCode(value), [value]);
  return (
    <>
      {parts.map((p, i) =>
        p.code ? (
          <code
            key={i}
            className="rounded-[4px] border px-1 py-0.5 font-mono"
            style={{
              background: 'var(--bg-panel-hi)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--accent-hi)',
              fontSize: '0.82em',
            }}
          >
            {p.value}
          </code>
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </>
  );
}
