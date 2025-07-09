import express, { Router } from "express";
import { getRoutesPopularity } from "./controller";

const report: Router = express.Router();

report.get("/routes/popularity", getRoutesPopularity);

export default report;