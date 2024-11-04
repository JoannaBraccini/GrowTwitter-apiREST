import { NextFunction, Request, Response } from "express";
import { prisma } from "../database/prisma.database";

export class UserMiddleware {
  static validateTypes(req: Request, res: Response, next: NextFunction) {
    const { name, username, password } = req.query;

    if (
      (name && typeof name !== "string") ||
      (username && typeof username !== "string") ||
      (password && typeof password !== "string")
    ) {
      res.status(400).json({
        ok: false,
        message: "All fields must be strings.",
      });
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

  public static async validateUnique(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { username } = req.body;

    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        return res.status(400).json({
          ok: false,
          message: "Username is already in use.",
        });
      }
    }

    return next();
  }
}
