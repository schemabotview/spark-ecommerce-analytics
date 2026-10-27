import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { streamTree } from './tree'
import code from '../../../spine/stream/01-kafka/project/shopwave/tracker.py?raw'
import session from '../../../spine/stream/01-kafka/session.txt?raw'

// §1 — Kafka. The events published and each partition's end offset are the session's.
const published = outputOf(session, 'python -m shopwave.tracker 2026-10-01').match(/published (\d+) events/)![1]
const offsets = [...session.matchAll(/^clicks:(\d+):(\d+)$/gm)].map(([, p, n]) => ({ p, n }))

export const streamKafka: SceneModel = ideFrame({
  tree: streamTree(['compose.yaml', 'shopwave/tracker.py'], 'shopwave/tracker.py', ['shopwave/tracker.py']),
  editor: { file: 'shopwave/tracker.py', code, ...view(code, 'def main('), highlight: [...linesFrom(code, 'visitor = F.coalesce', 'records = lines.select'), ...linesFrom(code, '(records.write.format("kafka")', '.option("topic", TOPIC).save())')] },
  session,
  side: [
    {
      type: 'group', id: 'flow', title: `${published} events, one day of the site`, icon: 'kafka', tone: 'ingest', children: [
        { type: 'item', id: 'k-producer', title: 'the tracker: a producer', sub: 'key = the visitor, value = the JSON', icon: 'globe' },
        { type: 'group', id: 'k-topic', title: 'topic clicks', sub: 'hash(key) picks the partition', icon: 'stream', dir: 'grid', cols: 2, children: offsets.map((o) => ({ type: 'item' as const, id: `k-p${o.p}`, title: `partition ${o.p}`, sub: `offsets 0–${+o.n - 1}`, chip: true })) },
        { type: 'item', id: 'k-consumer', title: 'Spark: a consumer (§2)', sub: 'reads from an offset, at its own pace', icon: 'spark' },
      ],
    },
    {
      type: 'table', id: 'terms', title: 'Kafka in four words', tone: 'neutral', columns: ['word', 'means'], rows: [
        { id: 't-topic', cells: ['topic', 'a named, append-only log'] },
        { id: 't-part', cells: ['partition', 'a slice of it, in order'] },
        { id: 't-off', cells: ['offset', 'a record’s place in its slice'] },
        { id: 't-ret', cells: ['retention', 'kept for days, read many times'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'ingest', text: 'Kafka keeps records after they are read: Spark, a fraud check and an archive can each read the same topic, at their own offsets.' },
  ],
  edges: [
    { from: 'k-producer', to: 'k-topic' },
    { from: 'k-topic', to: 'k-consumer' },
  ],
})
