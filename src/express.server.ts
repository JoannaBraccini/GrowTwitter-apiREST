import cors from "cors";
import express from "express";
import { makeRoutes } from "./routes";
import { restrictActionsMiddleware } from "./middlewares/restrictActionsMiddleware";

export const createServer = () => {
  const app = express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json());
  app.use(restrictActionsMiddleware);

  makeRoutes(app);

  return app;
};
