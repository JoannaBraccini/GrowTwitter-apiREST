import { NextFunction, Request, Response } from "express";

export class TweetMiddleware {
  public static validateRequired(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { type, parentId, content } = req.body;
    const errors: string[] = [];

    if (!type) {
      errors.push("Tweet type is required");
    }
    if ((type === "REPLY" || type === "RETWEET") && !parentId) {
      errors.push("Parent Tweet ID is required for REPLY or RETWEET");
    }
    if (parentId && type !== "REPLY" && type !== "RETWEET") {
      errors.push("Parent Tweed ID is only valid for RETWEET or REPLY");
    }
    if (
      !content ||
      (typeof content === "string" && content.trim().length === 0)
    ) {
      errors.push("Content is required");
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

  public static validateTypes(req: Request, res: Response, next: NextFunction) {
    const { type, content } = req.body;
    const errors: string[] = [];

    if (type && type !== "TWEET" && type !== "REPLY" && type !== "RETWEET") {
      errors.push("Type must be TWEET, REPLY or RETWEET");
    }
    if (typeof content !== "string") {
      errors.push("Content must be a string");
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
    const { content } = req.body;

    if (content.length > 280) {
      res.status(400).json({
        ok: false,
        message: "Content exceeds the maximum allowed length of 280 characters",
      });
      return;
    }
    next();
  }
}
