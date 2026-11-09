import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { prodTree } from './tree'
import code from '../../../spine/production/01-jobs/project/shopwave/jobs.py?raw'
import session from '../../../spine/production/01-jobs/session.txt?raw'

// §1 — jobs as a package. The job list is the session's own listing.
const jobs = [...outputOf(session, 'python -m shopwave.jobs').matchAll(/^(\w+)\s+(.+)$/gm)].map(([, name, what]) => ({ name, what }))

export const productionJobs: SceneModel = ideFrame2({
  model: 'One entry point for the night',
  tree: prodTree(['shopwave/bronze.py', 'shopwave/silver.py', 'shopwave/gold.py', 'shopwave/lake.py', 'shopwave/ml.py', 'shopwave/jobs.py'], 'shopwave/jobs.py', ['shopwave/jobs.py']),
  editor: { file: 'shopwave/jobs.py', code, ...view(code, 'JOBS: dict['), highlight: linesFrom(code, 'JOBS: dict[', '"recommend": (') },
  session,
  side: [
    {
      type: 'group', id: 'order', title: 'python -m shopwave.jobs: the night, in order', icon: 'workflow', tone: 'ingest',
      children: jobs.map((j) => ({ type: 'item' as const, id: `j-${j.name}`, title: j.name, sub: j.what, icon: 'package' as const })),
    },
  ],
  edges: jobs.slice(1).map((j, i) => ({ from: `j-${jobs[i].name}`, to: `j-${j.name}` })),
})
