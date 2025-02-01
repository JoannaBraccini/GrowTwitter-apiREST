import cors from "cors";
import express from "express";
import { makeRoutes } from "./routes";

export const createServer = () => {
  const app = express();

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  makeRoutes(app);

  return app;
};
