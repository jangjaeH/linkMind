import { Pool } from "pg";

declare global {
  var __linkmindPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export const db =
  global.__linkmindPool ??
  new Pool({
    connectionString
  });

if (process.env.NODE_ENV !== "production") {
  global.__linkmindPool = db;
}

