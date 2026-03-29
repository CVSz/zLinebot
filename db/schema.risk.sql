CREATE TABLE IF NOT EXISTS risk_events (
  id UUID PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
