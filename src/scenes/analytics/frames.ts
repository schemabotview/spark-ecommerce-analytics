import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { analyticsTree, csvRows } from './tree'
import code from '../../../spine/analytics/03-frames/project/shopwave/analytics.py?raw'
import session from '../../../spine/analytics/03-frames/session.txt?raw'
import smooth from '../../../spine/analytics/03-frames/captured/out/moving_average.csv?raw'

// §3 — window frames. The chart is the captured CSV (daily GMV and its 7-day average, every day of
// 2026); the rows-vs-range table is the session's Black Friday week with 26 November removed.
const out = outputOf(session, 'python -m explore.frames')
const week = [...out.matchAll(/^ {2}([\d-]+)\s+gmv\s+([\d.]+)\s+rows:\s+([\d.]+)\s+range:\s+([\d.]+)$/gm)].map((m) => m.slice(1))
const rows = csvRows(smooth)
const at = (col: number) => rows.map((r, i) => [i + 1, Math.round(+r[col])] as [number, number])
const peak = Math.max(...rows.map((r) => +r[2]))

export const analyticsFrames: SceneModel = ideFrame({
  tree: analyticsTree(['shopwave/analytics.py', 'explore/frames.py', 'explore/windows.py'], 'shopwave/analytics.py', ['explore/frames.py']),
  editor: { file: 'shopwave/analytics.py', code, ...view(code, 'def moving_average(', undefined, 0), highlight: linesFrom(code, 'day = F.unix_date', 'return kpis.withColumn') },
  session,
  side: [
    {
      type: 'plot', id: 'avg', title: 'GMV per day (grey) and its 7-day average (blue), €', compact: true,
      x: { min: 0, max: 366, step: 61, label: 'day of the year' }, y: { min: 0, max: Math.ceil(peak / 20000) * 20000 },
      series: [{ kind: 'line', points: at(2), tone: 'neutral' }, { kind: 'line', points: at(4), tone: 'ingest' }],
    },
    {
      type: 'table', id: 'week', title: 'rows or range, with 26 Nov missing', tone: 'ingest', columns: ['day', 'GMV', 'rows: last 7 rows', 'range: last 7 days'],
      rows: week.map(([d, g, r, n]) => ({ id: `w-${d}`, cells: [d.slice(5), g, r, n], tone: r !== n ? 'consume' as const : undefined })),
    },
    { type: 'note', id: 'note', tone: 'ingest', text: 'rowsBetween(-6, 0) counts rows: with a day missing, it reaches back 8 days. rangeBetween(-6, 0) counts values of the order key: always 7 days.' },
  ],
})
