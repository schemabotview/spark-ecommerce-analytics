import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { cleanTree } from './tree'
import code from '../../../spine/clean/04-timezones/project/shopwave/silver.py?raw'
import session from '../../../spine/clean/04-timezones/session.txt?raw'

// §4 — time zones. Counts and the three example orders are the session's.
const out = outputOf(session, 'python -m explore.timezones')
const [, all, moved] = out.match(/orders: (\d+) · on another day locally: (\d+)/)!

const examples = [...out.matchAll(/^([A-Z]{2}) (\d+): ([\d-]+ [\d:]+) UTC = ([\d-]+ [\d:]+) (\S+)$/gm)].map((m) => m.slice(1))

export const cleanTimezones: SceneModel = ideFrame2({
  model: 'Store UTC; report the local day',
  tree: cleanTree(['shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/timezones.py'],
    'shopwave/silver.py', ['explore/timezones.py']),
  editor: { file: 'shopwave/silver.py', code, ...view(code, 'def orders(', undefined, 0), highlight: [...linesFrom(code, 'zones = F.create_map', 'local = F.from_utc_timestamp'), ...linesFrom(code, 'F.to_date("order_ts").alias("order_date")', 'F.to_date(local)')] },
  session,
  side: [
    {
      type: 'table', id: 'examples', title: 'One instant, two days', tone: 'ingest', columns: ['order', 'UTC', 'local clock'],
      rows: examples.map(([c, id, utc, local]) => ({ id: `x-${c}`, cells: [`${c} ${id}`, utc.slice(5, 16), local.slice(5, 16)] })),
    },
    {
      type: 'group', id: 'flow', title: `silver.orders: ${moved} of ${all} move day`, icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'f-utc', title: 'order_ts, stored in UTC', sub: 'one moment, the same everywhere', icon: 'clock' },
        { type: 'item', id: 'f-zone', title: 'country → time zone', sub: 'create_map(TIMEZONES)', icon: 'globe' },
        { type: 'item', id: 'f-local', title: 'local_date', sub: 'from_utc_timestamp, then to_date', icon: 'check', tone: 'store' },
      ],
    },
  ],
  edges: [{ from: 'f-utc', to: 'f-zone' }, { from: 'f-zone', to: 'f-local' }],
})
