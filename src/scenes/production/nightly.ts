import type { SceneModel } from '@graphlearning/graphl-flow'
import { outputOf } from '../lab'
import session from '../../../spine/production/06-nightly/session.txt?raw'

// §6 — the whole platform, one night: the platform map, every stage lit by the run's own ✓ lines.
const out = outputOf(session, 'python -m shopwave.jobs nightly')
const ran = new Map([...out.matchAll(/^([✓✗]) (\w+)\s+(.+)$/gm)].map(([, mark, job, what]) => [job, { mark, what }]))
const tables = outputOf(session, 'ls lake/gold').trim().split('\n')
const lit = (job: string) => ran.get(job)?.mark === '✓' ? 'store' as const : 'consume' as const
const job = (id: string, name: string, icon: 'disk' | 'filter' | 'table' | 'check' | 'clock' | 'layers' | 'brain') =>
  ({ type: 'item' as const, id, title: `${ran.get(name)?.mark ?? '·'} ${name}`, sub: ran.get(name)?.what ?? '', icon, tone: lit(name) })

export const productionNightly: SceneModel = {
  title: 'The whole platform, one night',
  sub: `python -m shopwave.jobs nightly: ${ran.size} jobs, one SparkSession, ${tables.length} gold tables`,
  nodes: [
    {
      type: 'group', id: 'map', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'in', badge: 1, title: 'Land and clean', icon: 'database', tone: 'neutral', children: [
            job('j-bronze', 'bronze', 'disk'), job('j-silver', 'silver', 'filter'),
          ],
        },
        {
          type: 'group', id: 'gold', badge: 2, title: 'Gold, then checked', icon: 'table', tone: 'neutral', children: [
            job('j-gold', 'gold', 'table'), job('j-checks', 'checks', 'check'),
          ],
        },
        {
          type: 'group', id: 'keep', badge: 3, title: 'Kept current', icon: 'layers', tone: 'neutral', children: [
            job('j-orders', 'orders', 'clock'), job('j-changes', 'changes', 'layers'), job('j-recommend', 'recommend', 'brain'),
          ],
        },
      ],
    },
    {
      type: 'group', id: 'tables', title: 'lake/gold after the night', icon: 'folder', tone: 'store', dir: 'row',
      children: tables.map((t) => ({ type: 'item' as const, id: `t-${t}`, title: t, chip: true, tone: 'store' as const })),
    },
  ],
  edges: [
    { from: 'j-bronze', to: 'j-silver' },
    { from: 'in', to: 'gold', label: 'silver' },
    { from: 'j-gold', to: 'j-checks' },
    { from: 'gold', to: 'keep', label: 'passed' },
  ],
}
