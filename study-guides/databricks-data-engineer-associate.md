# Databricks Certified Data Engineer Associate — Study Guide

**Built from the 147 questions in `databricks-data-engineer-associate.json`, cross-checked
against the official exam guide of 4 May 2026 and the documentation those questions cite.**

Every fact below traces to a rendered `docs.databricks.com` page (see [Sources](#14-sources)) or
to this deck's fact-check pass of 2026-08-15. This is the first non-Salesforce guide in this
repo, and the gap it has to close is the widest of any deck so far: **the exam was restructured
into seven domains, and four of the products the deck names by their old names have been
renamed under it.** [§12 Where the deck is older than the exam](#12-where-the-deck-is-older-than-the-exam)
carries the whole list.

---

## 1. The exam, factually

| | |
|---|---|
| Official name | Databricks Certified Data Engineer Associate |
| Content | **45 scored** multiple-choice questions, plus unscored items |
| Time | **90 minutes** (2 minutes per question) |
| Passing score | Not published — Databricks states no fixed percentage for this exam |
| Prerequisite | None; six months of hands-on Databricks experience recommended |
| Fee | US$200 |
| Validity | **2 years**, then recertification on the current live exam |
| **Exam version** | **4 May 2026** |

**Code in this exam is SQL wherever SQL can express it, and Python otherwise.** That is stated
on the certification page, and it tells you where to spend effort: the PySpark you need is the
DataFrame API (`groupBy`, `agg`, `select`, `dropDuplicates`, `readStream`, `writeStream`), not
the whole of Spark.

Two structural facts matter more than any single topic. **The exam is 45 questions**, so one
domain percentage point is roughly half a question — a 6% domain is about three questions and a
22% domain is about ten. And **the exam version is newer than the deck**, which was scraped
before the May 2026 restructure. Everything in §12 follows from that second fact.

---

## 2. Where the points actually are

Official outline weightings against the deck. **Unlike every other deck in this repo there was
nothing to re-classify from**: all 147 questions carry the single tag "Databricks Certified Data
Engineer Associate", so the deck has no domain structure at all. The column below is an
independent re-classification of all 147 against the seven current sections
(`study-guides/reclassify-databricks.mjs`).

| Domain | Weight | ≈ Questions | Deck | Verdict |
|---|---:|---:|---:|---|
| Databricks Intelligence Platform | 6% | ~3 | 24 (16.3%) | **badly over** |
| Data Ingestion and Loading | 21% | ~9 | 23 (15.6%) | under |
| Data Transformation and Modeling | 22% | ~10 | 40 (27.2%) | over |
| Working with Lakeflow Jobs | 16% | ~7 | 13 (8.8%) | **badly under** |
| Implementing CI/CD | 10% | ~5 | 10 (6.8%) | under |
| Troubleshooting, Monitoring, Optimization | 10% | ~5 | 16 (10.9%) | about right |
| Governance and Security | 15% | ~7 | 21 (14.3%) | about right |

### The gap you need to close

**The deck spends a sixth of itself on a domain worth 6%.** Twenty-four questions ask what a
lakehouse is, what the control plane holds, what a DataFrame is, and which cluster to pick —
material worth about three questions on the real exam. Meanwhile **Lakeflow Jobs is 16% of the
exam and 8.8% of the deck**, and it is the domain where the deck's coverage is not just thin but
one-sided: the deck knows task dependencies and repair runs, and knows nothing about triggers
beyond cron or about control flow at all.

Reading all 147 against the May 2026 sub-objectives, **thirteen named objectives have no deck
item**:

1. **`COPY INTO`** for incremental loads from cloud object storage — a named Section 2
   objective, zero deck items.
2. **Lakeflow Connect**, standard against managed connectors, and choosing between them and Auto
   Loader — named four separate times in Section 2.
3. **Column masks and row filters** in Unity Catalog — a named Section 7 objective.
4. **Unity Catalog ABAC** governance policies and governed tags — a named Section 7 objective.
5. **`DENY`**, and **service principals** as grantees — Section 7 names GRANT, REVOKE *and* DENY
   against users, groups and service principals; the deck has GRANT to groups only.
6. **Predictive optimization** — named in Section 6 beside liquid clustering, which the deck does
   cover once (`cebba9ec`).
7. **File-arrival and table-update triggers**, and choosing time-based against data-driven — a
   named Section 4 objective; the deck knows cron only (`e0215c73`, `3781f6d5`).
8. **Job control flow** — retries, If/else condition tasks, For each loops, the Run if setting —
   a named Section 4 objective.
9. **Materialized views** as a Gold-layer object beside views, streaming tables and tables —
   named in Section 3; the deck mentions the term only as a gloss on "live table".
10. **Bundle variables, targets and deployment modes** for promoting one codebase across
    dev/test/prod — a named Section 5 objective.
11. **The named tuning parameters** — `spark.sql.shuffle.partitions`,
    `spark.default.parallelism`, `spark.executor/driver.memory`,
    `spark.sql.autoBroadcastJoinThreshold` — named in Section 3.
12. **Join breadth** — inner, left, cross, multiple keys, union all. Section 3 names them; the
    deck has one `UNION` item (`7d8befb9`) and one broadcast-join item (`37d2584a`).
13. **`approx_count_distinct`, `mean`, `summary`, and exploding arrays** — named in Section 3.

§4 through §9 teach all thirteen from the documentation.

### What the deck's 147 do rehearse well

Delta Live Tables expectations and their two violation actions (8 items), Auto Loader and
Structured Streaming mechanics (14), medallion-layer design (11), Unity Catalog grants and
ownership (12), Delta Sharing (5), the Delta maintenance commands (6), and Spark performance
diagnosis (6). Someone who can explain *why* each of those is keyed has the middle of the exam.
They will still be short on jobs, ingestion breadth and the governance features added since the
scrape.

---

## 3. Databricks Intelligence Platform (6%)

The smallest domain, and the one the deck over-trains by a factor of five. Learn the compute
table and the architecture split, and move on.

### Architecture — what sits where

| Plane | Holds |
|---|---|
| **Control plane** (Databricks account) | Compute orchestration, Unity Catalog, the workspace UI, notebooks, job configuration, query history (`1eb89e9b`) |
| **Customer cloud account** | **Data** — the S3/ADLS/GCS buckets your tables' files live in (`47a349af`). Classic compute also runs here |
| **Serverless compute plane** | Databricks' own account. Serverless SQL warehouses, serverless jobs and serverless pipelines run here, not in your VPC |

`47a349af` keys **Data**, and that is right for classic compute *and* for serverless: your files
never leave your account either way. What moves with serverless is the compute, not the storage.

### Choosing compute — the whole domain in one table

| Requirement in the stem | Answer | Deck |
|---|---|---|
| Interactive work, small data, no distribution needed | **Single-node cluster** | `09230e35` |
| Scheduled production ETL, terminates when done, cheapest per run | **Job cluster** | `495c576a`, `1d94fee4` |
| Small, interruptible, cost is the whole point | Job cluster with **spot instances** | `2decff00` |
| Cluster start time is the bottleneck on a repeated job | **Cluster pools** — pre-warmed idle instances | `27d6e2a9`, `e5b58f83` |
| Ad-hoc SQL, fluctuating query volume, no infrastructure to manage | **Serverless SQL warehouse** — starts in seconds | `7fc931cb`, `25c59e18`, `047d9dcc`, `630dc828` |
| Minimal runtime errors and high availability, no cluster management | **Serverless compute** | `f649f00e` |
| Migrating jobs off classic to cut cost, which one first | A frequent, efficient, **Python** pipeline on a current runtime | `58e8c0c0` |
| Shared cluster, many analysts, needs isolation | Serverless SQL warehouse today; the exam guide's own sample still says *high-concurrency cluster* (§12) | — |

**Serverless is the default answer to a cost-or-startup stem on this exam**, and it is the one
place the deck and the outline agree completely: four deck items key it and the exam guide's
sample question 2 keys Delta Lake + Unity Catalog for the same shape of requirement.

### Delta Lake and Unity Catalog as components

**Delta Lake** is the storage layer: ACID transactions, schema enforcement, time travel
(`a495c049`, `2a715f47`). A Delta table is a directory of Parquet data files plus a transaction
log holding history, metadata and statistics (`d19c13d0`) — the log, not a metastore row, is
what makes the table a table.

**A lakehouse** is what you get when that layer sits under both BI and AI workloads: one copy of
the data, one set of permissions, one source of truth for the analytics team and the engineering
team (`b75b484a`, `ac547586`).

### Workspace mechanics the outline no longer names

Three deck items test notebook behaviour that maps to no current sub-objective — one language
per cell (`5acae1e0`), `%sql` to switch a single cell (`a65602bf`), and the 30 MB job-cluster
notebook output ceiling (`ae5406b2`). They are cheap to hold and cost nothing to keep, but do
not budget study time for them.

---

## 4. Data Ingestion and Loading (21%)

The largest domain after transformation, and the deck is nine points short of it. Two of the
missing pieces — `COPY INTO` and Lakeflow Connect — are named objectives with **zero** deck
items, so they are the highest-yield reading in this guide.

### The four ways to land data, and how to choose

| Tool | Use when | Deck |
|---|---|---|
| **Auto Loader** (`cloudFiles`) | New files arrive continuously in cloud object storage; you want incremental processing with schema inference and evolution and exactly-once semantics | `357e5f5f`, `85fa27f8`, `c46dbf87`, `8163487e` |
| **`COPY INTO`** | A SQL-first team, a bounded set of files, idempotent re-runs | **none** |
| **Lakeflow Connect** | Ingesting from an enterprise source — a database or a SaaS application — rather than from files | **none** |
| **Federation** | You want to *query* the source without copying it at all | `883f4c22`, `145c9e5f` |

#### `COPY INTO` — the objective the deck never asks

`COPY INTO` loads files from a location into a Delta table with SQL, from CSV, JSON, XML, Avro,
ORC, Parquet, text and binary, out of S3, ADLS, ABFS, GCS or a Unity Catalog volume. The
property to remember is that it is **retriable and idempotent**: *"files in the source location
that have already been loaded are skipped on subsequent runs."* Re-running it after a partial
failure does not double-load.

Two things that follow. It needs no streaming checkpoint of your own, because that per-file
bookkeeping is the table's. And Databricks' own guidance now says that *"for a more scalable and
robust file ingestion experience, Databricks recommends that SQL users use streaming tables"* —
so a stem that says "scalable" or "continuously arriving" keys a streaming table or Auto Loader
even where `COPY INTO` would work.

#### Lakeflow Connect — the objective named four times

**Managed connectors** are built and maintained by Databricks for named sources: MySQL,
PostgreSQL, SQL Server; Salesforce, HubSpot, Jira, Workday; Google Drive, SharePoint; RabbitMQ.
They *"produce ingestion pipelines that are governed by Unity Catalog and powered by serverless
compute and Lakeflow pipelines"* — you configure the source and the destination and Databricks
runs the pipeline.

**Standard connectors** cover a broader set of sources and *"trade some automation for broader
source support and customization"* — you own more of the pipeline.

The selection tell in a stem: a **named SaaS or database source** with no mention of files →
Lakeflow Connect, managed if the source is on the list. **Files landing in a bucket** → Auto
Loader. **A team that writes only SQL and re-runs a load** → `COPY INTO`.

### Auto Loader, in the detail the exam asks for

- It is built on **Spark Structured Streaming** (`8163487e`), so it is a streaming workload even
  when you run it once (`c46dbf87`).
- **Schema inference on JSON gives you strings.** `607579bf` is the deck's best item here: with
  no schema hints, every column comes back as a string, because JSON is a text format and Auto
  Loader will not guess a type it cannot prove.
- **Schema evolution is a mode, not a switch.** `cbad36b2` keys `failOnNewColumns` — the mode
  that stops the stream when an unexpected column appears, which is what you want when a
  downstream contract must be renegotiated before the data moves. The alternatives add the
  column, rescue it into `_rescued_data`, or ignore it.
- The read is `spark.readStream.format("cloudFiles")` with `cloudFiles.format` naming the file
  type (`85fa27f8`). Turning a batch read into a stream is exactly the `spark.read` →
  `spark.readStream` swap (`e994ba67`).

### Structured Streaming — state, triggers and checkpoints

| Concept | What it does | Deck |
|---|---|---|
| **Checkpoint** | Records stream progress so a restart resumes rather than reprocesses; with write-ahead logs it is what delivers exactly-once | `1af41ff9`, `b44046a7` |
| **Watermark** | Bounds how long state is kept for aggregations, so late data past the threshold is dropped instead of growing state forever | `cd5c6fb5` |
| `trigger(processingTime="5 seconds")` | Micro-batch every five seconds | `e2b2b183` |
| `trigger(availableNow=True)` | Process everything available, then stop — the incremental-batch trigger | `db601c4b` |
| `.outputMode("append")` | Add new rows only, never rewrite | `61f47f5f` |

**`availableNow` is the one to recognise on sight.** A stem that wants incremental processing on
a schedule rather than a continuously running stream keys it: you get the streaming engine's
bookkeeping with a job's cost profile.

### Reading from tables and external systems

- **Kafka**: `spark.readStream.format("kafka")` with `kafka.bootstrap.servers` and `subscribe`,
  wrapped in a pipeline table (`5bd76bd3`).
- **JDBC**: `CREATE TABLE ... USING org.apache.spark.sql.jdbc` with `url`, `dbtable` and
  credentials (`ab519345`).
- **Files as a table**: `CREATE TABLE ... USING CSV OPTIONS (header, delimiter) LOCATION ...`
  (`e37b5308`). Prefer Parquet over CSV for a `CREATE TABLE AS SELECT` because **Parquet carries
  its own schema** and CSV does not (`5b22314e`).
- **`STREAM(LIVE.table)`** in a pipeline means the upstream is being read incrementally
  (`0cc3a156`); `CREATE STREAMING LIVE TABLE` is for append-only incremental sources, plain
  `CREATE LIVE TABLE` recomputes (`8b96c6a7`).

---

## 5. Data Transformation and Modeling (22%)

The biggest domain and the deck's biggest block, but the coverage is uneven: the deck is strong
on medallion design and DDL and almost silent on joins, aggregates and tuning.

### The DataFrame operations the outline names

| Operation | Spark | SQL | Deck |
|---|---|---|---|
| Group and aggregate | `df.groupBy("region").agg(sum("amt").alias("total"))` | `GROUP BY` | `714c3513`, `66dcd37c`, `d3fe1ff3` |
| Project columns | `df.select(...)` | `SELECT` | `b2eac0e1` |
| Deduplicate | `df.dropDuplicates(["a","b"])` | — | `927c138b` |
| Union | `df.union(other)` | `UNION` / `UNION ALL` | `7d8befb9` |
| Broadcast a small side of a join | `broadcast(df)` | `/*+ BROADCAST(t) */` | `37d2584a` |
| Explode an array into rows | `explode(col)` | `explode()` | **none** |
| Higher-order filter on an array | — | `FILTER(arr, i -> i.x > 5)` | `90a659a5` |
| Long to wide | — | `PIVOT` | `9f03e206` |

**`UNION` removes duplicates and `UNION ALL` keeps them.** `7d8befb9` keys `UNION` for combining
two months of transactions; if the stem says "every row including repeats", it is `UNION ALL`.
The deck never asks this, and Section 3 names both.

**Joins are a gap.** The deck has broadcast joins and nothing else. What Section 3 names: inner,
left, cross, multiple keys, union and union all. The rules worth holding: an **inner** join drops
unmatched rows on both sides; a **left** join keeps every left row and nulls the right; a
**cross** join is the Cartesian product and is almost never the intended answer unless the stem
says "every combination"; a **broadcast** join is the optimisation when one side is small enough
to ship to every executor (`37d2584a`), which is the same thing
`spark.sql.autoBroadcastJoinThreshold` does automatically below its size limit.

**Aggregate breadth is a gap too.** The deck has `count_if` twice (`b830bd4a`, `d4cff52c`).
Section 3 also names `approx_count_distinct` — an approximate distinct count that trades exactness
for speed on high-cardinality columns — plus `mean` and `summary`, the profiling call that
returns count, mean, stddev, min and max per column in one pass.

### Counting nulls — the item worth reading twice

`d4cff52c` is the deck's sharpest SQL item and the reason to know the semantics rather than the
syntax:

- `count_if(col > 1)` counts rows where the predicate is **true**; a NULL `col` makes the
  predicate NULL, which is not true, so the row is not counted.
- `count(*)` counts **rows**, nulls included.
- `count(col1)` counts **non-null values** of that column.

So the same table gives three different numbers from three counts, and the question is only hard
if you think `count(col)` and `count(*)` are the same thing. `b830bd4a` is the same fact from the
other side: the number of nulls is `count_if(member_id IS NULL)`.

### DDL, DML and the objects you can create

| You need | Object | Deck |
|---|---|---|
| Persisted, shared across sessions, physical storage | **Table** | `4521d38c` |
| Scoped to one session, no storage | **Temp view** — `CREATE TEMP VIEW` | `6f2f2961`, `19f13e4f` |
| A saved query recomputed on read | **View** | — |
| A saved query with **materialized results**, refreshed incrementally | **Materialized view** | **none** |
| Append-only incremental ingest target | **Streaming table** | `8b96c6a7`, `9cd76b59` |
| Create empty with a fixed schema, replacing whatever is there | `CREATE OR REPLACE TABLE t (col TYPE, ...)` | `e15b1b0a`, `e93d65ad` |
| Append a row | `INSERT INTO t VALUES (...)` | `3c490978` |
| Delete matching rows without rewriting the table | `DELETE FROM t WHERE ...` | `576c09d6`, `18a58c20` |
| Insert-or-update against a key, no duplicates | `MERGE INTO` | `7770a34e` |
| Reusable scalar logic in SQL | `CREATE FUNCTION f(...) RETURNS ... RETURN CASE ...` | `ef32d90b` |

**Materialized views are the named Gold-layer object the deck skips.** Section 3 asks you to
distinguish *"materialized views, views, streaming tables, and tables"* for BI teams. The line:
a **view** stores a query and pays the compute on every read; a **materialized view** stores the
*result* and refreshes it, so BI readers pay nothing; a **streaming table** is the append-only
ingest target upstream of both. For a dashboard over a large, slowly changing aggregate, the
answer is a materialized view.

`CREATE OR REPLACE TABLE` versus `CREATE TABLE IF NOT EXISTS` is a real distinction
(`e15b1b0a`): the stem's "regardless of whether a table already exists" forces the first.

### The medallion architecture

| Layer | Holds | Deck |
|---|---|---|
| **Bronze** | Raw, append-only, original schemas preserved, in Delta format; the only additions are provenance columns — load date/time, process id, source file | `9356edb4`, `eda36319`, `f936e928`, `6c62630d` |
| **Silver** | Cleaned, conformed, deduplicated, joined — the master customer record, the `customer_transactions` join | `e1fce6fb`, `044f84a7`, `4139a66f` |
| **Gold** | Aggregated, report-ready, business-level; the source for dashboards and BI | `260f002c`, `4139a66f` |

**The Bronze rule that the exam keeps testing: do not transform on the way in.** `9356edb4` and
`f936e928` both key "land it raw, append-only, minimal validation" over any option that cleans,
filters or conforms in Bronze. The reason is reprocessing — if Bronze holds exactly what arrived,
every downstream mistake is fixable without going back to the source. Adding an ingest timestamp
and a process id is not a transformation; it is provenance, and `eda36319` keys it.

### Data quality — expectations and their two actions

A pipeline expectation is a named constraint with an action:

```sql
CONSTRAINT valid_timestamp EXPECT (timestamp > '2020-01-01') ON VIOLATION DROP ROW
CONSTRAINT valid_timestamp EXPECT (timestamp > '2020-01-01') ON VIOLATION FAIL UPDATE
```

| Clause | Effect | Deck |
|---|---|---|
| `EXPECT (...)` with no action | Records are **kept** and the violation is counted in the event log | — |
| `ON VIOLATION DROP ROW` | Violating records are dropped from the target and recorded as invalid in the event log | `17bff8a1`, `e86e463b` |
| `ON VIOLATION FAIL UPDATE` | The **update fails** — the pipeline stops | `7e554787`, `e86e463b` |

`e86e463b` is the item that makes you choose between the two on a stated requirement, and the
tell is whether the stem wants the run to *continue* with clean data (DROP ROW) or to *stop* so a
human looks at it (FAIL UPDATE). `9cd76b59` shows the whole shape on a streaming table, and
`253200f6` and `9582ab27` key expectations as the mechanism when a stem says "automatically
monitor and enforce quality".

**Quality statistics are per table on the pipeline page** (`721d10bc`) — click the table in the
pipeline graph to see how many records each expectation dropped.

### Tuning parameters — the objective the deck never names

Section 3 asks you to *"understand the basic tuning parameters … and re-measure the
performance."* None of the four appears anywhere in the deck.

| Parameter | What it controls |
|---|---|
| `spark.sql.shuffle.partitions` | How many partitions a shuffle produces. Too high on small data makes thousands of tiny tasks; too low makes each task too big to fit in memory |
| `spark.default.parallelism` | The default partition count for RDD operations with no shuffle setting of their own |
| `spark.executor.memory` / `spark.driver.memory` | Heap per executor and per driver — the knob for an `OutOfMemoryError` that is not caused by skew |
| `spark.sql.autoBroadcastJoinThreshold` | The size below which Spark broadcasts the small side of a join automatically. Raising it turns more joins into broadcast joins; `-1` disables the behaviour |

"Re-measure" is part of the objective: the exam expects you to change one and check the Spark UI,
not to know a magic number.

---

## 6. Working with Lakeflow Jobs (16%)

**The worst-covered domain in the deck relative to its weight**, and the one where a reader who
trusts the deck will meet unfamiliar vocabulary in the exam. Sixteen per cent is about seven
questions; the deck offers thirteen, and they cluster on two of the four sub-objectives.

### What the deck does cover

- **Tasks and dependencies.** A job is a DAG of tasks; `Depends on` makes one wait for another
  (`5db322a2`, `d205b9c7`). A new upstream step is a new task the original depends on, not a
  second job.
- **Repair.** A failed run is re-run with **Repair run**, which re-executes only the failed and
  downstream tasks rather than the whole DAG — the answer when a stem says the workflow is
  expensive (`9318411d`, `b8d8ba3d`, `1b743a58`).
- **Scheduling.** Cron syntax carries a complex schedule between jobs (`e0215c73`); a scheduled
  job's cluster runs only long enough to do the work (`3781f6d5`); a Databricks SQL query can be
  scheduled to refresh from its own page (`87500e54`).
- **Parameters.** `dbutils.widgets` passes values such as file paths and processing dates into a
  notebook task (`b199b398`).
- **Pipelines as jobs.** A pipeline needs at least one notebook library (`93896ff1`) and may mix
  SQL and Python source notebooks in one pipeline (`ecd9e75b`).

### Triggers — the objective the deck skips

The deck knows one trigger: a schedule. The outline names six types and asks you to *"choose
between time-based and data-driven triggers based on data availability."*

| Trigger | Fires when |
|---|---|
| **Scheduled** | A time-based schedule (cron) is due |
| **Table update** | Source tables are updated — the data-driven answer when an upstream table, not a clock, should start the job |
| **File arrival** | New files arrive in a monitored Unity Catalog external location or volume |
| **Model update** | A Unity Catalog model is created, a version is ready, or an alias is set (Beta) |
| **Continuous** | A new run starts whenever the last run finishes or fails |
| **None** | Manual: Run now, or an external orchestrator |

**File arrival, in the detail the exam can ask for.** It monitors a Unity Catalog external
location or a volume, recursively including subdirectories, and makes *"a best effort to check
for new files every minute."* The **Wait after last change** advanced setting delays the run
until arrivals stop, and each new file resets the timer — the setting for sources that drop files
in batches. Without file events enabled there is a ceiling of **50 jobs per workspace** using the
trigger and **10,000 files** in the monitored location; with file events enabled there is no file
limit.

**The selection rule:** a stem naming a clock ("every morning at 6", "nightly") is scheduled; a
stem naming an *event* ("as soon as the vendor drops the file", "when the upstream table
refreshes") is file arrival or table update. The deck's `85fa27f8` teaches the Auto Loader answer
to "as soon as the file arrives" — which is correct for the read, but the *job* question has its
own answer now.

### Control flow — the other objective the deck skips

Section 4 names *"retries and conditional tasks such as branching and looping."*

- **Retries** are per task: a retry policy with a maximum count and an interval.
- **The If/else condition task** runs part of the DAG *"based on the results of a boolean
  expression"* — for example, run the transform only if the ingest task actually added rows.
- **The For each task** runs another task in a loop over a list of inputs.
- **Run if** governs each dependency edge, and has six settings: **All succeeded** (the default),
  **At least one succeeded**, **None failed**, **All done**, **At least one failed**, **All
  failed**. "All done" is the one for a cleanup or notification task that must run whatever
  happened upstream.
- A task whose Run if condition is not met is marked **Excluded** and skipped, and **exclusion
  cascades**: if all of a task's dependencies are excluded, it is excluded too.

`c86a38ee` — the item where an analyst wants only the last query in a daily SQL program to run on
Sundays — keys wrapping the queries in PySpark and using Python's control flow. That was the only
answer once. Today it is an **If/else condition task** on a day-of-week expression, and §12 lists
it as such.

---

## 7. Implementing CI/CD (10%)

Ten per cent, about five questions, and the deck's ten items cover the concepts but not the
promotion mechanics that Section 5 actually names.

### Git folders

A Git folder (**formerly Databricks Repos** — §12) clones a remote repository into the workspace
and tracks changes against it.

| Operation | Where |
|---|---|
| Create a branch, switch branches | In Databricks, from the Git dialog (`ef8652ae`) |
| Commit and push | In Databricks — **Commit & Push** |
| Pull remote changes made by a colleague | In Databricks — **Pull** (`f163d861`) |
| Merge a branch, rebase, reset, resolve conflicts | In Databricks, from the Git dialog's kebab menu |
| **Create a pull request, and merge that pull request** | **In your Git provider's interface** |

**This is the one place where the deck is contradicted by today's documentation.** `94a481b8`
keys **Merge** as the operation that must be performed outside Databricks Repos. The Git folders
page now documents *Merge branches*, *Resolve merge conflicts*, *Rebase a branch* and *Reset a
branch* as in-product operations, and says that what you go to the provider for is to *"create a
pull request and merge it into the default branch."* The boundary moved from the merge to the
pull request. See §12.

The advantage of a Git folder over notebook revision history is **branches** (`ef8652ae`):
revision history is linear and per notebook, a repository is branched and covers the project.

### Bundles

A bundle — **Declarative Automation Bundles**, formerly Databricks Asset Bundles — is a YAML
description of a project's jobs, pipelines and other resources, deployed by the Databricks CLI
(`bc754c65`, `4362d421`). Exactly one **`databricks.yml` at the repository root** is the main
configuration file, and it may reference others (`3b2b15a2`). Bundles are the answer for
version-controlled, repeatable deployment to production (`d5ed9d2a`, `c6af1c01`).

#### Targets and deployment modes — the objective the deck skips

The point of a bundle is one codebase promoted across environments, and the mechanism is
**targets**. `databricks bundle deploy -t <target>` selects one.

| `mode: development` | `mode: production` |
|---|---|
| Prefixes resources with `[dev ${workspace.current_user.short_name}]` and tags them `dev` | Requires pipelines to be marked non-development |
| **Pauses all schedules and triggers** on deployed resources | Can validate that the current Git branch matches the target's branch |
| Marks pipelines as development | Recommends a **service principal** as `run_as` and validates permissions |
| Allows concurrent runs; disables the deployment lock; allows `--cluster-id` override | **Does not allow overriding existing cluster definitions**; validates that artifact and state paths are not user-specific |

**Variables and substitutions** are how one definition differs per target — a warehouse id, a
catalog name, a schedule — without a second copy of the YAML.

The CLI verbs to recognise: `databricks bundle validate` (check the configuration),
`databricks bundle deploy` (push it), `databricks bundle run` (run a resource in it).

### Databricks Connect

Databricks Connect runs your code locally against a remote Databricks cluster or serverless
compute, so an engineer develops and tests in their own IDE while the work executes on the
platform (`4156034b`). Its prerequisites are worth holding: **Unity Catalog enabled** on the
workspace and a **Databricks Connect version that supports serverless** (`cf9b73c2`).

---

## 8. Troubleshooting, Monitoring and Optimization (10%)

The one domain where the deck's share matches the exam's. It is still missing predictive
optimization, and its Spark-UI items are softer than the exam's own sample question.

### Diagnosing a slow job in the Spark UI

The documented path is: **Jobs timeline → longest stage → look for skew or spill → is it I/O
bound → other causes.** Two rules from the stage page are worth memorising because they are
numeric:

- **Skew**: *"If the Max duration is 50% more than the 75th percentile, you may be suffering from
  skew."* On a healthy stage the 75th percentile and the Max are the same.
- **Spill**: spill statistics appear at the top of the stage details page. **If there are no
  spill stats, there is no spill.**

The exam guide's own sample question 1 is exactly this shape — most tasks under 30 seconds, one
over 10 minutes, median shuffle read 400 MB against a max over 5 GB — and its answer is
**confirm adaptive query execution with skew join handling is active** so the oversized partition
is split at runtime. Salting before the join is the manual version of the same fix.

| Symptom | Cause | Fix | Deck |
|---|---|---|---|
| One task runs far longer than the rest; Max shuffle read dwarfs the median | **Data skew** | AQE skew join handling; salt the key; repartition | `334c542a` |
| Cluster is not fully utilised, tasks unevenly spread | Poor partitioning | **Repartition** the dataset across nodes | `42c02958` |
| `java.lang.OutOfMemoryError: Java heap space` | Too much data per executor | Narrow the filters to collect less; upsize workers and adjust shuffle partitions | `b0ef3381` |
| High CPU time against task time | CPU-bound | Re-examine executor and worker sizing | `d4bf69a2` |
| A repeated scan of an unchanging table | Re-reading from storage | `CACHE TABLE` | `80bcd63f` |
| Queries filter on a column that is not the partition column | Poor data layout | `OPTIMIZE ... ZORDER BY`, or liquid clustering | `b92b838e`, `cebba9ec` |
| Streaming ingest creating many small files | Small-file problem | `autoCompact` (with `optimizeWrite`) | `b88bac23` |

### Delta maintenance

| Command | Does | Deck |
|---|---|---|
| `OPTIMIZE` | Compacts small files into larger ones | `b92b838e` |
| `ZORDER BY` | Colocates related data in the same files for filtered columns | `b92b838e` |
| **Liquid clustering** | Replaces both partitioning and Z-ordering; clustering keys can be changed without rewriting the table | `cebba9ec` |
| `VACUUM` | Deletes data files no longer referenced by the log, past the retention window | `4f099cf4`, `be6c2bbb` |

**`VACUUM` is what breaks time travel**, and `be6c2bbb` is the deck's best cautionary item: an
engineer cannot restore to a three-day-old version because `VACUUM` removed the files that
version pointed at. The default deleted-file retention is **7 days**
(`delta.deletedFileRetentionDuration`), and `VACUUM FULL` enforces a 7-day minimum regardless of
configuration.

**Liquid clustering over partitioning** is the modern answer (`cebba9ec`): a table partitioned by
`purchase_date` and also filtered heavily on `customer_id` is a clustering problem, not a
second-partition problem, because partitioning on a high-cardinality column creates the
small-file problem you were trying to solve.

#### Predictive optimization — the objective the deck skips

Predictive optimization runs `OPTIMIZE`, `VACUUM` and `ANALYZE` automatically on **Unity Catalog
managed tables**, on serverless compute, without a maintenance job. It is **enabled by default
for accounts created on or after 11 November 2024**, and it does **not** run on external tables.

That is the sentence that makes the managed-versus-external choice (§9) an operational decision
and not just a governance one — and it means a modern stem asking "how do you keep this table
optimised" keys predictive optimization, not a scheduled `OPTIMIZE` job.

### Monitoring

- **Job run history and the Runs tab** show which task in a run is slow and let you open its
  notebook output (`9803cecf`); the run-history view is where you compare a run against its
  historical baseline.
- **Databricks SQL alerts** watch a query's result and fire on a condition; the destination can
  be a **webhook** (`42c11595`, `c59ebbbc`) — the answer whenever a stem wants a notification
  somewhere other than email.
- **Pipeline data-quality statistics** are per table on the pipeline page (`721d10bc`).
- **Debuggers**: the Python notebook interactive debugger steps through a cell line by line
  (`b8479190`); the variable explorer shows values at a glance (`5c71f0db`).

---

## 9. Governance and Security (15%)

Fifteen per cent, about seven questions. The deck's 21 items cover grants, ownership and sharing
well, and miss both of the *newer* Section 7 objectives entirely.

### Managed against external tables

| | Managed | External |
|---|---|---|
| Who owns the files | Unity Catalog, in the metastore's managed storage | You, at a `LOCATION` you name |
| `DROP TABLE` | Removes metadata **and the data files** (`01a4251c`) | Removes **metadata only** (`a3d17a56`) |
| Created by | `CREATE TABLE t (...)` with no `LOCATION` (`6a772acc`) | `CREATE TABLE t ... LOCATION 'abfss://...'` (`393dfae5`) |
| Predictive optimization, automatic layout management | **Yes** | No |

`a3d17a56` is the item that makes the distinction operational: dropping the managed staging tables
removes their data, and dropping the external tables that point at shared cloud storage removes
only the registrations — which is exactly what you want when another team still reads those files.

### Privileges

Unity Catalog is a three-level namespace, `catalog.schema.table`, and privileges are inherited
downward.

| Grant | Gives | Deck |
|---|---|---|
| `GRANT USAGE ON DATABASE customers TO team` | The ability to *see* the schema and what is in it — the prerequisite for anything else | `39a9ae72` |
| `GRANT ALL PRIVILEGES ON TABLE sales TO team` | Full control of that table | `d96fcc04` |
| `GRANT ALL PRIVILEGES ON DATABASE customers TO team` | Full control of everything in the schema | `5da4fd9e` |
| `GRANT CREATE TABLE ON SCHEMA q TO g` **plus** `GRANT USE SCHEMA ON SCHEMA q TO g` | Create tables — and both halves are needed | `d7737ad3` |
| `GRANT SELECT ON VIEW v TO u` | Read the view **without** any privilege on its underlying tables | `da42fde3` |

**`da42fde3` is the one to understand rather than memorise.** A view's reader needs `SELECT` on
the view only; the view executes with its owner's privileges on the tables underneath. That is
the whole mechanism behind using views as a security boundary.

**The gap: `DENY`, and service principals.** Section 7 names *"GRANT, REVOKE, and DENY privileges
to principals (users, groups, and service principals)"*. The deck has GRANT and one REVOKE
(`32080a59`), always to a group. `DENY` explicitly refuses a privilege that would otherwise be
inherited from a higher level — the tool for carving one schema out of a catalog-wide grant. A
**service principal** is a non-human identity for automation, and it is the recommended `run_as`
for a production bundle deployment (§7).

### Who can do what

| Role | Can |
|---|---|
| **Metastore admin** | Transfer ownership of any securable and manage privileges across all metastore objects — the answer when a departing owner's catalogs, storage credentials and external locations must be reassigned (`0964845e`) |
| **Object owner** (catalog, schema, table) | Grant and revoke on that object and everything under it (`32080a59`) |

Finding an owner is a UI task: **the Owner field on the table's page in Catalog Explorer**
(`b3e97d70`), which is also where you check your own permissions (`0327f145`, `c41ece0b` — the
same question under the old name, *Data Explorer*, and the new one).

### Column masks, row filters and ABAC — the two objectives the deck skips

**Row filters and column masks** are per-table controls implemented as **SQL UDFs**:

- A **row filter** is bound to a table with `ALTER TABLE ... SET ROW FILTER`, and its UDF returns
  `FALSE` for rows the caller must not see.
- A **column mask** is bound to one column with `ALTER TABLE ... ALTER COLUMN ... SET MASK`, and
  its UDF returns either the original value or a masked one; the return type must match the
  column's.
- The table **owner or a principal with `MANAGE`** applies them.
- They need **DBR 12.2 LTS or above**, and they **cannot be applied to views**. `MERGE` is not
  supported against a table whose policy contains nesting, aggregations, windows, limits or
  non-deterministic functions, and cloning is not supported.

**ABAC** is the same two capabilities driven by attributes instead of per-table bindings. A
**governance policy** is attached at a level of the hierarchy — catalog, schema or table, and
metastore in Beta — and targets **governed tags**: any object carrying a matching tag is covered,
automatically, without touching the table. It delivers row filtering, column masking and dynamic
`GRANT` policies, with `DENY` policies in Beta.

The choice between them: a **row filter or column mask** when one table needs one rule; an
**ABAC policy** when "every table tagged `pii` must mask its email column" is the requirement.

### Sharing

**Delta Sharing** is the answer to every cross-organisation stem in this deck, and the variant
turns on who the recipient is.

| Recipient | Mechanism | Deck |
|---|---|---|
| Another Databricks workspace with Unity Catalog, on any cloud | **Databricks-to-Databricks sharing** — exchange the **sharing identifier** of the recipient's metastore; no data is copied and no replication is configured | `9df48f77`, `855493c1`, `0caebf63` |
| A partner **not** on Databricks | **Open sharing protocol** | `0774a092` |

`9df48f77` is the one that catches people: AWS workspace to Azure workspace still needs no
special configuration, because Delta Sharing is cloud-agnostic.

**Lineage** shows every dependency of a table, including where it is used downstream
(`3b73f7fd`) — the answer to "what uses this?" rather than "who can read this?".

**Lakehouse Federation** queries MySQL, Redshift, BigQuery, Synapse and on-premises PostgreSQL in
place, without ingesting (`145c9e5f`, `883f4c22`) — the answer whenever a stem says "avoid data
duplication" and "up-to-date".

---

## 10. Numbers to memorise

| | |
|---|---|
| Exam | **45 scored** questions, **90 minutes**, US$200, valid **2 years**, version **4 May 2026** |
| Domain weights | Platform 6 · **Ingestion 21** · **Transformation 22** · **Jobs 16** · CI/CD 10 · Ops 10 · **Governance 15** |
| Skew rule of thumb | Max stage-task duration **> 50%** above the 75th percentile |
| `VACUUM` default retention | **7 days** (`delta.deletedFileRetentionDuration`); `VACUUM FULL` enforces 7 days minimum |
| Predictive optimization | On by default for accounts created on or after **11 Nov 2024**; **managed tables only** |
| File arrival trigger | Checked about every **minute**; without file events, **50 jobs** per workspace and **10,000 files** per location |
| Run if settings | **6** — All succeeded (default), At least one succeeded, None failed, All done, At least one failed, All failed |
| Job trigger types | Scheduled, table update, file arrival, model update (Beta), continuous, none |
| Notebook output on a job cluster | **30 MB** |
| Notebook size | 100 MB (10 MB for DBC/HTML/source); **6 MB** per cell input |
| Notebook table results | **10,000 rows or 2 MB**, whichever is lower |
| Row filters and column masks | **DBR 12.2 LTS** or above; not on views |
| Bundle configuration | Exactly **one `databricks.yml`** at the repository root |
| Unity Catalog namespace | Three levels: `catalog.schema.table` |

---

## 11. Distractor tells

Patterns in how this exam writes wrong answers, from the deck's 147 and its fact-check.

1. **The invented option value.** A configuration key or enum that sounds plausible and does not
   exist — the fact-check found two of these (a breakpoint said to raise type errors, a bare
   `TBLPROPERTIES PII` that is a syntax error). Any option naming a setting you cannot place is a
   candidate.
2. **A default quoted as a ceiling.** The deck's fact-check found one outright. `VACUUM`'s 7 days
   is a default you can change; the 50-job file-arrival limit is a real ceiling. Know which is
   which.
3. **Transforming in Bronze.** Any option that cleans, filters, deduplicates or conforms on the
   way into Bronze is wrong (`9356edb4`, `f936e928`).
4. **A roll-your-own where a platform feature exists.** A scheduled `OPTIMIZE` job against
   predictive optimization; a custom file-tracking table against `COPY INTO`'s idempotency; a
   polling notebook against a file-arrival trigger.
5. **The wrong half of the streaming/batch pair.** `spark.read` in a stem that says "incremental"
   (`e994ba67`); `CREATE LIVE TABLE` where the source is append-only (`8b96c6a7`);
   `processingTime` where the stem wants one pass and a stop (`db601c4b`).
6. **A grant that is missing its other half.** `CREATE TABLE ON SCHEMA` with no `USE SCHEMA`
   (`d7737ad3`); a privilege on the table when the reader needs it on the view (`da42fde3`).
7. **Copying data when the question says not to.** Replication, ETL into Databricks, or a nightly
   export, where Delta Sharing (`9df48f77`) or Lakehouse Federation (`145c9e5f`) is offered.
8. **The bigger cluster.** "Increase cluster size" is the distractor of choice for a skew
   problem — it is the wrong answer in the exam guide's own sample question 1, because a single
   oversized partition still runs on one task however many executors you add.
9. **The retired tool by its old name.** See §12; on a May 2026 paper, a *Databricks Repos* or
   *Delta Live Tables* option is not automatically wrong, but the *current* name is the safer
   read of the intent.
10. **`count(col)` treated as `count(*)`.** `d4cff52c` exists to punish this.

### Read the question's own verb

- **"as soon as the file arrives"** → Auto Loader for the read; a **file-arrival trigger** for the
  job.
- **"incrementally", "only new data"** → streaming table, Auto Loader, `COPY INTO`, or
  `availableNow`.
- **"without duplicating"**, **"up-to-date"** → Lakehouse Federation or Delta Sharing.
- **"the job must stop"** → `ON VIOLATION FAIL UPDATE`; **"keep the clean rows"** → `DROP ROW`.
- **"costly workflow", "already succeeded"** → Repair run, not re-run.
- **"exactly once"** → checkpointing and write-ahead logs.
- **"can be safely removed entirely"** → managed table; **"still used by another team"** →
  external table.
- **"whatever happened upstream"** → Run if: All done.
- **"different partner, not on Databricks"** → Delta Sharing **open** protocol.
- **"without managing infrastructure"** → serverless.

---

## 12. Where the deck is older than the exam

**This is the largest staleness section of any guide in this repo, and almost all of it is
vocabulary rather than mechanism.** Between the scrape and the 4 May 2026 exam version,
Databricks renamed four of the products this deck is mostly about. The mechanisms did not change;
the names on the screen and in the option text did.

| The deck says | The exam and the docs now say | In the deck |
|---|---|---|
| Delta Live Tables / DLT | **Lakeflow Spark Declarative Pipelines** (docs: *Spark Declarative Pipelines*) | 11 questions |
| Databricks Repos | **Databricks Git folders** | 9 questions |
| Databricks Workflows / Jobs | **Lakeflow Jobs** | 13 questions |
| Databricks Asset Bundles (DAB) | **Declarative Automation Bundles** | 5 questions |
| Data Explorer | **Catalog Explorer** | `c41ece0b` (old name), `0327f145` (new name) |

Two of the deck's explanations already use the new vocabulary — `253200f6` and `9cd76b59` say
*"Lakeflow Declarative Pipelines (formerly Delta Live Tables)"*, written during the 2026-08-15
fact-check. The option text does not, and it stays as scraped, which is this repo's standing
decision on product renames.

**Answer these the current way.** The exam guide's own sub-objectives are written in the new
names throughout, so an option reading *Lakeflow Jobs* in a question whose deck twin reads
*Workflows* is the same answer, not a distractor.

### One item the documentation now contradicts

**`94a481b8` — "Which Git operation must be performed outside of Databricks Repos?" keys
*Merge*.** The Git folders page documents *Merge branches*, *Resolve merge conflicts*, *Rebase a
branch* and *Reset a branch* as operations you perform from the Git dialog inside Databricks, and
says the thing you leave for the provider is to *"create a pull request and merge it into the
default branch."* The boundary moved from the merge to the **pull request**, and Section 5's
objective is written the same way: *"creating pull requests using Databricks Git integration."*

The key has **not** been moved in the deck — a key change needs a fact-check pass with its own
citation and correction notice, not a study guide. Treat this item as the exam's older answer and
know the current one.

### Exam-right, production-wrong

Three items where the deck's answer is what an exam aligned to an older platform tests, and not
what you would build today.

| Item | Keyed as | What you would do now |
|---|---|---|
| `c86a38ee` — run only the last query in a daily SQL program on Sundays | Wrap the queries in PySpark and use Python control flow | An **If/else condition task** on a day-of-week expression, with the final query as its own task |
| `b92b838e`, `cebba9ec` — keeping a large table's layout fast | `OPTIMIZE ZORDER BY`, or altering the table to liquid clustering | **Liquid clustering** plus **predictive optimization**, which runs `OPTIMIZE`, `VACUUM` and `ANALYZE` for you on a managed table |
| `4f099cf4` — reclaiming storage from unreferenced files | Run `VACUUM` | Predictive optimization runs it on managed tables; a hand-run `VACUUM` is for external tables and for a forced retention change |

And one from the exam's own side: the **exam guide's sample question 4** keys *a high-concurrency
cluster with autoscaling* for multiple analysts running ad-hoc SQL. High-concurrency is a legacy
cluster mode; the current answer to that requirement is a **serverless SQL warehouse**, which is
what four deck items key (`7fc931cb`, `25c59e18`, `047d9dcc`, `630dc828`). The sample questions
are labelled as *"retired from a previous version of the exam"*, which is the vendor telling you
the same thing this section does.

---

## 13. Two-week revision plan

| Day | Focus |
|---:|---|
| 1 | §4 the four ways to land data; **`COPY INTO` and Lakeflow Connect from scratch** — they are pure gap |
| 2 | §4 Auto Loader in detail; schema inference and the evolution modes; drill the ingestion items |
| 3 | §4 Structured Streaming — checkpoints, watermarks, the two triggers, output modes |
| **4** | **§6 Lakeflow Jobs: the six trigger types and the Run if settings from memory** — the worst-covered domain |
| **5** | **§6 control flow — If/else, For each, retries, exclusion cascading**; re-answer `c86a38ee` the modern way |
| 6 | §5 medallion layers and expectations; write both `ON VIOLATION` clauses from memory |
| 7 | §5 DataFrame operations, the join table, the aggregate gap, and `count_if` semantics until `d4cff52c` is automatic |
| 8 | §5 DDL/DML and the four Gold objects — **materialized view against view against streaming table** |
| **9** | **§9 governance: the grant table, managed against external, and the masks/filters/ABAC gap** |
| 10 | §9 Delta Sharing and federation; §3 the compute table |
| 11 | §8 Spark UI — the skew rule, the spill check, and the maintenance commands; **predictive optimization** |
| 12 | §7 CI/CD — Git folders' boundary, bundle targets and deployment modes |
| 13 | §10 numbers (cover and reproduce); §12 the rename table until the new names are the reflex |
| 14 | Full deck run at 2 minutes a question — 147 items is two sittings. Re-read §6 and §12. Rest |

---

## 14. Sources

Every URL below was rendered and title-checked while writing this guide on 2026-09-25.
`docs.databricks.com` returns an honest HTTP 404 for an invented path, so these were checked by
status and title rather than in a browser — the exception to this repo's usual rule, and the
reason is in the skill.

### The exam

- [Databricks Certified Data Engineer Associate](https://www.databricks.com/learn/certification/data-engineer-associate) — the domain weights, question count and time limit.
- [Data Engineer Associate Exam Guide (PDF, May 2026)](https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf) — the sub-objectives and five retired sample questions.

### Platform

- [High-level architecture](https://docs.databricks.com/aws/en/getting-started/overview), [Connect to serverless compute](https://docs.databricks.com/aws/en/compute/serverless/), [Connect to pools](https://docs.databricks.com/aws/en/compute/pool-index)
- [Notebook limitations](https://docs.databricks.com/aws/en/notebooks/notebook-limitations) — the 30 MB, 6 MB and 10,000-row numbers.

### Ingestion

- [What is Auto Loader?](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/) and [Configure schema inference and evolution in Auto Loader](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/schema)
- [Get started using COPY INTO to load data](https://docs.databricks.com/aws/en/ingestion/copy-into/) and [COPY INTO](https://docs.databricks.com/aws/en/sql/language-manual/delta-copy-into)
- [Lakeflow Connect connector concepts](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/) and [Choose a standard connector](https://docs.databricks.com/aws/en/ingestion/)
- [Configure Structured Streaming trigger intervals](https://docs.databricks.com/aws/en/structured-streaming/triggers), [Apply watermarks](https://docs.databricks.com/aws/en/structured-streaming/watermarks), [Checkpoints](https://docs.databricks.com/aws/en/structured-streaming/checkpoints)

### Transformation and modeling

- [What is the medallion lakehouse architecture?](https://docs.databricks.com/aws/en/lakehouse/medallion)
- [Manage data quality with pipeline expectations](https://docs.databricks.com/aws/en/ldp/expectations), [Spark Declarative Pipelines](https://docs.databricks.com/aws/en/ldp/), [Streaming tables](https://docs.databricks.com/aws/en/ldp/concepts/streaming-tables)
- [Use standalone materialized views](https://docs.databricks.com/aws/en/views/materialized) and [Use standalone streaming tables](https://docs.databricks.com/aws/en/tables/streaming)
- [JOIN](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-join), [Set operators](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-setops), [count_if](https://docs.databricks.com/aws/en/sql/language-manual/functions/count_if), [approx_count_distinct](https://docs.databricks.com/aws/en/sql/language-manual/functions/approx_count_distinct), [explode](https://docs.databricks.com/aws/en/sql/language-manual/functions/explode)

### Jobs

- [Automate jobs with schedules and triggers](https://docs.databricks.com/aws/en/jobs/triggers) — the six trigger types.
- [Trigger jobs when new files arrive](https://docs.databricks.com/aws/en/jobs/file-arrival-triggers) — the per-minute check and the 50-job / 10,000-file limits.
- [Configure task dependencies](https://docs.databricks.com/aws/en/jobs/conditional-tasks) — Run if and the If/else condition task.
- [Use a For each task to run another task in a loop](https://docs.databricks.com/aws/en/jobs/for-each)
- [Troubleshoot and repair job failures](https://docs.databricks.com/aws/en/jobs/repair-job-failures) and [Monitor Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/monitor)

### CI/CD

- [Databricks Git folders](https://docs.databricks.com/aws/en/repos/) and [Create and manage Git folders](https://docs.databricks.com/aws/en/repos/git-operations-with-repos) — the merge-versus-pull-request boundary.
- [What are Declarative Automation Bundles?](https://docs.databricks.com/aws/en/dev-tools/bundles/), [deployment modes](https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes), [substitutions and variables](https://docs.databricks.com/aws/en/dev-tools/bundles/variables)
- [Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/) and [Databricks Connect](https://docs.databricks.com/aws/en/dev-tools/databricks-connect/)

### Troubleshooting and optimization

- [Diagnose cost and performance issues using the Spark UI](https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/) and [Skew and spill](https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/long-spark-stage-page) — the 50%-above-75th-percentile rule.
- [Adaptive query execution](https://docs.databricks.com/aws/en/optimizations/aqe)
- [Predictive optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization), [Use liquid clustering](https://docs.databricks.com/aws/en/delta/clustering), [Remove unused data files with vacuum](https://docs.databricks.com/aws/en/delta/vacuum), [Work with table history](https://docs.databricks.com/aws/en/delta/history)
- [Databricks SQL alerts](https://docs.databricks.com/aws/en/sql/user/alerts/)

### Governance and security

- [Unity Catalog privileges reference](https://docs.databricks.com/aws/en/data-governance/unity-catalog/access-control/privileges-reference), [GRANT](https://docs.databricks.com/aws/en/sql/language-manual/security-grant), [REVOKE](https://docs.databricks.com/aws/en/sql/language-manual/security-revoke), [DENY](https://docs.databricks.com/aws/en/sql/language-manual/security-deny)
- [Admin privileges in Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/admin-privileges)
- [Row filters and column masks](https://docs.databricks.com/aws/en/tables/row-and-column-filters) and [Attribute-based access control in Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/)
- [Unity Catalog managed tables](https://docs.databricks.com/aws/en/tables/managed), [Work with external tables](https://docs.databricks.com/aws/en/tables/external), [Unity Catalog volumes](https://docs.databricks.com/aws/en/volumes/)
- [What is OpenSharing?](https://docs.databricks.com/aws/en/delta-sharing/) and [Connect to external databases and catalogs](https://docs.databricks.com/aws/en/query-federation/)

---

## 15. Using this with NotebookLM

Upload the Markdown version of this guide (`study-guides/databricks-data-engineer-associate.md`)
as a source. Markdown ingests cleanly and the headings become NotebookLM's navigation.

Worth adding as additional sources: the [exam guide PDF](https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf),
[Automate jobs with schedules and triggers](https://docs.databricks.com/aws/en/jobs/triggers)
and [Row filters and column masks](https://docs.databricks.com/aws/en/tables/row-and-column-filters)
— the exam's own statement of scope, and the two pages behind the deck's biggest gaps.

### Prompts that produce useful study media

- "Generate an Audio Overview of section 6. Have the hosts describe a scheduling requirement — a nightly load, a vendor file that arrives at no fixed time, an upstream table that refreshes irregularly — and argue over which trigger type fits each one."
- "Using section 4, drill me on ingestion tool selection: give me a source and a requirement and ask whether it is Auto Loader, COPY INTO, Lakeflow Connect managed, Lakeflow Connect standard, or federation. Don't give me the answer until I try."
- "Turn section 10 into flashcards — one number per card."
- "Using section 12, quiz me on each renamed product: give me the old name and make me produce the current one, then the reverse."
- "Using section 9, give me a data-protection requirement and ask whether it needs a GRANT, a DENY, a row filter, a column mask, or an ABAC policy, and why the others do not fit."

For the Audio Overview, sections 4, 6 and 11 reward listening — they are selection decisions
argued out loud. Sections 10 and 14 are lookups and will not survive being read aloud.
