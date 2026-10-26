import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
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
const [, inexact] = out.match(/not whole cents: (\d+) of 31 days/)!
const [, day, double, decimal] = out.match(/([\d-]+): double ([\d.]+), decimal ([\d.]+)/)!

export const ingestSchemas: SceneModel = ideFrame({
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
      type: 'table', id: 'types', title: 'What each read decided', tone: 'ingest', columns: ['column', 'guessed', 'declared'], rows: [
        { id: 't-id', cells: ['order_id', gId, dId] },
        { id: 't-total', cells: ['total', gTotal, dTotal], tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'orders', title: 'ORDERS, declared', tone: 'store', columns: ['column', 'type', 'why'], rows: [
        ['order_id', 'long', 'ids outgrow an int'],
        ['order_ts', 'timestamp', 'a moment, in UTC'],
        ['customer_id', 'long', ''],
        ['country · status', 'string', ''],
        { id: 'o-total', cells: ['total', 'MONEY', 'decimal(10, 2): exact cents'], tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'money', title: `${day}: the day's revenue`, tone: 'consume', columns: ['summed as', 'result'], rows: [
        { id: 'm-double', cells: ['double', double], tone: 'consume' },
        { id: 'm-decimal', cells: ['decimal(10,2)', decimal], tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: `A double stores most cents only approximately: ${inexact} of October's 31 daily sums came out a hair off. Money is a decimal, declared once in schemas.py.` },
  ],
  edges: [{ from: 'guess', to: 'declare', label: 'instead' }],
})
