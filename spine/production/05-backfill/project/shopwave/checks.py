"""What gold must be true of, written down: checked after every build.

A check is a table and a condition every row must meet, or a query that
must come back empty. An "error" stops the night; a "warn" is reported and
the night goes on (SHOPWAVE_STRICT=1 makes every warning an error).
"""
import os
import sys

from pyspark.sql import SparkSession

from shopwave.session import spark_session

GOLD = "lake/gold"
ROWS = [  # (level, table, a condition every row must meet)
    ("error", "fact_sales", "revenue >= 0"),
    ("error", "fact_sales", "qty BETWEEN 1 AND 10"),
    ("error", "fact_payments", "amount_eur > 0"),
    ("error", "dim_product", "category IS NOT NULL"),
]
EMPTY = [  # (level, what, a query that must return no rows)
    ("warn", "paid orders with no payment", """
        SELECT DISTINCT s.order_id FROM fact_sales s
        LEFT ANTI JOIN fact_payments p ON s.order_id = p.order_id
        WHERE s.status = 'paid'"""),
    ("error", "sales of unknown products", """
        SELECT * FROM fact_sales s
        LEFT ANTI JOIN dim_product p ON s.product_id = p.product_id"""),
]


def run(spark: SparkSession) -> bool:
    """Every check, printed; False if an error-level check failed."""
    for t in ["fact_sales", "fact_payments", "dim_product"]:
        table = spark.read.format("delta").load(f"{GOLD}/{t}")
        table.createOrReplaceTempView(t)
    strict = os.environ.get("SHOPWAVE_STRICT") == "1"
    ok = True
    checks = [(lv, f"{t}: {c}", f"SELECT * FROM {t} WHERE NOT ({c})")
              for lv, t, c in ROWS] + EMPTY
    for level, what, query in checks:
        bad = spark.sql(query).count()
        fails = bad and (level == "error" or strict)
        ok = ok and not fails
        mark = "✓" if not bad else "✗" if fails else "!"
        print(f"{mark} {what:42} {bad:5} bad rows")
    return ok


def main() -> None:
    if not run(spark_session()):
        sys.exit("checks: failed, the night stops here")


if __name__ == "__main__":
    main()
