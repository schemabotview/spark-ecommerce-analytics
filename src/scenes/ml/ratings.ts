import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { mlTree } from './tree'
import code from '../../../spine/ml/01-ratings/project/explore/ratings.py?raw'
import session from '../../../spine/ml/01-ratings/session.txt?raw'

// §1 — the ratings as a matrix. Sizes, the stars and one customer's taste are the session's.
const out = outputOf(session, 'python -m explore.ratings')
const [, ratings, users, items] = out.match(/(\d+) ratings · (\d+) customers × (\d+) products/)!
const [, cells, filled] = out.match(/the matrix: (\d+) cells, ([\d.]+%) filled/)!
const [, who, theirs] = out.match(/customer (\d+), (\d+) ratings:/)!
const taste = [...out.matchAll(/^\s+(\w+)\s+([\d.]+)★ over (\d+)$/gm)].map(([, c, s, n]) => ({ c, s, n }))

export const mlRatings: SceneModel = ideFrame2({
  model: 'A sparse matrix to fill in',
  tree: mlTree(['shopwave/schemas.py', 'shopwave/ml.py', 'explore/ratings.py'], 'explore/ratings.py', ['shopwave/ml.py', 'explore/ratings.py', 'data/raw/reviews/']),
  editor: { file: 'explore/ratings.py', code, ...view(code, 'spark = spark_session()'), highlight: linesFrom(code, 'theirs = (ratings.filter', '.agg(F.count("*")') },
  session,
  side: [
    {
      type: 'group', id: 'matrix', title: `${users} customers × ${items} products`, icon: 'table', tone: 'ingest', children: [
        { type: 'item', id: 'x-cells', title: `${cells} cells, ${filled} filled`, sub: `${ratings} ratings; the rest never rated, not zero`, icon: 'layers' },
        { type: 'item', id: 'x-goal', title: 'fill in the blanks', sub: 'what would each customer rate the rest?', icon: 'search', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'taste', title: `Customer ${who}: ${theirs} ratings, by category`, tone: 'store', columns: ['category', 'stars', 'ratings'],
      rows: taste.map((t, i) => ({ id: `t-${t.c}`, cells: [t.c, `${t.s}★`, t.n], tone: i === 0 ? 'store' as const : i === taste.length - 1 ? 'consume' as const : undefined })),
    },
  ],
  edges: [{ from: 'x-cells', to: 'x-goal' }],
})
