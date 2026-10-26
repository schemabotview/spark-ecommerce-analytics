import type { Section } from '../types'

export const jdbc: Section = {
  id: 'jdbc',
  title: "JDBC: reading the shop's database",
  scene: 'ingest-jdbc',
  narration:
    "Customers and products do not arrive as files. They live in the shop's own database, PostgreSQL, so we read them directly. Compose dot yaml describes that database for Docker. Docker compose up starts PostgreSQL seventeen, and init dot sql creates the two tables and loads them from the generated data, so every run starts from the same state. The status check says it is running and healthy. Spark talks to databases through JDBC, which needs the database's own driver, a jar file. Jars dot txt lists its address on Maven Central, curl downloads it into the jars folder, and the session now hands every jar in that folder to Spark. Reading a table is one line, and by default it is one query: one partition, read by one task, however big the table. Bronze dot table does better. It asks the database for the smallest and largest key, then tells Spark to split that range into four strides, one query each. The experiment prints Spark's own partition list: four WHERE clauses, each covering about five hundred customers, and the first one also catches any null keys. Four tasks run the four queries at the same time. Two things to keep in mind: the key should be spread evenly, or one query does all the work, and each partition is a separate connection to a database that also serves the live shop. The types came from the database itself: a bigint id, and a real date for signup.",
}
