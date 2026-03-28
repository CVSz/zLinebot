CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY,
  tenant_id TEXT,
  user_id TEXT NOT NULL,
  item_id UUID NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  reward DOUBLE PRECISION NOT NULL,
  action_prob DOUBLE PRECISION,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_user ON feedback (tenant_id, user_id);
