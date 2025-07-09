import express, { Router, RequestHandler } from "express";
import { listRoutes, getRouteStops } from "./controller";

const routes: Router = express.Router();

routes.get("/", listRoutes);
routes.get("/:id/stops", getRouteStops as RequestHandler);

export default routes;