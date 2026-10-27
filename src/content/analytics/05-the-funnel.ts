import type { Section } from '../types'

export const theFunnel: Section = {
  id: 'the-funnel',
  title: 'The conversion funnel',
  scene: 'analytics-funnel',
  narration:
    "Of everyone who visits Shopwave, how many buy? A funnel answers it step by step: viewed a page, viewed a product, added to cart, checked out, purchased. Funnel works on the sessions from the last section, leaving out the bot, whose visits never buy and would only drag every rate down. For each session it records, step by step, whether the session reached it: the maximum of a zero or one per event. Then it adds those up across all sessions. The chart and the table show October. Six thousand one hundred and sixty six visits viewed a page, and almost all of them viewed a product. Then the biggest drop: only sixty one percent added anything to a cart. A quarter of all visits reached checkout, and a quarter bought. So Shopwave converts one visit in four, and the place to improve is between looking at a product and putting it in the cart. Look closely and there is one more purchase than checkout. One session recorded a purchase without its checkout event, perhaps a click the tracker lost. Real data has rough edges like that, and a funnel should be read as a picture of behaviour, not an accounting identity. Notice too that this whole computation is one group by over sessions, then one aggregate: nothing here needed a loop over visitors, even though the question is about each visitor's path.",
}
