import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../services/auth.service";
import { JWT } from "../../utils/jwt";

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
      return;
    }

    const jwt = new JWT();

    const userDecoded = jwt.verifyToken(token);

    if (!userDecoded) {
      res.status(401).json({
        ok: false,
        message: "Not authenticated!",
      });
      return;
    }

    req.body.user = {
      id: userDecoded?.id,
      username: userDecoded?.username,
    };

    next();
  }
}
