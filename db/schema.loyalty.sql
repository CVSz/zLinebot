CREATE TABLE IF NOT EXISTS loyalty_points (
  user_id TEXT PRIMARY KEY,
  points INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY,
  referrer TEXT NOT NULL,
  referee TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (referrer, referee)
);
