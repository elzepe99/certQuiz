import type { ReactNode } from 'react';

/**
 * Shared drawing vocabulary for the hand-authored question diagrams.
 *
 * Everything paints with the app's CSS custom properties rather than literal
 * hex, so a figure inherits the palette instead of sitting on top of it. Sizes
 * are in `viewBox` units; each diagram picks its own extent and the wrapper
 * scales it to the column width.
 *
 * Deliberately monochrome. These render *above* the options, before the reader
 * has committed to an answer, so no mark may single out the option a question
 * keys to — the figure states the mechanism and leaves the reasoning alone.
 */
export const INK = {
  line: 'var(--border-default)',
  lineStrong: 'var(--border-strong)',
  call: 'var(--text-secondary)',
  reply: 'var(--text-muted)',
  label: 'var(--text-secondary)',
  labelHi: 'var(--text-primary)',
  faint: 'var(--text-faint)',
  panel: 'var(--bg-panel-hi)',
  chipBg: 'var(--accent-bg)',
  chipBorder: 'var(--accent-border)',
  chipText: 'var(--accent-hi)',
} as const;

export const FONT = {
  head: 12.5,
  msg: 11.5,
  note: 10.5,
  chip: 10.5,
} as const;

/**
 * Arrowhead markers. Marker ids live in the HTML document's global id space, so
 * each diagram passes a distinct `prefix` — two figures on one screen would
 * otherwise resolve `url(#arrow)` to whichever mounted first.
 */
export function ArrowDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      <marker
        id={`${prefix}-call`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 1 L 10 5 L 0 9 z" fill={INK.call} />
      </marker>
      <marker
        id={`${prefix}-reply`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 1 L 10 5 L 0 9 z" fill={INK.reply} />
      </marker>
    </defs>
  );
}

/** A participant header plus the dashed lifeline dropping from it. */
export function Lifeline({
  x,
  label,
  width = 160,
  top = 18,
  headHeight = 40,
  bottom,
}: {
  x: number;
  label: string;
  width?: number;
  top?: number;
  headHeight?: number;
  bottom: number;
}) {
  const headBottom = top + headHeight;
  return (
    <g>
      <rect
        x={x - width / 2}
        y={top}
        width={width}
        height={headHeight}
        rx={7}
        fill={INK.panel}
        stroke={INK.lineStrong}
      />
      <text
        x={x}
        y={top + headHeight / 2 + 4}
        textAnchor="middle"
        fontSize={FONT.head}
        fill={INK.labelHi}
      >
        {label}
      </text>
      <line
        x1={x}
        y1={headBottom}
        x2={x}
        y2={bottom}
        stroke={INK.line}
        strokeDasharray="4 5"
      />
    </g>
  );
}

/**
 * A call or reply between two lifelines. `reply` switches to the dashed,
 * dimmer return style; the label sits just above the line, biased toward the
 * sending end so long labels do not drift over the receiving lifeline.
 */
export function Message({
  from,
  to,
  y,
  label,
  reply = false,
  prefix,
  tag,
}: {
  from: number;
  to: number;
  y: number;
  label: string;
  reply?: boolean;
  prefix: string;
  tag?: string;
}) {
  const stroke = reply ? INK.reply : INK.call;
  const marker = `url(#${prefix}-${reply ? 'reply' : 'call'})`;
  const mid = (from + to) / 2;
  return (
    <g>
      <line
        x1={from}
        y1={y}
        x2={to}
        y2={y}
        stroke={stroke}
        strokeWidth={1.4}
        strokeDasharray={reply ? '5 4' : undefined}
        markerEnd={marker}
      />
      <text x={mid} y={y - 7} textAnchor="middle" fontSize={FONT.msg} fill={INK.label}>
        {label}
      </text>
      {tag ? (
        <text x={mid} y={y + 15} textAnchor="middle" fontSize={FONT.note} fill={INK.faint}>
          {tag}
        </text>
      ) : null}
    </g>
  );
}

/**
 * An activation bar — the span of time a participant is busy handling a call.
 * Height is duration, which is the whole point in the response-time figure:
 * a bar that encloses another means the outer call has not returned yet.
 */
export function Activation({
  x,
  top,
  bottom,
  width = 11,
  dashed = false,
}: {
  x: number;
  top: number;
  bottom: number;
  width?: number;
  dashed?: boolean;
}) {
  return (
    <rect
      x={x - width / 2}
      y={top}
      width={width}
      height={bottom - top}
      rx={2}
      fill={INK.panel}
      stroke={dashed ? INK.reply : INK.lineStrong}
      strokeDasharray={dashed ? '4 4' : undefined}
    />
  );
}

/**
 * A participant calling itself: out to the right, down for the duration, back.
 * The label sits above the loop rather than beside it so a long method name
 * cannot collide with the lifeline to the right.
 */
export function SelfCall({
  x,
  top,
  bottom,
  label,
  prefix,
  reach = 50,
  dashed = false,
  note,
}: {
  x: number;
  top: number;
  bottom: number;
  label: string;
  prefix: string;
  reach?: number;
  dashed?: boolean;
  note?: string;
}) {
  const out = x + reach;
  return (
    <g>
      <path
        d={`M ${x} ${top} L ${out} ${top} L ${out} ${bottom} L ${x + 6} ${bottom}`}
        fill="none"
        stroke={dashed ? INK.reply : INK.call}
        strokeWidth={1.4}
        strokeDasharray={dashed ? '5 4' : undefined}
        markerEnd={`url(#${prefix}-${dashed ? 'reply' : 'call'})`}
      />
      {/* Clear of the activation bar's right edge at x + 5.5, or the first
          glyph clips into it. */}
      <text x={x + 10} y={top - 7} fontSize={FONT.msg} fill={INK.label}>
        {label}
      </text>
      {note ? (
        <text x={out + 10} y={(top + bottom) / 2 + 16} fontSize={FONT.note} fill={INK.faint}>
          {note}
        </text>
      ) : null}
    </g>
  );
}

/** The lettered leg marker (A–H) the response-time question refers to. */
export function LegChip({ x, y, letter }: { x: number; y: number; letter: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9.5} fill={INK.chipBg} stroke={INK.chipBorder} />
      <text
        x={x}
        y={y + 3.6}
        textAnchor="middle"
        fontSize={FONT.chip}
        fontWeight={600}
        fill={INK.chipText}
      >
        {letter}
      </text>
    </g>
  );
}

/** A soft annotation attached to part of the drawing. */
export function Note({
  x,
  y,
  width,
  lines,
  anchor = 'start',
}: {
  x: number;
  y: number;
  width?: number;
  lines: string[];
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <g>
      {width ? (
        <rect
          x={anchor === 'middle' ? x - width / 2 : x - 8}
          y={y - 14}
          width={width}
          height={lines.length * 14 + 10}
          rx={6}
          fill={INK.panel}
          stroke={INK.line}
        />
      ) : null}
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={y + i * 14}
          textAnchor={anchor}
          fontSize={FONT.note}
          fill={INK.faint}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/** Small keyed legend, for the encodings a figure repeats. */
export function Legend({
  x,
  y,
  items,
}: {
  x: number;
  y: number;
  items: { swatch: ReactNode; text: string }[];
}) {
  return (
    <g>
      {items.map((item, i) => (
        <g key={i} transform={`translate(${x}, ${y + i * 18})`}>
          {item.swatch}
          <text x={46} y={3.5} fontSize={FONT.note} fill={INK.faint}>
            {item.text}
          </text>
        </g>
      ))}
    </g>
  );
}
