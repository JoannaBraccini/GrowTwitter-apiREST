import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../services/auth.service";

export class AuthMiddleware {
  public static async validate(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    //busca o dado
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "Not authenticated!",
      });
    }

    //chama o service
    const service = new AuthService();
    const userFound = await service.validateToken(token);

    if (!userFound) {
      res.status(401).json({
        ok: false,
        message: "Not authenticated!",
      });
    }

    req.body.user = {
      id: userFound?.id,
      username: userFound?.username,
    };

    return next();
  }
}
