import { NextFunction, Request, Response } from "express";

export class TweetMiddleware {
  public static validateRequired(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { tweetType, parentId, content } = req.body;
    const errors: string[] = [];

    if (tweetType === "REPLY" && !parentId) {
      errors.push("Parent Tweet ID is required for REPLY");
    }
    if (parentId && tweetType !== "REPLY") {
      errors.push("Parent Tweed ID is only valid for RETWEET or REPLY");
    }
    if (!tweetType) {
      errors.push("Tweet type is required");
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
    const { tweetType, content, comment } = req.body;
    const { page, take, search } = req.query;
    const errors: string[] = [];

    if (tweetType && tweetType !== "TWEET" && tweetType !== "REPLY") {
      errors.push("Tweet type must be TWEET, REPLY");
    }
    if (typeof content !== "string") {
      errors.push("Content must be a string");
    }
    if (comment && typeof comment !== "string") {
      errors.push("Comment must be a string");
    }
    if (page && typeof page !== "number") {
      errors.push("Page must be a number");
    }
    if (take && typeof take !== "number") {
      errors.push("Take must be a number");
    }
    if (search && typeof search !== "string") {
      errors.push("Search term must be a string");
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
    const { content, comment } = req.body;

    if (content.length > 280) {
      res.status(400).json({
        ok: false,
        message: "Content exceeds the maximum allowed length of 280 characters",
      });
      return;
    }

    if (comment && comment.length > 140) {
      res.status(400).json({
        ok: false,
        message: "Comment exceeds the maximum allowed length of 140 characters",
      });
      return;
    }
    next();
  }
}
