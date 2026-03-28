CREATE TABLE IF NOT EXISTS events (
  event_id String,
  tenant_id String,
  user_id String,
  product_id String,
  type LowCardinality(String),
  value Float64,
  ts DateTime
)
ENGINE = MergeTree
PARTITION BY toDate(ts)
ORDER BY (tenant_id, ts, event_id);
