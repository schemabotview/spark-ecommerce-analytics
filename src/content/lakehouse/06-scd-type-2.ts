import type { Section } from '../types'

export const scdType2: Section = {
  id: 'scd-type-2',
  title: 'SCD Type 2',
  scene: 'lakehouse-scd2',
  narration:
    "Prices change, and a report on March must use March's prices. Overwriting the price in the product table, type one, forgets the old price. A slowly changing dimension of type two keeps a row for every price a product has had, each with the day it became valid and the day it stopped. Price history builds it from the price change file. Valid to is the day before the product's next price, found with lead over the product's rows in date order. The current price has no next price, so its valid to is the last day of year nine nine nine nine, an open end that keeps between working, and is current flags it. Sixty six rows, eight products repriced. Product ten had three prices this year, the last from the day after Black Friday. The check joins every sale to the price valid on the day it was sold: all thirty five thousand and forty three sales find their row, and not one has a price that disagrees. That join, a range join on dates, is how every as of question is answered.",
}
