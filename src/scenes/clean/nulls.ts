import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { cleanTree } from './tree'
import code from '../../../spine/clean/02-nulls/project/shopwave/silver.py?raw'
import session from '../../../spine/clean/02-nulls/session.txt?raw'

// §2 — NULL. Every count is the session's: == and != together miss the nulls.
const out = outputOf(session, 'python -m explore.nulls')
const n = (label: string) => out.match(new RegExp(`${label}:?\\s+(\\d+)`))![1]
const events = n('events'), isNull = n('user_id is null'), eq = n('user_id == 239'), ne = n('user_id != 239')
const safe = n('NOT \\(user_id <=> 239\\)')

export const cleanNulls: SceneModel = ideFrame2({
  model: 'NULL compares to nothing',
  tree: cleanTree(['shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/columns.py', 'explore/nulls.py'],
    'shopwave/silver.py', ['explore/nulls.py']),
  editor: { file: 'shopwave/silver.py', code, ...view(code, 'def clicks(', undefined, 0), highlight: linesFrom(code, '# who: the customer', '.otherwise("anonymous")') },
  session,
  side: [
    {
      type: 'table', id: 'counts', title: `${events} events`, tone: 'ingest', columns: ['filter', 'rows'], rows: [
        { id: 'c-null', cells: ['user_id is null', isNull] },
        { id: 'c-eq', cells: ['user_id == 239', eq] },
        { id: 'c-ne', cells: ['user_id != 239', ne], tone: 'consume' },
        { id: 'c-safe', cells: ['NOT (user_id <=> 239)', safe], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'visitor', title: 'visitor: never null', icon: 'user', tone: 'store', children: [
        { type: 'item', id: 'v-user', title: 'user_id, when logged in', sub: 'cast to a string', icon: 'user' },
        { type: 'item', id: 'v-anon', title: 'else anon_id', sub: 'coalesce: the first non-null', icon: 'fingerprint' },
      ],
    },
  ],
  edges: [{ from: 'v-user', to: 'v-anon', label: 'else' }],
})
