import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { mlTree } from './tree'
import code from '../../../spine/ml/05-score/project/shopwave/ml.py?raw'
import session from '../../../spine/ml/05-score/session.txt?raw'

// §5 — scoring everyone. The gold table's size, one customer's taste and their top 5 are the session's.
const [, rows, customers] = outputOf(session, 'python -m shopwave.ml').match(/(\d+) rows, (\d+) customers/)!
const out = outputOf(session, 'python -m explore.one_customer')
const [, who, rated] = out.match(/customer (\d+) rated, on average: (.+)/)!
const taste = rated.split(', ').map((t) => t.split(' '))
const top = [...out.matchAll(/^\s+(\d)\. (.+?)\s{2,}(\w+)\s+([\d.]+)★$/gm)].map(([, rank, name, cat, score]) => ({ rank, name, cat, score }))
const liked = new Set(taste.slice(0, 2).map(([c]) => c))

export const mlScore: SceneModel = ideFrame({
  tree: mlTree(['shopwave/ml.py', 'explore/one_customer.py', 'lake/gold/recommendations/'], 'shopwave/ml.py', ['explore/one_customer.py', 'lake/gold/recommendations/']),
  editor: { file: 'shopwave/ml.py', code, ...view(code, 'def recommend(', 'main()'), highlight: linesFrom(code, 'pairs = customers.select("customer_id")', '"rank", F.row_number().over(best))') },
  session,
  side: [
    {
      type: 'table', id: 'top', title: `Customer ${who}: the top 5`, tone: 'store', columns: ['#', 'product', 'category', 'score'],
      rows: top.map((t) => ({ id: `t${t.rank}`, cells: [t.rank, t.name, t.cat, `${t.score}★`], tone: liked.has(t.cat) ? 'store' as const : undefined })),
    },
    {
      type: 'table', id: 'taste', title: `What customer ${who} rated, on average`, tone: 'ingest', columns: ['category', 'stars'],
      rows: taste.map(([c, s]) => ({ id: `r-${c}`, cells: [c, s], tone: liked.has(c) ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'job', title: `gold/recommendations: ${rows} rows`, icon: 'brain', tone: 'store', children: [
        { type: 'item', id: 'g-score', title: `${customers} customers × every product`, sub: 'scored: the average + ALS', icon: 'layers' },
        { type: 'item', id: 'g-rank', title: 'row_number() per customer', sub: 'the 5 best, ranked', icon: 'chart' },
        { type: 'item', id: 'g-write', title: 'a Delta table, overwritten nightly', sub: 'what the website reads', icon: 'globe' },
      ],
    },
  ],
  edges: [
    { from: 'g-score', to: 'g-rank' },
    { from: 'g-rank', to: 'g-write' },
  ],
})
