CREATE TABLE IF NOT EXISTS feature_registry (
  name TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  entity TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_lineage (
  id UUID PRIMARY KEY,
  feature_name TEXT NOT NULL REFERENCES feature_registry(name) ON DELETE CASCADE,
  upstream TEXT NOT NULL,
  transformation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
