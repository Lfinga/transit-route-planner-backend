import { Pool } from "pg";
import { config } from "../config";

const pool = new Pool(config.db);

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

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
    const { type, active, sort, page = '1', limit = String(DEFAULT_PAGE_SIZE) } = params;

    // Validate and parse pagination params
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * pageSize;

    // Build query with parameters
    let baseWhereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Add type filter if provided
    if (type) {
        baseWhereClause += ` AND type = $${paramIndex}`;
        queryParams.push(type);
        paramIndex++;
    }

    // Add active filter if provided
    if (active) {
        baseWhereClause += ` AND active = $${paramIndex}`;
        queryParams.push(active === 'true');
        paramIndex++;
    }

    // Get total count for pagination metadata
    const countQuery = `SELECT COUNT(*) FROM routes ${baseWhereClause}`;
    const totalCountResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    // Build the main query
    let query = `SELECT * FROM routes ${baseWhereClause}`;

    // Add sorting with validation
    if (sort) {
        // Validate sort parameter format (field:order)
        const [field, order] = sort.split(':');
        const validFields = ['id', 'name', 'type'];
        const validOrders = ['ASC', 'DESC'];

        const sortField = validFields.includes(field) ? field : 'id';
        const sortOrder = validOrders.includes(order?.toUpperCase()) ? order.toUpperCase() : 'ASC';

        query += ` ORDER BY ${sortField} ${sortOrder}`;
    }

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(pageSize, offset);

    const routes = await pool.query(query, queryParams);

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