import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { view } from '../fold'
import { prodTree } from './tree'
import code from '../../../spine/production/05-backfill/project/shopwave/daily.py?raw'
import session from '../../../spine/production/05-backfill/session.txt?raw'

// §5 — idempotent runs and backfills. Each run's rows, days and revenue are the session's.
const runs = [...session.matchAll(/^\$ python -m shopwave\.daily (.+)\n(?:.*\n)*?daily_sales: .+ rebuilt · (\d+) rows, (\d+) days · € ([\d.]+)/gm)]
  .map(([, args, rows, days, eur]) => ({ args, rows, days, eur }))

export const productionBackfill: SceneModel = ideFrame({
  tree: prodTree(['shopwave/daily.py', 'lake/gold/daily_sales/'], 'shopwave/daily.py', ['shopwave/daily.py']),
  editor: { file: 'shopwave/daily.py', code, ...view(code, 'def build(', 'build(spark, first + timedelta(days=n))'), highlight: linesFrom(code, '(daily.write.format("delta").mode("overwrite")', '.partitionBy("order_date").save(DAILY))') },
  session,
  side: [
    {
      type: 'table', id: 'runs', title: 'Four runs, two of them repeats', tone: 'store', columns: ['run', 'rows', 'days', 'revenue'],
      rows: runs.map((r, i) => ({ id: `r${i}`, cells: [r.args, r.rows, r.days, `€ ${r.eur}`], tone: i % 2 ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'how', title: 'replaceWhere: overwrite one day', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'h-day', title: 'build the day from gold', sub: 'all of it, from scratch', icon: 'table' },
        { type: 'item', id: 'h-swap', title: 'one commit: that day out, the new day in', sub: 'the other days untouched', icon: 'layers' },
        { type: 'item', id: 'h-again', title: 'run it again: the same table', sub: 'safe to retry, safe to backfill', icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'modes', title: 'Writing a day, three ways', tone: 'neutral', columns: ['mode', 'run twice'], rows: [
        { id: 'm-append', cells: ['append', 'the day twice'], tone: 'consume' },
        { id: 'm-over', cells: ['overwrite', 'every other day gone'], tone: 'consume' },
        { id: 'm-rw', cells: ['overwrite + replaceWhere', 'the same table'], tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Appending a day would double it on a retry. A job that replaces exactly what it owns can be run any number of times: that is idempotent.' },
  ],
  edges: [
    { from: 'h-day', to: 'h-swap' },
    { from: 'h-swap', to: 'h-again' },
  ],
})
