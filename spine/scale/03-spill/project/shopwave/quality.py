"""Quality gates: a table is written only when its numbers make sense."""
import os

from pyspark.sql import DataFrame
from pyspark.sql import functions as F

# How many rows cleaning may drop before something is wrong (duplicates: ~0.5%)
MAX_LOSS = float(os.environ.get("SHOPWAVE_MAX_LOSS", "0.02"))


def gate(name: str, df: DataFrame, rows_in: int, not_null: list[str]) -> bool:
    """Print the table's numbers; False when it lost too many rows, or has a
    null where none may be."""
    rows = df.count()
    loss = 1 - rows / rows_in
    counted = {c: df.filter(F.col(c).isNull()).count() for c in not_null}
    nulls = {c: n for c, n in counted.items() if n}
    ok = loss <= MAX_LOSS and not nulls
    print(f"{'✓' if ok else '✗'} {name:8} {rows_in:6} → {rows:6} rows "
          f"({loss:.2%} dropped, max {MAX_LOSS:.2%})"
          + (f", nulls: {nulls}" if nulls else ""))
    return ok
