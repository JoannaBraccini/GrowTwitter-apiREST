import { NextFunction, Request, Response } from "express";

export class FindManyUsersMiddleware {
  static validateTypes(req: Request, res: Response, next: NextFunction) {
    const { name, username } = req.query;

    if (
      (name && typeof name !== "string") ||
      (username && typeof username !== "string")
    ) {
      res.status(400).json({
        ok: false,
        message: "All fields must be strings.",
      });
    }

    next();
  }
}
