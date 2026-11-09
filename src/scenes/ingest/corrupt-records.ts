import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { ingestTree } from './tree'
import code from '../../../spine/ingest/02-corrupt-records/project/shopwave/bronze.py?raw'
import session from '../../../spine/ingest/02-corrupt-records/session.txt?raw'

// §2 — the returns file: Latin-1, three malformed lines. The decoded reasons and every bad line are
// the session's. ö and ß are one byte each in Latin-1 (0xF6, 0xDF), which UTF-8 cannot decode.
const out = outputOf(session, 'python -m explore.returns')
const [, good, bad] = out.match(/lines: (\d+) good, (\d+) bad/)!
const badLines = [...out.matchAll(/bad: (.+)/g)].map((m) => m[1])
const why = (line: string) => line.includes('"') ? 'a quote never closed' : line.split(',').length < 5 ? 'fields missing' : 'not a date: dd/mm/yyyy'

export const ingestCorruptRecords: SceneModel = ideFrame2({
  model: 'PERMISSIVE: keep every line',
  tree: ingestTree(['shopwave/__init__.py', 'shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'explore/infer.py', 'explore/returns.py'],
    'shopwave/bronze.py', ['shopwave/bronze.py', 'explore/returns.py']),
  editor: { file: 'shopwave/bronze.py', code, highlight: linesFrom(code, 'rows = spark.read.csv(', '.cache()') },
  session,
  side: [
    {
      type: 'group', id: 'split', title: `${+good + +badLines.length} lines, mode PERMISSIVE`, icon: 'filter', tone: 'ingest', children: [
        { type: 'item', id: 'file', title: 'returns-2026-10.csv', sub: 'decoded as Latin-1, parsed with RETURNS', icon: 'file' },
        { type: 'item', id: 'good', title: `${good} good`, sub: 'typed columns, into bronze', icon: 'check', tone: 'store' },
        { type: 'item', id: 'bad', title: `${bad} bad`, sub: 'the whole line, in _corrupt_record', icon: 'bell', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'badlines', title: 'The bad lines, and why', tone: 'consume', columns: ['return', 'why'],
      rows: badLines.map((l, i) => ({ id: `b${i}`, cells: [l.split(',')[0], why(l)] })),
    },
  ],
  edges: [{ from: 'file', to: 'good', label: 'parsed' }, { from: 'good', to: 'bad', label: 'else' }],
})
