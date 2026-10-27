"""How Spark cuts files into input partitions: one task each."""
import os

from shopwave import schemas, scale
from shopwave.session import spark_session

path = f"{scale.SF1}/order_items/"
files = [os.path.getsize(path + f) for f in os.listdir(path)]
print(f"{len(files)} files · {sum(files) / 2**20:.0f} MB · "
      f"about {sum(files) / len(files) / 2**10:.0f} KB each")
for size in ["128m", "16m", "1m"]:
    spark = spark_session(**{"spark.sql.files.maxPartitionBytes": size})
    items = spark.read.csv(path, header=True, schema=schemas.ORDER_ITEMS)
    print(f"maxPartitionBytes {size:>4}: "
          f"{items.rdd.getNumPartitions():4} partitions")
    spark.stop()
