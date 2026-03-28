CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'demo',
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id INT NOT NULL REFERENCES products(id),
  qty INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'demo',
  user_id TEXT NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_qr TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS subscriptions (
  tenant_id TEXT PRIMARY KEY,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  amount NUMERIC,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
