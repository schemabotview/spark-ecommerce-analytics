import type { Section } from '../types'

export const testingSparkCode: Section = {
  id: 'testing-spark-code',
  title: 'Testing Spark code',
  scene: 'production-tests',
  narration:
    "Every transform in Shopwave is a function from DataFrames to a DataFrame, which makes it testable without any real data. A test builds a few rows by hand, the cases that matter, calls the transform exactly as the job does, and compares the result to the frame it must give with assert DataFrame equal, from PySpark's own testing module. It compares rows and types, in any order. Three tests here. An order placed at half past eleven at night UTC is already the next day in Berlin, but not in New York. Revenue is quantity times unit price, and an order line whose order does not exist is not a sale. And latest keeps each order's newest change. Pytest is added to requirements. Conftest dot py starts one Spark session for the whole run, with a single shuffle partition and no web UI, because starting a JVM takes seconds and a test on four rows takes milliseconds. Three passed. Tests like these run on every change, before anything reaches the nightly run.",
}
