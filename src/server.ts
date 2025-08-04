import express from "express";
import morgan from "morgan";
import cors from "cors";
import v1 from "./routes/v1";
import errorHandler from "./error-handler";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(
      cors({
        origin: true,
        credentials: true,
      }),
    );

  app.use("/api/v1", v1);

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/", (req, res) => {
    res.send("Hello Worlddd !!!");
  });
  app.use(errorHandler);
  return app;
};
