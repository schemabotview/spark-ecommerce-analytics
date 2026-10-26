# CLAUDE.md — spark-ecommerce-analytics

> Workspace invariants live in the workspace `CLAUDE.md`. This file is only what is true here.

## What this repo is

A GraphL concept app: **learn Apache Spark by building an e-commerce analytics platform** for
Shopwave, a fictional online store, from a first nightly job to a streaming Delta lakehouse on a
real cluster, in real, executed code. A **section** is `(scene, narration)`: one full-screen 16:9
frame, one chapter of the video.

**`COURSE-PLAN.md` is the source of truth**: courses, sections, the platform's growth, the data
generator's planted problems, each side-pane diagram, and the packaging (one video). Author from
it; change it first, never drift from it.

Sister repo: **python-expense-tracker**, which has the same course design for Python. Port its
infra (IDE frame template, `spine.py`, checks, registry, shots); do not reinvent it.

## Status

Plan drafted 2026-10-26, awaiting owner review. Nothing is authored yet.

## Decisions fixed by the owner

- Data: our own seeded generator (`shopwave-gen`, scale factor `--sf`); no public datasets.
- Table format: Delta Lake (from Course 7).
- Infrastructure: Docker Compose (Spark, PostgreSQL, Kafka; standalone master + 2 workers in
  Course 11). The spine replay needs Docker.
- One video, 11 courses, no parts or acts.

## Invariants

- Every output is run, at the versions pinned in `COURSE-PLAN.md`. Nothing is typed.
- The Spark UI is never screenshotted: stage, task and memory views are scenes drawn from the run's
  event log / metrics.
- Replays are deterministic: `local[4]`, log level `ERROR`, `orderBy` before `show()`, session time
  zone UTC, seeded data. Application ids, plan expression ids, paths, timings, sizes and offsets
  are volatile and masked; scenes read them from the session, never type them.
- Never write `x`/`y`; scenes are declarative.
- No `file:` installs committed.
