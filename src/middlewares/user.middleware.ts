import { NextFunction, Request, Response } from "express";

export class UserMiddleware {
  static validateTypes(req: Request, res: Response, next: NextFunction) {
    const { name, username, password } = req.query;
    const errors: string[] = [];

    if (name && typeof name !== "string") {
      errors.push("Name must be a string");
    }
    if (username && typeof username !== "string") {
      errors.push("Username must be a string");
    }
    if (password && typeof password !== "string") {
      errors.push("Password must be a string");
    }

    next();
  }

  public static validateLength(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { name, username, password } = req.body;
    const errors: string[] = [];

    if (name && name.length < 3) {
      errors.push("Name must be at least 3 characters long.");
    }

    if (username && username.length < 3) {
      errors.push("Username must be at least 3 characters long.");
    }

    if (password && password.length < 4) {
      errors.push("Password must be at least 4 characters long.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        ok: false,
        message: errors,
      });
    }

    return next();
  }
}
