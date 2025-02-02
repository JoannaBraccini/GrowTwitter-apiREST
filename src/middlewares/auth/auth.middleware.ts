import { NextFunction, Request, Response } from "express";
import { JWT } from "../../utils/jwt";

export class AuthMiddleware {
  public static async validate(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    //Busca o dado
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.status(401).json({
        ok: false,
        message: "Not authenticated.",
      });
      return;
    }

    //Desestrutura o bearer token para usar somente o token
    const [_, token] = authorization.split(" ");
    // const token = authorization.split(" ")[1] -> assim também funciona, pegando apenas a segunda posição que é o token

    if (!token) {
      res.status(401).json({
        ok: false,
        message: "Not authenticated.",
      });
      return;
    }

    const jwt = new JWT();

    const userDecoded = jwt.verifyToken(token);

    if (!userDecoded) {
      res.status(401).json({
        ok: false,
        message: "Not authenticated.",
      });
      return;
    }

    req.AuthUser = {
      id: userDecoded.id,
      name: userDecoded.name,
      username: userDecoded.username,
      email: userDecoded.email,
    };

    next();
  }
}
