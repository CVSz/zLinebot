CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  product_id INT,
  type TEXT NOT NULL,
  value NUMERIC,
  ts TIMESTAMP NOT NULL DEFAULT NOW()
);
