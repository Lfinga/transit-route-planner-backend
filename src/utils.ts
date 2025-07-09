
import { StopFilters } from "./repository/stops";
import { RouteFilters } from "./repository/routes";

export function add(a: number, b: number): number {
    return a + b;
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    if (typeof error === "string") {
        return error;
    }
    return "Unknown error";
}

export function buildStopsQuery(filters: StopFilters): { query: string; params: any[] } {
    let query = `
        SELECT id, name, location, created_at 
        FROM stops
    `;
    const queryParams: any[] = [];

    // If name parameter is provided, add WHERE clause for case-insensitive partial match
    if (filters.name) {
        query += ` WHERE LOWER(name) LIKE LOWER($1)`;
        queryParams.push(`%${filters.name}%`);
    }

    return {
        query,
        params: queryParams
    };
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

    // Validate and parse pagination params
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * pageSize;

    // Build query with parameters
    let baseWhereClause = "WHERE 1=1";
    const filterParams: any[] = [];
    let paramIndex = 1;

    // Add type filter if provided
    if (type) {
        baseWhereClause += ` AND type = $${paramIndex}`;
        filterParams.push(type);
        paramIndex++;
    }

    // Add active filter if provided
    if (active) {
        baseWhereClause += ` AND active = $${paramIndex}`;
        filterParams.push(active === 'true');
        paramIndex++;
    }

    // Create count query with filter parameters
    const countQuery = `SELECT COUNT(*) FROM routes ${baseWhereClause}`;

    // Build the main query
    let mainQuery = `SELECT * FROM routes ${baseWhereClause}`;

    // Add sorting with validation
    if (sort) {
        // Validate sort parameter format (field:order)
        const [field, order] = sort.split(':');
        const validFields = ['id', 'name', 'type'];
        const validOrders = ['ASC', 'DESC'];

        const sortField = validFields.includes(field) ? field : 'id';
        const sortOrder = validOrders.includes(order?.toUpperCase()) ? order.toUpperCase() : 'ASC';

        mainQuery += ` ORDER BY ${sortField} ${sortOrder}`;
    }

    // Add pagination to main query only
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