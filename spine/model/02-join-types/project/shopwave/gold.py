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


def dim_customer(customers: DataFrame) -> DataFrame:
    """Who buys: one row per customer."""
    return customers.select("customer_id", "country", "signup_date")


def dim_product(products: DataFrame) -> DataFrame:
    """What is bought: one row per product."""
    return products.select("product_id", "sku", "name", "brand", "category")


def main() -> None:
    spark = spark_session()
    silver = {t: spark.read.parquet(f"{LAKE}/silver/{t}")
              for t in ["orders", "order_items", "customers", "products"]}
    tables = {
        "fact_sales": fact_sales(silver["orders"], silver["order_items"]),
        "dim_customer": dim_customer(silver["customers"]),
        "dim_product": dim_product(silver["products"]),
    }
    for name, df in tables.items():
        df.write.mode("overwrite").parquet(f"{LAKE}/gold/{name}")
    print("gold: written", ", ".join(tables))


if __name__ == "__main__":
    main()
