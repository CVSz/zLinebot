CREATE TABLE IF NOT EXISTS controls (
  id UUID PRIMARY KEY,
  framework TEXT,
  control_id TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY,
  control_id TEXT,
  artifact TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
