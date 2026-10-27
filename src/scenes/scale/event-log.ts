import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { scaleTree } from './tree'
import code from '../../../spine/scale/01-event-log/project/explore/event_log.py?raw'
import session from '../../../spine/scale/01-event-log/session.txt?raw'

// §1 — reading a job from its event log. The stage table is the session's (seconds volatile).
const out = outputOf(session, 'python -m explore.event_log')
const stages = [...out.matchAll(/^\s*(\d+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+(\d+)\s+(\d+)$/gm)]
  .map(([, id, tasks, secs, read, write, shuffled]) => ({ id, tasks, secs, read, write, shuffled }))
const reads = stages.filter((s) => +s.read > 0).map((s) => +s.read)
const role = (s: (typeof stages)[number]) =>
  +s.read > 0 ? (+s.read === Math.max(...reads) ? 'read order_items' : 'read orders, paid only') : +s.write > 0 ? 'join, then partial sums' : 'add the sums up'

export const scaleEventLog: SceneModel = ideFrame({
  tree: scaleTree(['shopwave/scale.py', 'explore/event_log.py', 'logs/events/'], 'explore/event_log.py', ['shopwave/scale.py', 'explore/event_log.py', 'logs/events/'], { 'logs/events/': 'JSON lines' }),
  editor: { file: 'explore/event_log.py', code, ...view(code, 'os.makedirs'), highlight: [...linesFrom(code, '"spark.eventLog.enabled"', '"spark.eventLog.compress"'), ...linesFrom(code, 'if event["Event"] != "SparkListenerStageCompleted"')] },
  session,
  side: [
    {
      type: 'table', id: 'stages', title: 'The job, stage by stage, from the event log', tone: 'store', columns: ['stage', 'tasks', 's', 'rows read', 'shuffle out', 'shuffle in'],
      rows: stages.map((s) => ({ id: `s${s.id}`, cells: [s.id, s.tasks, s.secs, s.read, s.write, s.shuffled] })),
    },
    {
      type: 'group', id: 'shape', title: 'Revenue by country, a year at SF 1', icon: 'workflow', tone: 'ingest', children: stages.map((s) => ({
        type: 'item' as const, id: `g${s.id}`, title: `stage ${s.id}: ${role(s)}`, sub: `${s.tasks} task${s.tasks === '1' ? '' : 's'}`, icon: +s.read > 0 ? 'file' as const : 'cpu' as const,
      })),
    },
    { type: 'note', id: 'note', tone: 'store', text: 'The Spark UI is drawn from these same events: the history server replays the log. Every table this course shows is read from it, not from a screenshot.' },
  ],
  edges: stages.slice(1).map((s, i) => ({ from: `g${stages[i].id}`, to: `g${s.id}` })),
})
