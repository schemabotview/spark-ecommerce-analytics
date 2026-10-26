import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { ingestTree } from './tree'
import code from '../../../spine/ingest/08-bronze/project/shopwave/bronze.py?raw'
import session from '../../../spine/ingest/08-bronze/session.txt?raw'

// §8 — the bronze layer, written. Every count is the session's; the folders are its `ls`.
const out = outputOf(session, 'python -m shopwave.bronze')
const counts = Object.fromEntries([...out.matchAll(/(\w+\/\w+)\s+(\d+) rows/g)].map((m) => [m[1], m[2]]))
const days = outputOf(session, 'ls lake/bronze/clicks').split('\n').filter((l) => l.startsWith('_file_date='))
const n = (p: string) => counts[p]

export const ingestBronze: SceneModel = ideFrame({
  tree: ingestTree(['db/', 'jars/', 'lake/bronze/', 'lake/quarantine/', 'shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'explore/', 'compose.yaml'],
    'shopwave/bronze.py', ['lake/bronze/', 'lake/quarantine/'], { 'lake/bronze/': '7 tables' }),
  editor: { file: 'shopwave/bronze.py', code, ...view(code, 'def main(', undefined, 0), highlight: [...linesFrom(code, 'for name, df in daily.items()', 'out.parquet('), ...linesFrom(code, 'bad.drop("_file_date")', 'quarantine/returns')] },
  session,
  side: [
    {
      type: 'group', id: 'land', bare: true, children: [
        {
          type: 'group', id: 'sources', title: 'Sources', icon: 'folder', tone: 'source', dir: 'row', children: [
            { type: 'item', id: 's-files', title: 'files', sub: 'CSV · JSON · Parquet', icon: 'file' },
            { type: 'item', id: 's-db', title: 'the shop’s database', sub: 'over JDBC', icon: 'postgresql' },
          ],
        },
        {
          type: 'group', id: 'bronze', title: 'lake/bronze', sub: 'Parquet, + _source_file', icon: 'database', tone: 'infra', children: [
            {
              type: 'table', id: 'tables', columns: ['table', 'rows'], rows: [
                ...['orders', 'order_items', 'payments', 'clicks', 'returns', 'customers', 'products'].map((t) => ({ id: `t-${t}`, cells: [t, n(`bronze/${t}`)] })),
                { id: 't-quarantine', cells: ['quarantine/returns', n('quarantine/returns')], tone: 'consume' as const },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'days', title: 'ls lake/bronze/clicks', tone: 'infra', columns: ['folder', 'holds'],
      rows: days.map((d) => ({ id: d.replace('_file_date=', 'd'), cells: [d, `the events that arrived on ${d.split('=')[1]}`] })),
    },
    { type: 'note', id: 'note', tone: 'infra', text: 'Bronze changes nothing in the data: it fixes only the format and the types. A query for one day reads only that day’s folder.' },
  ],
  edges: [{ from: 'sources', to: 'bronze', label: 'land' }],
})
