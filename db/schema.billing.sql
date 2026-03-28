CREATE TABLE IF NOT EXISTS subscriptions (
  tenant_id TEXT PRIMARY KEY,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  amount NUMERIC,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
