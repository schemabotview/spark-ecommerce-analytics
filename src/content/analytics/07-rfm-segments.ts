import type { Section } from '../types'

export const rfmSegments: Section = {
  id: 'rfm-segments',
  title: 'RFM segments',
  scene: 'analytics-rfm',
  narration:
    'Marketing wants to treat customers differently, and the simplest serious way to group them is RFM. Recency: how many days since their last order. Frequency: how many orders. Monetary: how much they have spent. RFM computes the three per customer, as of the end of the year, then scores each from one to four with n tile, which splits the customers into four equal groups. For recency fewer days is better, so it is ordered descending. A segment then follows from the scores: champions are the most recent and most frequent, loyal customers order often, new ones are recent but have ordered once or twice, and lost ones have not ordered for months. Everyone else is occasional. The result, for one thousand nine hundred and eighty four customers who paid this year. Loyal customers are the largest group and bring in the most money, over nine hundred thousand euros. Two hundred and twenty four champions average twenty eight orders each, with their last order six days ago. Four hundred and thirty one customers are lost: their last order was over four months ago, a list worth an email. As with the moving average, these windows have no partition by: every customer is sorted in one task to cut the quartiles. For two thousand customers that is instant. For ten million, it is the bottleneck, and the fix is approximate percentiles, computed in parallel.',
}
