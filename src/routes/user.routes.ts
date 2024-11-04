import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { FindManyUsersMiddleware } from "../middlewares/find-many-users.middleware";
import { AuthMiddleware } from "../middlewares/auth/auth.middleware";

export class UserRoutes {
  public static execute(): Router {
    const router = Router();

    //CREATE USER -> movido para authRoutes: signup

    //FIND MANY USERS
    router.get(
      "/users",
      [AuthMiddleware.validate, FindManyUsersMiddleware.validateTypes],
      UserController.findMany
    );

    //FIND ONE USER
    // router.get(
    //   "users/:id",
    //   [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
    //   UserController.findOne
    // );

    return router;
  }
}
