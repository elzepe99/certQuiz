import { INK } from './primitives';

/**
 * Question bd39a845 — "DreamHouse Realty has a data model as shown in the
 * image", for a stem whose image did not survive the scrape.
 *
 * Redrawn from the original. The structure the question turns on is the
 * cascade: Time Entry is a junction with master-detail to both Work Item and
 * Resource, each of which rolls its hours up; those two are themselves
 * master-detail children of Project, which rolls up again. So one Time Entry
 * insert recalculates roll-ups on two parents and then on their shared
 * grandparent — and Project is private, so its sharing is recalculated too.
 * Field types are shown because master-detail versus lookup is exactly what
 * decides whether a given edge participates.
 */
type Row = { name: string; type: string; sub?: string };

const PROJECT: Row[] = [
  { name: 'Total Hours for Project', type: '', sub: 'Roll-Up Summary (SUM Resource)' },
  { name: 'Num of Work Items', type: '', sub: 'Roll-Up Summary (COUNT Work Item)' },
  { name: 'Created By', type: 'Lookup(User)' },
  { name: 'Last Modified By', type: 'Lookup(User)' },
  { name: 'Num of Assigned Resources', type: '', sub: 'Roll-Up Summary (COUNT Resource)' },
  { name: 'Owner', type: 'Lookup(User+1)' },
  { name: 'Project Name', type: 'Text(80)' },
];

const RESOURCE: Row[] = [
  { name: 'Total Hours', type: '', sub: 'Roll-Up Summary (SUM Time Entry)' },
  { name: 'Created By', type: 'Lookup(User)' },
  { name: 'Last Modified By', type: 'Lookup(User)' },
  { name: 'Project', type: 'Master-Detail(Project)' },
  { name: 'Resource Name', type: 'Text(80)' },
];

const WORK_ITEM: Row[] = [
  { name: 'Sum of Hours', type: '', sub: 'Roll-Up Summary (SUM Time Entry)' },
  { name: 'Project', type: 'Master-Detail(Project)' },
  { name: 'Created By', type: 'Lookup(User)' },
  { name: 'Last Modified By', type: 'Lookup(User)' },
  { name: 'Owner', type: 'Lookup(User+1)' },
  { name: 'Work Item Name', type: 'Text(80)' },
];

const TIME_ENTRY: Row[] = [
  { name: 'Hours', type: 'Number(18, 0)' },
  { name: 'Work Item', type: 'Master-Detail(Work Item)' },
  { name: 'Resource', type: 'Master-Detail(Resource)' },
  { name: 'Created By', type: 'Lookup(User)' },
  { name: 'Last Modified By', type: 'Lookup(User)' },
  { name: 'Owner', type: 'Lookup(User+1)' },
  { name: 'Time Entry Num', type: 'Auto Number' },
];

const HEAD = 27;
const ROW = 19;
// 18, not 15: "Num of Assigned Resources" is long enough to reach back under
// its own right-aligned roll-up line at tighter spacing.
const SUBROW = 18;

const boxHeight = (rows: Row[]) =>
  HEAD + 12 + rows.reduce((a, r) => a + ROW + (r.sub ? SUBROW : 0), 0);

export function DreamHouseDataModel() {
  return (
    <svg
      viewBox="0 0 1130 500"
      role="img"
      aria-label={ALT}
      style={{ width: '100%', height: 'auto' }}
    >
      <Entity x={20} y={20} w={300} title="Project" rows={PROJECT} />
      <Entity x={420} y={30} w={290} title="Resource" rows={RESOURCE} />
      <Entity x={420} y={230} w={290} title="Work Item" rows={WORK_ITEM} />
      <Entity x={800} y={300} w={300} title="Time Entry" rows={TIME_ENTRY} />

      {/* Project is the master of both Resource and Work Item */}
      <Edge d="M 320 150 L 372 150" />
      <Edge d="M 372 105 L 372 310" />
      <Edge d="M 372 105 L 414 105" />
      <Edge d="M 372 310 L 414 310" />
      <CrowFoot x={420} y={105} />
      <CrowFoot x={420} y={310} />

      {/* Time Entry is a junction: master-detail to Resource and to Work Item */}
      <Edge d="M 710 120 L 780 120 L 780 345 L 794 345" />
      <Edge d="M 710 310 L 745 310 L 745 375 L 794 375" />
      <CrowFoot x={800} y={345} />
      <CrowFoot x={800} y={375} />
    </svg>
  );
}

function Entity({
  x,
  y,
  w,
  title,
  rows,
}: {
  x: number;
  y: number;
  w: number;
  title: string;
  rows: Row[];
}) {
  const h = boxHeight(rows);
  let cy = y + HEAD + 16;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={INK.panel} stroke={INK.lineStrong} />
      <path
        d={`M ${x} ${y + 3} a 3 3 0 0 1 3 -3 L ${x + w - 3} ${y} a 3 3 0 0 1 3 3 L ${x + w} ${y + HEAD} L ${x} ${y + HEAD} Z`}
        fill={INK.line}
        stroke={INK.lineStrong}
      />
      <text x={x + 12} y={y + 19} fontSize={13.5} fontWeight={700} fill={INK.labelHi}>
        {title}
      </text>
      {rows.map((r, i) => {
        const nameY = cy;
        const subY = cy + SUBROW;
        cy += ROW + (r.sub ? SUBROW : 0);
        return (
          <g key={i}>
            <text x={x + 12} y={nameY} fontSize={11.5} fill={INK.labelHi}>
              {r.name}
            </text>
            {r.type ? (
              <text
                x={x + w - 12}
                y={nameY}
                textAnchor="end"
                fontSize={11}
                fontStyle="italic"
                fill={INK.chipText}
              >
                {r.type}
              </text>
            ) : null}
            {r.sub ? (
              <text
                x={x + w - 12}
                y={subY}
                textAnchor="end"
                fontSize={10.5}
                fontStyle="italic"
                fill={INK.reply}
              >
                {r.sub}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function Edge({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={INK.call} strokeWidth={1.4} />;
}

/** Zero-or-many end of a relationship, drawn on the child side as in the original. */
function CrowFoot({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={INK.call} strokeWidth={1.4} fill="none">
      <circle cx={x - 17} cy={y} r={4} />
      <path d={`M ${x - 13} ${y} L ${x} ${y - 7} M ${x - 13} ${y} L ${x} ${y} M ${x - 13} ${y} L ${x} ${y + 7}`} />
    </g>
  );
}

const ALT =
  'Entity relationship diagram with four objects. Project has Roll-Up Summary fields ' +
  'Total Hours for Project (SUM Resource), Num of Work Items (COUNT Work Item) and Num ' +
  'of Assigned Resources (COUNT Resource), plus Created By, Last Modified By and Owner ' +
  'lookups to User and a Project Name text field. Resource has a Total Hours Roll-Up ' +
  'Summary (SUM Time Entry), Created By and Last Modified By lookups, a Project field ' +
  'that is Master-Detail to Project, and a Resource Name. Work Item has a Sum of Hours ' +
  'Roll-Up Summary (SUM Time Entry), a Project field that is Master-Detail to Project, ' +
  'Created By, Last Modified By and Owner lookups, and a Work Item Name. Time Entry has ' +
  'an Hours number field, a Work Item field that is Master-Detail to Work Item, a ' +
  'Resource field that is Master-Detail to Resource, Created By, Last Modified By and ' +
  'Owner lookups, and an auto-number Time Entry Num. So Project is the master of both ' +
  'Resource and Work Item, and Time Entry is a junction whose two master-detail ' +
  'relationships point at Work Item and at Resource.';

export const dreamHouseDataModel = {
  Svg: DreamHouseDataModel,
  alt: ALT,
  caption:
    'Time Entry is a junction with master-detail to both Work Item and Resource. Each of ' +
    'those rolls hours up, and both are master-detail children of Project, which rolls up ' +
    'again.',
};
