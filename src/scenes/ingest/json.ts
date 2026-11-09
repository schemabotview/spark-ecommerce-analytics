import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { ingestTree } from './tree'
import code from '../../../spine/ingest/03-json/project/shopwave/schemas.py?raw'
import session from '../../../spine/ingest/03-json/session.txt?raw'

// §3 — nested JSON. The side pane draws one event's shape (CLICKS), and the guessed and declared
// types and the day's counts are read from the session.
const out = outputOf(session, 'python -m explore.clicks')
const ts = (who: string) => out.match(new RegExp(`${who}: event_ts (\\S+)`))![1]
const items = [...out.matchAll(/ {2}items (\S+)/g)].map((m) => m[1])

export const ingestJson: SceneModel = ideFrame2({
  model: 'Nested data, declared',
  tree: ingestTree(['shopwave/__init__.py', 'shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'explore/clicks.py', 'explore/infer.py', 'explore/returns.py'],
    'shopwave/schemas.py', ['explore/clicks.py']),
  editor: { file: 'shopwave/schemas.py', code, ...view(code, 'CLICKS = ', undefined, 0), highlight: [lineOf(code, '"context", StructType'), ...linesFrom(code, '"items", ArrayType', 'MONEY),')] },
  session,
  side: [
    {
      type: 'group', id: 'event', title: 'One event, as CLICKS declares it', icon: 'code', tone: 'ingest', children: [
        { type: 'item', id: 'ev', title: 'event_id · event_ts · event_type · user_id …', sub: 'plain columns', icon: 'table' },
        {
          type: 'group', id: 'shape', bare: true, children: [
            { type: 'item', id: 'ctx', title: 'context: a struct', sub: 'device, browser, campaign…', icon: 'box', tone: 'serve' },
            { type: 'item', id: 'items', title: 'items: an array', sub: 'of product_id, qty, price', icon: 'layers', tone: 'infra' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'types', title: 'Guessed or declared', tone: 'ingest', columns: ['', 'event_ts', 'price'], rows: [
        { id: 'g', cells: ['guessed', ts('guessed'), items[0].match(/price:(\w+)/)![1]], tone: 'consume' },
        { id: 'd', cells: ['declared', ts('declared'), items[1].match(/price:([\w(),]+?)>/)![1]], tone: 'store' },
      ],
    },
  ],
  edges: [{ from: 'ev', to: 'shape', label: 'nested' }],
})
