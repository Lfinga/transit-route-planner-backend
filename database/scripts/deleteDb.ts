import { Pool } from "pg";
import { config } from "../../src/config";

const pool = new Pool({ ...config.db, database: "postgres" });

async function deleteDb() {
  await pool.query("DROP DATABASE IF EXISTS route_planner_db");
}

deleteDb();
