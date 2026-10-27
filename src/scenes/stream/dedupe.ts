import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { streamTree } from './tree'
import code from '../../../spine/stream/07-dedupe/project/explore/stream_dedupe.py?raw'
import session from '../../../spine/stream/07-dedupe/session.txt?raw'

// §7 — streaming deduplication. Every count is the session's, from the query's progress reports.
const out = outputOf(session, 'python -m explore.stream_dedupe')
const [, read, kept, , copies] = out.match(/read (\d+) · kept (\d+) · distinct ids (\d+) · copies dropped (\d+)/)!
const held = out.match(/ids held in state: (\d+)/)![1]
const late = +read - +kept - +copies

export const streamDedupe: SceneModel = ideFrame({
  tree: streamTree(['shopwave/stream.py', 'explore/stream_dedupe.py'], 'explore/stream_dedupe.py', ['explore/stream_dedupe.py']),
  editor: { file: 'explore/stream_dedupe.py', code, highlight: linesFrom(code, 'once = (events.withWatermark', '.dropDuplicatesWithinWatermark') },
  session,
  side: [
    {
      type: 'table', id: 'counts', title: 'Three days through the stream', tone: 'store', columns: ['', 'events'], rows: [
        { id: 'c-read', cells: ['read from Kafka', read] },
        { id: 'c-copy', cells: ['copies dropped', copies], tone: 'store' },
        { id: 'c-late', cells: ['later than the watermark', String(late)], tone: 'consume' },
        { id: 'c-kept', cells: ['kept, each id once', kept], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'state', title: 'The state store: ids seen', icon: 'memory', tone: 'ingest', children: [
        { type: 'item', id: 's-new', title: 'a new event_id: kept, remembered', sub: 'until the watermark passes it + 1 hour', icon: 'fingerprint' },
        { type: 'item', id: 's-seen', title: 'an id it holds: dropped', sub: 'the tracker’s second copy', icon: 'filter', tone: 'store' },
        { type: 'item', id: 's-free', title: `${held} ids held at the end`, sub: 'older ones forgotten: state stays small', icon: 'disk' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Plain dropDuplicates on a stream keeps every id for ever. Within a watermark, the state holds only the recent ones: a copy must arrive within the window to be caught.' },
  ],
  edges: [
    { from: 's-new', to: 's-seen' },
    { from: 's-seen', to: 's-free' },
  ],
})
