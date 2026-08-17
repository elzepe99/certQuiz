import { ArrowDefs, FONT, INK } from './primitives';

const P = 'elt';

/**
 * Question 647f738a — "review the following (see diagram & description)".
 *
 * Redrawn from the original exam figure: a nine-step round trip out from the
 * Lightning UI and back. The two constraints the recommendations turn on are
 * annotations inside the boxes, underlined as in the original — the gateway
 * times out at 9 seconds, the eligibility system may take 90.
 *
 * The original misspells "Eligibility" in three of its labels. Corrected here;
 * reproducing a typo is not fidelity.
 */
export function EligibilityTimeout() {
  return (
    <svg
      viewBox="0 0 1180 300"
      role="img"
      aria-label={ALT}
      style={{ width: '100%', height: 'auto' }}
    >
      <ArrowDefs prefix={P} />

      {/* Salesforce Lightning UI, with its two numbered steps */}
      <rect
        x={30}
        y={30}
        width={210}
        height={180}
        rx={4}
        fill={INK.panel}
        stroke={INK.lineStrong}
      />
      <line x1={30} y1={100} x2={240} y2={100} stroke={INK.lineStrong} />
      <line x1={30} y1={155} x2={240} y2={155} stroke={INK.lineStrong} />
      <text x={135} y={70} textAnchor="middle" fontSize={FONT.msg} fill={INK.labelHi}>
        (1) Check Eligibility
      </text>
      <path
        d="M 135 112 L 135 143"
        fill="none"
        stroke={INK.call}
        strokeWidth={1.5}
        markerEnd={`url(#${P}-call)`}
      />
      <text x={135} y={189} textAnchor="middle" fontSize={FONT.msg} fill={INK.labelHi}>
        (9) Display Response
      </text>
      {/* The UI-internal return the original draws down the left-hand side */}
      <path
        d="M 30 182 L 12 182 L 12 128 L 26 128"
        fill="none"
        stroke={INK.call}
        strokeWidth={1.5}
        markerEnd={`url(#${P}-call)`}
      />
      <text
        x={135}
        y={236}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill={INK.labelHi}
      >
        Salesforce - Lightning UI
      </text>

      <Box x={380} w={150} lines={['API Gateway']} note={['Timesout in 9 secs']} />
      <Box x={660} w={140} lines={['ESB', '(Mulesoft)']} />
      <Box
        x={930}
        w={160}
        lines={['External', 'Eligibility', 'System / API']}
        note={['response max.', '90 secs']}
      />

      {/* Request path, left to right */}
      <Hop from={242} to={378} y={90} />
      <Hop from={532} to={658} y={90} />
      <Hop from={802} to={928} y={90} />
      <Label x={310} y={58} lines={['(2) Check Eligibility', '(customer ID)']} />
      <Label x={595} y={74} lines={['(3)']} />
      <Label x={865} y={58} lines={['(4) Check Eligibility', '(customer ID)']} />

      {/* External processing */}
      <path
        d="M 1090 78 L 1140 78 L 1140 152 L 1092 152"
        fill="none"
        stroke={INK.call}
        strokeWidth={1.5}
        markerEnd={`url(#${P}-call)`}
      />
      <text x={1148} y={119} fontSize={FONT.msg} fill={INK.label}>
        (5)
      </text>

      {/* Response path, right to left */}
      <Hop from={928} to={802} y={172} />
      <Hop from={658} to={532} y={172} />
      <Hop from={378} to={242} y={172} />
      <Label x={865} y={143} lines={['(6) Return', 'Eligibility']} />
      <Label x={595} y={158} lines={['(7)']} />
      <Label x={310} y={158} lines={['(8) Response']} />
    </svg>
  );
}

function Box({
  x,
  w,
  lines,
  note,
}: {
  x: number;
  w: number;
  lines: string[];
  note?: string[];
}) {
  const cx = x + w / 2;
  // Centre the title block, then hang the underlined constraint below it.
  const top = note ? 96 - (lines.length - 1) * 10 : 116 - (lines.length - 1) * 10;
  return (
    <g>
      <rect
        x={x}
        y={30}
        width={w}
        height={180}
        rx={4}
        fill={INK.panel}
        stroke={INK.lineStrong}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={top + i * 20}
          textAnchor="middle"
          fontSize={13}
          fill={INK.labelHi}
        >
          {line}
        </text>
      ))}
      {note?.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={top + lines.length * 20 + 10 + i * 18}
          textAnchor="middle"
          fontSize={FONT.note}
          fill={INK.label}
          textDecoration="underline"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Hop({ from, to, y }: { from: number; to: number; y: number }) {
  return (
    <line
      x1={from}
      y1={y}
      x2={to}
      y2={y}
      stroke={INK.call}
      strokeWidth={1.5}
      markerEnd={`url(#${P}-call)`}
    />
  );
}

function Label({ x, y, lines }: { x: number; y: number; lines: string[] }) {
  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={y + i * 18}
          textAnchor="middle"
          fontSize={FONT.msg}
          fill={INK.label}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

const ALT =
  'Flow diagram of a nine-step round trip across four components. On the left, a ' +
  'Salesforce - Lightning UI box whose top compartment is step 1, Check Eligibility, ' +
  'with an arrow down to its lower compartment, step 9, Display Response. Step 2, ' +
  'Check Eligibility with a customer ID, goes from the UI to the API Gateway, which is ' +
  'annotated "Timesout in 9 secs". Step 3 goes from the API Gateway to the ESB ' +
  '(Mulesoft). Step 4, Check Eligibility with a customer ID, goes from the ESB to the ' +
  'External Eligibility System / API, annotated "response max. 90 secs". Step 5 is a ' +
  'self-loop on that external system while it processes. The response then returns ' +
  'leftward: step 6, Return Eligibility, to the ESB; step 7 to the API Gateway; and ' +
  'step 8, Response, back to the Lightning UI, which displays it at step 9.';

export const eligibilityTimeout = {
  Svg: EligibilityTimeout,
  alt: ALT,
  caption:
    'One round trip, steps 1 to 9. Every hop crosses the API Gateway, which times out ' +
    'at 9 seconds, to reach an eligibility system whose response may take up to 90.',
};
