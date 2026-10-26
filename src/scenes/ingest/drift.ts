import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { ingestTree } from './tree'
import code from '../../../spine/ingest/05-schema-drift/project/shopwave/bronze.py?raw'
import session from '../../../spine/ingest/05-schema-drift/session.txt?raw'

// §5 — schema drift. The per-file counts are the session's table; bronze.clicks merges the two
// names. The rename happened in the tracker on 2026-06-01, by FILE, not by event time.
const out = outputOf(session, 'python -m explore.drift')
const files = [...out.matchAll(/^\|([\d-]+)\|\s*(\d+)\|\s*(\d+)\|\s*(\d+)\|\s*(\d+)\|$/gm)].map((m) => m.slice(1))
const [, known, all] = out.match(/device known for (\d+) of (\d+) events/)!

export const ingestDrift: SceneModel = ideFrame({
  tree: ingestTree(['shopwave/__init__.py', 'shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'explore/drift.py'],
    'shopwave/bronze.py', ['explore/drift.py']),
  editor: { file: 'shopwave/bronze.py', code, ...view(code, 'def clicks(', undefined, 0), highlight: linesFrom(code, 'device = F.coalesce', 'dropFields') },
  session,
  side: [
    {
      type: 'table', id: 'files', title: 'What each day’s file holds', tone: 'ingest', columns: ['file', 'events', 'device', 'device_type', 'consent'],
      rows: files.map(([f, ...n]) => ({ id: `f-${f}`, cells: [f, ...n], tone: n[1] === '0' ? 'consume' as const : undefined })),
    },
    {
      type: 'group', id: 'merge', title: 'bronze.clicks', icon: 'workflow', tone: 'ingest', children: [
        {
          type: 'group', id: 'names', bare: true, children: [
            { type: 'item', id: 'old', title: 'context.device', sub: 'until 2026-05-31', icon: 'file' },
            { type: 'item', id: 'new', title: 'context.device_type', sub: 'from 2026-06-01', icon: 'file' },
          ],
        },
        { type: 'item', id: 'one', title: 'coalesce → context.device', sub: `known for ${known} of ${all} events`, icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'fields', title: 'In bronze, per field', tone: 'store', columns: ['field', 'May', 'June on'], rows: [
        { id: 'f-device', cells: ['context.device', 'device', 'device_type'], tone: 'store' },
        { id: 'f-type', cells: ['context.device_type', 'dropped', 'dropped'] },
        { id: 'f-consent', cells: ['consent', 'null', 'granted / denied'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'A declared schema ignores a field it does not name: had CLICKS kept only one of the two names, half the devices would have been null, with no error.' },
  ],
  edges: [{ from: 'names', to: 'one', label: 'coalesce' }],
})
