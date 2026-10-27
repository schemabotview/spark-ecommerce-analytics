import type { SceneModel } from '@graphlearning/graphl-flow'
import { scaleEventLog } from './event-log'
import { scaleMemory } from './memory'
import { scaleSpill } from './spill'
import { scaleCache } from './cache'
import { scalePartitionSize } from './partition-size'
import { scalePlanTuning } from './plan-tuning'
import { scaleSkipping } from './skipping'
import { scaleCores } from './cores'

export const scaleScenes: Record<string, SceneModel> = {
  'scale-event-log': scaleEventLog,
  'scale-memory': scaleMemory,
  'scale-spill': scaleSpill,
  'scale-cache': scaleCache,
  'scale-partition-size': scalePartitionSize,
  'scale-plan-tuning': scalePlanTuning,
  'scale-skipping': scaleSkipping,
  'scale-cores': scaleCores,
}
