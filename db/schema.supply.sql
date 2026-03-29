CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY,
  location TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
  warehouse_id UUID,
  product_id UUID,
  stock INT
);
