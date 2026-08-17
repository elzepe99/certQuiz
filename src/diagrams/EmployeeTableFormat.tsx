import { INK } from './primitives';

/**
 * Question e15b1b0a — "a data architect has determined that a table of the
 * following format is necessary", whose exhibit did not survive the scrape.
 *
 * Redrawn from the original freecram exhibit. All the question turns on is the
 * column set and the types those sample values imply: employeeId holds `a1`
 * (a string, not a number), startDate holds ISO dates, avgRating holds
 * decimals. Every option declares the same three columns, so the figure exists
 * to establish the target schema, not to separate the options — which is why
 * it names no types and marks nothing.
 */
type Col = { name: string; x: number; w: number };

const COLS: Col[] = [
  { name: 'employeeId', x: 0, w: 190 },
  { name: 'startDate', x: 190, w: 200 },
  { name: 'avgRating', x: 390, w: 170 },
];

const ROWS: string[][] = [
  ['a1', '2009-01-06', '5.5'],
  ['a2', '2018-11-21', '7.1'],
  ['...', '...', '...'],
];

const X = 12;
const Y = 10;
const HEAD = 40;
const ROW = 38;
const W = 560;

export function EmployeeTableFormat() {
  return (
    <svg
      viewBox={`0 0 ${W + X * 2} ${Y + HEAD + ROW * ROWS.length + 12}`}
      role="img"
      aria-label={ALT}
      style={{ width: '100%', height: 'auto' }}
    >
      <rect
        x={X}
        y={Y}
        width={W}
        height={HEAD + ROW * ROWS.length}
        fill={INK.panel}
        stroke={INK.lineStrong}
        strokeWidth={1.4}
      />

      {/* header band */}
      <path
        d={`M ${X} ${Y + HEAD} L ${X + W} ${Y + HEAD}`}
        stroke={INK.lineStrong}
        strokeWidth={1.4}
        fill="none"
      />
      {COLS.map((c) => (
        <text
          key={c.name}
          x={X + c.x + 12}
          y={Y + 26}
          fontSize={15}
          fontWeight={700}
          fill={INK.labelHi}
        >
          {c.name}
        </text>
      ))}

      {/* column separators, full height */}
      {COLS.slice(1).map((c) => (
        <path
          key={c.name}
          d={`M ${X + c.x} ${Y} L ${X + c.x} ${Y + HEAD + ROW * ROWS.length}`}
          stroke={INK.lineStrong}
          strokeWidth={1.4}
          fill="none"
        />
      ))}

      {/* body */}
      {ROWS.map((cells, r) => {
        const y = Y + HEAD + ROW * r;
        return (
          <g key={r}>
            {r > 0 ? (
              <path
                d={`M ${X} ${y} L ${X + W} ${y}`}
                stroke={INK.line}
                strokeWidth={1}
                fill="none"
              />
            ) : null}
            {cells.map((v, i) => (
              <text
                key={i}
                x={X + COLS[i].x + 12}
                y={y + 25}
                fontSize={14}
                fill={INK.labelHi}
              >
                {v}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

const ALT =
  'A three-column table. The columns are employeeId, startDate and avgRating. ' +
  'The first row holds a1, 2009-01-06 and 5.5. The second row holds a2, ' +
  '2018-11-21 and 7.1. A third row shows an ellipsis in each column, ' +
  'indicating that the data continues. The sample values imply employeeId is a ' +
  'string, startDate is a date, and avgRating is a decimal number.';

export const employeeTableFormat = {
  Svg: EmployeeTableFormat,
  alt: ALT,
  caption:
    'The target format: three columns, with sample values showing employeeId as a string, ' +
    'startDate as a date and avgRating as a decimal.',
};
