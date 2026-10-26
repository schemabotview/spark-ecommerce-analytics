import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { cleanTree } from './tree'
import code from '../../../spine/clean/03-dedupe/project/shopwave/silver.py?raw'
import session from '../../../spine/clean/03-dedupe/session.txt?raw'

// §3 — deduplication. The counts are the session's.
const out = outputOf(session, 'python -m explore.dedupe')
const n = (label: string) => out.match(new RegExp(`${label}:\\s+(\\d+)`))![1]
const bronze = n('bronze events'), distinct = n('distinct ids'), twice = n('sent twice'), silver = n('silver events')

export const cleanDedupe: SceneModel = ideFrame({
  tree: cleanTree(['shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/dedupe.py', 'explore/nulls.py'],
    'shopwave/silver.py', ['explore/dedupe.py']),
  editor: { file: 'shopwave/silver.py', code, ...view(code, 'def clicks(', undefined, 0), highlight: linesFrom(code, 'The tracker sends some events twice', 'dropDuplicates') },
  session,
  side: [
    {
      type: 'group', id: 'how', title: 'dropDuplicates(["event_id"])', icon: 'filter', tone: 'ingest', children: [
        { type: 'item', id: 'h-shuffle', title: 'rows with the same event_id meet', sub: 'a shuffle by event_id, like a groupBy', icon: 'layers', tone: 'infra' },
        { type: 'item', id: 'h-keep', title: 'one row per id is kept', sub: 'any one of them: here, true copies', icon: 'check', tone: 'store' },
        { type: 'item', id: 'h-out', title: 'silver.clicks', sub: 'each event exactly once', icon: 'table', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'counts', title: 'October’s clicks', tone: 'ingest', columns: ['', 'rows'], rows: [
        { id: 'c-bronze', cells: ['bronze events', bronze] },
        { id: 'c-ids', cells: ['distinct event ids', distinct] },
        { id: 'c-twice', cells: ['ids sent twice', twice], tone: 'consume' },
        { id: 'c-silver', cells: ['silver events', silver], tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'when', title: 'Which tool', tone: 'neutral', columns: ['the copies are', 'use'], rows: [
        { id: 'w-same', cells: ['identical, same id', 'dropDuplicates([id])'] },
        { id: 'w-diff', cells: ['different: keep the first', 'a window: Course 6'] },
        { id: 'w-all', cells: ['identical in every column', 'dropDuplicates()'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'ingest', text: 'dropDuplicates keeps whichever copy it meets first. That is fine for exact copies of one event; it is wrong when the rows differ, like two payments for one order.' },
  ],
  edges: [{ from: 'h-shuffle', to: 'h-keep' }, { from: 'h-keep', to: 'h-out' }],
})
