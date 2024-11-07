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
      [UserMiddleware.validateTypes], //sem validação de token para visualizar
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
      ],
      UserController.update
    );

    //DELETE USER (id)
    router.delete(
      "/users/:id",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      UserController.remove
    );

    //FOLLOW USER (id)
    router.post(
      "/users/:id/follow",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      UserController.follow
    );

    //UNFOLLOW USER (id)
    router.delete(
      "/users/:id/follow",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      UserController.follow
    );
    return router;
  }
}
