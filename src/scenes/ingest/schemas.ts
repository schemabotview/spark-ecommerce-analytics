import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { ingestTree } from './tree'
import code from '../../../spine/ingest/01-schemas/project/shopwave/schemas.py?raw'
import session from '../../../spine/ingest/01-schemas/session.txt?raw'

// §1 — a declared schema. Every value is the session's: the two reads' job counts, the types each
// way, and one day's revenue as a double next to the same sum as a decimal.
const out = outputOf(session, 'python -m explore.infer')
const jobs = (who: string) => out.match(new RegExp(`${who}:\\s+jobs to read: (\\d+)`))![1]
const types = (who: string) => out.match(new RegExp(`${who}\\s+order_id (\\S+), total (\\S+)`))!.slice(1)
const [gId, gTotal] = types('guessed'), [dId, dTotal] = types('declared')
const [, day, double, decimal] = out.match(/([\d-]+): double ([\d.]+), decimal ([\d.]+)/)!

export const ingestSchemas: SceneModel = ideFrame2({
  model: 'Declare the types; never guess',
  tree: ingestTree(['shopwave/__init__.py', 'shopwave/schemas.py', 'shopwave/session.py', 'explore/infer.py'], 'shopwave/schemas.py',
    ['shopwave/__init__.py', 'shopwave/schemas.py', 'explore/infer.py']),
  editor: { file: 'shopwave/schemas.py', code, highlight: [lineOf(code, 'MONEY = '), ...linesFrom(code, 'ORDERS = ', '"total", MONEY')] },
  session,
  side: [
    {
      type: 'group', id: 'reads', title: 'Two ways to read October', icon: 'file', tone: 'ingest', children: [
        { type: 'item', id: 'guess', title: 'inferSchema=True', sub: `${jobs('guessed')} jobs: reads all the data to guess`, icon: 'search', tone: 'consume' },
        { type: 'item', id: 'declare', title: 'schema=ORDERS', sub: `${jobs('declared')} jobs: nothing to guess`, icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'money', title: `${day}: the day's revenue`, tone: 'consume', columns: ['summed as', 'result'], rows: [
        { id: 'm-double', cells: ['double', double], tone: 'consume' },
        { id: 'm-decimal', cells: ['decimal(10,2)', decimal], tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'types', title: 'What each read decided', tone: 'ingest', columns: ['column', 'guessed', 'declared'], rows: [
        { id: 't-id', cells: ['order_id', gId, dId] },
        { id: 't-total', cells: ['total', gTotal, dTotal], tone: 'consume' },
      ],
    },
  ],
  edges: [{ from: 'guess', to: 'declare', label: 'instead' }, { from: 'declare', to: 'money', label: 'sums exactly' }],
})
