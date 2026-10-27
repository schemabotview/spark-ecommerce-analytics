import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { streamTree } from './tree'
import code from '../../../spine/stream/06-watermarks/project/explore/watermarks.py?raw'
import session from '../../../spine/stream/06-watermarks/session.txt?raw'

// §6 — watermarks. The batches, final hours, the watermark and the drops are the session's.
const out = outputOf(session, 'python -m explore.watermarks')
const [, batches, final, kept] = out.match(/batches: (\d+) · final hours written: (\d+) · events in them: (\d+)/)!
const mark = out.match(/watermark now: (\S+)/)![1].replace('T', ' ').replace(/\.000Z$/, '')
const dropped = out.match(/late events dropped: (\d+)/)![1]
const open = out.match(/windows still open in state: (\d+)/)![1]

export const streamWatermarks: SceneModel = ideFrame({
  tree: streamTree(['shopwave/stream.py', 'explore/watermarks.py'], 'explore/watermarks.py', ['explore/watermarks.py']),
  editor: { file: 'explore/watermarks.py', code, ...view(code, 'spark = spark_session()'), highlight: [...linesFrom(code, 'late_ok = events.withWatermark'), ...linesFrom(code, '.outputMode("append")')] },
  session,
  side: [
    {
      type: 'group', id: 'rule', title: 'withWatermark("event_ts", "2 hours")', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'm-max', title: 'the latest event time seen', sub: 'in every batch so far', icon: 'search' },
        { type: 'item', id: 'm-mark', title: 'minus 2 hours: the watermark', sub: `now ${mark}`, icon: 'clock' },
        { type: 'item', id: 'm-close', title: 'a window ending before it: final', sub: 'written once (append), its state freed', icon: 'check', tone: 'store' },
        { type: 'item', id: 'm-late', title: 'late, but after the watermark: counted', sub: 'its window is still open', icon: 'clock' },
        { type: 'item', id: 'm-drop', title: 'an event older than it: dropped', sub: 'its window is already written', icon: 'zap', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'run', title: `Three days of clicks, ${batches} batches`, tone: 'store', columns: ['', 'count'], rows: [
        { id: 'r-final', cells: ['hours written, final', final], tone: 'store' },
        { id: 'r-kept', cells: ['events in them', kept] },
        { id: 'r-drop', cells: ['late events dropped', dropped], tone: 'consume' },
        { id: 'r-open', cells: ['windows still in state', open] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'The watermark trades completeness for memory: a longer delay keeps more late events and more state. Choose it from how late your data really arrives.' },
  ],
  edges: [
    { from: 'm-max', to: 'm-mark' },
    { from: 'm-mark', to: 'm-close' },
  ],
})
