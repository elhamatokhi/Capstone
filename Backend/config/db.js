import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Database connected! Current time:", res.rows[0]);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

export default pool;
