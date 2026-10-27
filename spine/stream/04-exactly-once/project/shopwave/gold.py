"""Gold: the star schema the business asks its questions of."""
from pyspark.sql import DataFrame
from pyspark.sql import functions as F

from shopwave.session import spark_session

LAKE = "lake"


def fact_sales(orders: DataFrame, items: DataFrame) -> DataFrame:
    """One row per order line: the grain every revenue question starts from."""
    order = orders.select("order_id", "order_ts", "order_date", "local_date",
                          "customer_id", "country", "status")
    return items.select("order_id", "line", "product_id", "qty",
                        "unit_price").join(order, "order_id").withColumn(
        "revenue", F.col("qty") * F.col("unit_price"))


def fact_payments(payments: DataFrame, fx: DataFrame) -> DataFrame:
    """Every payment in euros. fx is a few thousand rows: each task gets all
    of it (a broadcast), so the payments never move."""
    rates = fx.select(F.col("date").alias("paid_date"), "currency", "per_eur")
    paid = payments.withColumn("paid_date", F.to_date("paid_ts"))
    joined = paid.join(F.broadcast(rates), ["paid_date", "currency"], "left")
    rate = F.coalesce("per_eur", F.lit(1))  # EUR has no row: 1 EUR = 1 EUR
    return joined.withColumn("amount_eur", F.round(F.col("amount") / rate, 2))


def dim_customer(customers: DataFrame) -> DataFrame:
    """Who buys: one row per customer."""
    return customers.select("customer_id", "country", "signup_date")


def dim_product(products: DataFrame) -> DataFrame:
    """What is bought: one row per product."""
    return products.select("product_id", "sku", "name", "brand", "category")


def main() -> None:
    spark = spark_session()
    silver = {t: spark.read.parquet(f"{LAKE}/silver/{t}")
              for t in ["orders", "order_items", "payments", "fx_rates",
                        "customers", "products"]}
    tables = {
        "fact_sales": fact_sales(silver["orders"], silver["order_items"]),
        "fact_payments": fact_payments(silver["payments"], silver["fx_rates"]),
        "dim_customer": dim_customer(silver["customers"]),
        "dim_product": dim_product(silver["products"]),
    }
    for name, df in tables.items():  # Delta: a write is all or nothing
        df.write.format("delta").mode("overwrite").save(f"{LAKE}/gold/{name}")
    print("gold: written", ", ".join(tables))


if __name__ == "__main__":
    main()
