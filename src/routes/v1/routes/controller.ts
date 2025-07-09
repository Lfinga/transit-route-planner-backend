import { Request, Response } from "express";
import { getRoutes, getRouteStopsById } from "../../../repository/routes";

export const listRoutes = async (req: Request, res: Response) => {
    const result = await getRoutes(req.query);
    res.json(result);
};

export const getRouteStops = async (req: Request, res: Response) => {
    const { id } = req.params;
    const stops = await getRouteStopsById(id);
    if (stops.length === 0) {
        res.status(404).json({
            error: 'No stops found for this route or route does not exist'
        });
        throw new Error('No stops found for this route or route does not exist');
    }
    res.json({
        data: stops
    });
};  