import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { explorer } from './tree'
import csv from '../../../spine/start/01-project/captured/data/raw/orders/orders-2026-10-01.csv?raw'
import session from '../../../spine/start/01-project/session.txt?raw'

// §1 — Java, a venv and PySpark. Every value in the side pane is read from the session: the Java
// build, PySpark's version, how many jars `pip install pyspark` put in the venv and their size.
const java = outputOf(session, 'java -version 2>&1 | head -1').match(/version "([^"]+)"/)![1]
const version = outputOf(session, 'python -c "import pyspark; print(pyspark.__version__)"')
const jars = outputOf(session, 'ls .venv/lib/python3.14/site-packages/pyspark/jars | wc -l').trim()
const size = outputOf(session, 'du -sh .venv/lib/python3.14/site-packages/pyspark').split(/\s/)[0]

export const startProject: SceneModel = ideFrame2({
  model: 'pip install pyspark is all of Spark',
  tree: explorer({ orders: 'open' }),
  editor: { file: 'data/raw/orders/orders-2026-10-01.csv', code: csv, lang: 'text', show: [[1, 22]], highlight: [1] },
  session,
  side: [
    {
      type: 'group', id: 'installed', title: 'pip install pyspark', sub: `PySpark ${version} · ${size}B on disk`, icon: 'package', tone: 'ingest', children: [
        { type: 'item', id: 'api', title: 'pyspark', sub: 'the Python API you write against', icon: 'python' },
        { type: 'item', id: 'py4j', title: 'py4j', sub: 'carries each call to the JVM', icon: 'network' },
        { type: 'item', id: 'jars', title: `jars/ · ${jars} files`, sub: 'Spark itself, written in Scala', icon: 'spark' },
      ],
    },
    { type: 'item', id: 'jvm', title: `Java ${java}: the JVM`, sub: 'installed separately: pip does not bring it', icon: 'cpu', tone: 'infra' },
    {
      type: 'table', id: 'asked', title: 'Asked in the terminal', tone: 'ingest', columns: ['asked', 'answer'], rows: [
        ['java -version', java],
        ['pyspark.__version__', version],
        { id: 'r-jars', cells: ['ls …/jars | wc -l', `${jars} jars`], tone: 'store' },
        { id: 'r-size', cells: ['du -sh …/pyspark', size], tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'api', to: 'py4j' },
    { from: 'py4j', to: 'jars' },
    { from: 'installed', to: 'jvm', label: 'runs in' },
  ],
})
