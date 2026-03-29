CREATE TABLE ledger (
  id UUID PRIMARY KEY,
  agent_id TEXT,
  delta NUMERIC,
  reason TEXT,
  ts TIMESTAMP DEFAULT NOW()
);
