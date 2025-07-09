import { Request, Response } from "express";
import { Pool } from "pg";
import { config } from "../../../config";

const pool = new Pool(config.db);

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const listRoutes = async (req: Request, res: Response) => {

    const { type, active, sort, page = '1', limit = String(DEFAULT_PAGE_SIZE) } = req.query;

    // Validate and parse pagination params
    const pageNum = Math.max(1, parseInt(page as string));
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * pageSize;

    // Build query with parameters
    let query = "SELECT * FROM routes WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    // Add type filter if provided
    if (type) {
        query += ` AND type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
    }

    // Add active filter if provided
    if (active) {
        query += ` AND active = $${paramIndex}`;
        params.push(active === 'true');
        paramIndex++;
    }

    // Add sorting with validation
    if (sort) {
        // Validate sort parameter format (field:order)
        const [field, order] = (sort as string).split(':');
        const validFields = ['id', 'name', 'type'];
        const validOrders = ['ASC', 'DESC'];

        const sortField = validFields.includes(field) ? field : 'id';
        const sortOrder = validOrders.includes(order?.toUpperCase()) ? order.toUpperCase() : 'ASC';

        query += ` ORDER BY ${sortField} ${sortOrder}`;
    }

    // Get total count for pagination metadata
    const countQuery = "SELECT COUNT(*) FROM routes";
    const totalCountResult = await pool.query(countQuery, params);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    const routes = await pool.query(query, params);

    // Send response with pagination metadata
    res.json({
        data: routes.rows,
        pagination: {
            total: totalCount,
            page: pageNum,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        }
    });

};

export const getRouteStops = async (req: Request, res: Response) => {

    const { id } = req.params;

    // Query to get all stops for a route, ordered by stop sequence
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

    const routeStops = await pool.query(query, [id]);

    if (routeStops.rows.length === 0) {
        res.status(404).json({
            error: 'No stops found for this route or route does not exist'
        });
        return;
    }

    res.json({
        data: routeStops.rows
    });
};  