import type { Section } from '../types'

export const streamStaticJoins: Section = {
  id: 'stream-static-joins',
  title: 'Stream-static joins',
  scene: 'stream-static-join',
  narration:
    "A live count of clicks is more useful by category, and the category is in gold, not in the click. With products joins the stream to the product dimension: it explodes each event's items into one row per product, then joins them to the dim product Delta table on product id. That is a stream static join. The stream side is the micro batches from Kafka. The static side is an ordinary table, read again for every batch, so a product added or renamed in gold appears in the stream's output from the next batch on, with no restart. It needs no state for the static side, because nothing about the table has to be remembered between batches. Counted by category and event type, after two batches, beauty has the most product views, a hundred and twenty six, and the most purchases. One thing streams cannot do is pivot: it would be two aggregations in a row, which Spark refuses on a stream, so the script counts by category and type, and pivots the finished table afterwards. Joining two streams to each other is a different, harder thing: both sides must be held in state until a match can no longer arrive, which again needs watermarks.",
}
