import { Request, Response } from "express";
import { getRoutesPopularity } from "../../../repository/reports";

export const getRoutesPopularityReport = async (
  req: Request,
  res: Response,
) => {
  const result = await getRoutesPopularity();
  res.json({
    data: result,
  });
};
