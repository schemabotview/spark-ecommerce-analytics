import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { mlTree } from './tree'
import code from '../../../spine/ml/02-pipeline/project/shopwave/ml.py?raw'
import session from '../../../spine/ml/02-pipeline/session.txt?raw'

// §2 — an ML pipeline. The fitted stages, the factor counts and four predictions are the session's.
const out = outputOf(session, 'python -m explore.pipeline')
const stages = out.match(/stages: (.+)/)![1].split(' → ')
const [, rank, users, items] = out.match(/rank (\d+): (\d+) customer vectors, (\d+) product vectors/)!
const rows = [...out.matchAll(/^\|\s*(\d+)\|\s*(\d+)\|\s*([\d.]+)\|\s*([\d.]+)\|$/gm)].map(([, c, p, r, g]) => ({ c, p, r, g }))

export const mlPipeline: SceneModel = ideFrame({
  tree: mlTree(['shopwave/ml.py', 'explore/pipeline.py'], 'shopwave/ml.py', ['explore/pipeline.py']),
  editor: { file: 'shopwave/ml.py', code, ...view(code, 'def pipeline('), highlight: [...linesFrom(code, 'columns = SQLTransformer'), ...linesFrom(code, 'als = ALS(', 'return Pipeline(stages=[columns, als])')] },
  session,
  side: [
    {
      type: 'group', id: 'pipe', title: 'Pipeline: fit() runs every stage in order', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'p-sql', title: stages[0], sub: 'the three columns ALS wants, as floats', icon: 'code' },
        { type: 'item', id: 'p-als', title: `ALS → ${stages[1]}`, sub: `rank ${rank}: ${users} customer vectors, ${items} product vectors`, icon: 'brain', tone: 'store' },
        { type: 'item', id: 'p-model', title: 'a PipelineModel', sub: 'transform() adds a prediction column', icon: 'package' },
      ],
    },
    {
      type: 'table', id: 'guess', title: 'Ratings it has seen, and its guesses', tone: 'store', columns: ['customer', 'product', 'rated', 'predicted'],
      rows: rows.map((r) => ({ id: `g${r.p}`, cells: [r.c, r.p, r.r, r.g] })),
    },
    {
      type: 'table', id: 'params', title: 'The settings', tone: 'neutral', columns: ['param', 'here'], rows: [
        { id: 'k-rank', cells: ['rank', `${rank}: numbers per customer`] },
        { id: 'k-reg', cells: ['regParam', '0.1: keeps them small'] },
        { id: 'k-cold', cells: ['coldStartStrategy', 'drop: no guess for strangers'] },
      ],
    },
  ],
  edges: [
    { from: 'p-sql', to: 'p-als' },
    { from: 'p-als', to: 'p-model' },
  ],
})
