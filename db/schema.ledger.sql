CREATE TABLE IF NOT EXISTS ledger (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
  amount NUMERIC(12,2) NOT NULL,
  ref TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
