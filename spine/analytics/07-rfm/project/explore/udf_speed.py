"""The bot rule three ways, timed on 3 million user agents."""
import re
import time

import pandas as pd
from pyspark.sql import functions as F
from pyspark.sql.types import BooleanType

from shopwave import silver
from shopwave.session import spark_session

spark = spark_session()
BOT = re.compile(r"bot|crawl|spider|scraper", re.IGNORECASE)


@F.udf(BooleanType())
def python_udf(agent):  # called once per row
    return bool(agent and BOT.search(agent))


@F.pandas_udf(BooleanType())
def pandas_udf(agents: pd.Series) -> pd.Series:  # once per batch of rows
    return agents.str.contains(BOT).fillna(False)


clicks = spark.read.parquet("lake/bronze/clicks").select("context.user_agent")
agents = clicks.crossJoin(spark.range(100)).select("user_agent").cache()
print("rows:", agents.count())
arrow = spark.conf.get("spark.sql.execution.pythonUDF.arrow.enabled")
print("Python UDFs travel as Arrow batches:", arrow)
for name, rule in [("built-in rlike", F.col("user_agent").rlike(silver.BOT)),
                   ("pandas UDF", pandas_udf("user_agent")),
                   ("Python UDF", python_udf("user_agent"))]:
    agents.filter(rule).count()  # once to warm up: start the Python workers
    start = time.perf_counter()
    bots = agents.filter(rule).count()
    print(f"{name:15} {bots:7} bots  {time.perf_counter() - start:5.1f} s")
