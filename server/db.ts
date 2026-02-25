import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Use a fallback so Vite builds don't crash when DATABASE_URL is not set.
// You MUST provide a valid DATABASE_URL in production.
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });
