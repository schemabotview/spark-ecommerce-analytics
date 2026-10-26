import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
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

export const cleanQuality: SceneModel = ideFrame({
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
    ...[['run1', 'Default: lose at most 2%', gates(ok)], ['run2', `SHOPWAVE_MAX_LOSS=0.001: exit code ${code1}`, gates(strict)]].map(([id, title, rows]) => ({
      type: 'table' as const, id: id as string, title: title as string, tone: 'ingest' as const, columns: ['', 'table', 'rows in → out', 'dropped'],
      rows: (rows as string[][]).map(([mark, t, a, b, loss]) => ({ id: `${id}-${t}`, cells: [mark, t, `${a} → ${b}`, loss], tone: mark === '✗' ? 'consume' as const : undefined })),
    })),
    {
      type: 'table', id: 'checks', title: 'What a gate checks', tone: 'neutral', columns: ['check', 'fails when'], rows: [
        { id: 'k-loss', cells: ['rows lost', 'more than MAX_LOSS'] },
        { id: 'k-null', cells: ['key columns', 'any null'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'ingest', text: 'A gate turns "the job ran" into "the data is right". The exit code lets a scheduler stop everything downstream of a bad table.' },
  ],
  edges: [{ from: 'f-build', to: 'f-gate' }, { from: 'f-gate', to: 'f-write' }],
})
