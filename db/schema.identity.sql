CREATE TABLE IF NOT EXISTS identities (
  id UUID PRIMARY KEY,
  global_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform, platform_user_id)
);

CREATE TABLE IF NOT EXISTS identity_edges (
  id UUID PRIMARY KEY,
  from_id UUID NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  weight DOUBLE PRECISION NOT NULL CHECK (weight >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_id, to_id)
);
