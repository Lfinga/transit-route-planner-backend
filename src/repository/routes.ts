import { Pool } from "pg";
import { config } from "../config";
import { buildRoutesQuery } from "../utils";

const pool = new Pool(config.db);

export interface RouteFilters {
    type?: string;
    active?: string;
    sort?: string;
    page?: string;
    limit?: string;
}

export interface PaginationMetadata {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface RoutesResponse {
    data: any[];
    pagination: PaginationMetadata;
}

export async function getRoutes(params: RouteFilters): Promise<RoutesResponse> {
    const { mainQuery, countQuery, pageSize, pageNum } = buildRoutesQuery(params);

    // Get total count for pagination metadata
    const totalCountResult = await pool.query(countQuery.query, countQuery.params);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    // Execute main query
    const routes = await pool.query(mainQuery.query, mainQuery.params);

    return {
        data: routes.rows,
        pagination: {
            total: totalCount,
            page: pageNum,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        }
    };
}

export async function getRouteStopsById(routeId: string) {
    const query = `
        SELECT DISTINCT 
            s.id as stop_id,
            s.name as stop_name,
            s.location,
            ts.stop_sequence
        FROM routes r
        JOIN trips t ON t.route_id = r.id
        JOIN trip_stops ts ON ts.trip_id = t.id
        JOIN stops s ON s.id = ts.stop_id
        WHERE r.id = $1
        ORDER BY ts.stop_sequence ASC
    `;

    const routeStops = await pool.query(query, [routeId]);
    return routeStops.rows;
}