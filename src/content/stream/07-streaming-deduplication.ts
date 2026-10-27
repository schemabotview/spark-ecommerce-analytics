import type { Section } from '../types'

export const streamingDeduplication: Section = {
  id: 'streaming-deduplication',
  title: 'Streaming deduplication',
  scene: 'stream-dedupe',
  narration:
    'The tracker sends some events twice. In the silver course, drop duplicates on event id took care of that, over a finished table. On a stream it is harder: to know an id is a repeat, Spark must remember every id it has seen, and a stream never ends. Drop duplicates within watermark bounds that memory. With a one hour watermark, an id is remembered until the watermark passes its event time plus an hour, and then forgotten. Three days of clicks go through: three thousand and thirty four read from Kafka. Thirteen copies are dropped, because their first copy was still in state. Eight more events arrived later than the watermark allowed and were dropped for that reason. Three thousand and thirteen events are kept, each id exactly once. At the end, the state holds just sixty five ids, the most recent hour or so, however long the stream runs. The rule to remember: a copy is only caught if it arrives within the window, so the watermark should be longer than the gap between copies, which for a retrying tracker is seconds.',
}
