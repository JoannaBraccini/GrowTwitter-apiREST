import { NextFunction, Request, Response } from "express";

export class AuthMiddleware {
  public static async validate(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    //busca o dado
    const token = req.headers.authorization;

    if (!token) {
      res.status(401).json({
        ok: false,
        message: "Not authenticated!",
      });
    }

    //chama o service
    const service = new AuthService();
    const UserFound = await service.validateToken(token);

    if (!UserFound) {
      res.status(401).json({
        ok: false,
        message: "Not authenticated!",
      });
    }

    req.body.user = {
      id: UserFound.id,
      type: UserFound.type,
    };

    return next();
  }
}
