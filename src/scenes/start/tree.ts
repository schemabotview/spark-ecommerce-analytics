import type { TreeEntry } from '@graphlearning/graphl-flow'

// The explorer through Course 2. data/raw/orders is one collapsed folder: 31 daily exports from the
// shop's database, written by shopwave_gen (spine.py checks them byte for byte).
type Mark = 'new' | 'active' | undefined

const file = (name: string, mark: Mark): TreeEntry => ({ name, state: mark })

// 'plain': in the project, untouched by this step.
type Shown = 'new' | 'active' | 'plain'
const mark = (s: Shown): Mark => (s === 'plain' ? undefined : s)

export interface Files {
  conf?: Shown
  logs?: boolean
  out?: boolean
  session?: Shown
  py?: [string, Mark][]
  orders?: 'open'
}

export function explorer({ conf, logs, out, session, py = [], orders }: Files): TreeEntry[] {
  return [
    { name: '.venv', folder: true, state: 'muted', note: 'PySpark 4.2.0' },
    ...(conf ? [{ name: 'conf', children: [file('log4j2.properties', mark(conf))] }] : []),
    // The compact explorer (frame v2) is 175px: data/raw/orders is one row, so a day's file fits.
    orders === 'open'
      ? { name: 'data/raw/orders', children: [{ name: '…2026-10-01.csv', state: 'active' as const }, { name: '30 more days', state: 'muted' as const }] }
      : { name: 'data/raw/orders', folder: true },
    ...(logs ? [{ name: 'logs', folder: true, state: 'muted' as const, note: "Spark's log" }] : []),
    ...(out ? [{ name: 'out', folder: true, state: 'new' as const, note: 'daily_revenue' }] : []),
    file('.gitignore', undefined),
    file('requirements.txt', undefined),
    ...(session ? [file('session.py', mark(session))] : []),
    ...py.map(([name, mark]) => file(name, mark)),
  ]
}
