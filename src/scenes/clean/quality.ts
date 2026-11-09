import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { cleanTree } from './tree'
import code from '../../../spine/clean/08-quality-gates/project/shopwave/quality.py?raw'
import session from '../../../spine/clean/08-quality-gates/session.txt?raw'

// §8 — quality gates and the silver writer. Both runs' gate lines are the session's.
const ok = outputOf(session, 'python -m shopwave.silver')
const strict = outputOf(session, 'SHOPWAVE_MAX_LOSS=0.001 python -m shopwave.silver; echo "exit code $?"')
const gates = (text: string) => [...text.matchAll(/^([✓✗]) (\w+)\s+(\d+) →\s+(\d+) rows \(([\d.]+%) dropped, max ([\d.]+%)\)/gm)].map((m) => m.slice(1))
const written = ok.match(/silver: written (.+)/)![1].split(', ')
const code1 = strict.match(/exit code (\d+)/)![1]

export const cleanQuality: SceneModel = ideFrame2({
  model: 'A gate before every write',
  tree: cleanTree(['lake/silver/', 'shopwave/bronze.py', 'shopwave/quality.py', 'shopwave/session.py', 'shopwave/silver.py'],
    'shopwave/quality.py', ['lake/silver/', 'shopwave/quality.py'], { 'lake/silver/': `${written.length} tables` }),
  editor: { file: 'shopwave/quality.py', code, highlight: linesFrom(code, 'rows = df.count()', 'ok = loss <= MAX_LOSS') },
  session,
  side: [
    {
      type: 'group', id: 'flow', title: 'python -m shopwave.silver', icon: 'shield', tone: 'ingest', children: [
        { type: 'item', id: 'f-build', title: 'build silver from bronze', sub: 'nothing written yet', icon: 'workflow' },
        { type: 'item', id: 'f-gate', title: 'gate each table', sub: 'rows lost · nulls in key columns', icon: 'shield' },
        { type: 'item', id: 'f-write', title: 'all pass: write lake/silver', sub: 'one fails: exit 1, nothing written', icon: 'disk', tone: 'store' },
      ],
    },
    ...[['run2', `MAX_LOSS=0.001: exit code ${code1}`, gates(strict)]].map(([id, title, rows]) => ({
      type: 'table' as const, id: id as string, title: title as string, tone: 'ingest' as const, columns: ['', 'table', 'rows in → out', 'dropped'],
      rows: (rows as string[][]).map(([mark, t, a, b, loss]) => ({ id: `${id}-${t}`, cells: [mark, t, `${a} → ${b}`, loss], tone: mark === '✗' ? 'consume' as const : undefined })),
    })),
  ],
  edges: [{ from: 'f-build', to: 'f-gate' }, { from: 'f-gate', to: 'f-write' }],
})
