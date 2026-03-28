CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY,
  user_id TEXT,
  code TEXT UNIQUE,
  balance NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS affiliate_events (
  id UUID PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id),
  order_id UUID,
  commission NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
