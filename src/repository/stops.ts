import { Pool } from "pg";
import { config } from "../config";

const pool = new Pool(config.db);

export interface Stop {
  id: string;
  name: string;
  location: string;
  created_at: Date;
}

export interface StopFilters {
  name?: string;
}

export interface StopsResponse {
  data: Stop[];
}

function buildStopsQuery(filters: StopFilters): {
  query: string;
  params: string[];
} {
  let query = `
        SELECT id, name, location, created_at 
        FROM stops
    `;
  const queryParams: string[] = [];

  // If name parameter is provided, add WHERE clause for case-insensitive partial match
  if (filters.name) {
    query += ` WHERE LOWER(name) LIKE LOWER($1)`;
    queryParams.push(`%${filters.name}%`);
  }

  return {
    query,
    params: queryParams,
  };
}

export async function getStops(filters: StopFilters): Promise<StopsResponse> {
  const { query, params } = buildStopsQuery(filters as StopFilters);
  const result = await pool.query(query, params);

  return {
    data: result.rows,
  };
}
