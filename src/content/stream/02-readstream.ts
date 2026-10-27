import type { Section } from '../types'

export const readstream: Section = {
  id: 'readstream',
  title: 'readStream',
  scene: 'stream-read-stream',
  narration:
    "Reading Kafka from Spark looks almost exactly like reading files: read stream instead of read, format Kafka, the broker's address and the topic, starting from the earliest offset. What comes back is a streaming DataFrame, and the session confirms it: is streaming is true. Each row is a Kafka record: a key and a value as raw bytes, the topic, the partition and the offset. Kafka stores no types, so the value is just the bytes the tracker sent. From JSON parses them with the clicks schema from the bronze course, the same one the files used, and the event's fields become columns again, with partition and offset kept alongside. A stream needs somewhere to go and a trigger. Here the sink is a memory table, for looking at, and the trigger is available now: read everything in the topic, then stop. All eight hundred and ninety seven events arrive, spread over the four partitions exactly as Kafka reported. The point of this design is that the same DataFrame code, select, filter, group by, now runs on data that keeps arriving.",
}
