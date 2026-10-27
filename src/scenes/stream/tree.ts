import type { TreeEntry } from '@graphlearning/graphl-flow'
import { BASE, BASE_MARK, BASE_NOTE, explorer } from '../tree'

// Course 9's explorer: compose.yaml gains Kafka; the package grows tracker.py and stream.py.
export function streamTree(files: string[], open: string, fresh: string[] = [], note: Record<string, string> = {}): TreeEntry[] {
  return explorer({
    files: [...BASE, 'lake/', ...files],
    mark: { ...BASE_MARK, ...Object.fromEntries(fresh.map((f) => [f, 'new' as const])), [open]: 'active' },
    note: { ...BASE_NOTE, 'lake/': 'Delta', 'compose.yaml': 'postgres + kafka', ...note },
  })
}
