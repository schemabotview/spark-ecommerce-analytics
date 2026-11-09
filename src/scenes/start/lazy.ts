import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
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

export const startLazy: SceneModel = ideFrame2({
  model: 'Transformations plan; actions run',
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
      type: 'table', id: 'kinds', title: 'Two kinds of method', tone: 'ingest', columns: ['kind', 'returns'], rows: [
        { id: 'k-t', cells: ['filter, select', 'a DataFrame, at once'] },
        { id: 'k-a', cells: ['count, show', 'an answer: a job'], tone: 'infra' },
      ],
    },
  ],
  edges: [
    { from: 'p-read', to: 'p-paid' },
    { from: 'p-paid', to: 'p-german' },
    { from: 'p-german', to: 'p-count' },
  ],
})
