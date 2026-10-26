import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { explorer } from './tree'
import code from '../../../spine/start/02-first-dataframe/project/first_job.py?raw'
import session from '../../../spine/start/02-first-dataframe/session.txt?raw'

// §2 — a SparkSession and the first DataFrame. The schema table is the session's own `dtypes` line,
// parsed: every column a string, because a CSV carries no types (Course 3 gives orders a schema).
const out = outputOf(session, 'python first_job.py')
const dtypes = [...out.split('\n').at(-1)!.matchAll(/\('(\w+)', '(\w+)'\)/g)].map((m) => [m[1], m[2]])
const shown = out.match(/only showing top (\d+) rows/)![1]

export const startFirstDataframe: SceneModel = ideFrame({
  tree: explorer({ conf: 'new', py: [['first_job.py', 'active']] }),
  editor: { file: 'first_job.py', code, highlight: [...linesFrom(code, 'SparkSession.builder', '.getOrCreate()'), lineOf(code, 'spark.read.csv')] },
  session,
  side: [
    {
      type: 'group', id: 'flow', title: 'python first_job.py', icon: 'terminal', tone: 'ingest', children: [
        { type: 'item', id: 'f-builder', title: 'SparkSession.builder', sub: 'starts Spark: a JVM, local[4]', icon: 'spark' },
        { type: 'item', id: 'f-read', title: 'spark.read.csv(…, header=True)', sub: 'line 1 holds the column names', icon: 'file' },
        { type: 'item', id: 'f-df', title: 'orders: a DataFrame', sub: `rows and named columns; show(${shown}) prints ${shown}`, icon: 'table' },
      ],
    },
    {
      type: 'table', id: 'settings', title: 'The builder, line by line', tone: 'ingest', columns: ['setting', 'means'], rows: [
        { id: 's-master', cells: ['master("local[4]")', 'this machine, 4 tasks at a time'] },
        { id: 's-name', cells: ['appName("shopwave")', 'labels the run in Spark’s log'] },
        { id: 's-log', cells: ['extraJavaOptions', 'Spark’s log → logs/spark.log'] },
        { id: 's-get', cells: ['getOrCreate()', 'starts the JVM, or reuses it'] },
      ],
    },
    {
      type: 'table', id: 'schema', title: 'orders.dtypes', tone: 'consume', columns: ['column', 'type'],
      rows: dtypes.map(([name, type]) => ({ id: `c-${name}`, cells: [name, type], tone: name === 'total' ? 'consume' as const : undefined })),
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Every column is a string, even total. A CSV file is only text, and Spark guesses nothing unless asked to: Course 3 gives orders a real schema.' },
  ],
  edges: [
    { from: 'f-builder', to: 'f-read' },
    { from: 'f-read', to: 'f-df' },
  ],
})
