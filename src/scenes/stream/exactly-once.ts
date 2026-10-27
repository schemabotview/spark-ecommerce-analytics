import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { streamTree } from './tree'
import code from '../../../spine/stream/04-exactly-once/project/shopwave/stream.py?raw'
import session from '../../../spine/stream/04-exactly-once/session.txt?raw'

// §4 — exactly once into Delta. The crash's condition and both runs' counts are the session's.
const crash = outputOf(session, 'python -m explore.exactly_once crash')
const stopped = crash.match(/the stream stopped: (\w+)/)![1]
const [, firstRows, firstDistinct] = crash.match(/in the table: (\d+) events, (\d+) distinct/)!
const again = outputOf(session, 'python -m explore.exactly_once')
const [, rows, distinct] = again.match(/in the table: (\d+) events, (\d+) distinct/)!

export const streamExactlyOnce: SceneModel = ideFrame({
  tree: streamTree(['shopwave/stream.py', 'explore/exactly_once.py', 'out/clicks/', 'out/clicks_checkpoint/'], 'shopwave/stream.py', ['explore/exactly_once.py']),
  editor: { file: 'shopwave/stream.py', code, ...view(code, 'def to_delta(', '.trigger(availableNow=True).start(table))'), highlight: linesFrom(code, 'return (events.writeStream.format("delta")', '.trigger(availableNow=True).start(table))') },
  session,
  side: [
    {
      type: 'table', id: 'runs', title: 'Crash, then start again', tone: 'store', columns: ['run', 'ends', 'in the table', 'distinct ids'], rows: [
        { id: 'r-crash', cells: ['with the bug', stopped, firstRows, firstDistinct], tone: 'consume' },
        { id: 'r-again', cells: ['fixed, restarted', 'done', rows, distinct], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'once', title: 'Why nothing is written twice', icon: 'shield', tone: 'ingest', children: [
        { type: 'item', id: 'e-ckpt', title: 'the checkpoint: batch 1’s offsets', sub: 'written before it ran, never committed', icon: 'disk' },
        { type: 'item', id: 'e-rerun', title: 'restart: batch 1 again, same range', sub: 'Kafka still holds those records', icon: 'clock' },
        { type: 'item', id: 'e-delta', title: 'Delta knows batch 0 is in', sub: 'the table’s log records each batch id', icon: 'layers', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'kinds', title: 'Delivery guarantees', tone: 'neutral', columns: ['guarantee', 'after a crash'], rows: [
        { id: 'g-most', cells: ['at most once', 'a batch may be lost'] },
        { id: 'g-least', cells: ['at least once', 'a batch may be written twice'] },
        { id: 'g-once', cells: ['exactly once', 'checkpoint + a Delta sink'], tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: `${+rows - +distinct} ids still appear twice: the tracker sent them twice (Course 4). Exactly once is per Kafka record; duplicates in the source are §7’s job.` },
  ],
  edges: [
    { from: 'e-ckpt', to: 'e-rerun' },
    { from: 'e-rerun', to: 'e-delta' },
  ],
})
