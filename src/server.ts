import express from "express";
import morgan from "morgan";
import cors from "cors";
import v1 from "./routes/v1";
import errorHandler from "./error-handler";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(
      morgan(
        ":method :url :status :res[content-length] - :response-time ms | Origin: :req[origin] | Referer: :req[referer]",
      ),
    )
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(
      cors({
        origin: [
          "https://transit-route-planner-alb-1279243436.ca-central-1.elb.amazonaws.com",
          "http://transit-route-planner-alb-1279243436.ca-central-1.elb.amazonaws.com",
          "https://dhi46ykz6r0q0.cloudfront.net",
          "http://dhi46ykz6r0q0.cloudfront.net",
        ],
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
