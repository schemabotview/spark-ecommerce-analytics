import type { SceneModel } from '@graphlearning/graphl-flow'
import { terminal } from '../ide'
import { outputOf } from '../lab'
import session from '../../../spine/ml/06-without-spark/session.txt?raw'
import evaluated from '../../../spine/ml/04-evaluate/session.txt?raw'

// §6 — ◆ full scene: when not to use Spark. The sizes, the RMSE and the time are the lab's
// (volatile: the scene reads them; the narration never says the seconds).
const out = outputOf(session, 'python -m explore.without_spark')
const [, ratings, mb] = out.match(/(\d+) ratings · ([\d.]+) MB in memory/)!
const [, columns, rmse] = out.match(/features: (\d+) columns · RMSE on the test months: ([\d.]+)/)!
const secs = out.match(/scored in ([\d.]+) s/)![1]
const als = evaluated.match(/the average \+ ALS\s+([\d.]+)/)![1]

export const mlWithoutSpark: SceneModel = {
  title: 'When not to use Spark',
  sub: `The same ratings, the same split: ${ratings} rows fit in ${mb} MB, so one Python process is enough`,
  nodes: [
    {
      type: 'group', id: 'sizes', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'small', badge: 1, title: 'Fits in one machine’s memory', icon: 'screen', tone: 'store', children: [
            { type: 'item', id: 's-pandas', title: 'pandas + scikit-learn', sub: `${ratings} ratings, ${mb} MB: here, in ${secs} s`, icon: 'pandas' },
            { type: 'item', id: 's-duck', title: 'or DuckDB, Polars', sub: 'one process, no JVM, no cluster', icon: 'duckdb' },
          ],
        },
        {
          type: 'group', id: 'big', badge: 2, title: 'Does not fit, or keeps growing', icon: 'server', tone: 'ingest', children: [
            { type: 'item', id: 'b-spark', title: 'Spark', sub: 'Courses 8 and 11: the year, a cluster', icon: 'spark' },
            { type: 'item', id: 'b-stream', title: 'or never stops arriving', sub: 'Course 9: a stream', icon: 'kafka' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'compare', title: 'RMSE on the same test months (10.4), in stars', tone: 'neutral', columns: ['model', 'features', 'RMSE'], rows: [
        { id: 'c-ridge', cells: ['Ridge, scikit-learn', `${columns} one-hot: customer × category, product`, rmse], tone: 'store' },
        { id: 'c-als', cells: ['the average + ALS, Spark', 'factors learned from the matrix', als] },
      ],
    },
    {
      type: 'group', id: 'proof', title: 'The lab, run: no Spark, no Java', icon: 'terminal', tone: 'neutral', children: [
        { type: 'code', id: 'out', terminal: true, filename: 'terminal — shopwave', code: terminal(session) },
      ],
    },
  ],
  edges: [{ from: 'small', to: 'big', label: 'outgrows' }],
}
