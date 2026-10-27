import type { SceneModel } from '@graphlearning/graphl-flow'
import { streamKafka } from './kafka'
import { streamReadStream } from './read-stream'
import { streamMicroBatches } from './micro-batches'
import { streamExactlyOnce } from './exactly-once'
import { streamWindows } from './windows'
import { streamWatermarks } from './watermarks'
import { streamDedupe } from './dedupe'
import { streamStaticJoin } from './static-join'
import { streamAbandonment } from './abandonment'

export const streamScenes: Record<string, SceneModel> = {
  'stream-kafka': streamKafka,
  'stream-read-stream': streamReadStream,
  'stream-micro-batches': streamMicroBatches,
  'stream-exactly-once': streamExactlyOnce,
  'stream-windows': streamWindows,
  'stream-watermarks': streamWatermarks,
  'stream-dedupe': streamDedupe,
  'stream-static-join': streamStaticJoin,
  'stream-abandonment': streamAbandonment,
}
