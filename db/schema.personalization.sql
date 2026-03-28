CREATE TABLE IF NOT EXISTS user_embeddings (
  user_id TEXT PRIMARY KEY,
  vector FLOAT[]
);
