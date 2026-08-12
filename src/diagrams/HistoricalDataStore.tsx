import { ArrowDefs, INK } from './primitives';

const P = 'hds';

/**
 * Question 9a718961 — "given the diagram below…".
 *
 * Redrawn from the original exam figure. Three components, connected in both
 * directions already: a Salesforce org whose top compartment is a "View
 * Archived Data" component, a middleware box, and the historical store. The
 * figure labels none of its arrows and does not say which direction is the
 * archive — the point it makes is that the connectivity exists and the pattern
 * across it is what you are being asked to choose.
 */
export function HistoricalDataStore() {
  return (
    <svg
      viewBox="0 0 990 268"
      role="img"
      aria-label={ALT}
      style={{ width: '100%', height: 'auto' }}
    >
      <ArrowDefs prefix={P} />

      {/* Salesforce, with "View Archived Data" as its top compartment */}
      <rect
        x={40}
        y={20}
        width={260}
        height={180}
        rx={4}
        fill={INK.panel}
        stroke={INK.lineStrong}
      />
      <line x1={40} y1={92} x2={300} y2={92} stroke={INK.lineStrong} />
      <text x={170} y={50} textAnchor="middle" fontSize={13} fill={INK.labelHi}>
        View Archived
      </text>
      <text x={170} y={72} textAnchor="middle" fontSize={13} fill={INK.labelHi}>
        Data
      </text>
      <text
        x={170}
        y={226}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        fill={INK.labelHi}
      >
        Salesforce
      </text>

      {/* Middleware */}
      <rect
        x={380}
        y={45}
        width={220}
        height={150}
        rx={4}
        fill={INK.panel}
        stroke={INK.lineStrong}
      />
      <text x={490} y={125} textAnchor="middle" fontSize={13} fill={INK.labelHi}>
        &lt;&lt;Middleware&gt;&gt;
      </text>

      {/* Historical data store, drawn as a datastore cylinder */}
      <path
        d="M 660 58 L 660 172 A 140 18 0 0 0 940 172 L 940 58"
        fill={INK.panel}
        stroke={INK.lineStrong}
      />
      <ellipse cx={800} cy={58} rx={140} ry={18} fill={INK.panel} stroke={INK.lineStrong} />
      <text x={800} y={106} textAnchor="middle" fontSize={13} fill={INK.labelHi}>
        Historical Data Store
      </text>
      <text x={800} y={130} textAnchor="middle" fontSize={12} fill={INK.faint}>
        (20M+ records)
      </text>

      {/* Salesforce ↔ Middleware */}
      <Flow d="M 302 82 L 376 82" />
      <Flow d="M 378 160 L 304 160" />

      {/* Middleware ↔ Historical Data Store */}
      <Flow d="M 602 96 L 656 96" />
      <Flow d="M 658 140 L 636 140 L 636 168 L 606 168" />
    </svg>
  );
}

function Flow({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={INK.call}
      strokeWidth={1.5}
      markerEnd={`url(#${P}-call)`}
    />
  );
}

const ALT =
  'Component diagram with three parts connected in both directions. On the left, a ' +
  'Salesforce box labelled Salesforce underneath, whose top compartment is a component ' +
  'called View Archived Data. In the middle, a box labelled <<Middleware>>. On the ' +
  'right, a datastore cylinder labelled Historical Data Store, 20M+ records. An arrow ' +
  'runs from Salesforce to the Middleware and another returns from the Middleware to ' +
  'Salesforce. An arrow runs from the Middleware to the Historical Data Store, and a ' +
  'stepped arrow returns from the Historical Data Store back into the Middleware. None ' +
  'of the arrows is labelled: the figure shows that connectivity already exists between ' +
  'all three, not which pattern runs over it.';

export const historicalDataStore = {
  Svg: HistoricalDataStore,
  alt: ALT,
  caption:
    'Connectivity between all three already exists in both directions. What the question ' +
    'asks you to choose is the mechanism that carries archived records back into the ' +
    'View Archived Data component.',
};
