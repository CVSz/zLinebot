CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  actor TEXT,
  action TEXT,
  resource TEXT,
  before JSONB,
  after JSONB,
  trace_id TEXT,
  prev_hash TEXT,
  hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
