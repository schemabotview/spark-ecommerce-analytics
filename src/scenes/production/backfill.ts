import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { view } from '../fold'
import { prodTree } from './tree'
import code from '../../../spine/production/05-backfill/project/shopwave/daily.py?raw'
import session from '../../../spine/production/05-backfill/session.txt?raw'

// §5 — idempotent runs and backfills. Each run's rows, days and revenue are the session's.
const runs = [...session.matchAll(/^\$ python -m shopwave\.daily (.+)\n(?:.*\n)*?daily_sales: .+ rebuilt · (\d+) rows, (\d+) days · € ([\d.]+)/gm)]
  .map(([, args, rows, days, eur]) => ({ args, rows, days, eur }))

export const productionBackfill: SceneModel = ideFrame2({
  model: 'replaceWhere: one day, rebuilt',
  tree: prodTree(['shopwave/daily.py', 'lake/gold/daily_sales/'], 'shopwave/daily.py', ['shopwave/daily.py']),
  editor: { file: 'shopwave/daily.py', code, ...view(code, 'def build(', 'build(spark, first + timedelta(days=n))'), highlight: linesFrom(code, '(daily.write.format("delta").mode("overwrite")', '.partitionBy("order_date").save(DAILY))') },
  session,
  side: [
    {
      type: 'table', id: 'runs', title: 'Four runs, two of them repeats', tone: 'store', columns: ['days rebuilt', 'rows', 'revenue'],
      rows: runs.map((r, i) => ({ id: `r${i}`, cells: [r.args.replaceAll('2026-', '').replace(' ', ' … '), r.rows, `€ ${r.eur}`], tone: i % 2 ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'how', title: 'replaceWhere: overwrite one day', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'h-day', title: 'build the day from gold', sub: 'all of it, from scratch', icon: 'table' },
        { type: 'item', id: 'h-swap', title: 'one commit: that day out, the new day in', sub: 'the other days untouched', icon: 'layers' },
        { type: 'item', id: 'h-again', title: 'run it again: the same table', sub: 'safe to retry, safe to backfill', icon: 'check', tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'h-day', to: 'h-swap' },
    { from: 'h-swap', to: 'h-again' },
  ],
})
