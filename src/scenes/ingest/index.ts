import type { SceneModel } from '@graphlearning/graphl-flow'
import { ingestSchemas } from './schemas'
import { ingestCorruptRecords } from './corrupt-records'
import { ingestJson } from './json'
import { ingestExplode } from './explode'
import { ingestDrift } from './drift'
import { ingestJdbc } from './jdbc'
import { ingestColumnar } from './columnar'
import { ingestBronze } from './bronze'

export const ingestScenes: Record<string, SceneModel> = {
  'ingest-schemas': ingestSchemas,
  'ingest-corrupt-records': ingestCorruptRecords,
  'ingest-json': ingestJson,
  'ingest-explode': ingestExplode,
  'ingest-drift': ingestDrift,
  'ingest-jdbc': ingestJdbc,
  'ingest-columnar': ingestColumnar,
  'ingest-bronze': ingestBronze,
}
