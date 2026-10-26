import type { SceneModel } from '@graphlearning/graphl-flow'
import { modelStar } from './star'
import { modelJoinTypes } from './join-types'
import { modelShuffle } from './shuffle'
import { modelSortMerge } from './sort-merge'
import { modelBroadcast } from './broadcast'
import { modelPartitions } from './partitions'
import { modelSkew } from './skew'
import { modelAqe } from './aqe'
import { modelSalting } from './salting'

export const modelScenes: Record<string, SceneModel> = {
  'model-star': modelStar,
  'model-join-types': modelJoinTypes,
  'model-shuffle': modelShuffle,
  'model-sort-merge': modelSortMerge,
  'model-broadcast': modelBroadcast,
  'model-partitions': modelPartitions,
  'model-skew': modelSkew,
  'model-aqe': modelAqe,
  'model-salting': modelSalting,
}
