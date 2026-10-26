# CLAUDE.md — spark-ecommerce-analytics

> Workspace invariants live in the workspace `CLAUDE.md`. This file is only what is true here.

## What this repo is

A GraphL concept app: **learn Apache Spark by building an e-commerce analytics platform** for
Shopwave, a fictional online store, from a first job to a streaming Delta lakehouse on a real
cluster, in real, executed code. A **section** is `(scene, narration)`: one full-screen 16:9 frame,
one chapter of the video.

**`COURSE-PLAN.md` is the source of truth**: courses, sections, the platform's growth, the data
generator's planted problems, each side-pane diagram, the pinned versions, and the packaging (one
video). Author from it; change it first, never drift from it.

Engine `@graphlearning/graphl-flow` (^0.3.0), shell `@graphlearning/shell` (^1.0.2), both published
and pinned. Sister repo: **python-expense-tracker**, whose infra (IDE template, `spine.py`, checks,
registry, shots) was ported here. Port from it; do not reinvent it.

## Status

| # | Course | Sections | Status |
| --- | --- | --- | --- |
| 1 | `intro` | 3 | not started |
| 2 | `start` | 6 | **pilot authored, replayed, rendered and looked at; awaiting owner review; no audio** |
| 3–11 | | 73 | not started |

## Route contract

`#/` catalog; `#/<courseId>-<sectionId>` a section; `?capture=1` and `window.__scene.plan()` come
from the shell. Do not reimplement the shell.

## The toolchain: every output run

PySpark 4.2.0 on CPython 3.14.9 (PySpark 4.2.0 stops at 3.14) and Java 21. Install with
`scripts/install-toolchain.sh` (also usable as the cloud environment's setup script). The repo's own
`.venv` holds the generator's one dependency: `python -m venv .venv && .venv/bin/pip install -r
scripts/requirements-gen.txt`.

## The data: `shopwave_gen`

A seeded generator of Shopwave's 2026: every table drawn from its own random stream keyed by
(seed, table, day), so a slice is byte-identical to the same slice of a full run. Every planted
problem (Black Friday ×20, a 15% bestseller, the June 1 schema change, duplicate and late clicks,
the bot, unpaid and double-paid orders, the Latin-1 returns) is a named constant in `model.py`
and asserted by `python -m shopwave_gen verify`. Change the generator only with `verify` green
and every spine step's `generated` check green — a step's committed data is the generator's.

## The spine

`spine/<course>/<NN-step>/` = `project/` (the platform at that step) + `session.txt` + `step.json`,
replayed by `scripts/spine.py` exactly as in python-expense-tracker (`first` / `from` + `changes` /
`lab`; one bash per step; paths shown as `/home/ana/shopwave`). What Spark changed:

- **A fixed replay directory and a shared venv.** A PySpark venv is 500 MB; `"venv": true` reuses
  one per `requirements.txt`, parked between steps at `$SPINE_ROOT/venvs/` (default
  `/tmp/shopwave-spine`). Only 2.1 installs PySpark on screen.
- **Spark's log goes to `logs/spark.log`** (`conf/log4j2.properties`, from 2.2). A failed task logs a
  stack trace of hundreds of lines; with the log in a file the terminal pane shows only what a job
  prints. The level stays INFO, and `PythonGatewayServer` is set to the same level because Spark
  prints a two-line "Setting default log level" notice whenever that logger's level differs from
  the root's (found in `Logging.class`, Spark 4.2.0). `session.py` (from 2.4) also mutes PySpark's
  `DataFrameQueryContextLogger`, which writes a JSON copy of every caught error to stderr.
- **One line stays in every run**: `WARNING: Using incubator modules: jdk.incubator.vector`. Spark's
  launcher hardcodes `--add-modules`, and the JVM prints it; it is real, and 2.2 says so.
- **The replay's environment**: `JAVA_TOOL_OPTIONS` is dropped (the container's proxy setup would
  print "Picked up JAVA_TOOL_OPTIONS" on every JVM start) and `SPARK_LOCAL_IP=127.0.0.1` is set (a
  container's hostname resolves to loopback, which Spark warns about; a laptop's does not).
- **Determinism**: `local[4]`, `orderBy` before `show`. `volatile` takes a list of what to mask:
  `["uuid"]` for a part file's name (2.5) leaves revenue numbers checked; `["digits"]` (2.6) for
  which row a task trips on and the log's times. A scene reads such values from the session;
  narration never says them.
- **The terminal holds 13 rows at 80 columns**, wrapped lines counted. Spark tables are wide and
  tracebacks long: `show(3)`, `java -version 2>&1 | head -1`, errors caught and printed by condition.

## Frames

python-expense-tracker's IDE template, unchanged: explorer | editor (80 × 23) over terminal (13) |
fixed side pane. Every IDE side pane carries a diagram and fills ≥ 2/3 of its height. No edges
between panes. A detour (◆) that cannot fit the side pane is a full concept scene with the lab's
real output inside it. **The Spark UI is never screenshotted**: stages, tasks and memory are drawn
from the run's own numbers (2.3 asks `statusTracker`). A full scene's widest node sets the zoom:
keep code and terminals in it short (2.3's first build put a 75-column line in the program column
and shrank every box).

## Checks, before handing over

```sh
npm run build && npx tsc --noEmit && npm run check   # check-content + check-render (4K)
python scripts/spine.py                              # replays every step (~1 min for Course 2)
python -m shopwave_gen verify
npm run shots -- <course>                            # then LOOK at out/shots/
```

Checks are a floor, not proof.

## Invariants

- Never write `x`/`y`; scenes are declarative. Highlights and folds are found by text (`lineOf`).
- Stylesheets in order: graphl-flow, shell, `./theme.css` last (`--brand` Spark orange).
- No `file:` installs committed.
- Narration: `.tts` → `.wav` via Colab + Chatterbox only. Audio at `public/audio/<course>/<id>.wav`.

## Working agreement

Author a whole course (scenes, spine, narration), render it, look, then hand over the routes. No
silent scaffolding. Say what was built, verified and left out.
