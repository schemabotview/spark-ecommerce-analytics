import type { SceneModel } from '@graphlearning/graphl-flow'
import { lakehouseBrokenOverwrite } from './broken-overwrite'
import { lakehouseDeltaLog } from './delta-log'
import { lakehouseDeltaGold } from './delta-gold'
import { lakehouseIncremental } from './incremental'
import { lakehouseMerge } from './merge'
import { lakehouseScd2 } from './scd2'
import { lakehouseTimeTravel } from './time-travel'
import { lakehouseSchema } from './schema'
import { lakehouseSmallFiles } from './small-files'

export const lakehouseScenes: Record<string, SceneModel> = {
  'lakehouse-broken-overwrite': lakehouseBrokenOverwrite,
  'lakehouse-delta-log': lakehouseDeltaLog,
  'lakehouse-delta-gold': lakehouseDeltaGold,
  'lakehouse-incremental': lakehouseIncremental,
  'lakehouse-merge': lakehouseMerge,
  'lakehouse-scd2': lakehouseScd2,
  'lakehouse-time-travel': lakehouseTimeTravel,
  'lakehouse-schema': lakehouseSchema,
  'lakehouse-small-files': lakehouseSmallFiles,
}
