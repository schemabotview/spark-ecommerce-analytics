# spark-ecommerce-analytics

**Learn Apache Spark by building an e-commerce analytics platform.** A GraphL concept app: one
company, Shopwave, an online store, and its data platform. The platform grows from one nightly job
on the shop's order exports to a streaming Delta lakehouse with recommendations, running on a real
cluster. Every Spark feature is taught at the moment the data forces it, in real, executed code.
Scenes render with `@graphlearning/graphl-flow`; the app shell is `@graphlearning/shell`.

Published as **one video: "Learn Apache Spark by building an e-commerce analytics platform: full
course, beginner to professional"** (~3 h 10 min, 11 courses).

**Status:** the pilot (Course 2, `start`) is authored. Scope, sections and diagrams are in
[`COURSE-PLAN.md`](COURSE-PLAN.md); authoring rules and status are in [`CLAUDE.md`](CLAUDE.md).

Prerequisite: the Python course,
[`python-expense-tracker`](https://github.com/schemabotview/python-expense-tracker).

## Run it

```sh
npm install
npm run dev          # http://localhost:5173  ·  routes are #/<course>-<section>
```

## Verify a change

```sh
scripts/install-toolchain.sh                          # once: CPython 3.14.9 in /usr/local; checks Java 21
python -m venv .venv && .venv/bin/pip install -r scripts/requirements-gen.txt
npm run build && npx tsc --noEmit && npm run check    # check: content + 4K render
python scripts/spine.py                               # replays every step on PySpark 4.2.0
.venv/bin/python -m shopwave_gen verify               # every planted data problem is really there
npm run shots -- <course>                             # 4K PNGs in out/shots/, then look at them
```

## The data

`python -m shopwave_gen --sf 0.01 --out data/raw` writes a year of Shopwave: orders, order items,
payments (Parquet), clickstream (JSON by arrival hour), returns (Latin-1), customers, products,
price history, exchange rates and campaigns. Same seed and scale factor, same bytes.

## Layout

```
src/content/<course>/    one file per section + the course index
src/scenes/<course>/     declarative scenes (never x/y)
src/scenes/ide.ts        the one IDE frame every IDE section uses
src/scenes/lab.ts        a lab command's real output, for concept scenes
spine/<course>/<step>/   the platform as real files, one cumulative snapshot per step
shopwave_gen/            the seeded data generator and its `verify`
scripts/                 spine.py, check-content, check-render, registry, shots, install-toolchain.sh
```
