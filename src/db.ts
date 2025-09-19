import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "test",
  password: "010305",
  port: 5432,
});
