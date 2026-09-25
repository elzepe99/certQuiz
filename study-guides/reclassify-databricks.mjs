// Independent re-classification of the Databricks Certified Data Engineer Associate deck
// against the OFFICIAL exam outline (the May 4, 2026 exam guide, seven sections), assigned by
// reading each question's stem + option shape.
//
// Unlike every Salesforce deck in this repo, there is nothing to re-classify FROM: all 147
// questions carry the single tag "Databricks Certified Data Engineer Associate". The deck has
// no domain structure at all, so the table this file prints is the only view of where the
// deck's weight actually sits.
//
// The outline was read off the certification page and the linked exam guide PDF:
//   https://www.databricks.com/learn/certification/data-engineer-associate
//   .../databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf
//
//   PLAT   Databricks Intelligence Platform (6%)          - architecture and the control plane,
//                                                           Delta Lake and Unity Catalog AS
//                                                           components, compute service selection
//                                                           (all-purpose / job / pool / SQL
//                                                           warehouse / serverless), cost models,
//                                                           workspace and notebook mechanics
//   ING    Data Ingestion and Loading (21%)               - Auto Loader, COPY INTO, Lakeflow
//                                                           Connect, streaming reads and triggers,
//                                                           Kafka, JDBC, schema inference and
//                                                           evolution on ingest, checkpointing,
//                                                           federation as an ingestion alternative
//   XFORM  Data Transformation and Modeling (22%)         - PySpark and SQL transformations, joins
//                                                           and set operators, dedup, aggregates,
//                                                           DDL/DML, UDFs, medallion layer design,
//                                                           Gold objects, data quality expectations
//   JOBS   Working with Lakeflow Jobs (16%)               - tasks and dependencies, schedules and
//                                                           triggers, control flow, repair runs,
//                                                           pipeline configuration, parameters
//   CICD   Implementing CI/CD (10%)                       - Git folders, branches, bundles, the
//                                                           Databricks CLI, Databricks Connect
//   OPS    Troubleshooting, Monitoring, Optimization (10%)- Spark UI, skew, spill, OOM, caching,
//                                                           OPTIMIZE / ZORDER / liquid clustering /
//                                                           VACUUM / autoCompact, debuggers, alerts
//   GOV    Governance and Security (15%)                  - Unity Catalog grants and admin roles,
//                                                           managed vs external tables, ownership,
//                                                           Catalog Explorer, lineage, Delta Sharing
//
//   node study-guides/reclassify-databricks.mjs      prints the exam-vs-deck table

export const CALLS = {
  // --- Databricks Intelligence Platform -------------------------------------------------
  '27d6e2a9':'PLAT', 'f649f00e':'PLAT', 'ae5406b2':'PLAT', '5acae1e0':'PLAT', '09230e35':'PLAT',
  '630dc828':'PLAT', '2a715f47':'PLAT', '1eb89e9b':'PLAT', 'a495c049':'PLAT', 'e5b58f83':'PLAT',
  '7fc931cb':'PLAT', '47a349af':'PLAT', '495c576a':'PLAT', '25c59e18':'PLAT', 'a65602bf':'PLAT',
  'd19c13d0':'PLAT', '58e8c0c0':'PLAT', 'd1d9d3e4':'PLAT', '635bddb5':'PLAT', '047d9dcc':'PLAT',
  'b75b484a':'PLAT', '1d94fee4':'PLAT', 'ac547586':'PLAT', '2decff00':'PLAT',

  // --- Data Ingestion and Loading -------------------------------------------------------
  '5b22314e':'ING', '607579bf':'ING', 'e994ba67':'ING', 'c46dbf87':'ING', 'e37b5308':'ING',
  '8163487e':'ING', '883f4c22':'ING', '0cc3a156':'ING', '5bd76bd3':'ING', 'c05bd089':'ING',
  'cbad36b2':'ING', '8b96c6a7':'ING', 'e2b2b183':'ING', 'cd5c6fb5':'ING', '145c9e5f':'ING',
  'db601c4b':'ING', '8c02bf21':'ING', 'ab519345':'ING', '1af41ff9':'ING', 'b44046a7':'ING',
  '85fa27f8':'ING', '61f47f5f':'ING', '357e5f5f':'ING',

  // --- Data Transformation and Modeling -------------------------------------------------
  '253200f6':'XFORM', '714c3513':'XFORM', 'b982701e':'XFORM', '3c490978':'XFORM', 'e86e463b':'XFORM',
  '9f03e206':'XFORM', '7770a34e':'XFORM', 'd4cff52c':'XFORM', '9cd76b59':'XFORM', '7d8befb9':'XFORM',
  '731b1431':'XFORM', '9582ab27':'XFORM', 'eda36319':'XFORM', 'd3fe1ff3':'XFORM', '90a659a5':'XFORM',
  '7e554787':'XFORM', '260f002c':'XFORM', '66dcd37c':'XFORM', '576c09d6':'XFORM', 'e15b1b0a':'XFORM',
  'e1fce6fb':'XFORM', '4139a66f':'XFORM', 'ef32d90b':'XFORM', '17bff8a1':'XFORM', '9356edb4':'XFORM',
  'b830bd4a':'XFORM', 'f936e928':'XFORM', '18a58c20':'XFORM', '37d2584a':'XFORM', '4521d38c':'XFORM',
  '6f2f2961':'XFORM', '347e0272':'XFORM', '044f84a7':'XFORM', 'b2eac0e1':'XFORM', '19f13e4f':'XFORM',
  'c25ad90d':'XFORM', 'efaa02e1':'XFORM', '927c138b':'XFORM', 'e93d65ad':'XFORM', '6c62630d':'XFORM',

  // --- Working with Lakeflow Jobs -------------------------------------------------------
  'd205b9c7':'JOBS', '93896ff1':'JOBS', '3781f6d5':'JOBS', 'ecd9e75b':'JOBS', '5db322a2':'JOBS',
  '9318411d':'JOBS', '87500e54':'JOBS', 'e4e3a589':'JOBS', '1b743a58':'JOBS', 'b199b398':'JOBS',
  'c86a38ee':'JOBS', 'e0215c73':'JOBS', 'b8d8ba3d':'JOBS',

  // --- Implementing CI/CD ---------------------------------------------------------------
  'f163d861':'CICD', 'bc754c65':'CICD', 'd5ed9d2a':'CICD', 'ef8652ae':'CICD', '94a481b8':'CICD',
  '4362d421':'CICD', 'c6af1c01':'CICD', '4156034b':'CICD', 'cf9b73c2':'CICD', '3b2b15a2':'CICD',

  // --- Troubleshooting, Monitoring, and Optimization ------------------------------------
  '42c11595':'OPS', '721d10bc':'OPS', 'd4bf69a2':'OPS', '9803cecf':'OPS', 'c59ebbbc':'OPS',
  'be6c2bbb':'OPS', '4f099cf4':'OPS', '5c71f0db':'OPS', 'b8479190':'OPS', '42c02958':'OPS',
  'cebba9ec':'OPS', '80bcd63f':'OPS', 'b92b838e':'OPS', 'b0ef3381':'OPS', '334c542a':'OPS',
  'b88bac23':'OPS',

  // --- Governance and Security ----------------------------------------------------------
  '5e449a1e':'GOV', '9df48f77':'GOV', '391a3356':'GOV', '39a9ae72':'GOV', '0964845e':'GOV',
  '855493c1':'GOV', 'b3e97d70':'GOV', 'd96fcc04':'GOV', '0caebf63':'GOV', 'a3d17a56':'GOV',
  '01a4251c':'GOV', '3b73f7fd':'GOV', '393dfae5':'GOV', 'd7737ad3':'GOV', '5da4fd9e':'GOV',
  '32080a59':'GOV', 'c41ece0b':'GOV', '0774a092':'GOV', '0327f145':'GOV', 'da42fde3':'GOV',
  '6a772acc':'GOV',
};

export const EXAM = { PLAT:6, ING:21, XFORM:22, JOBS:16, CICD:10, OPS:10, GOV:15 };
export const NAMES = {
  PLAT:'Databricks Intelligence Platform',
  ING:'Data Ingestion and Loading',
  XFORM:'Data Transformation and Modeling',
  JOBS:'Working with Lakeflow Jobs',
  CICD:'Implementing CI/CD',
  OPS:'Troubleshooting, Monitoring, Optimization',
  GOV:'Governance and Security',
};

// Sub-objectives named in the May 2026 exam guide with NO deck item, found by reading all 147
// against the outline and confirmed by keyword sweep over stems, options and explanations.
export const UNCOVERED = [
  'COPY INTO for incremental loads from cloud object storage (a named Section 2 objective; zero deck items)',
  'Lakeflow Connect standard vs managed connectors, and choosing between them and Auto Loader (named four times in Section 2)',
  'Column masks and row filters in Unity Catalog (a named Section 7 objective)',
  'Unity Catalog ABAC governance policies and governed tags (a named Section 7 objective)',
  'DENY, and granting to service principals as principals alongside users and groups (Section 7 names GRANT, REVOKE and DENY; the deck has GRANT only)',
  'Predictive optimization (named in Section 6 beside liquid clustering, which the deck does cover once)',
  'File-arrival and table-update triggers, and choosing time-based against data-driven (a named Section 4 objective; the deck knows cron only)',
  'Job control flow - retries, If/else condition tasks, For each loops, and the Run if setting (a named Section 4 objective)',
  'Materialized views as a Gold-layer object beside views, streaming tables and tables (named in Section 3)',
  'Bundle variables, targets and deployment modes for promoting one codebase across dev/test/prod (a named Section 5 objective)',
  'The named tuning parameters - spark.sql.shuffle.partitions, spark.default.parallelism, spark.executor/driver.memory, spark.sql.autoBroadcastJoinThreshold (named in Section 3)',
  'Join breadth - inner, left, cross, multiple keys, union all (Section 3 names them; the deck has one UNION item and one broadcast-join item)',
  'approx_count_distinct, mean and summary as aggregate/profiling operations, and exploding arrays (named in Section 3)',
];

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const fs = await import('node:fs');
  const deck = JSON.parse(fs.readFileSync('public/decks/databricks-data-engineer-associate.json', 'utf8'));
  const ids = new Set(deck.map(q => q.id));
  const missing = deck.filter(q => !(q.id in CALLS)).map(q => q.id);
  const stale = Object.keys(CALLS).filter(id => !ids.has(id));
  if (missing.length || stale.length) console.log('unclassified:', missing, 'stale:', stale);
  const n = deck.length;
  const counts = {};
  for (const q of deck) counts[CALLS[q.id]] = (counts[CALLS[q.id]] || 0) + 1;
  console.log(`deck ${n} questions  |  exam 45 scored questions`);
  for (const d of Object.keys(EXAM)) {
    const c = counts[d] || 0;
    console.log(
      `${NAMES[d].padEnd(42)} exam ${String(EXAM[d]).padStart(2)}%  ~${Math.round(EXAM[d] * 0.45).toString().padStart(2)} Qs   deck ${String(c).padStart(3)}  ${(100 * c / n).toFixed(1).padStart(5)}%`,
    );
  }
}
