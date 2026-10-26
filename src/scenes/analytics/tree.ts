import type { TreeEntry } from '@graphlearning/graphl-flow'
import { BASE, BASE_MARK, BASE_NOTE, explorer } from '../tree'

// Course 6's explorer: the lake is built to gold; the package grows analytics.py.
export function analyticsTree(files: string[], open: string, fresh: string[] = [], note: Record<string, string> = {}): TreeEntry[] {
  return explorer({
    files: [...BASE, 'lake/bronze/', 'lake/silver/', 'lake/gold/', ...files],
    mark: { ...BASE_MARK, ...Object.fromEntries(fresh.map((f) => [f, 'new' as const])), [open]: 'active' },
    note: { ...BASE_NOTE, 'lake/gold/': 'Course 5', ...note },
  })
}

/** A captured CSV as rows of strings, header dropped. */
export const csvRows = (text: string) => text.trim().split('\n').slice(1).map((l) => l.split(','))
