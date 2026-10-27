import type { Course } from '../types'
import { kafka } from './01-kafka'
import { readstream } from './02-readstream'
import { microBatches } from './03-micro-batches'
import { exactlyOnceIntoDelta } from './04-exactly-once-into-delta'
import { liveRevenue } from './05-live-revenue'
import { watermarks } from './06-watermarks'
import { streamingDeduplication } from './07-streaming-deduplication'
import { streamStaticJoins } from './08-stream-static-joins'
import { cartAbandonment } from './09-cart-abandonment'

export const stream: Course = {
  id: 'stream',
  title: 'Live data from Kafka',
  sections: [kafka, readstream, microBatches, exactlyOnceIntoDelta, liveRevenue, watermarks, streamingDeduplication, streamStaticJoins, cartAbandonment],
}
