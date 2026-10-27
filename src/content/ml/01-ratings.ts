import type { Section } from '../types'

export const ratings: Section = {
  id: 'ratings',
  title: 'Ratings as a matrix',
  scene: 'ml-ratings',
  narration:
    "The last thing the business asks for is the most familiar: recommended for you. Shopwave's customers rate what they buy, from one to five stars, and the reviews now land in the raw data. A new schema reads them, and a new module, ml dot py, starts with a single function that loads them. Nine thousand four hundred and forty seven ratings, from one thousand eight hundred and thirty three customers, on fifty products. As a matrix, customers down the side and products across the top, that is ninety one thousand cells, and fewer than eight percent are filled. The empty cells are not zeros: nobody has said anything about them yet. Recommending means filling them in: guessing what each customer would rate the products they have never tried. Is there anything to learn? The customer with the most ratings, customer one, rates fashion four point six stars on average and books two point two, a full two stars apart. Most customers have a favourite category and one they dislike, and that pattern, hidden in a sparse matrix, is what the model has to find.",
}
