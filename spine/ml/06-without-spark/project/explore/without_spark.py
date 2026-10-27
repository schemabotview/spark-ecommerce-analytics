"""Lab: the same question on one machine, with pandas and scikit-learn."""
import glob
import time

import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import root_mean_squared_error
from sklearn.preprocessing import OneHotEncoder

start = time.perf_counter()
ratings = pd.concat(pd.read_csv(f, parse_dates=["reviewed_at"])
                    for f in sorted(glob.glob("data/raw/reviews/*.csv")))
products = pd.read_csv("data/raw/products.csv")
ratings = ratings.merge(products[["product_id", "category"]], on="product_id")
size = ratings.memory_usage(deep=True).sum() / 2**20
print(f"{len(ratings)} ratings · {size:.1f} MB in memory")

# A customer's taste per category, and a product's own quality: one-hot
ratings["taste"] = (ratings.customer_id.astype(str) + "/"
                    + ratings.category)
features = OneHotEncoder(handle_unknown="ignore")
known = ratings.reviewed_at < "2026-10-01"  # the same split as 10.4
train, test = ratings[known], ratings[~known]
x = features.fit_transform(train[["taste", "product_id"]])
model = Ridge(alpha=1.0).fit(x, train.rating)
guess = model.predict(features.transform(test[["taste", "product_id"]]))
print(f"features: {x.shape[1]} columns · RMSE on the test months: "
      f"{root_mean_squared_error(test.rating, guess):.3f}")
print(f"read, fit and scored in {time.perf_counter() - start:.1f} s")
