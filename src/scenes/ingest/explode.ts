import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf } from '../ide'
import { outputOf } from '../lab'
import { ingestTree } from './tree'
import code from '../../../spine/ingest/04-explode/project/explore/explode.py?raw'
import session from '../../../spine/ingest/04-explode/session.txt?raw'

// §4 — explode. The counts are the session's; the purchase drawn is the first one shown, with
// as many item rows as the table printed for its event id.
const out = outputOf(session, 'python -m explore.explode')
const [, events, withItems] = out.match(/events: (\d+) · with items: (\d+)/)!
const [, exploded, outer] = out.match(/explode: (\d+) rows · explode_outer: (\d+) rows/)!
const rows = [...out.matchAll(/^\|(\w+\.\.\.)\|\s*(\d+)\|\s*(\d+)\|\s*([\d.]+)\|$/gm)].map((m) => m.slice(1))
const first = rows.filter((r) => r[0] === rows[0][0])

export const ingestExplode: SceneModel = ideFrame({
  tree: ingestTree(['shopwave/__init__.py', 'shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'explore/clicks.py', 'explore/explode.py', 'explore/infer.py', 'explore/returns.py'],
    'explore/explode.py', ['explore/explode.py']),
  editor: { file: 'explore/explode.py', code, highlight: [lineOf(code, 'F.explode("items")'), lineOf(code, 'F.explode_outer')] },
  session,
  side: [
    {
      type: 'group', id: 'one', title: `One purchase, ${first.length} items`, icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'ev', title: `event ${first[0][0]}`, sub: `items: [${first.length} objects]`, icon: 'box' },
        {
          type: 'table', id: 'rows', title: 'explode("items")', tone: 'infra', columns: ['product_id', 'qty', 'price'],
          rows: first.map(([, p, q, price], i) => ({ id: `r${i}`, cells: [p, q, price] })),
        },
      ],
    },
    {
      type: 'table', id: 'counts', title: 'Counted on 2026-10-01', tone: 'ingest', columns: ['', 'rows'], rows: [
        { id: 'c-events', cells: ['events', events] },
        { id: 'c-items', cells: ['events with items', withItems] },
        { id: 'c-explode', cells: ['explode: one row per item', exploded], tone: 'infra' },
        { id: 'c-outer', cells: ['explode_outer: + empty lists, as null', outer] },
      ],
    },
    {
      type: 'table', id: 'which', title: 'Which one', tone: 'infra', columns: ['the question', 'use'], rows: [
        { id: 'w-sold', cells: ['what was sold, per product', 'explode'] },
        { id: 'w-events', cells: ['every event, with its items', 'explode_outer'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'infra', text: `explode drops the ${+events - +withItems} events with an empty list; explode_outer keeps each as one row with a null item. Pick on purpose.` },
  ],
  edges: [{ from: 'ev', to: 'rows', label: 'explode' }],
})
