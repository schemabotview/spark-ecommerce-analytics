import type { Section } from '../types'

export const sparkSql: Section = {
  id: 'spark-sql',
  title: 'Spark SQL: the same engine',
  scene: 'analytics-sql',
  narration:
    'Everything in this course could have been written in SQL. Spark SQL is not a separate system: it is another way into the same engine. The script registers the session DataFrame as a temporary view called visits, which gives it a name that SQL can use for the rest of this Spark session. Funnel dot sql is the funnel from section five, in plain SQL: a common table expression marks, per session, whether each step was reached, then the outer query adds them up. Spark dot sql runs it and returns an ordinary DataFrame. The two answers, from SQL and from the DataFrame code, are identical, step for step. And the last line of the terminal shows why: after Catalyst has optimised them, the two plans are the same plan. Both are parsed into the same logical operators, rewritten by the same rules, and run as the same tasks. So choosing between SQL and the DataFrame API is a question of who reads the code, not of speed. SQL is easier for analysts and for long declarative queries. Python is easier when logic is reused, tested, or built up in functions, like the sessions function this query depends on. Most real platforms mix them, exactly like this: Python builds the reusable datasets, and SQL asks the questions. Course seven turns to the tables themselves, and fixes a weakness the platform has had since Course three.',
}
