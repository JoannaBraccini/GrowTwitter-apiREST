import { NextFunction, Request, Response } from "express";

export class UserMiddleware {
  static validateTypes(req: Request, res: Response, next: NextFunction) {
    const { name, username, password, email, bio, avatarUrl } = req.body;
    const errors: string[] = [];

    if (name && typeof name !== "string") {
      errors.push("Name must be a string");
    }
    if (name && typeof name === "string") {
      const isValidName = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name);
      if (!isValidName) {
        errors.push("Name can only contain letters and spaces");
      }
    }
    if (username && typeof username !== "string") {
      errors.push("Username must be a string");
    }
    if (password && typeof password !== "string") {
      errors.push("Password must be a string");
    }
    if (email && typeof email !== "string") {
      errors.push("Email must be a string");
    }
    if (email && typeof email === "string") {
      // Regex para validar o email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Invalid email");
      }
    }
    if (bio && typeof bio !== "string") {
      errors.push("Bio must be a string");
    }
    if (avatarUrl && typeof avatarUrl !== "string") {
      errors.push("Avatar link must be a string");
    }
    if (avatarUrl && typeof avatarUrl === "string") {
      const imageRegex = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
      if (!imageRegex.test(avatarUrl)) {
        errors.push(
          "Avatar URL must be an image link (.jpg, .png, .gif, .webp, .svg)"
        );
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        ok: false,
        message: errors,
      });
      return;
    }

    next();
  }

  public static validateLength(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { name, username, password, email, bio, avatarUrl } = req.body;
    const { search } = req.query;

    const errors: string[] = [];

    if (name && name.length < 3) {
      errors.push("Name must be at least 3 characters long");
    }

    if (username && username.length < 3) {
      errors.push("Username must be at least 3 characters long");
    }

    if (password && password.length < 4) {
      errors.push("Password must be at least 4 characters long");
    }

    if (bio && bio.length > 100) {
      errors.push("Bio cannot be so long");
    }

    if (avatarUrl && avatarUrl.length > 200) {
      errors.push("Link cannot be so long");
    }

    if (search && typeof search === "string" && search.length > 40) {
      errors.push("Search cannot be so long");
    }

    if (errors.length > 0) {
      res.status(400).json({
        ok: false,
        message: errors,
      });
      return;
    }

    next();
  }
}
