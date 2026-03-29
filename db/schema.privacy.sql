CREATE TABLE IF NOT EXISTS consents (
  user_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  version TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, purpose)
);

CREATE TABLE IF NOT EXISTS dsr_requests (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('access', 'delete', 'rectify')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
