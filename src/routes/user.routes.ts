import { Router } from "express";
import { CreateUserMiddleware } from "../middlewares/create-user.midleware";
import { UserController } from "../controllers/user.controller";
import { FindManyUsersMiddleware } from "../middlewares/find-many-users.middleware";
import { AuthMiddleware } from "../middlewares/auth/auth.middleware";
import { ValidateUuidMiddleware } from "../middlewares/validate-uuid.middleware";

export class UserRoutes {
  public static execute(): Router {
    const router = Router();

    //CREATE USER
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

    //FIND MANY USERS
    router.get(
      "/users",
      [AuthMiddleware.validate, FindManyUsersMiddleware.validateTypes],
      UserController.findMany
    );

    //FIND ONE USER
    router.get(
      "users/:id",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      UserController.findOne
    );

    return router;
  }
}
