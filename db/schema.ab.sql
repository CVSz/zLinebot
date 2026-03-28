CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  variants TEXT[] NOT NULL,
  traffic FLOAT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
  user_id TEXT NOT NULL,
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, experiment_id)
);
