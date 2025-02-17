import { Router } from "express";
import { TrendsController } from "../controllers/trends.controller";

export class TrendsRoutes {
  public static execute(): Router {
    const router = Router();

    router.get("/trends", TrendsController.findAll); //sem validação de token para visualizar

    return router;
  }
}
