import type { Course } from '../types'
import { starSchema } from './01-star-schema'
import { joinTypes } from './02-join-types'
import { theShuffle } from './03-the-shuffle'
import { sortMergeJoin } from './04-sort-merge-join'
import { broadcastJoin } from './05-broadcast-join'
import { partitions } from './06-partitions'
import { skew } from './07-skew'
import { adaptiveQueryExecution } from './08-adaptive-query-execution'
import { salting } from './09-salting'

export const model: Course = {
  id: 'model',
  title: 'A star schema, and Black Friday (gold)',
  sections: [starSchema, joinTypes, theShuffle, sortMergeJoin, broadcastJoin, partitions, skew, adaptiveQueryExecution, salting],
}
