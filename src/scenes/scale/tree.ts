import type { TreeEntry } from '@graphlearning/graphl-flow'
import { BASE, BASE_MARK, BASE_NOTE, explorer } from '../tree'

// Course 8's explorer: a year at SF 1 sits beside the lake in data/sf1; the package grows scale.py.
export function scaleTree(files: string[], open: string, fresh: string[] = [], note: Record<string, string> = {}): TreeEntry[] {
  return explorer({
    files: [...BASE, 'data/sf1/', 'lake/', ...files],
    mark: { ...BASE_MARK, ...Object.fromEntries(fresh.map((f) => [f, 'new' as const])), [open]: 'active' },
    note: { ...BASE_NOTE, 'data/sf1/': 'a year at SF 1', 'lake/': 'Delta', ...note },
  })
}
