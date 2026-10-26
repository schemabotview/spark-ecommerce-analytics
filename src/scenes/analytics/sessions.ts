import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { analyticsTree } from './tree'
import code from '../../../spine/analytics/04-sessions/project/shopwave/analytics.py?raw'
import session from '../../../spine/analytics/04-sessions/session.txt?raw'

// §4 — sessionization. Counts for people and the bot, and visitor 1's first events, are the session's.
const out = outputOf(session, 'python -m explore.sessions')
const who = [...out.matchAll(/^(people|the bot)\s+(\d+) events ·\s+(\d+) visitors ·\s+(\d+) sessions · ([\d.]+) events each$/gm)].map((m) => m.slice(1))
const one = [...out.matchAll(/^ {2}visitor 1\s+([\d-]+ [\d:]+)\s+(\w+)\s+session (\d+)$/gm)].map((m) => m.slice(1))

export const analyticsSessions: SceneModel = ideFrame({
  tree: analyticsTree(['shopwave/analytics.py', 'explore/frames.py', 'explore/sessions.py'], 'shopwave/analytics.py', ['explore/sessions.py']),
  editor: { file: 'shopwave/analytics.py', code, ...view(code, 'def sessions(', undefined, 0), highlight: linesFrom(code, 'in_order = Window', '.drop("starts")') },
  session,
  side: [
    {
      type: 'table', id: 'timeline', title: 'Visitor 1, in order', tone: 'ingest', columns: ['event_ts', 'event', 'session'],
      rows: one.map(([ts, e, s], i) => ({ id: `e${i}`, cells: [ts.slice(5), e, s], tone: i > 0 && s !== one[i - 1][2] ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'rule', title: 'Per visitor, in time order', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'r-lag', title: 'lag(event_ts)', sub: 'the previous event’s time', icon: 'clock' },
        { type: 'item', id: 'r-gap', title: 'a gap over 30 minutes → 1', sub: 'else 0: this event starts a session', icon: 'filter' },
        { type: 'item', id: 'r-sum', title: 'a running sum of the 1s', sub: 'the session’s number', icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'who', title: 'October', tone: 'store', columns: ['', 'events', 'visitors', 'sessions', 'per session'],
      rows: who.map(([w, e, v, s, per]) => ({ id: `w-${w.replace(' ', '-')}`, cells: [w, e, v, s, per], tone: w === 'the bot' ? 'consume' as const : undefined })),
    },
  ],
  edges: [{ from: 'r-lag', to: 'r-gap' }, { from: 'r-gap', to: 'r-sum' }],
})
