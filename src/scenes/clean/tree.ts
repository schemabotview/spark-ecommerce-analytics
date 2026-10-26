import type { TreeEntry } from '@graphlearning/graphl-flow'
import { BASE, BASE_MARK, BASE_NOTE, explorer } from '../tree'

// Course 4's explorer: bronze is built (lake/bronze), the package grows silver.py.
export function cleanTree(files: string[], open: string, fresh: string[] = [], note: Record<string, string> = {}): TreeEntry[] {
  return explorer({
    files: [...BASE, 'lake/bronze/', ...files],
    mark: { ...BASE_MARK, ...Object.fromEntries(fresh.map((f) => [f, 'new' as const])), [open]: 'active' },
    note: { ...BASE_NOTE, 'lake/bronze/': 'Course 3', ...note },
  })
}
