import { NextFunction, Request, Response } from "express";

export class LoginMiddleware {
  public static validateRequired(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { email, username, password } = req.body;

    if (!email && !username) {
      return res.status(400).json({
        ok: false,
        message: "Email or username are required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        message: "Password is required.",
      });
    }

    return next();
  }

  public static validateTypes(req: Request, res: Response, next: NextFunction) {
    const { email, username, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        ok: false,
        message: "All fields must be strings.",
      });
    }

    return next();
  }
}
