import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { ingestTree } from './tree'
import code from '../../../spine/ingest/06-jdbc/project/shopwave/bronze.py?raw'
import session from '../../../spine/ingest/06-jdbc/session.txt?raw'

// §6 — the shop's PostgreSQL, in Docker, read over JDBC. Each partition's WHERE clause is Spark's
// own (relation.parts(), printed by the session), with its row count.
const out = outputOf(session, 'python -m explore.jdbc')
const parts = [...out.matchAll(/partition (\d+):\s+(\d+) rows {2}where (.+)/g)].map((m) => m.slice(1))
const health = outputOf(session, "docker compose ps --format '{{.Service}}: {{.State}} ({{.Health}})'")
const short = (where: string) => where.replaceAll('"customer_id"', 'id').replace(' or id is null', ' or null').replace(' AND ', ' and ')

export const ingestJdbc: SceneModel = ideFrame2({
  model: 'One query per partition',
  tree: ingestTree(['db/init.sql', 'jars/', 'shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'explore/jdbc.py', 'compose.yaml', 'jars.txt'],
    'shopwave/bronze.py', ['db/init.sql', 'jars/', 'explore/jdbc.py', 'compose.yaml', 'jars.txt'], { 'jars/': 'the JDBC driver' }),
  editor: { file: 'shopwave/bronze.py', code, ...view(code, 'def table(', undefined, 0), highlight: linesFrom(code, 'return spark.read.jdbc(', 'numPartitions=partitions') },
  session,
  side: [
    {
      type: 'group', id: 'reads', bare: true, children: [
        {
          type: 'group', id: 'spark', title: 'Spark: 4 tasks', icon: 'spark', tone: 'infra', dir: 'grid', cols: 4, children: parts.map(([i]) => (
            { type: 'item', id: `t${i}`, title: `task ${i}`, chip: true }
          )),
        },
        {
          type: 'group', id: 'db', title: 'postgres:17', sub: health.replace(/^postgres: /, ''), icon: 'postgresql', tone: 'source', children: [
            { type: 'item', id: 'customers', title: 'customers', sub: 'loaded by db/init.sql', icon: 'table' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'parts', title: 'One query per partition', tone: 'infra', columns: ['', 'where', 'rows'],
      rows: parts.map(([i, n, w]) => ({ id: `p${i}`, cells: [i, short(w), n] })),
    },
  ],
  edges: [{ from: 'spark', to: 'db', label: '4 queries' }],
})
