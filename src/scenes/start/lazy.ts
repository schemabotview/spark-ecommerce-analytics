import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { explorer } from './tree'
import code from '../../../spine/start/04-lazy/project/lazy.py?raw'
import session from '../../../spine/start/04-lazy/session.txt?raw'

// §4 — transformations and actions. lazy.py prints how many jobs Spark has run after each line;
// the plan's job counts are parsed from that output, never typed. session.py takes the builder out
// of first_job.py from here on.
const out = outputOf(session, 'python lazy.py')
const after = (label: string) => out.match(new RegExp(`${label}:\\s+(\\d+) jobs?`))![1]
const read = after('read October'), paid = after('kept paid orders'), german = after('kept German ones'), counted = after('after count\\(\\)')
const count = out.match(/count\(\): (\d+)/)![1]
const jobs = (n: string) => `${n} job${n === '1' ? '' : 's'} so far`

export const startLazy: SceneModel = ideFrame({
  tree: explorer({ conf: 'plain', logs: true, session: 'new', py: [['first_job.py', undefined], ['lazy.py', 'active']] }),
  editor: { file: 'lazy.py', code, highlight: [lineOf(code, 'paid = '), lineOf(code, 'german = '), lineOf(code, 'german.count()')] },
  session,
  side: [
    {
      type: 'group', id: 'plan', title: 'The plan grows; nothing runs', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'p-read', title: 'spark.read.csv(…)', sub: `${jobs(read)}: it opened one file for the header`, icon: 'file' },
        { type: 'item', id: 'p-paid', title: 'filter: paid', sub: `transformation · still ${jobs(paid)}`, icon: 'filter' },
        { type: 'item', id: 'p-german', title: 'filter: DE · select 2 columns', sub: `transformation · still ${jobs(german)}`, icon: 'filter' },
        { type: 'item', id: 'p-count', title: `count() → ${count}`, sub: `action · now ${jobs(counted)}`, icon: 'zap', tone: 'infra' },
      ],
    },
    {
      type: 'table', id: 'kinds', title: 'Two kinds of method', tone: 'ingest', columns: ['kind', 'returns', 'examples'], rows: [
        { id: 'k-t', cells: ['transformation', 'a new DataFrame, at once', 'filter, select, groupBy'] },
        { id: 'k-a', cells: ['action', 'an answer: runs a job', 'count, show, write'], tone: 'infra' },
      ],
    },
    {
      type: 'table', id: 'actions', title: 'Actions so far in the course', tone: 'infra', columns: ['action', 'in', 'answer'], rows: [
        { id: 'a-show', cells: ['show(3)', 'first_job.py', 'prints 3 rows'] },
        { id: 'a-count', cells: ['count()', 'lazy.py', `${count} rows`], tone: 'infra' },
        { id: 'a-write', cells: ['write.csv(…)', 'next section', 'files on disk'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'ingest', text: 'A DataFrame is a plan, not data. An action hands the whole plan to Spark, which can then read only the columns and rows the plan needs.' },
  ],
  edges: [
    { from: 'p-read', to: 'p-paid' },
    { from: 'p-paid', to: 'p-german' },
    { from: 'p-german', to: 'p-count' },
  ],
})
