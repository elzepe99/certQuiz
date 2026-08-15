import {
  Activation,
  ArrowDefs,
  INK,
  FONT,
  LegChip,
  Legend,
  Lifeline,
  Message,
  SelfCall,
} from './primitives';

const P = 'rtl';

// Lifeline x positions, left to right in call order.
const USER = 90;
const UI = 280;
const MW = 500;
const ONPREM = 730;
const THIRD = 950;

const FLOOR = 650;

/**
 * Question 0ae13744 — "which computation represents the end-to-end response
 * time from the user's perspective?"
 *
 * A faithful redraw of the sequence diagram the item was written against. The
 * prose rendering that stood in for it could not show the one thing the
 * question turns on: leg A is still open while B through F run inside it, and
 * leg G is still running after the reply that closes A. Duration is height
 * here, so the containment is visible rather than inferred.
 */
export function ResponseTimeLegs() {
  return (
    <svg
      viewBox="0 0 1180 750"
      role="img"
      aria-label={ALT}
      style={{ width: '100%', height: 'auto' }}
    >
      <ArrowDefs prefix={P} />

      <Lifeline x={USER} label="User" width={110} bottom={FLOOR} />
      <Lifeline x={UI} label="UI Component" bottom={FLOOR} />
      <Lifeline x={MW} label="Middleware" bottom={FLOOR} />
      <Lifeline x={ONPREM} label="On-Premise System" bottom={FLOOR} />
      <Lifeline x={THIRD} label="3rd Party System" bottom={FLOOR} />

      {/* Activation bars — height is the leg's duration. Each lettered leg is
          marked on the participant that is *waiting* on it, which is where the
          original figure puts them: A on the UI Component, B/D/F on the
          Middleware as it makes each sub-call in turn. */}
      <Activation x={USER} top={100} bottom={FLOOR} />
      <Activation x={UI} top={142} bottom={610} />
      <Activation x={MW} top={142} bottom={516} />
      <Activation x={ONPREM} top={188} bottom={288} />
      <Activation x={THIRD} top={328} bottom={428} />
      <Activation x={ONPREM} top={464} bottom={500} />

      <Message from={USER} to={UI} y={100} label="1: onClick" prefix={P} />
      <Message from={UI} to={MW} y={142} label="2: getSummary" prefix={P} />
      <Message from={MW} to={ONPREM} y={188} label="2.1: getSummary" prefix={P} />
      <SelfCall x={ONPREM} top={222} bottom={252} label="2.1.1: consolidateInfo" prefix={P} />
      <Message from={ONPREM} to={MW} y={288} label="2.1.2: summary info" reply prefix={P} />
      <Message from={MW} to={THIRD} y={328} label="2.2: getSummary" prefix={P} />
      <SelfCall x={THIRD} top={362} bottom={392} label="2.2.1: consolidateInfo" prefix={P} />
      <Message from={THIRD} to={MW} y={428} label="2.2.2: summary info" reply prefix={P} />
      <Message from={MW} to={ONPREM} y={464} label="2.3: startAsyncProcess" prefix={P} />
      <SelfCall
        x={ONPREM}
        top={497}
        bottom={FLOOR}
        label="2.3.1: process"
        prefix={P}
        dashed
        note="still running"
      />
      <Message
        from={MW}
        to={UI}
        y={516}
        label="2.4: consolidated summary"
        reply
        prefix={P}
      />
      <SelfCall x={UI} top={552} bottom={596} label="3: render" prefix={P} />

      {/* Leg letters, as the question numbers them. */}
      <LegChip x={262} y={210} letter="A" />
      <LegChip x={482} y={238} letter="B" />
      <LegChip x={797} y={237} letter="C" />
      <LegChip x={482} y={378} letter="D" />
      <LegChip x={1017} y={377} letter="E" />
      <LegChip x={482} y={482} letter="F" />
      <LegChip x={797} y={570} letter="G" />
      <LegChip x={347} y={574} letter="H" />

      <Legend
        x={40}
        y={686}
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
        x={330}
        y={686}
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
            text: 'bar height = how long that leg is open',
          },
          {
            swatch: (
              <rect
                x={12}
                y={-8}
                width={11}
                height={16}
                rx={2}
                fill={INK.panel}
                stroke={INK.reply}
                strokeDasharray="4 4"
              />
            ),
            text: 'dashed = asynchronous',
          },
        ]}
      />
      <text x={40} y={732} fontSize={FONT.note} fill={INK.faint}>
        Legs A–H are the eight intervals the question asks you to combine.
      </text>
    </svg>
  );
}

const ALT =
  'UML sequence diagram with five participants: User, UI Component, Middleware, ' +
  'On-Premise System and 3rd Party System. The User clicks (1: onClick) on the UI ' +
  'Component, which calls the Middleware with 2: getSummary. Leg A is marked on the UI ' +
  'Component, which stays busy from that call until the reply at 2.4. Inside it the ' +
  'Middleware calls the On-Premise System (2.1: getSummary) and waits — this is leg B, ' +
  'marked on the Middleware; the On-Premise System calls itself (2.1.1: ' +
  'consolidateInfo, leg C) and replies at 2.1.2. The Middleware then calls the 3rd ' +
  'Party System (2.2: getSummary) and waits, which is leg D; the 3rd Party System ' +
  'calls itself (2.2.1: consolidateInfo, leg E) and replies at 2.2.2. The Middleware ' +
  'then calls the On-Premise System again (2.3: startAsyncProcess), which is leg F; ' +
  'that starts an asynchronous self-call (2.3.1: process, leg G) still running after ' +
  'the Middleware has replied. The Middleware returns 2.4: consolidated summary to the ' +
  'UI Component, closing leg A, and the UI Component renders (3: render, leg H).';

export const responseTimeLegs = {
  Svg: ResponseTimeLegs,
  alt: ALT,
  // States how to read the notation, not what the legs add up to — the figure
  // renders above the options, and the arithmetic is the question.
  caption:
    'Duration is height: an activation bar stays open until its reply arrives, and a ' +
    'dashed bar keeps running after one.',
};
