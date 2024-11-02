import { Router } from "express";
import { CreateUserMiddleware } from "../middlewares/create-user.midleware";

export class UserRoutes {
  public static execute(): Router {
    const router = Router();

    router.post(
      "/users",
      [
        CreateUserMiddleware.validateRequired,
        CreateUserMiddleware.validateTypes,
        CreateUserMiddleware.validateLength,
        CreateUserMiddleware.validateUnique,
      ],
      UserController.create
    );

    return router;
  }
}
