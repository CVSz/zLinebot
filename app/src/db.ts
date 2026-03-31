import pg from "pg";
import { env } from "./utils/env.js";

const { Pool } = pg;

export const db = new Pool({
  connectionString: env.databaseUrl
});
