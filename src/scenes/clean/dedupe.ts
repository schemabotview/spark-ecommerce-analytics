import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { cleanTree } from './tree'
import code from '../../../spine/clean/03-dedupe/project/shopwave/silver.py?raw'
import session from '../../../spine/clean/03-dedupe/session.txt?raw'

// §3 — deduplication. The counts are the session's.
const out = outputOf(session, 'python -m explore.dedupe')
const n = (label: string) => out.match(new RegExp(`${label}:\\s+(\\d+)`))![1]
const bronze = n('bronze events'), distinct = n('distinct ids'), twice = n('sent twice'), silver = n('silver events')

export const cleanDedupe: SceneModel = ideFrame2({
  model: 'One row per event_id',
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
  ],
  edges: [{ from: 'h-shuffle', to: 'h-keep' }, { from: 'h-keep', to: 'h-out' }],
})
