import type { TreeEntry } from '@graphlearning/graphl-flow'
import { BASE, BASE_MARK, BASE_NOTE, explorer } from '../tree'

// Course 7's explorer: the lake is built to gold, and becomes Delta tables; the package grows lake.py.
export function lakeTree(files: string[], open: string, fresh: string[] = [], note: Record<string, string> = {}): TreeEntry[] {
  return explorer({
    files: [...BASE, 'lake/bronze/', 'lake/silver/', 'lake/gold/', ...files],
    mark: { ...BASE_MARK, ...Object.fromEntries(fresh.map((f) => [f, 'new' as const])), [open]: 'active' },
    note: { ...BASE_NOTE, 'lake/gold/': 'Course 5', ...note },
  })
}
