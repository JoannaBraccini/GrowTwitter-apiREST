import { Express } from "express";
import swaggerUI from "swagger-ui-express";
import swaggerDoc from "../docs/swagger.json";
import { AuthRoutes } from "./auth.routes";
import { UserRoutes } from "./user.routes";
import { TweetRoutes } from "./tweet.routes";
import { Request, Response } from "express";
import { TrendsRoutes } from "./trends.routes";

export const makeRoutes = (app: Express) => {
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      ok: true,
      message: "GrowTwitter API 💻🌍",
    });
  });

  app.use("/docs", swaggerUI.serve);
  app.get("/docs", swaggerUI.setup(swaggerDoc));

  app.use(AuthRoutes.execute());
  app.use(UserRoutes.execute());
  app.use(TweetRoutes.execute());
  app.use(TrendsRoutes.execute());
};
