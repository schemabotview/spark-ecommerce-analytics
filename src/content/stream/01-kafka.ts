import type { Section } from '../types'

export const kafka: Section = {
  id: 'kafka',
  title: 'Kafka',
  scene: 'stream-kafka',
  narration:
    "Until now the clickstream arrived as files, an hour at a time, and every number on the dashboard was a day old. Marketing wants it live. The platform's front door for live data is Kafka, added to compose dot yaml as a single broker. Kafka stores records in topics, and a topic is a log: records are appended, kept for days, and read by as many consumers as like, each at its own pace. A topic is split into partitions so that it can be written and read in parallel. Clicks has four. The tracker, which used to write JSON files, now publishes each event as a record, with the visitor as its key. Kafka hashes the key to choose the partition, so every event of one visitor lands in the same partition, in the order it happened. One day of October is eight hundred and ninety seven events. Kafka's own tool shows where each partition ends: two hundred and eighty nine records in partition zero, down to a hundred and eighty five in partition one. Those positions are offsets, and offsets are how Spark will keep track of what it has read.",
}
