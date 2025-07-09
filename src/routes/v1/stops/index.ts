import express, { Router } from "express";
import { getStops } from "./controller";

const stops: Router = express.Router();

stops.get("/search", getStops);

export default stops;