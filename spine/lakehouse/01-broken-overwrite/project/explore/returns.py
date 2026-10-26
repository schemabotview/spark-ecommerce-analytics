"""October's returns: the wrong encoding, then the right one, and the bad
lines."""

from pyspark.sql import functions as F

from shopwave import bronze, schemas
from shopwave.session import spark_session

spark = spark_session()
german = F.col("reason").startswith("Gr")  # the German reason "Größe falsch"
as_utf8 = spark.read.csv(
    "data/raw/returns/", header=True, schema=schemas.RETURNS
)
print("read as UTF-8:  ", as_utf8.filter(german).first().reason)

good, bad = bronze.returns(spark)
print("read as Latin-1:", good.filter(german).first().reason)
print(f"lines: {good.count()} good, {bad.count()} bad")
for row in bad.collect():
    print("  bad:", row._corrupt_record)
