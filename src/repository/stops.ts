import { Pool } from "pg";
import { config } from "../config";
import { buildStopsQuery } from "../utils";

const pool = new Pool(config.db);

export interface Stop {
    id: string;
    name: string;
    location: string,
    created_at: Date;
}

export interface StopFilters {
    name?: string;
}

export interface StopsResponse {
    data: Stop[];
}


export async function getStops(filters: StopFilters): Promise<StopsResponse> {
    const { query, params } = buildStopsQuery(filters as StopFilters);
    const result = await pool.query(query, params);

    return {
        data: result.rows
    };
}