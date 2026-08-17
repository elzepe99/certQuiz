import {
  Activation,
  ArrowDefs,
  FONT,
  INK,
  Legend,
  Lifeline,
  Message,
  SelfCall,
} from './primitives';

const P = 'prf';

const EVENT1 = 80;
const DEP = 290;
const MW = 520;
const PS = 760;
const EVENT2 = 1060;

const FLOOR = 620;

/**
 * Question d258eebd — the payment-request SLA and update-conflict item.
 *
 * Redrawn from the original exam figure. Two exchanges share one Payment
 * Request record: the first ends at 2.2 with a reply the Middleware sends
 * without waiting — the figure's own "fire and forget" annotation — so the
 * processing at step 3 happens afterwards, unattended. The second is triggered
 * independently by Event2 and reaches back through the Middleware to the Data
 * Entry Point.
 */
export function PaymentRequestFlow() {
  return (
    <svg
      viewBox="0 0 1180 700"
      role="img"
      aria-label={ALT}
      style={{ width: '100%', height: 'auto' }}
    >
      <ArrowDefs prefix={P} />

      <Actor x={EVENT1} label="Event1" />
      <Lifeline x={DEP} label="Data Entry Point" width={180} bottom={FLOOR} />
      <Lifeline x={MW} label="Middleware" bottom={FLOOR} />
      <Lifeline x={PS} label="Payment System" bottom={FLOOR} />
      <Actor x={EVENT2} label="Event2" />

      {/* Both triggers stay active across the whole exchange, as in the original. */}
      <Activation x={EVENT1} top={100} bottom={FLOOR} />
      <Activation x={EVENT2} top={100} bottom={FLOOR} />

      {/* First exchange: accept the request and reply without waiting. */}
      <Activation x={DEP} top={100} bottom={305} />
      <Activation x={MW} top={145} bottom={305} />
      <Activation x={PS} top={190} bottom={390} />

      <Message from={EVENT1} to={DEP} y={100} label="1: start" prefix={P} />
      <Message from={DEP} to={MW} y={145} label="2: request" prefix={P} />
      <Message from={MW} to={PS} y={190} label="2.1: send" prefix={P} />
      <FireAndForget />
      <SelfCall x={PS} top={228} bottom={258} label="2.1.1: enqueue" prefix={P} />
      <Message from={MW} to={DEP} y={298} label="2.2: reply" reply prefix={P} />
      <SelfCall x={PS} top={340} bottom={378} label="3: process upon dequeue" prefix={P} />

      {/* Second exchange, triggered independently by Event2. */}
      <Activation x={PS} top={440} bottom={600} />
      <Activation x={MW} top={480} bottom={600} />
      <Activation x={DEP} top={515} bottom={565} />

      <Message from={EVENT2} to={PS} y={448} label="4: start" prefix={P} />
      <Message from={PS} to={MW} y={486} label="4.1: request" prefix={P} />
      <Message from={MW} to={DEP} y={522} label="4.1.1: request" prefix={P} />
      <Message from={DEP} to={MW} y={558} label="4.1.2: reply" reply prefix={P} />
      <Message from={MW} to={PS} y={594} label="4.2: reply" reply prefix={P} />

      <Legend
        x={40}
        y={658}
        items={[
          {
            swatch: (
              <line
                x1={0}
                y1={0}
                x2={34}
                y2={0}
                stroke={INK.call}
                strokeWidth={1.4}
                markerEnd={`url(#${P}-call)`}
              />
            ),
            text: 'call',
          },
        ]}
      />
      <Legend
        x={220}
        y={658}
        items={[
          {
            swatch: (
              <line
                x1={0}
                y1={0}
                x2={34}
                y2={0}
                stroke={INK.reply}
                strokeWidth={1.4}
                strokeDasharray="5 4"
                markerEnd={`url(#${P}-reply)`}
              />
            ),
            text: 'reply',
          },
        ]}
      />
      <Legend
        x={410}
        y={658}
        items={[
          {
            swatch: (
              <rect
                x={12}
                y={-8}
                width={11}
                height={16}
                rx={2}
                fill={INK.panel}
                stroke={INK.lineStrong}
              />
            ),
            text: 'bar height = how long that participant is busy',
          },
        ]}
      />
    </svg>
  );
}

/** The figure's own annotation on the 2.1 hop. */
function FireAndForget() {
  return (
    <g>
      <rect
        x={575}
        y={206}
        width={130}
        height={28}
        rx={4}
        fill="var(--warning-bg)"
        stroke="var(--warning-border)"
      />
      <text
        x={640}
        y={224}
        textAnchor="middle"
        fontSize={FONT.note}
        fill="var(--warning)"
      >
        fire and forget
      </text>
    </g>
  );
}

/** A triggering event, drawn as the stick figure the original uses. */
function Actor({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={30} r={9} fill={INK.panel} stroke={INK.lineStrong} />
      <path
        d={`M ${x} 39 L ${x} 62 M ${x - 14} 48 L ${x + 14} 48 M ${x} 62 L ${x - 11} 78 M ${x} 62 L ${x + 11} 78`}
        fill="none"
        stroke={INK.lineStrong}
      />
      <text x={x} y={96} textAnchor="middle" fontSize={FONT.head} fill={INK.labelHi}>
        {label}
      </text>
      <line x1={x} y1={100} x2={x} y2={FLOOR} stroke={INK.line} strokeDasharray="4 5" />
    </g>
  );
}

const ALT =
  'UML sequence diagram with five participants: Event1 and Event2 drawn as actors, and ' +
  'Data Entry Point, Middleware and Payment System drawn as lifelines. In the first ' +
  'exchange, Event1 triggers 1: start on the Data Entry Point, which sends 2: request ' +
  'to the Middleware. The Middleware sends 2.1: send to the Payment System, annotated ' +
  '"fire and forget", and the Payment System enqueues it (2.1.1: enqueue). The ' +
  'Middleware then replies 2.2 to the Data Entry Point. Only afterwards does the ' +
  'Payment System run 3: process upon dequeue. A second exchange follows, triggered ' +
  'independently: Event2 starts the Payment System (4: start), which sends 4.1: request ' +
  'to the Middleware, which sends 4.1.1: request to the Data Entry Point; the Data ' +
  'Entry Point replies 4.1.2 and the Middleware replies 4.2 back to the Payment System.';

export const paymentRequestFlow = {
  Svg: PaymentRequestFlow,
  alt: ALT,
  caption:
    'The 2.1 hop is fire and forget, so the reply at 2.2 is sent before the processing ' +
    'at 3 happens. The 4.x exchange is triggered separately and reaches the same record.',
};
