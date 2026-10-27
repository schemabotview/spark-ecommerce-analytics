import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { scaleTree } from './tree'
import code from '../../../spine/scale/07-skipping/project/explore/skipping.py?raw'
import session from '../../../spine/scale/07-skipping/session.txt?raw'

// §7 — data skipping. Lines, files read and files skipped are the session's.
const out = outputOf(session, 'python -m explore.skipping')
const lines = out.match(/Black Friday lines: (\d+)/)![1]
const [, read, total, skipped] = out.match(/files read: (\d+) of (\d+) · skipped by min\/max: (\d+)/)!

export const scaleSkipping: SceneModel = ideFrame({
  tree: scaleTree(['explore/skipping.py', 'out/sales/'], 'explore/skipping.py', ['explore/skipping.py'], { 'out/sales/': `Delta, ${total} files` }),
  editor: { file: 'explore/skipping.py', code, highlight: [...linesFrom(code, '(sales.repartitionByRange(48'), ...linesFrom(code, 'read = scan.metrics()')] },
  session,
  side: [
    {
      type: 'plot', id: 'plot', title: `Files for one day, of ${total}`, compact: true, x: { labels: ['read', 'skipped'] }, y: { label: 'files', min: 0, max: +total },
      series: [
        { kind: 'bar', points: [[0, +read]], tone: 'store' },
        { kind: 'bar', points: [[1, +skipped]], tone: 'infra' },
      ],
    },
    {
      type: 'group', id: 'how', title: `order_date = 2026-11-27: ${lines} lines`, icon: 'search', tone: 'ingest', children: [
        { type: 'item', id: 'h-stats', title: 'the log: min/max per file', sub: 'written with every add (7.2)', icon: 'layers' },
        { type: 'item', id: 'h-skip', title: `${skipped} files: the day outside their range`, sub: 'never opened', icon: 'filter' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Statistics only skip when a file holds a narrow range: repartitionByRange here, clustering on a real table. Random rows give every file the whole year.' },
  ],
  edges: [{ from: 'h-stats', to: 'h-skip' }],
})
