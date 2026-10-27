import type { Section } from '../types'

export const dataQualityAsCode: Section = {
  id: 'data-quality-as-code',
  title: 'Data quality as code',
  scene: 'production-checks',
  narration:
    "Tests check the code. Checks check the data, every night, after it is built. Checks dot py writes down what gold must be true of. Some are conditions every row must meet: revenue is never negative, quantity is between one and ten, payments are positive in euros, every product has a category. Others are queries that must come back empty: paid orders with no payment, sales of products that do not exist. Each has a level. An error stops the night; a warning is reported and the night goes on. Run against gold, everything passes except one warning: a hundred and ninety one paid orders have no payment. That is the generator's planted problem from the start of the course, a known issue that finance chases, so it is a warning, and the exit code is zero. With strict mode on, the same warning becomes an error, the checks print that the night stops here, and the exit code is one. Checks becomes a job in the nightly run, right after gold, so nothing built on bad data runs after it.",
}
