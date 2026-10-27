import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { lakeTree } from './tree'
import code from '../../../spine/lakehouse/06-scd2/project/shopwave/lake.py?raw'
import session from '../../../spine/lakehouse/06-scd2/session.txt?raw'

// §6 — SCD type 2: price history. One product's rows and the as-of check are the session's.
const out = outputOf(session, 'python -m explore.scd2')
const [, rows, repriced] = out.match(/price rows: (\d+) · products repriced: (\d+)/)!
const prices = [...out.matchAll(/product (\d+): €\s+([\d.]+)\s+(\S+) → (\S+)(\s+current)?/g)]
  .map(([, id, price, from, to, current]) => ({ id, price, from, to, current: !!current }))
const [, checked, sales, wrong] = out.match(/sales checked: (\d+) of (\d+) · price on the day wrong: (\d+)/)!

export const lakehouseScd2: SceneModel = ideFrame({
  tree: lakeTree(['shopwave/lake.py', 'explore/scd2.py', 'data/raw/product_prices.csv'], 'shopwave/lake.py', ['explore/scd2.py']),
  editor: { file: 'shopwave/lake.py', code, ...view(code, 'def price_history(', 'isNull()))'), highlight: linesFrom(code, 'upto = F.date_sub', '.isNull()))') },
  session,
  side: [
    {
      type: 'table', id: 'history', title: `Product ${prices[0].id}: every price it has had`, tone: 'store', columns: ['price', 'valid_from', 'valid_to', 'is_current'],
      rows: prices.map((p, i) => ({ id: `p${i}`, cells: [`€ ${p.price}`, p.from, p.to, String(p.current)], tone: p.current ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'rules', title: `${rows} rows, ${repriced} products repriced`, icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'r-to', title: 'valid_to: the day before the next price', sub: 'lead() over the product’s rows', icon: 'layers' },
        { type: 'item', id: 'r-open', title: 'the current price: 9999-12-31', sub: 'open, so between() still works', icon: 'clock' },
        { type: 'item', id: 'r-asof', title: `as-of join: ${checked} of ${sales} sales`, sub: `price on the day wrong: ${wrong}`, icon: 'check', tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'Type 1 overwrites the price and forgets. Type 2 keeps a row per price, so a sale in March is joined to March’s price, not today’s.' },
  ],
})
