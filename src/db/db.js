import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import PG from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create a connection pool to the PostgreSQL database
export const pool = new PG.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool); // Create a Drizzle ORM instance using the connection pool
