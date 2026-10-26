import type { Item, SceneModel } from '@graphlearning/graphl-flow'
import { outputOf } from '../lab'
import session from '../../../spine/ingest/07-columnar/session.txt?raw'

// §7 — ◆ full scene: rows or columns. A year of orders (shopwave_gen, SF 0.01) as CSV and as Parquet;
// every size and byte count is the lab's, read from the stage metrics the Spark UI shows.
const out = outputOf(session, 'python -m explore.columnar')
const disk = (fmt: string) => out.match(new RegExp(`${fmt}\\s+(\\d+) files\\s+([\\d,]+) bytes`))!.slice(1)
const [csvFiles, csvBytes] = disk('csv'), [pqFiles, pqBytes] = disk('parquet')
const reads = [...out.matchAll(/(csv|parquet) reads\s+([\d,]+) bytes/g)].map((m) => m[2])
const [deCsv, dePq, idCsv, idPq] = reads
const plan = out.slice(out.indexOf('== Physical Plan =='))
const pushed = plan.match(/PushedFilters: \[([^\]]+)\]/)![1]
const schema = plan.match(/ReadSchema: (struct<[^>]+>)/)![1]

const cell = (id: string, title: string, tone?: Item['tone']): Item => ({ type: 'item', id, title, chip: true, tone })
const COLS = ['order_id', 'order_ts', 'customer_id', 'country', 'status', 'total']
const used = new Set(['order_id', 'country', 'total'])

export const ingestColumnar: SceneModel = {
  title: 'Rows or columns: CSV and Parquet',
  sub: `A year of orders: ${csvFiles} CSV files of ${csvBytes} bytes, or ${pqFiles} Parquet file of ${pqBytes}`,
  nodes: [
    {
      type: 'group', id: 'formats', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'csv', badge: 1, title: 'CSV: one line per row', sub: 'to read one column, read every line', icon: 'file', tone: 'source', children: [
            { type: 'group', id: 'csv-rows', dir: 'grid', cols: 1, children: [1, 2, 3].map((r) => cell(`row${r}`, `row ${r}: ${COLS.join(', ')}`)) },
            { type: 'item', id: 'csv-read', title: `German orders: ${deCsv} bytes read`, sub: 'the whole year, every column', icon: 'disk', tone: 'consume' },
          ],
        },
        {
          type: 'group', id: 'pq', badge: 2, title: 'Parquet: one chunk per column', sub: 'compressed, typed, with min/max per chunk', icon: 'layers', tone: 'store', children: [
            { type: 'group', id: 'pq-cols', dir: 'grid', cols: 3, children: COLS.map((c) => cell(`col-${c}`, c, used.has(c) ? 'store' : 'neutral')) },
            { type: 'item', id: 'pq-read', title: `German orders: ${dePq} bytes read`, sub: 'only 3 of the 6 column chunks', icon: 'disk', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'proof', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'plan', title: 'Parquet’s plan: the scan does the work', icon: 'workflow', tone: 'ingest', children: [
            {
              type: 'table', id: 'scan', columns: ['FileScan parquet', ''], rows: [
                { id: 's-pushed', cells: ['PushedFilters', pushed.replace(/, /g, ', ')], tone: 'store' },
                { id: 's-schema', cells: ['ReadSchema', schema.replace('struct<', '').replace('>', '').replace(/,/g, ', ')], tone: 'store' },
              ],
            },
          ],
        },
        {
          type: 'group', id: 'skip', title: 'order_id < 1000: min/max skips the rest', icon: 'filter', tone: 'store', children: [
            {
              type: 'table', id: 'bytes', columns: ['format', 'bytes read'], rows: [
                { id: 'b-csv', cells: ['CSV', idCsv], tone: 'consume' },
                { id: 'b-pq', cells: ['Parquet', idPq], tone: 'store' },
              ],
            },
          ],
        },
      ],
    },
  ],
  edges: [{ from: 'csv', to: 'pq', label: 'write.parquet' }],
}
