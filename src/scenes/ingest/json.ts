import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
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
const total = out.match(/events: (\d+)/)![1]
const kinds = [...out.matchAll(/^ {2}(\w+)\s+(\d+)$/gm)].map((m) => [m[1], m[2]])

export const ingestJson: SceneModel = ideFrame({
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
    {
      type: 'table', id: 'reach', title: 'Reaching inside', tone: 'serve', columns: ['write', 'gets'], rows: [
        { id: 'r-ctx', cells: ['col("context.campaign")', 'one field of the struct'] },
        { id: 'r-items', cells: ['size("items")', 'how many items'] },
        { id: 'r-first', cells: ['col("items")[0]', 'the first item'] },
      ],
    },
    {
      type: 'table', id: 'kinds', title: `2026-10-01: ${total} events`, tone: 'neutral', columns: ['event_type', 'events'],
      rows: kinds.map(([k, n]) => ({ id: `k-${k}`, cells: [k, n] })),
    },
  ],
  edges: [{ from: 'ev', to: 'shape', label: 'nested' }],
})
