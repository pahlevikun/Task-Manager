import { Pool, PoolConfig } from "pg";

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_MAX_CONNECTIONS || "20", 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10),
  connectionTimeoutMillis: parseInt(
    process.env.DB_CONNECTION_TIMEOUT || "2000",
    10
  ),
};

const pool = new Pool(poolConfig);

// Event listener for pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  pool,
};
