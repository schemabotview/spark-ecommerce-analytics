-- The conversion funnel, in SQL: people's visits that reached each step.
WITH reached AS (
  SELECT session_id,
         max(int(event_type = 'page_view')) AS page_view,
         max(int(event_type = 'product_view')) AS product_view,
         max(int(event_type = 'add_to_cart')) AS add_to_cart,
         max(int(event_type = 'checkout')) AS checkout,
         max(int(event_type = 'purchase')) AS purchase
  FROM visits
  WHERE NOT is_bot
  GROUP BY session_id
)
SELECT sum(page_view) AS page_view, sum(product_view) AS product_view,
       sum(add_to_cart) AS add_to_cart, sum(checkout) AS checkout,
       sum(purchase) AS purchase
FROM reached
