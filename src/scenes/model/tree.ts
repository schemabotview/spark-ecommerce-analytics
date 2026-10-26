import type { TreeEntry } from '@graphlearning/graphl-flow'
import { BASE, BASE_MARK, BASE_NOTE, explorer } from '../tree'

// Course 5's explorer: bronze and silver are built; the package grows gold.py.
export function modelTree(files: string[], open: string, fresh: string[] = [], note: Record<string, string> = {}): TreeEntry[] {
  return explorer({
    files: [...BASE, 'lake/bronze/', 'lake/silver/', ...files],
    mark: { ...BASE_MARK, ...Object.fromEntries(fresh.map((f) => [f, 'new' as const])), [open]: 'active' },
    note: { ...BASE_NOTE, 'lake/bronze/': 'Course 3', 'lake/silver/': 'Course 4', ...note },
  })
}

/** A Spark job's stage line from metrics.run, as the explore scripts print it. */
export const num = (text: string, re: RegExp) => text.match(re)![1]
