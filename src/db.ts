import { Pool } from "pg";
import { config } from "./config";

let pool: Pool

export function getPool() {
    if (!pool) {
        pool = new Pool(config.db);
    }
    return pool;
}

