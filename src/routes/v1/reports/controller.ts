import { Request, Response } from "express";
import { pool } from "../../../db";

export const getRoutesPopularity = async (req: Request, res: Response) => {

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
    res.json(result.rows);
};