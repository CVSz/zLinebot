CREATE TABLE identities (
  id UUID PRIMARY KEY,
  type TEXT,
  value TEXT UNIQUE
);

CREATE TABLE links (
  a UUID,
  b UUID,
  weight FLOAT DEFAULT 1
);
