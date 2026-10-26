-- The shop's own tables, as its web app sees them.
CREATE TABLE customers (
    customer_id bigint PRIMARY KEY,
    country     text NOT NULL,
    signup_date date NOT NULL,
    email       text NOT NULL
);
CREATE TABLE products (
    product_id bigint PRIMARY KEY,
    sku        text NOT NULL,
    name       text NOT NULL,
    brand      text NOT NULL,
    category   text NOT NULL,
    price      numeric(10, 2) NOT NULL
);
COPY customers FROM '/data/customers.csv' WITH (FORMAT csv, HEADER true);
COPY products FROM '/data/products.csv' WITH (FORMAT csv, HEADER true);
