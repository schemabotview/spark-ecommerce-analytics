import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { analyticsTree } from './tree'
import code from '../../../spine/analytics/08-attribution/project/shopwave/analytics.py?raw'
import session from '../../../spine/analytics/08-attribution/session.txt?raw'

// §8 — last-touch attribution. Campaign windows and credited revenue are the session's.
const out = outputOf(session, 'python -m explore.attribution')
const camps = [...out.matchAll(/(\S+) \((\d\d-\d\d)→(\d\d-\d\d)\)/g)].map((m) => m.slice(1))
const credit = [...out.matchAll(/^(\S+)\s+(\w+)\s+(\d+) sales\s+€\s+([\d.]+)$/gm)].map((m) => m.slice(1))

export const analyticsAttribution: SceneModel = ideFrame({
  tree: analyticsTree(['shopwave/analytics.py', 'shopwave/bronze.py', 'explore/attribution.py', 'explore/rfm.py'], 'shopwave/analytics.py', ['explore/attribution.py'],
    { 'shopwave/bronze.py': '+ campaigns' }),
  editor: { file: 'shopwave/analytics.py', code, ...view(code, 'def attribution(', undefined, 0), highlight: [...linesFrom(code, 'touched = visits.withColumn', '"touch", F.last'), ...linesFrom(code, 'running = (F.col("touch")', 'return bought.join')] },
  session,
  side: [
    {
      type: 'table', id: 'credit', title: 'October’s sales, credited', tone: 'store', columns: ['campaign', 'channel', 'sales', 'revenue'],
      rows: credit.map(([c, ch, n, r]) => ({ id: `r-${c.replace(/[()]/g, '')}`, cells: [c, ch, n, `€ ${r}`] })),
    },
    {
      type: 'group', id: 'how', title: 'Last touch, in two steps', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'h-last', title: 'last(campaign, ignorenulls) so far', sub: 'within the session, up to each event', icon: 'clock' },
        { type: 'item', id: 'h-range', title: 'join campaigns on a range', sub: 'touch = id AND date BETWEEN start AND end', icon: 'filter', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'camps', title: 'Campaigns (bronze: multi-line JSON)', tone: 'neutral', columns: ['campaign', 'runs'],
      rows: camps.map(([c, a, b]) => ({ id: `c-${c}`, cells: [c, `${a} → ${b}`] })),
    },
    { type: 'note', id: 'note', tone: 'store', text: 'In October only the newsletter and retargeting were running: a click still named black-friday would fall outside its dates and earn nothing.' },
  ],
  edges: [{ from: 'h-last', to: 'h-range' }],
})
