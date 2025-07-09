import express, { Router } from "express";
import routes from "./routes";
import stops from "./stops";

const v1: Router = express.Router();
v1.use("/routes", routes);
v1.use("/stops", stops);
export default v1;