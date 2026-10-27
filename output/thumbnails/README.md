# Thumbnails

`film.png` — the thumbnail for the single full-course video (`scripts/out/film.mp4`).
A copy of `film-dark.png`. Rebuild any variant with:

```sh
npm run thumb:film -- --theme dark --source cluster --out output/thumbnails/film-dark.png
```

Variants: `film-dark.png` (shipped), `film-ember.png` (brighter amber),
`film-light.png` (stands out in a dark feed), `film-kpis.png` (the other source, below).

## The mark is ours, on purpose

The tile is **not** the Apache Spark logo, and not a lookalike either. That is an ASF
trademark: the ASF permits a third party to use a project logo essentially only as a hyperlink
to the project's own site, and separately forbids applying a "confusingly similar" derivative —
which rules out drawing our own fan shape as much as copying theirs. The *name* "Apache Spark"
is fine nominatively, in the title and the narration; the mark is not.

So the tile is a drawn glyph of our own: a plain five-pointed star — a spark — outlined on a
light tile. It resembles nobody's mark, carries no ASF identity and claims no endorsement.

**The sister data-science repo reaches the opposite conclusion, correctly:** it carries the real
pandas logo, because pandas publishes its logo under BSD-3-Clause — a copyright licence that
permits redistribution with the notice retained. Copyright and trademark are different
questions, and the answer is per-project. Do not copy either decision across without checking.

## The two sources, both real

`--source cluster` (default, shipped) renders `spine/production/04-cluster/session.txt`: the
real `spark-submit --properties-file conf/cluster.conf explore/on_cluster.py`, its master and
executor/core counts, and the genuine task split — 6 stages, 107 tasks, executor 0 ran 17 and
executor 1 ran 90.

The card draws the picture every Spark user knows — **Driver Program / SparkContext → Cluster
Manager → Worker nodes with Executors, Cache and Tasks** — but it is drawn from *this run*
rather than copied from the docs. Every label is the session's:

- the Cluster Manager carries the real master, `127.0.0.1:7077`;
- there is one Worker node box per worker the session started (`2 workers × 2 cores`), and one
  `Task` box per core each was given;
- each executor shows the tasks it really ran: **17 and 90**.

That last line is why this is worth doing honestly. The canonical diagram implies a tidy, even
split; this run was five-to-one lopsided, and the cover says so. A diagram drawn from the docs
would have shown a balance the course never produced.

The session reports how many stages ran, not what each one did, so no stage is named anywhere
on the card — the count appears in the headline and nothing more is claimed.

`--source kpis` renders `spine/analytics/01-kpis/session.txt`: GMV €2,178,214 over 18,014 paid
orders, with the busiest days as bars and Black Friday (2026-11-27) as the hero row.

The command and the numbers always come from the **same** session, never mixed. Pasting
`spark-submit` above the KPI figures would advertise output that command did not produce — the
failure mode this whole script exists to avoid.

## Why not `npm run thumb` (the shell's `graphl-thumb`)

That template is a **per-course** poster: 58% of a scene plus a text panel. A scene is a 16:9
video frame, and cropped to 58% it turns to unreadable mush at the ~168px wide the YouTube
mobile feed actually renders — the only size that decides a thumbnail.
`scripts/thumb-film.mjs` uses poster grammar instead: few elements, enormous type, one focal
object. Every change was checked by downscaling to 168px, not at 1280px. At that size what
survives is LEARN / SPARK, the badge, `107 tasks · 6 stages`, and the orange-green-purple
topology as a shape — which is the one picture that says "Spark" without a word being read.

## Guards

Everything on the card is parsed out of a spine `session.txt` — the same replayed output the
scenes use — and a row or day that is not in that output is a hard error, so no invented figure
can reach the thumbnail. The diagram is held to the same rule: if the session's worker count
and its executor count ever disagree, the render **fails** rather than drawing a box it cannot
source. The renderer also asserts that no element overflows its box, and the
long `spark-submit` line is **shrunk to fit, never truncated**, so the command always appears in
full. The headline splits on spaces into one line per word and shrinks against the left column's
max width, so a longer concept name cannot push the card off the canvas.
