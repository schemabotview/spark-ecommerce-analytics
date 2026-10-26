import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { cleanTree } from './tree'
import code from '../../../spine/clean/04-timezones/project/shopwave/silver.py?raw'
import session from '../../../spine/clean/04-timezones/session.txt?raw'

// §4 — time zones. Counts and the three example orders are the session's.
const out = outputOf(session, 'python -m explore.timezones')
const [, all, moved] = out.match(/orders: (\d+) · on another day locally: (\d+)/)!
const top = [...out.matchAll(/^ {2}([A-Z]{2}): (\d+)$/gm)].map((m) => [m[1], m[2]])
const examples = [...out.matchAll(/^([A-Z]{2}) (\d+): ([\d-]+ [\d:]+) UTC = ([\d-]+ [\d:]+) (\S+)$/gm)].map((m) => m.slice(1))

export const cleanTimezones: SceneModel = ideFrame({
  tree: cleanTree(['shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/timezones.py'],
    'shopwave/silver.py', ['explore/timezones.py']),
  editor: { file: 'shopwave/silver.py', code, ...view(code, 'def orders(', undefined, 0), highlight: [...linesFrom(code, 'zones = F.create_map', 'local = F.from_utc_timestamp'), ...linesFrom(code, 'F.to_date("order_ts").alias("order_date")', 'F.to_date(local)')] },
  session,
  side: [
    {
      type: 'table', id: 'examples', title: 'One instant, two days', tone: 'ingest', columns: ['order', 'UTC', 'the customer’s clock'],
      rows: examples.map(([c, id, utc, local, zone]) => ({ id: `x-${c}`, cells: [`${c} ${id}`, utc, `${local} ${zone.split('/')[1].replace('_', ' ')}`] })),
    },
    {
      type: 'group', id: 'flow', title: 'silver.orders', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'f-utc', title: 'order_ts, stored in UTC', sub: 'one moment, the same everywhere', icon: 'clock' },
        { type: 'item', id: 'f-zone', title: 'country → time zone', sub: 'create_map(TIMEZONES)', icon: 'globe' },
        { type: 'item', id: 'f-local', title: 'local_date', sub: 'from_utc_timestamp, then to_date', icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'moved', title: `${moved} of ${all} orders change day`, tone: 'consume', columns: ['country', 'orders'],
      rows: top.map(([c, k]) => ({ id: `m-${c}`, cells: [c, k] })),
    },
    { type: 'note', id: 'note', tone: 'ingest', text: 'Store instants in UTC, always. Turn them into a day only when the question names whose day: finance’s UTC day, or the customer’s.' },
  ],
  edges: [{ from: 'f-utc', to: 'f-zone' }, { from: 'f-zone', to: 'f-local' }],
})
