import { Pool } from "pg";
import { config } from "../config";

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

interface RouteQueryResult {
    mainQuery: { query: string; params: any[] };
    countQuery: { query: string; params: any[] };
    pageSize: number;
    pageNum: number;
}

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export function buildRoutesQuery(filters: RouteFilters): RouteQueryResult {
    const { type, active, sort, page = '1', limit = String(DEFAULT_PAGE_SIZE) } = filters;

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * pageSize;

    let baseWhereClause = "WHERE 1=1";
    const filterParams: any[] = [];
    let paramIndex = 1;

    if (type) {
        baseWhereClause += ` AND type = $${paramIndex}`;
        filterParams.push(type);
        paramIndex++;
    }

    if (active) {
        baseWhereClause += ` AND active = $${paramIndex}`;
        filterParams.push(active === 'true');
        paramIndex++;
    }

    const countQuery = `SELECT COUNT(*) FROM routes ${baseWhereClause}`;
    let mainQuery = `SELECT * FROM routes ${baseWhereClause}`;

    if (sort) {
        const [field, order] = sort.split(':');
        const validFields = ['id', 'name', 'type'];
        const validOrders = ['ASC', 'DESC'];

        const sortField = validFields.includes(field) ? field : 'id';
        const sortOrder = validOrders.includes(order?.toUpperCase()) ? order.toUpperCase() : 'ASC';

        mainQuery += ` ORDER BY ${sortField} ${sortOrder}`;
    }

    mainQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const mainQueryParams = [...filterParams, pageSize, offset];

    return {
        mainQuery: {
            query: mainQuery,
            params: mainQueryParams
        },
        countQuery: {
            query: countQuery,
            params: filterParams
        },
        pageSize,
        pageNum
    };
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