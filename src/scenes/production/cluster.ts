import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { prodTree } from './tree'
import code from '../../../spine/production/04-cluster/project/cluster.sh?raw'
import session from '../../../spine/production/04-cluster/session.txt?raw'

// §4 — a real cluster. The master, executors, cores and each stage's tasks are the session's
// (volatile: which executor ran what changes run to run).
const out = outputOf(session, 'spark-submit --properties-file conf/cluster.conf explore/on_cluster.py')
const master = out.match(/master: (\S+)/)![1]
const [, executors, cores] = out.match(/executors: (\d+) · cores: (\d+)/)!
const [, countries, stages, tasks, per] = out.match(/(\d+) countries · (\d+) stages, (\d+) tasks: (.+)/)!
const ran = [...per.matchAll(/executor (\d+) ran (\d+)/g)].map(([, e, n]) => ({ e, n }))

export const productionCluster: SceneModel = ideFrame2({
  model: 'Driver, master, workers',
  tree: prodTree(['cluster.sh', 'conf/cluster.conf', 'explore/on_cluster.py', 'shopwave/session.py'], 'cluster.sh', ['cluster.sh', 'conf/cluster.conf', 'explore/on_cluster.py']),
  editor: { file: 'cluster.sh', lang: 'shell', code, ...view(code, 'case "$1" in', 'echo "cluster stopped";;'), highlight: linesFrom(code, '"$daemon" start $master 1', '--work-dir "$SPARK_LOG_DIR/work" > /dev/null') },
  session,
  side: [
    {
      type: 'group', id: 'topo', title: master, icon: 'network', tone: 'ingest', children: [
        { type: 'item', id: 'c-driver', title: 'driver: spark-submit, here', sub: 'plans the job, hands out tasks', icon: 'screen' },
        { type: 'item', id: 'c-master', title: 'master', sub: 'knows the workers, starts executors on them', icon: 'server' },
        {
          type: 'group', id: 'c-workers', title: `${executors} workers → ${executors} executors, ${cores} cores`, dir: 'row', children: [
            { type: 'item', id: 'w1', title: 'worker 1', sub: 'executor: 2 cores, 1 GB', icon: 'cpu' },
            { type: 'item', id: 'w2', title: 'worker 2', sub: 'executor: 2 cores, 1 GB', icon: 'cpu' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'ran', title: `Revenue by country: ${countries} rows, ${stages} stages, ${tasks} tasks`, tone: 'store', columns: ['executor', 'tasks it ran'],
      rows: ran.map((r) => ({ id: `e${r.e}`, cells: [`executor ${r.e}`, r.n] })),
    },
  ],
  edges: [
    { from: 'c-driver', to: 'c-master' },
    { from: 'c-master', to: 'c-workers' },
  ],
})
