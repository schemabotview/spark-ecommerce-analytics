import type { Section } from '../types'

export const liveRevenue: Section = {
  id: 'live-revenue',
  title: 'Live revenue',
  scene: 'stream-windows',
  narration:
    "Now the number marketing asked for: revenue per hour, live. Purchases keeps purchase events and adds their basket's value. Revenue per groups them by a window of event time, one hour wide. Window is a function of a timestamp: a purchase at fifteen forty two belongs to the window from fifteen hundred to sixteen hundred. These are tumbling windows, one after another with no overlap, so every event lands in exactly one. It is event time, when the purchase happened, not when the record reached Kafka. Each window's count and sum live in Spark's state store, and every batch that brings purchases for a window updates it. In complete mode the whole result table is written after every batch. After four batches, the day has sixteen hours with sales, and the busiest was three to four in the afternoon. Complete mode has a cost: every window ever seen stays in state, for ever. For one day that is nothing. For a stream that runs for months, windows must be allowed to close, which is what watermarks are for.",
}
