# Thumbnails

`film.png` — the thumbnail for the single full-course video (`scripts/out/film.mp4`).
A copy of `film-dark.png`. Rebuild any variant with:

```sh
npm run thumb:film -- --theme dark --source cluster --out output/thumbnails/film-dark.png
```

Variants: `film-dark.png` (shipped), `film-ember.png` (brighter amber),
`film-light.png` (stands out in a dark feed), `film-kpis.png` (the other source, below).

## The two sources, both real

`--source cluster` (default, shipped) renders `spine/production/04-cluster/session.txt`:
the real `spark-submit --properties-file conf/cluster.conf explore/on_cluster.py`, its
master and executor/core counts, and the genuine task split — 6 stages, 107 tasks,
executor 0 ran 17 and executor 1 ran 90. It leads with `spark-submit` because that is
the command a Spark user recognises.

`--source kpis` renders `spine/analytics/01-kpis/session.txt`: GMV €2,178,214 over
18,014 paid orders, with the busiest days as bars and Black Friday (2026-11-27) as the
hero row.

The command and the numbers always come from the **same** session, never mixed. Pasting
`spark-submit` above the KPI figures would advertise output that command did not produce
— the failure mode this whole script exists to avoid.

## Why not `npm run thumb` (the shell's `graphl-thumb`)

That template is a **per-course** poster: 58% of a scene plus a text panel. A scene is a
16:9 video frame, and cropped to 58% it turns to unreadable mush at the ~168px wide the
YouTube mobile feed actually renders — the only size that decides a thumbnail.
`scripts/thumb-film.mjs` uses poster grammar instead: few elements, enormous type, one
focal object. Every change was checked by downscaling to 168px, not at 1280px.

## Guards

Everything on the card is parsed out of a spine `session.txt` — the same replayed output
the scenes use — and a row or day that is not in that output is a hard error, so no
invented figure can reach the thumbnail. The renderer also asserts that no element
overflows its box, and the long `spark-submit` line is **shrunk to fit, never truncated**,
so the command always appears in full.
