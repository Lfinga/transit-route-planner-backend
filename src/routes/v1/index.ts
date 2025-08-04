import express, { Router } from "express";
import routes from "./routes";
import stops from "./stops";
import report from "./reports";

const v1: Router = express.Router();
v1.use("/routes", routes);
v1.use("/stops", stops);
v1.use("/report", report);
export default v1;
