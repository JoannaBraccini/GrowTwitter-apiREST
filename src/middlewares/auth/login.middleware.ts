import { NextFunction, Request, Response } from "express";

export class LoginMiddleware {
  public static validateRequired(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { email, username, password } = req.body;

    if (!email && !username) {
      res.status(400).json({
        ok: false,
        message: "Email or username are required",
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        ok: false,
        message: "Password is required",
      });
      return;
    }

    next();
  }
}
