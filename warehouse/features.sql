CREATE TABLE IF NOT EXISTS user_features (
  tenant_id String,
  user_id String,
  ctr Float64,
  avg_order Float64,
  last_active DateTime
) ENGINE = MergeTree
ORDER BY (tenant_id, user_id);

CREATE TABLE IF NOT EXISTS item_features (
  tenant_id String,
  product_id String,
  popularity Float64,
  conversion Float64
) ENGINE = MergeTree
ORDER BY (tenant_id, product_id);
