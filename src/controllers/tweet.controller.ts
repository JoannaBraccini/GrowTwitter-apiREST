import { Request, response, Response } from "express";
import { CreateTweetDto } from "../dtos";
import { TweetService } from "../services/tweet.service";

export class TweetController {
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { parentId, type, content } = req.body;
      const { id } = req.body.user;
      const data: CreateTweetDto = {
        userId: id,
        parentId,
        type,
        content,
      };

      const service = new TweetService();
      const result = await service.create(data);

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An error occurred while creating tweet: ${error.message}`,
      });
    }
  }

  public static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const service = new TweetService();
      const result = await service.findAll();

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An error occurred while fetching tweets: ${error.message}`,
      });
    }
  }
}
