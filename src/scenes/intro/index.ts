import type { SceneModel } from '@graphlearning/graphl-flow'
import { introWhatSparkIs } from './what-spark-is'
import { introPlatform } from './platform'
import { introWhyNotPandas } from './why-not-pandas'

export const introScenes: Record<string, SceneModel> = {
  'intro-what-spark-is': introWhatSparkIs,
  'intro-platform': introPlatform,
  'intro-why-not-pandas': introWhyNotPandas,
}
