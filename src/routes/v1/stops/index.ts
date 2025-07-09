import express, { Router } from "express";
import { listStops } from "./controller";

const stops: Router = express.Router();

stops.get("/search", listStops);

export default stops;