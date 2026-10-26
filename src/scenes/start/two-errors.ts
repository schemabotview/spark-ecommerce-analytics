import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { explorer } from './tree'
import code from '../../../spine/start/06-two-errors/project/two_errors.py?raw'
import session from '../../../spine/start/06-two-errors/session.txt?raw'

// §6 — two kinds of error. The step is volatile (which row a task trips on, the log's time and
// count can change), so every value below is read from the session.
const out = outputOf(session, 'python two_errors.py')
const [, kind1, cond1] = out.match(/1\. select: (\w+) (\S+)/)!
const [, kind2, cond2] = out.match(/show: (\w+) (\S+)/)!
const value = out.match(/value: (.+)/)![1]
const errors = outputOf(session, 'grep -c ERROR logs/spark.log').trim()
const task = outputOf(session, 'grep -m1 "ERROR Executor" logs/spark.log').match(/in (task [\d.]+ in stage [\d.]+)/)![1]

export const startTwoErrors: SceneModel = ideFrame({
  tree: explorer({ conf: 'plain', logs: true, out: true, session: 'plain', py: [['first_job.py', undefined], ['lazy.py', undefined], ['daily_revenue.py', undefined], ['two_errors.py', 'active']] }),
  editor: { file: 'two_errors.py', code, highlight: [lineOf(code, 'F.col("totl")'), lineOf(code, 'euros.show(3)')] },
  session,
  side: [
    {
      type: 'group', id: 'where', title: 'Where each error is found', icon: 'search', tone: 'ingest', children: [
        { type: 'item', id: 'w-plan', title: 'building the plan', sub: 'the driver checks every name', icon: 'workflow' },
        { type: 'item', id: 'w-err1', title: `1. ${kind1}`, sub: 'at select: before any job runs', icon: 'bell', tone: 'consume' },
        { type: 'item', id: 'w-run', title: 'running the plan', sub: 'tasks read the rows', icon: 'cpu' },
        { type: 'item', id: 'w-err2', title: `2. ${kind2}`, sub: `at show: in ${task}`, icon: 'bell', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'conditions', title: 'Each error names its condition', tone: 'consume', columns: ['', 'condition', 'about'], rows: [
        { id: 'e1', cells: ['1', cond1, '`totl`: did you mean `total`?'] },
        { id: 'e2', cells: ['2', cond2, `${value} is not an int`] },
      ],
    },
    {
      type: 'table', id: 'log', title: 'The rest is in logs/spark.log', tone: 'neutral', columns: ['asked', 'answer'], rows: [
        { id: 'l-count', cells: ['grep -c ERROR', `${errors} lines`] },
        { id: 'l-first', cells: ['grep -m1 "ERROR Executor"', task] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'A wrong name fails as you write the line; a wrong value fails only when a task meets it. Search for the condition, and read logs/spark.log for the task’s full stack trace.' },
  ],
  edges: [
    { from: 'w-plan', to: 'w-err1' },
    { from: 'w-err1', to: 'w-run' },
    { from: 'w-run', to: 'w-err2' },
  ],
})
