import { NextFunction, Request, Response } from "express";
import { prisma } from "../database/prisma.database";

export class CreateUserMiddleware {
  public static validateRequired(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { name, email, username, password } = req.body;

    if (!name) {
      res.status(400).json({
        ok: false,
        message: "Name is required!",
      });
    }
    if (!email) {
      res.status(400).json({
        ok: false,
        message: "Email is required!",
      });
    }
    if (!username) {
      res.status(400).json({
        ok: false,
        message: "Username is required!",
      });
    }
    if (!password) {
      res.status(400).json({
        ok: false,
        message: "Password is required!",
      });
    }
    return next();
  }

  public static validateTypes(req: Request, res: Response, next: NextFunction) {
    const { name, email, username, password } = req.body;

    if (typeof name !== "string") {
      res.status(400).json({
        ok: false,
        message: "Name must be a string.",
      });
    }
    if (typeof email !== "string") {
      res.status(400).json({
        ok: false,
        message: "Email must be a string.",
      });
    }
    if (typeof username !== "string") {
      res.status(400).json({
        ok: false,
        message: "Username must be a string.",
      });
    }
    if (typeof password !== "string") {
      res.status(400).json({
        ok: false,
        message: "Password must be a string.",
      });
    }
    return next();
  }

  public static validateLength(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { name, email, username, password } = req.body;

    if (name.length < 3) {
      res.status(400).json({
        ok: false,
        message: "Name must be at least 3 characters long.",
      });
    }
    if (!email.includes("@") || !email.includes(".com")) {
      res.status(400).json({
        ok: false,
        message: "Invalid email.",
      });
    }
    if (username.length < 3) {
      res.status(400).json({
        ok: false,
        message: "Username must be at least 3 characters long.",
      });
    }
    if (password.length < 4) {
      res.status(400).json({
        ok: false,
        message: "Password must be at least 4 characters long.",
      });
    }
    return next();
  }

  public static async validateUnique(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { email, username } = req.body;
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return res.status(400).json({
        ok: false,
        message: "Email is already in use.",
      });
    }
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({
        ok: false,
        message: "Username is already in use.",
      });
    }

    return next();
  }
}
