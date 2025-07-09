import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { getErrorMessage } from "../utils";

export default function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent || config.debug) {
        next(error);
        return;
    }


    res.status(500).json({ error: { message: getErrorMessage(error) || "Internal server error. Please view logs for more details.", status: 500 } });
};