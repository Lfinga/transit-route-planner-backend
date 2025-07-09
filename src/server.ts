import express from "express";
import morgan from "morgan";
import cors from "cors";
import v1 from "./routes/v1";
import errorHandler from "./middleware/error-handler";

export const createServer = () => {
    const app = express();
    app.disable("x-powered-by").use(morgan("dev")).use(express.urlencoded({ extended: true })).use(express.json()).use(cors());

    app.use("/api/v1", v1);
    app.use(errorHandler);
    return app;
}