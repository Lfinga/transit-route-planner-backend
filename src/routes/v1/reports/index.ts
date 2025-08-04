import express, { Router } from "express";
import { getRoutesPopularityReport } from "./controller";

const report: Router = express.Router();

report.get("/routes/popularity", getRoutesPopularityReport);

export default report;
