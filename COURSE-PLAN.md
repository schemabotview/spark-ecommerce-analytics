# Learn Apache Spark by building an e-commerce analytics platform: full course — plan

**Status (2026-10-26):** plan approved; infra built; **Course 2 `start` (the pilot) authored, replayed and
rendered, awaiting owner review**; no audio yet.

## The idea

One company, **Shopwave**, an online store, and its data platform. The platform grows from one
nightly job on yesterday's orders to a streaming lakehouse with recommendations, running on a real
cluster. Every Spark feature is taught **when the data first forces it**: a file too big for pandas,
a join that shuffles everything, a bestseller that stalls one task, an overwrite that a reader
catches half-done, events that arrive late. Internals (driver and executors, Catalyst, the
shuffle, executor memory) appear as detours at the moment they answer a question on screen. They
are never front-loaded.

Why e-commerce analytics:

- **It is what Spark was built for.** It has large semi-structured data (clickstream JSON), many
  sources to join, natural skew, windows at scale (sessions, funnels, cohorts), upserts and history
  (order status, price changes), streaming, and distributed ML (recommendations) in one domain.
- **Everyone has shopped online,** so there is no domain to explain.
- **It grows the way data platforms grow:** a nightly report → a lakehouse (bronze / silver /
  gold) → incremental and CDC loads → streaming → ML → production on a cluster.
- **Every concept arrives because something breaks.** Nothing is taught for its own sake.

Prerequisite: the Python course (`python-expense-tracker`). Its last section, "Where next", leads
into this one.

## Packaging for YouTube

**One video: "Learn Apache Spark by building an e-commerce analytics platform: full course,
beginner to professional"** covers all 11 courses, 82 sections, ~3 h 10 min, as one continuous
story: the platform grows from its first job to a production pipeline, with no break in the middle.

A course is one YouTube chapter group and the owner's review unit. A section (90–150 s) is one
chapter, titled *concept: what the platform gets* (e.g. "Broadcast joins: currency conversion in
one stage"). The video opens with the finished platform running (the payoff first). It is published
only when all 11 courses are recorded. Each section can also go out as a Short (portrait,
`record-reels`).

## Versions, pinned

Every output is run, so everything is pinned in one place and named in the plan once:

| What | Pin | Note |
| --- | --- | --- |
| Apache Spark / PySpark | **4.2.0** | `pip install pyspark==4.2.0` brings all of Spark (277 jars, 485 MB) |
| Delta Lake (`delta-spark`) | **4.4.1** | its PyPI metadata accepts `pyspark<=4.2.0`; the jar is checked in Course 7 |
| Java | **21** | on the host, like Python: Spark is a JVM program and pip cannot bring it |
| Python | **3.14.9** | PySpark 4.2.0 supports 3.10–3.14, so not the Python course's 3.15 |
| Kafka | KRaft, single broker | Course 9, Docker |
| PostgreSQL | one major version | Course 3, Docker: the shop's OLTP database |

`scripts/install-toolchain.sh` installs Python and checks Java. Never changed after Course 2 is
recorded. Docker arrives with the first service that needs it (PostgreSQL, Course 3); Course 2 is
Spark on its own.

## The data: a seeded generator, owned

No public dataset (several popular ones are licensed non-commercial). `shopwave-gen` is our own
seeded generator with a **scale factor** (`--sf`). The same seed and SF always give byte-identical
data, so every replay is deterministic.

One year of Shopwave, 2026-01-01 → 2026-12-31:

| Source | Lands as | Arrives in | Planted problems (each one is a lesson) |
| --- | --- | --- | --- |
| `orders`, `order_items`, `customers`, `products` | PostgreSQL tables (OLTP) | 2 (CSV export), 3 (JDBC) | order status lifecycle placed → paid → shipped → delivered → returned; product price changes (SCD2) |
| order change events | Debezium-style JSON on Kafka / files | 7 (CDC), 9 | the same order updated several times a day |
| `clickstream` | JSON lines, one file per hour | 3 | nested `context` and `items[]`; **schema change on 2026-06-01** (field added, one renamed); duplicates (at-least-once tracker); events up to 3 days late; **one bot** with millions of events |
| `payments` | Parquet from the payment provider, daily | 3 | multi-currency (EUR, GBP, USD, INR); a few orders never paid; a few paid twice |
| `returns` | CSV from the warehouse, Latin-1 | 3 | encoding; malformed rows |
| `fx_rates` | small CSV, daily | 5 | the textbook broadcast table |
| `campaigns` | JSON from marketing | 6 | time-ranged; attribution needs a range join |

Load shape: **Black Friday** (2026-11-27) is ~20× a normal day, and **one bestseller** is ~15% of
all order items. This is where the skew lessons come from.

Three sizes:

| SF | Orders / year | Click events / year | Used for |
| --- | --- | --- | --- |
| 0.01 | 20 k | 378 k (150 MB of JSON) | every spine step: the slices a step needs are committed, checked byte for byte against the generator |
| 0.1 | 200 k | ~3.8 M | sections that show plans, stages and task counts |
| 1+ | 2 M | ~38 M | measured sections only (`scale`, skew, pandas vs Spark); generated, never committed. The generator is pure Python (a year at SF 0.01 takes 9 s): SF 1 must be measured, and may need a faster writer |

## The platform: `shopwave`

```
spark-ecommerce-analytics/
  docker-compose.yml        postgres, kafka, a standalone cluster                    (3 → 11)
  shopwave_gen/             the seeded generator (in the course repo, not the project) (infra)
  conf/log4j2.properties    Spark's log to logs/spark.log                            (2)
  shopwave/
    session.py              one SparkSession builder (2, at the project root; moves in with 3)
    schemas.py              explicit StructTypes, DecimalType money                 (3)
    ingest/                 bronze: csv, json, jdbc, parquet readers                (3)
    clean/                  silver: dedupe, types, timezones, fx, quality gates     (4)
    model/                  gold: fact_orders, dim_customer, dim_product            (5)
    analytics/              KPIs, sessions, funnel, cohorts, RFM, attribution       (6)
    lake/                   Delta: incremental, MERGE, SCD2, maintenance            (7)
    stream/                 Kafka → Delta: live revenue, dedupe, cart abandonment   (9)
    ml/                     ALS recommendations                                     (10)
    jobs/                   entry points for spark-submit                           (11)
  tests/                    pyspark.testing, a local session fixture                (11)
  lake/                     bronze/ silver/ gold/ on disk                           (3 →)
  pyproject.toml            project, pinned pyspark + delta-spark, dev tools        (2 → 11)
```

| After course | The platform can… |
| --- | --- |
| 2 Start | compute October's revenue per day from the shop's daily exports |
| 3 Ingest | land every source raw (bronze), schema-checked, bad rows quarantined |
| 4 Clean | produce clean, deduplicated, typed, UTC-correct tables (silver), with quality gates |
| 5 Model | build a star schema (gold) and survive Black Friday's skew |
| 6 Analytics | answer the business: GMV, funnel, cohorts, segments, attribution |
| 7 Lakehouse | load incrementally, apply CDC with MERGE, keep price history, time travel |
| 8 Scale | process the full year at SF 1 within a measured budget |
| 9 Stream | serve live revenue and cart-abandonment alerts from Kafka, exactly once |
| 10 ML | recommend products to every customer |
| 11 Production | run tested, scheduled and idempotent on a real multi-node cluster |

## The courses

Side pane = the diagram (every IDE section carries one). Detours are marked ◆, in two kinds:

- **◆ side pane:** a small picture of the code on screen (a plan, a stage's tasks, a folder of
  part files). It stays in the IDE frame, so the proof (the terminal output) stays visible beside it.
- **◆ full scene:** a canonical big picture that needs the whole 16:9 frame (driver and executors,
  Catalyst, the shuffle). It is its own section with a concept frame, never squeezed into the side
  pane, and carries the real output inside the scene as a `code` node imported from a lab, so it
  stays proof. The next section returns to the IDE.

Rule: if a detour's diagram cannot fit the side pane at ≥ 24px body text in the 4K frame, it is a
full scene. When in doubt, full scene.

**The Spark UI is never screenshotted.** Stage, task and memory views are drawn as scenes from the
real event log / listener metrics of the step's run (tables, plots), so they are declarative and
replayable like everything else.

**1. `intro` · Spark, Shopwave, and why one machine is not enough · 3**

| # | Section | Frame | Side pane |
| --- | --- | --- | --- |
| 1 | What Spark is, and where it's used | concept | Spark → batch, SQL, streaming, ML; who runs it |
| 2 | Shopwave, and what we'll build | concept | **the platform map**: sources → bronze → silver → gold → analytics / stream / ML |
| 3 | ◆ full scene: why not pandas | concept + lab | pandas on one day (fine) vs one year (`MemoryError` / time, measured); the same report in Spark |

**2. `start` · The first job · 6**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Java, a venv and PySpark | `pip install pyspark==4.2.0`; October's 31 daily order exports | what pip installed: the Python API, py4j, 277 jars of Spark; Java runs them |
| 2 | `SparkSession` and a first DataFrame | `first_job.py`: `show(3)`; Spark's log to `logs/spark.log` | builder → read → DataFrame; `dtypes`: every column a string |
| 3 | ◆ full scene: driver, executors, tasks | concept + lab (`where_it_runs.py`: slots, partitions, jobs → stages → tasks) | program → driver → executor (4 slots) → 31 files as 4 partitions; count = 4 tasks, then 1 |
| 4 | Transformations and actions | `session.py`; `lazy.py` counts jobs after each line | the plan growing with 0 new jobs; `count()` runs 2 |
| 5 | Daily revenue | `groupBy(day)`, `cast("decimal(10,2)")`, write CSV → a folder | read → filter → groupBy (shuffle) → write; `_SUCCESS` + one part file |
| 6 | Two kinds of error | `two_errors.py`: a misspelt column vs `cast("int")` on `20.67` | found building the plan vs in a task; error conditions; the rest in `logs/spark.log` |

**3. `ingest` · Land every source (bronze) · 8**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Schemas | the `shopwave/` package; `schemas.ORDERS`; `inferSchema` costs 2 jobs and makes money a `double` (21 of 31 daily sums off by a hair) | guessed vs declared, column by column; one day's sum both ways |
| 2 | Corrupt records | `bronze.returns`: Latin-1, PERMISSIVE, `_corrupt_record`; 58 good, 3 bad | the same bytes as UTF-8 and Latin-1; good / bad split; why each bad line is bad |
| 3 | Clickstream JSON | `schemas.CLICKS`: a struct and an array of structs | one event's shape; guessed vs declared types; the day's events by type |
| 4 | `explode` and flattening | 897 events → 718 item rows; `explode_outer` keeps the 259 empty ones | one purchase fanned into its items; which to use |
| 5 | Schema drift | June 1 renames `device` → `device_type`, adds `consent`; `bronze.clicks` coalesces | what each day's file holds; the merge |
| 6 | JDBC from PostgreSQL | `compose.yaml` (postgres:17), `jars.txt`, `bronze.table`: 4 range queries | 4 tasks → 4 queries; Spark's own WHERE clauses with row counts |
| 7 | ◆ full scene: row vs columnar files | concept + lab (`explore.columnar`: bytes read from stage metrics) | CSV rows vs Parquet column chunks; 901,650 vs 73,036 bytes; pushed filters; min/max skipping (6,976 bytes) |
| 8 | Writing bronze | `python -m shopwave.bronze`: Parquet by `_file_date`, `_source_file`, quarantine | sources → bronze tables with counts; one folder per day |

**4. `clean` · Clean and conform (silver) · 8**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Column expressions | `silver.clicks`: one `select`, the context struct flattened (10 → 13 columns) | one column as an expression; three ways to name a column |
| 2 | Nulls and conditions | `== 239` 21, `!= 239` 19,628 of 31,046: the 11,397 nulls in neither; `coalesce` → `visitor`, `when` → `visitor_type` | NULL compared with 239; the counts; visitor never null |
| 3 | Deduplication | `dropDuplicates(["event_id"])`: 145 ids sent twice | the shuffle that dedupes; which tool when copies differ |
| 4 | Timestamps and time zones | `silver.orders`: UTC `order_date` and the customer's `local_date`; 93 orders change day | one instant, two days; country → zone |
| 5 | A Python UDF | `is_bot`: 2,477 events (8%) from one scraper | rows crossing JVM → Python → JVM; the busiest visitors |
| 6 | Built-ins vs pandas UDF vs Python UDF | 3.1 M user agents timed; Spark 4.2 sends Python UDFs as Arrow batches, so pandas no longer wins; silver moves to `rlike` | plot: seconds per rule |
| 7 | ◆ full scene: Catalyst | concept + lab (`explain(mode="extended")`, RuleExecutor metrics) | analyzed → optimized → physical; the five rules that fired |
| 8 | Quality gates | `quality.gate`; `python -m shopwave.silver` writes 6 tables; `SHOPWAVE_MAX_LOSS=0.001` fails, exit code 1 | build → gate → write; both runs' gates |

**5. `model` · A star schema, and Black Friday (gold) · 9**

The chain's data runs through November from here (Black Friday). Skew and AQE are measured in ROWS
PER TASK from the task metrics (deterministic), never seconds; a `noop` write makes every column
count (a `count()` lets Spark prune all but the join key, and the shuffle carries almost nothing).

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Facts and dimensions | `gold.fact_sales` (7,389 lines), `dim_customer`, `dim_product`; revenue from lines = from orders, to the cent | the star; the two sums; revenue by category |
| 2 | Join types | inner / left / semi / anti: 44 orders never paid, 12 paid twice | what each join keeps; SQL equivalents |
| 3 | ◆ full scene: the shuffle | concept + lab (status store: stages, rows, shuffle bytes) | map tasks → shuffle files → reduce (200 partitions, AQE-coalesced to 1) |
| 4 | Sort-merge join | broadcasting off: Exchange + Sort on both sides, 160,716 B shuffled | the plan drawn; join strategies |
| 5 | Broadcast join | `fx_rates` lands in bronze; `gold.fact_payments` in EUR: 39,517 B vs 236 B shuffled | the broadcast; plot: bytes shuffled |
| 6 | Partitions | 200 tasks, 55 busy → 8 tasks; `coalesce(1)` 1 file, `repartition(4)` 4 | tasks per setting; files per write |
| 7 | Skew | product 1 is 16% of lines: largest task 1,154 rows, median 84 | plot: rows per task |
| 8 | Adaptive Query Execution | thresholds scaled to KB: 200 → 13 tasks, largest 819; 2 extra rows read = the split | AQE's steps; off vs on; its thresholds |
| 9 | Salting | 8 salts: busy tasks 44 → 179, largest 1,154 → 329 | one hot key → 8; what to try, in order |

**6. `analytics` · Answer the business · 9**

The chain's data covers all of 2026 from here; the clickstream questions use October. Charts are
drawn from small CSVs the scripts write (`capture`), so every point is real.

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | KPIs | `analytics.daily_kpis`: 18,014 paid orders, GMV € 2.18 M, AOV € 120.92; Black Friday € 98,090 | plot: GMV per day, the year |
| 2 | Window functions | `top_products`: `rank()` over `partitionBy(category)` | rank per category; rank / dense_rank / row_number on a tie |
| 3 | Frames | `moving_average`: `rangeBetween(-6, 0)` over `unix_date`; rows vs range with a day missing | plot: daily and 7-day; the difference |
| 4 | Sessionization | `sessions`: `lag`, a 30-minute gap, a running sum; 6,170 sessions, the bot's 401 | visitor 1's timeline; the rule |
| 5 | The funnel | `funnel`: 25% of visits buy; the drop is view → cart | plot: sessions per step |
| 6 | Cohort retention | `cohorts`: first-order month, `months_between`, `pivot` | the cohort grid |
| 7 | RFM segments | `rfm`: `ntile(4)` on R, F, M → five segments | segments with their numbers; the rules |
| 8 | Attribution | `campaigns` lands (multi-line JSON); last touch + a range join; `aggregate` over items | credited revenue; the campaigns' windows |
| 9 | Spark SQL | `sql/funnel.sql` over a temp view: same answer, the same optimized plan | two ways in, one engine |

**7. `lakehouse` · Delta Lake · 9**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Why folders of Parquet break | `explore.overwrite`: a December row raises mid-overwrite; 35,043 rows → `UNABLE_TO_INFER_SCHEMA`, 0 files left | the folder mid-write; what a reader sees |
| 2 | ◆ full scene: a Delta table | concept + lab (`explore.delta_log`: two commits' actions and stats; 6 files on disk, 5 added) | writes → `_delta_log/` → data files; the file no commit added |
| 3 | Converting the lake | `delta-spark` + jars + the session's extension; gold writes Delta; the same failed overwrite leaves 35,043 rows; `CONVERT TO DELTA` on bronze orders (365 files kept) | Parquet vs Delta after the failure; what Delta needed; the convert |
| 4 | Incremental loads | `lake.load_orders`: max(`order_date`) as the mark; +17,944, +2,080, +0 | the mark → new rows → one commit; the three runs |
| 5 | CDC with `MERGE` | a week of `order_changes`: 1,976 changes, 537 orders twice → refused; `latest` then MERGE: 1,439 updated | latest → matched and newer → one commit; status before / after |
| 6 | SCD Type 2 | `lake.price_history`: 66 rows, 8 repriced; an as-of join over every sale: 0 wrong | one product's price rows over time; type 1 vs 2 |
| 7 | Time travel and restore | overwrite instead of append: 20,024 → 47; `versionAsOf=1`; `restoreToVersion` → version 3 | the version history, one rolled back |
| 8 | Schema enforcement and evolution | a string `total` and a new column refused; `mergeSchema` adds `channel` (old rows null) | refused vs evolved; the options |
| 9 | Small files and layout | 31 daily appends → 31 files; `OPTIMIZE` → 1; `VACUUM(0)` deletes the rest; rows unchanged (clustering is narrated, not run) | files in the table vs on disk, per step |

**8. `scale` · The full year, measured · 8**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Reading a job | the year at SF 1: jobs, stages, tasks from the event log | the stage table (our scene, not a UI screenshot) |
| 2 | ◆ full scene: executor memory | concept + lab (memory metrics) | heap: execution vs storage (unified), user memory, overhead |
| 3 | Spill | less memory → spill to disk, measured | spill bytes per stage |
| 4 | Caching | `cache` a reused DataFrame; when it helps and hurts | storage level; plot: with vs without |
| 5 | Partition sizing | `maxPartitionBytes`, ~128 MB per task | partitions vs file sizes |
| 6 | The plan as a tuning tool | a UDF hides a filter: pushdown and pruning lost, then restored | two plans side by side |
| 7 | Data skipping | Delta file statistics skip most files | files read / files total |
| 8 | Cores and time | `local[1]` → `local[8]`, measured | plot: wall time vs cores, the flattening |

**9. `stream` · Live data from Kafka · 9**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Kafka | the tracker now publishes to a topic | producer → topic partitions → consumer |
| 2 | `readStream` | bytes → `from_json` with our schema | a Kafka record → a row |
| 3 | ◆ full scene: micro-batches | concept + lab (progress JSON: offsets, batch durations) | trigger → offsets → batch → sink → checkpoint |
| 4 | Exactly once into Delta | kill the query mid-batch, restart: no duplicates | checkpoint + Delta commit = once |
| 5 | Live revenue | tumbling 1-minute windows | events dropping into windows |
| 6 | Watermarks | late events: accepted, then dropped; state cleaned | timeline: event time vs watermark |
| 7 | Streaming deduplication | `dropDuplicatesWithinWatermark` | state store of seen ids |
| 8 | Stream-static joins | enrich clicks with `dim_product` (Delta) | stream ← static table |
| 9 | Cart abandonment | stateful processing: cart with no checkout in 30 min → alert | one user's state over time |

**10. `ml` · Recommendations · 6**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Features from gold | implicit feedback: views, carts, purchases weighted | the user × product matrix (sparse) |
| 2 | ML pipelines | `StringIndexer` → `ALS` as one `Pipeline` | stages of the pipeline |
| 3 | ◆ full scene: distributed ALS | concept + lab | matrix factorisation; user / item blocks across executors |
| 4 | Evaluating honestly | split by time, not at random; ranking metrics | train window → test window |
| 5 | Scoring everyone | `recommendForAllUsers` → a gold table | one customer's top 10 |
| 6 | When not to use Spark | a model that fits on one machine: pandas + scikit-learn | data size → the right tool |

**11. `production` · Ship it · 7**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Jobs as a package | `shopwave/jobs/`, config in one place | package → job entry points |
| 2 | Testing Spark code | `pyspark.testing.assertDataFrameEqual`, a session fixture | test → transform → expected frame |
| 3 | Data quality as code | expectations per table; a failing check stops the run | checks lit pass / fail |
| 4 | A real cluster | `spark-submit` to a standalone master + 2 workers (Docker) | driver → master → workers: tasks on other machines now |
| 5 | Idempotent runs and backfills | re-run a date: same result; backfill a week | run date → partitions replaced |
| 6 | The whole platform | every job end to end, one night | **the platform map**, every stage lit |
| 7 | Where next | Databricks / EMR / Dataproc, Kubernetes, Spark Connect, Iceberg | each part of the platform → its tool at scale |

## How a section teaches

Objective → mental model (side pane) → the code and its real result → a failure or alternative →
bridge. One step per section; failure is its own step with a real error or a real measurement.
Narration explains, never reads code aloud. A detour ◆ is ≤ 120 s and returns to the platform.

## Replay rules (Spark-specific)

Spark output is noisier than Python's, so the spine fixes these up front:

- **Deterministic shape:** `local[4]` (never `local[*]`), log level `ERROR`, `orderBy` before every
  `show()`, seeded data, a fixed session time zone (`spark.sql.session.timeZone=UTC`).
- **Volatile, masked when compared:** application ids, plan expression ids (`#123`), temp and
  checkpoint paths, timings, memory sizes, Kafka offsets. A scene READS such values from the
  session; narration says "about two seconds", not a number.
- **Two data sizes in the spine:** SF 0.001 for correctness; measured sections run at SF 1 and are
  `volatile`.
- **Docker is part of the replay.** `check:spine` brings the compose stack up; Courses 9 and 11 need
  Kafka and the multi-node cluster.

## Build order

1. Owner review of this plan.
2. Infra (done 2026-10-26): the versions pinned; `shopwave_gen` and `verify` for every planted
   problem; the frame template (`ide.ts`), `spine.py`, checks, registry and shots ported from
   python-expense-tracker, `spine.py` extended for Spark (a shared venv, the JVM's environment,
   UUID masking, data checked against the generator). Still to build with the course that first
   needs it: Docker Compose (3), the platform-map scene (1), an event-log → stage-table scene (5).
3. Course 2 as the pilot → owner review.
4. Courses 1, 3–11 one at a time, each reviewed on its rendered routes, then narrated.
5. Record all 11 courses → assemble and publish the one video.

## Decisions

1. Project: **Shopwave**, an e-commerce analytics platform. Repo `spark-ecommerce-analytics`.
2. Data: our own seeded generator with a scale factor; no public datasets.
3. Table format: **Delta Lake**, from Course 7 (bronze/silver/gold start as Parquet so the move
   to Delta is motivated by a real failure).
4. Infrastructure: **Docker Compose** (PostgreSQL from Course 3, Kafka, a standalone master + 2
   workers in Course 11). Spark itself runs from `pip install pyspark` on the host's Java 21; the
   spine needs Docker from Course 3.
5. One video, one continuous story: 11 courses, no parts or acts.
6. Background is just-in-time (◆ detours), never a front-loaded course.
7. Follow-up project videos (not this plan): retail bank fraud + AML (streaming, GraphFrames);
   telemetry (time series, geospatial); log analytics (sketches, HyperLogLog).
