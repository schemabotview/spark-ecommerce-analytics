import type { Section } from '../types'

export const broadcastJoin: Section = {
  id: 'broadcast-join',
  title: 'Broadcast join: currency conversion without a shuffle',
  scene: 'model-broadcast',
  narration:
    "Payments arrive in four currencies, and the business wants every amount in euros. The finance team's exchange rates are a new source: bronze now lands them, one row per day and currency, a little over a thousand rows. Gold's fact payments joins each payment to the rate for its day and currency, and divides. Euro payments have no rate row, so the join is a left join, and a missing rate counts as one. The rates table is tiny, so instead of shuffling both sides, Spark can broadcast it: the driver collects the whole table once and sends a copy to every task. Each task then joins its own payments against its local copy, and the payments never move. The experiment runs the same join both ways. Forced into a sort merge join, thirty nine thousand five hundred bytes cross the shuffle. Broadcast, two hundred and thirty six bytes, and those belong to the final count, not to the join. On a real year of payments that is the difference between moving gigabytes and moving nothing. The plan names it a broadcast hash join. Spark broadcasts on its own when one side is under ten megabytes, but gold dot py says so explicitly with F dot broadcast, because the rule depends on Spark's size estimate, and the fact payments table should never fall back to a shuffle by accident. Every payment now has an amount in euros: four hundred and eighty eight thousand euros in all.",
}
