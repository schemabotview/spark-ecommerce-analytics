"""The funnel again, written in SQL over a view: same answer, same plan."""
import re
from pathlib import Path

from pyspark.sql import functions as F

from shopwave import analytics
from shopwave.session import spark_session

spark = spark_session()
clicks = spark.read.parquet("lake/silver/clicks").filter(
    F.col("event_date").between("2026-10-01", "2026-10-31"))
analytics.sessions(clicks).createOrReplaceTempView("visits")  # a SQL name

in_sql = spark.sql(Path("sql/funnel.sql").read_text())
in_python = analytics.funnel(spark.table("visits"))
print("SQL:      ", in_sql.first().asDict())
print("DataFrame:", in_python.first().asDict())

plan = lambda df: re.sub(r"#\d+L?", "", df._jdf.queryExecution()
                         .optimizedPlan().toString())
print("same optimized plan:", plan(in_sql) == plan(in_python))
