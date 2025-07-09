import { Request, Response } from "express";
import { pool } from "../../../db";

const getStops = async (req: Request, res: Response) => {
    const { name } = req.query;

    let query = `
        SELECT id, name, location, created_at 
        FROM stops
    `;
    const queryParams: any[] = [];

    // If name parameter is provided, add WHERE clause for case-insensitive partial match
    if (name) {
        query += ` WHERE LOWER(name) LIKE LOWER($1)`;
        queryParams.push(`%${name}%`);
    }

    const result = await pool.query(query, queryParams);
    res.json({
        data: result.rows
    });
};

export { getStops };