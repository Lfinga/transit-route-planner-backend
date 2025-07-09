import { Request, Response } from "express";
import { getStops } from "../../../repository/stops";

const listStops = async (req: Request, res: Response) => {
    const result = await getStops(req.query);
    res.json(result);
};

export { listStops };