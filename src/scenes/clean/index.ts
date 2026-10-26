import type { SceneModel } from '@graphlearning/graphl-flow'
import { cleanColumns } from './columns'
import { cleanNulls } from './nulls'
import { cleanDedupe } from './dedupe'
import { cleanTimezones } from './timezones'
import { cleanPythonUdf } from './python-udf'
import { cleanUdfSpeed } from './udf-speed'
import { cleanCatalyst } from './catalyst'
import { cleanQuality } from './quality'

export const cleanScenes: Record<string, SceneModel> = {
  'clean-columns': cleanColumns,
  'clean-nulls': cleanNulls,
  'clean-dedupe': cleanDedupe,
  'clean-timezones': cleanTimezones,
  'clean-python-udf': cleanPythonUdf,
  'clean-udf-speed': cleanUdfSpeed,
  'clean-catalyst': cleanCatalyst,
  'clean-quality': cleanQuality,
}
