import { Router } from "express";
import { LoginMiddleware } from "../middlewares/auth/login.middleware";
import { AuthController } from "../controllers/auth.controller";
import { SignupMiddleware } from "../middlewares/auth/signup.midleware";

export class AuthRoutes {
  public static execute(): Router {
    const router = Router();

    router.post(
      "/signup",
      [
        SignupMiddleware.validateRequired,
        SignupMiddleware.validateTypes,
        SignupMiddleware.validateLength,
        SignupMiddleware.validateUnique,
      ],
      AuthController.signup
    );

    router.post(
      "/login",
      [LoginMiddleware.validateRequired, LoginMiddleware.validateTypes],
      AuthController.login
    );

    return router;
  }
}
