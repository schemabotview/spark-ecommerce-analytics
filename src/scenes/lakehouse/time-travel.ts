import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { lakeTree } from './tree'
import code from '../../../spine/lakehouse/07-time-travel/project/explore/time_travel.py?raw'
import session from '../../../spine/lakehouse/07-time-travel/session.txt?raw'

// §7 — time travel and RESTORE. The history and every count are the session's.
const out = outputOf(session, 'python -m explore.time_travel')
const today = out.match(/today: (\d+) orders/)![1]
const bad = out.match(/after the bad load: (\d+) orders/)![1]
const versions = [...out.matchAll(/version (\d+): (\w+)\s+(\w*)/g)].map(([, v, op, mode]) => ({ v, op, mode }))
const [, asOf, read] = out.match(/version (\d+), read as it was: (\d+)/)!
const [, restored, as] = out.match(/restored: (\d+) orders, as version (\d+)/)!
const last = versions[versions.length - 1].v

export const lakehouseTimeTravel: SceneModel = ideFrame({
  tree: lakeTree(['explore/time_travel.py', 'lake/gold/orders/'], 'explore/time_travel.py', ['explore/time_travel.py'], { 'lake/gold/orders/': 'Delta' }),
  editor: { file: 'explore/time_travel.py', code, highlight: [...linesFrom(code, 'one_day.write'), ...linesFrom(code, 'print(f"version {before}', 'orders.restoreToVersion')] },
  session,
  side: [
    {
      type: 'table', id: 'history', title: 'DESCRIBE HISTORY gold/orders', tone: 'store', columns: ['version', 'operation', 'rows after'],
      rows: [
        ...versions.map((h) => ({
          id: `v${h.v}`, cells: [h.v, `${h.op} ${h.mode}`, h.v === last ? bad : h.v === asOf ? read : '—'],
          tone: h.v === last ? 'consume' as const : h.v === asOf ? 'store' as const : undefined,
        })),
        { id: `v${as}`, cells: [as, `RESTORE to ${asOf}`, restored], tone: 'store' as const },
      ],
    },
    {
      type: 'group', id: 'steps', title: 'The morning after', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 's-bug', title: `a bad load: ${today} → ${bad} orders`, sub: 'overwrite where append was meant', icon: 'zap', tone: 'consume' },
        { type: 'item', id: 's-read', title: `versionAsOf=${asOf}: ${read}`, sub: 'the old files are still there; the log says which', icon: 'search' },
        { type: 'item', id: 's-restore', title: `RESTORE: version ${as}`, sub: 'a new commit; the history keeps the mistake', icon: 'layers', tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 's-bug', to: 's-read' },
    { from: 's-read', to: 's-restore' },
  ],
})
