import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { modelTree } from './tree'
import code from '../../../spine/model/04-sort-merge/project/explore/sort_merge.py?raw'
import session from '../../../spine/model/04-sort-merge/session.txt?raw'

// §4 — the sort-merge join. The plan's operators and the bytes shuffled are the session's.
const out = outputOf(session, 'python -m explore.sort_merge')
const [, rows, moved] = out.match(/joined rows: (\d+) · bytes shuffled: (\d+)/)!

export const modelSortMerge: SceneModel = ideFrame({
  tree: modelTree(['shopwave/gold.py', 'shopwave/metrics.py', 'explore/joins.py', 'explore/sort_merge.py'], 'explore/sort_merge.py', ['shopwave/metrics.py', 'explore/sort_merge.py']),
  editor: { file: 'explore/sort_merge.py', code, highlight: [...linesFrom(code, 'spark.conf.set("spark.sql.autoBroadcastJoinThreshold"'), ...linesFrom(code, 'joined = items.join')] },
  session,
  side: [
    {
      type: 'group', id: 'plan', bare: true, children: [
        {
          type: 'group', id: 'sides', bare: true, dir: 'row', children: [
            {
              type: 'group', id: 'left', title: 'order_items', icon: 'table', tone: 'ingest', children: [
                { type: 'item', id: 'l-ex', title: 'Exchange on order_id', sub: 'shuffle', icon: 'network', tone: 'infra' },
                { type: 'item', id: 'l-sort', title: 'Sort', sub: 'by order_id', icon: 'filter' },
              ],
            },
            {
              type: 'group', id: 'right', title: 'orders', icon: 'table', tone: 'ingest', children: [
                { type: 'item', id: 'r-ex', title: 'Exchange on order_id', sub: 'shuffle', icon: 'network', tone: 'infra' },
                { type: 'item', id: 'r-sort', title: 'Sort', sub: 'by order_id', icon: 'filter' },
              ],
            },
          ],
        },
        { type: 'item', id: 'smj', title: 'SortMergeJoin', sub: 'walk both sorted lists together', icon: 'workflow', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'cost', title: 'What it cost', tone: 'infra', columns: ['', ''], rows: [
        { id: 'c-rows', cells: ['rows joined', rows] },
        { id: 'c-bytes', cells: ['bytes shuffled', moved], tone: 'infra' },
      ],
    },
    {
      type: 'table', id: 'strategies', title: 'How Spark picks a join', tone: 'ingest', columns: ['strategy', 'when'], rows: [
        { id: 's-bhj', cells: ['broadcast hash', 'one side under 10 MB: next section'] },
        { id: 's-smj', cells: ['sort-merge', 'both sides large: the default'], tone: 'infra' },
        { id: 's-shj', cells: ['shuffled hash', 'one side small per partition'] },
        { id: 's-bnlj', cells: ['broadcast nested loop', 'no equality in the condition'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'infra', text: 'Both sides are shuffled so that equal order_ids land in the same task, then sorted, then merged in one pass. It works for any size: the default when neither side is small.' },
  ],
  edges: [{ from: 'sides', to: 'smj', label: 'merge' }],
})
