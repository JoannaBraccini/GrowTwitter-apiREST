import { AuthController } from "../controllers/auth.controller";
import { AuthMiddleware } from "../middlewares/auth/auth.middleware";
import { LoginMiddleware } from "../middlewares/auth/login.middleware";
import { Router } from "express";
import { SignupMiddleware } from "../middlewares/auth/signup.midleware";
import { UserMiddleware } from "../middlewares/user.middleware";

export class AuthRoutes {
  public static execute(): Router {
    const router = Router();

    router.post(
      "/signup",
      [
        SignupMiddleware.validateRequired,
        UserMiddleware.validateTypes,
        UserMiddleware.validateLength,
      ],
      AuthController.signup
    );

    router.post(
      "/login",
      [LoginMiddleware.validateRequired, UserMiddleware.validateTypes],
      AuthController.login
    );

    router.get("/validate", AuthMiddleware.validate, (req, res) => {
      res.status(200).json({
        ok: true,
      });
    });

    return router;
  }
}
