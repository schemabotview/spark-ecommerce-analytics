"""The website's tracker, replayed: one day of click events sent to Kafka,
in the order they arrived.

    python -m shopwave.tracker 2026-10-01 [2026-10-02 …]
"""
import sys

from pyspark.sql import functions as F

from shopwave.session import spark_session

KAFKA = "localhost:9092"  # compose.yaml
TOPIC = "clicks"


def main(days: list[str]) -> None:
    spark = spark_session()
    lines = spark.read.text([f"data/raw/clickstream/{d}/" for d in days])
    # Send them in the order they arrived: file by file (events-<hour>.jsonl
    # sorts by time), line by line, from one task; parallel tasks would mix
    # the days up in every partition.
    lines = (lines.withColumn("file", F.input_file_name())
             .withColumn("line", F.monotonically_increasing_id())
             .repartition(1).sortWithinPartitions("file", "line"))
    # A record is a key and a value; the key picks its partition, so every
    # event of one visitor lands in the same partition, in order.
    visitor = F.coalesce(F.get_json_object("value", "$.user_id"),
                         F.get_json_object("value", "$.anon_id"))
    records = lines.select(visitor.alias("key"), "value")
    (records.write.format("kafka").option("kafka.bootstrap.servers", KAFKA)
     .option("topic", TOPIC).save())
    print(f"published {records.count()} events to {TOPIC}")


if __name__ == "__main__":
    main(sys.argv[1:])
