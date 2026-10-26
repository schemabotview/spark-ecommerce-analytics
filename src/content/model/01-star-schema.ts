import type { Section } from '../types'

export const starSchema: Section = {
  id: 'star-schema',
  title: 'Facts and dimensions: the star schema',
  scene: 'model-star',
  narration:
    "Silver is clean, but it is still shaped like the systems that produced it. Gold is shaped like the questions the business asks, and the classic shape is a star. At its centre is a fact table: one row for each thing that happened, here one row per order line, with the numbers you add up. Around it are dimensions: one row per thing you describe, customers and products. Gold dot py builds them. Fact sales joins each order line to its order, to get the date, the customer and the country, and computes revenue as quantity times unit price. The two dimensions are simple selects. The course's data now runs through the end of November, so it includes Black Friday. The experiment builds the star and checks it. Seven thousand three hundred and eighty nine order lines, two thousand customers, fifty products. Then the most important line in this section: paid revenue summed from the lines, and paid revenue summed from the orders' totals, must agree to the cent. They do, four hundred and fifty eight thousand three hundred and eighty eight euros and eighty nine cents both ways. A check like that catches a join that silently duplicates or loses rows. Joining the fact to the product dimension answers the first real question: electronics sells the most, then beauty. Every one of these answers needed a join, and joins are where Spark spends its effort. The rest of this course is about what a join really costs, and what Black Friday does to it.",
}
