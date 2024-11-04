import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { FindManyUsersMiddleware } from "../middlewares/find-many-users.middleware";
import { AuthMiddleware } from "../middlewares/auth/auth.middleware";
import { ValidateUuidMiddleware } from "../middlewares/validate-uuid.middleware";

export class UserRoutes {
  public static execute(): Router {
    const router = Router();

    //CREATE USER -> movido para authRoutes: signup
    //FIND MANY USERS (by query)
    router.get(
      "/users",
      [AuthMiddleware.validate, FindManyUsersMiddleware.validateTypes],
      UserController.findMany
    );

    //FIND ONE USER (by id)
    router.get(
      "/users/:id",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      UserController.findOne
    );

    return router;
  }
}
