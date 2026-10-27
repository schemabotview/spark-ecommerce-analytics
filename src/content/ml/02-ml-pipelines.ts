import type { Section } from '../types'

export const mlPipelines: Section = {
  id: 'ml-pipelines',
  title: 'ML pipelines',
  scene: 'ml-pipeline',
  narration:
    "Spark's machine learning library is built from two kinds of piece. A transformer turns one DataFrame into another. An estimator learns from a DataFrame and produces a transformer, a model. A pipeline chains them, so that fitting the pipeline fits every stage in order, and the result is one model that can be saved, loaded and applied as a unit. Shopwave's pipeline has two stages. A SQL transformer selects the three columns the algorithm wants: customer, product, and the rating as a float. Then ALS, alternating least squares, the classic collaborative filtering algorithm. Its main settings: rank, how many numbers describe each customer and each product, here eight; a regularization parameter that keeps those numbers small; a fixed seed, because the factors start random; and a cold start strategy of drop, so the model makes no guess for a customer it has never seen. Fitted on every rating, it learns one thousand eight hundred and thirty three customer vectors and fifty product vectors, and transform adds a prediction column. On ratings it has already seen, the guesses are close, which proves nothing yet.",
}
