import type { Section } from '../types'

export const evaluatingHonestly: Section = {
  id: 'evaluating-honestly',
  title: 'Evaluating honestly',
  scene: 'ml-evaluate',
  narration:
    "A model has to be judged on ratings it has not seen, and the way it will be used decides how to split them. The model will predict the future from the past, so the split is by time: train on the six thousand two hundred and sixty four ratings before October, test on the three thousand one hundred and eighty three after. The measure is RMSE, roughly how many stars off a guess is. Every model needs a baseline to beat. Giving everyone the average rating is off by one point oh nine stars; giving each product its own average, one point oh. And ALS alone? One point two four: worse than the baselines. That is a real result, and a common one. ALS has no idea that some products are simply better than others, and its regularization pulls every guess toward zero stars. The fix is to let each one do what it is good at: the product's average carries how good a product is, and ALS learns only what the average misses, each customer's taste. The average plus ALS scores zero point nine one, the best of all. Split at random instead, the same model looks slightly better again, because it has trained on December to predict October. That number would be a promise the model could not keep.",
}
