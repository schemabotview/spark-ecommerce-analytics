import type { Section } from '../types'

export const attribution: Section = {
  id: 'attribution',
  title: 'Attribution: which campaign brought the sale',
  scene: 'analytics-attribution',
  narration:
    "Marketing spends money on campaigns and wants to know which ones bring sales. First, a new source: marketing's campaign list lands in bronze. It is a single JSON array spread over several lines, so it is read with multi line set to true; ordinary JSON reading expects one object per line. Attribution then credits each purchase with the last campaign its visitor came through in the same session. Last, with ignore nulls, over the session's events so far, carries the most recent campaign forward to every later event. Purchases then get their revenue, summed from their items inside the array, with aggregate, a higher order function that folds a list without exploding it. Finally, a join to the campaigns, but not on equality alone: the campaign must match, and the purchase date must fall between the campaign's start and end. That is a range join, and Spark handles it like any other join with a condition. October's answer: most sales came from no campaign at all, direct visits, one thousand one hundred and seventeen sales and one hundred and thirty six thousand euros. The newsletter brought two hundred and twenty two sales, retargeting two hundred and seven. The spring sale and Black Friday campaigns were not running in October, so the range condition gives them nothing, even if a click carried their name. Last touch is only one model, and a simple one, but it is a fair start, and it is all in one query.",
}
