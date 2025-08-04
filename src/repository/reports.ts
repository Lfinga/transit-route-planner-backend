import { Pool } from "pg";
import { config } from "../config";

const pool = new Pool(config.db);

export interface RoutePopularity {
  route_name: string;
  total_trips: number;
}

export async function getRoutesPopularity(): Promise<RoutePopularity[]> {
  const query = `
        SELECT
            r.name as route_name,
            COUNT(t.id) as total_trips
        FROM routes r
        JOIN trips t ON t.route_id = r.id
        GROUP BY r.name
        ORDER BY total_trips DESC
    `;

  const result = await pool.query(query);
  return result.rows;
}
