import type { Item, SceneModel } from '@graphlearning/graphl-flow'
import { terminal } from '../ide'
import { outputOf } from '../lab'
import session from '../../../spine/lakehouse/02-delta-log/session.txt?raw'

// §2 — ◆ full scene: a Delta table on disk. Two commits; every file name, action and count is the lab's.
const out = outputOf(session, 'python -m explore.delta_log')
const [, parquet, logs] = out.match(/: (\d+) parquet files · _delta_log\/: (.+)/)!
const commits = [...out.matchAll(/^(\d{20}\.json): (.+)\n {2}commitInfo: (\w+)\n {2}add (\S+) (\d+) rows, product_id (\d+)–(\d+)/gm)]
  .map(([, name, actions, op, file, rows, lo, hi]) => ({ name, actions, op, file, rows, lo, hi }))
const total = out.match(/rows now: (\d+)/)![1]

const chip = (id: string, title: string, tone?: Item['tone']): Item => ({ type: 'item', id, title, chip: true, tone })

export const lakehouseDeltaLog: SceneModel = {
  title: 'A Delta table: Parquet files and a log',
  sub: 'The log decides which files are the table; a commit is one file, written whole or not at all',
  nodes: [
    {
      type: 'group', id: 'table', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'writes', badge: 1, title: 'Two writes', icon: 'code', tone: 'ingest', children: [
            { type: 'item', id: 'w0', title: 'mode("overwrite")', sub: 'dim_product, every row', icon: 'table' },
            { type: 'item', id: 'w1', title: 'mode("append")', sub: 'two products again', icon: 'table' },
          ],
        },
        {
          type: 'group', id: 'log', badge: 2, title: '_delta_log/', sub: logs.split(', ').length + ' commits, numbered', icon: 'folder', tone: 'store', children: commits.map((c, i) => ({
            type: 'group' as const, id: `c${i}`, title: c.name, sub: c.actions, children: [
              chip(`c${i}-op`, `commitInfo: ${c.op}`, 'store'),
              chip(`c${i}-add`, `add ${c.file} ${c.rows} rows`),
              chip(`c${i}-st`, `stats: product_id ${c.lo}–${c.hi}`),
            ],
          })),
        },
        {
          type: 'group', id: 'data', badge: 3, title: 'out/dim_product/', sub: `${parquet} Parquet files`, icon: 'disk', tone: 'infra', children: [
            { type: 'item', id: 'd-files', title: 'part-….parquet', sub: 'never changed in place, only added', icon: 'file' },
            { type: 'item', id: 'd-read', title: `a reader: ${total} rows`, sub: 'the files the log adds, no others', icon: 'search' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'proof', title: 'The lab, run', icon: 'terminal', tone: 'neutral', span: 'all', children: [
        { type: 'code', id: 'out', terminal: true, filename: 'terminal — shopwave', code: terminal(session) },
      ],
    },
  ],
  edges: [
    { from: 'writes', to: 'log', label: 'commit' },
    { from: 'log', to: 'data', label: 'lists' },
  ],
}
