import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { modelTree } from './tree'
import code from '../../../spine/model/07-skew/project/explore/skew.py?raw'
import session from '../../../spine/model/07-skew/session.txt?raw'

// §7 — skew. The bestseller's share and every task's row count are the session's (task metrics).
const out = outputOf(session, 'python -m explore.skew')
const [, product, lines, all, share] = out.match(/product (\d+): (\d+) of (\d+) lines \((\d+%)\)/)!
const [, tasks, busy] = out.match(/join stage: (\d+) tasks, (\d+) with rows/)!
const largest = out.match(/largest first: \[([\d, ]+)\]/)![1].split(', ').map(Number)
const [, , med] = out.match(/largest task (\d+) rows · median task (\d+) rows/)!

export const modelSkew: SceneModel = ideFrame({
  tree: modelTree(['shopwave/gold.py', 'shopwave/metrics.py', 'explore/partitions.py', 'explore/skew.py'], 'explore/skew.py', ['explore/skew.py']),
  editor: { file: 'explore/skew.py', code, ...view(code, 'sales = spark.read', undefined, 0), highlight: [...linesFrom(code, 'joined = sales.join', 'write = joined.write'), ...linesFrom(code, 'join = max(stages')] },
  session,
  side: [
    {
      type: 'plot', id: 'rows', title: 'Rows per task: the largest six, and the median', compact: true,
      x: { labels: [...largest.map((_, i) => `#${i + 1}`), 'median'] }, y: { min: 0, max: Math.ceil(largest[0] / 200) * 200, label: 'rows' },
      series: [{ kind: 'bar', points: largest.map((r, i) => [i, r] as [number, number]), tone: 'consume' },
        { kind: 'bar', points: [[largest.length, +med]], tone: 'store' }],
    },
    {
      type: 'table', id: 'facts', title: 'fact_sales ⋈ dim_product', tone: 'consume', columns: ['', ''], rows: [
        { id: 'f-best', cells: [`product ${product}`, `${lines} of ${all} lines (${share})`], tone: 'consume' },
        { id: 'f-tasks', cells: ['join tasks', `${tasks}, ${busy} with rows`] },
        { id: 'f-ratio', cells: ['largest ÷ median', `${Math.round(largest[0] / +med)}×`], tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'sources', title: 'Where skew comes from', tone: 'neutral', columns: ['a key that', 'example'], rows: [
        { id: 'k-best', cells: ['sells far more', 'the bestseller'] },
        { id: 'k-bot', cells: ['acts far more', 'the scraper: Course 6'] },
        { id: 'k-null', cells: ['is missing', 'null customer_id'] },
        { id: 'k-default', cells: ['is a placeholder', "'unknown', 0, ''"] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'A join sends every row with one key to one task. The bestseller’s task does many times the median’s work, and the stage ends only when it does: the others wait.' },
  ],
})
