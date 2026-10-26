import type { Section } from '../types'

export const deduplication: Section = {
  id: 'deduplication',
  title: 'Deduplication',
  scene: 'clean-dedupe',
  narration:
    "The website's tracker is built to never lose an event. When it is not sure an event arrived, it sends it again, which means some events arrive twice. This is called at least once delivery, and it is how almost every event pipeline behaves. In October's bronze clicks there are thirty one thousand and forty six rows, but only thirty thousand nine hundred and one distinct event ids. One hundred and forty five events were sent twice. Counted as they are, every page view, every cart and every purchase number would be slightly inflated, and nobody would know why. The fix is one call at the top of silver dot clicks: drop duplicates on event id. Spark groups the rows that share an id, which means rows from different partitions must meet, so like a group by, it is a shuffle. Then it keeps one row for each id. Silver now holds exactly thirty thousand nine hundred and one events. Be careful about which copy survives. Drop duplicates keeps whichever row it meets first, and makes no promise about which one. For exact copies of the same event, that does not matter. It matters a lot when the duplicates differ: an order paid twice has two different payments, with different ids and times, and picking one at random is wrong. That needs a window function, to keep the first by time, and windows are Course six.",
}
