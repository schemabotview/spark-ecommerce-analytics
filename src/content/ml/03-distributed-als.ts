import type { Section } from '../types'

export const distributedAls: Section = {
  id: 'distributed-als',
  title: 'Distributed ALS',
  scene: 'ml-distributed-als',
  narration:
    "How does ALS fill in the matrix, and why does it suit Spark? It looks for two small matrices whose product approximates the big one: a row of eight numbers for every customer, and a row of eight numbers for every product. A predicted rating is the dot product of a customer's row and a product's row. Finding both at once is hard. But if the products' numbers are fixed, each customer's row is a small least squares problem that can be solved on its own, and the same is true the other way round. So ALS alternates: fix the products, solve every customer; fix the customers, solve every product; ten rounds. Each half is embarrassingly parallel. Spark splits the customers into blocks and the products into blocks, four of each here, and between half steps shuffles each block's factors to where they are needed. The lab's run took five jobs and fifty four stages. The proof is at the bottom: for customer one and product one, the first four of eight numbers on each side, and their dot product, three point eight nine, is exactly the prediction the model gives.",
}
