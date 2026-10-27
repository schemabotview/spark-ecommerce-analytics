import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { mlTree } from './tree'
import code from '../../../spine/ml/04-evaluate/project/shopwave/ml.py?raw'
import session from '../../../spine/ml/04-evaluate/session.txt?raw'

// §4 — evaluating honestly. The split's sizes and every RMSE are the session's.
const out = outputOf(session, 'python -m explore.evaluate')
const [, train, test] = out.match(/train: (\d+) ratings before October · test: (\d+) after/)!
const scores = [...out.matchAll(/^ {2}(.+?)\s+(\d\.\d{3})$/gm)].map(([, name, rmse]) => ({ name, rmse: +rmse }))
const best = Math.min(...scores.filter((s) => !s.name.includes('random')).map((s) => s.rmse))

export const mlEvaluate: SceneModel = ideFrame({
  tree: mlTree(['shopwave/ml.py', 'explore/evaluate.py'], 'shopwave/ml.py', ['explore/evaluate.py']),
  editor: { file: 'shopwave/ml.py', code, ...view(code, 'def split(', 'F.col("base") + F.col("prediction"))'), highlight: [...linesFrom(code, 'before = F.col("reviewed_at")'), ...linesFrom(code, 'base = ratings.groupBy("product_id")', '"rating", F.col("rating") - F.col("base"))')] },
  session,
  side: [
    {
      type: 'plot', id: 'rmse', title: 'RMSE on the test months, in stars', compact: true,
      x: { labels: scores.map((_, i) => String(i + 1)) }, y: { label: 'stars off', min: 0, max: 1.5, step: 0.25 },
      series: scores.map((s, i) => ({ kind: 'bar' as const, points: [[i, s.rmse] as [number, number]], tone: s.rmse === best ? 'store' as const : s.name.includes('random') ? 'neutral' as const : 'infra' as const })),
    },
    {
      type: 'table', id: 'scores', title: `Train: ${train} before October · test: ${test} after`, tone: 'store', columns: ['#', 'model', 'RMSE'],
      rows: scores.map((s, i) => ({ id: `s${i}`, cells: [String(i + 1), s.name, s.rmse.toFixed(3)], tone: s.rmse === best ? 'store' as const : s.name === 'ALS alone' ? 'consume' as const : undefined })),
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'A random split lets the model train on December to predict October: it looks better than it will be. Split by time, the way it will be used.' },
  ],
})
