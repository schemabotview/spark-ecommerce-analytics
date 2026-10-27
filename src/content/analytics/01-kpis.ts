import type { Section } from '../types'

export const kpis: Section = {
  id: 'kpis',
  title: 'KPIs: a year of Shopwave',
  scene: 'analytics-kpis',
  narration:
    'With gold in place, the platform can finally answer the business, and from this course on the data covers all of 2026. The first answers are the key performance indicators, KPIs, per day. Daily KPIs in analytics dot py filters to paid order lines, groups by day, and computes three numbers. Orders, counted as distinct order ids, because an order has several lines. Gross merchandise value, GMV, the sum of revenue. And average order value, GMV divided by orders. The script also writes the result to a small CSV, and the chart on the right draws it: every point is a real day. The year: three hundred and sixty five days, eighteen thousand and fourteen paid orders, two point one eight million euros of GMV, and an average order of about one hundred and twenty one euros. A typical day brings in about five and a half thousand euros. Then there is the spike. On Black Friday, Shopwave took eight hundred and thirty seven orders and ninety eight thousand euros, eighteen times a median day, and the Monday after was the second biggest day of the year. That spike is why the platform has to be built for its peak, not its average. One detail matters: the result is three hundred and sixty five rows, small enough to bring to the driver with to pandas. That is the usual shape of analytics in Spark: process billions of rows on the cluster, and bring back only the small answer.',
}
