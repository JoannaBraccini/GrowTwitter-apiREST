import { Request, Response } from "express";
import { CreateTweetDto } from "../dtos";
import { TweetService } from "../services/tweet.service";

export class TweetController {
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { userId, parentId, type, content } = req.body;
      const data: CreateTweetDto = {
        userId,
        parentId,
        type,
        content,
      };

      const service = new TweetService();
      const result = service.create(data);

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An error occurred while creating tweet: ${error.message}`,
      });
    }
  }
}
