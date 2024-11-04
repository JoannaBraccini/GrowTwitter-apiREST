import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserMiddleware } from "../middlewares/user.middleware";
import { AuthMiddleware } from "../middlewares/auth/auth.middleware";
import { ValidateUuidMiddleware } from "../middlewares/validate-uuid.middleware";

export class UserRoutes {
  public static execute(): Router {
    const router = Router();

    //CREATE USER -> movido para authRoutes: signup
    //FIND MANY USERS (by query)
    router.get(
      "/users",
      [AuthMiddleware.validate, UserMiddleware.validateTypes],
      UserController.findMany
    );

    //FIND ONE USER (by id)
    router.get(
      "/users/:id",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      UserController.findOne
    );

    //UPDATE USER (id)
    router.put(
      "/users/:id",
      [
        AuthMiddleware.validate,
        ValidateUuidMiddleware.validate,
        UserMiddleware.validateTypes,
        UserMiddleware.validateLength,
        UserMiddleware.validateUnique,
      ],
      UserController.update
    );

    return router;
  }
}
