import { Request, Response } from "express";
import { CreateTweetDto } from "../dtos";
import { TweetService } from "../services/tweet.service";

export class TweetController {
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { parentId, tweetType, content } = req.body;
      const { id: userId } = req.AuthUser;

      const data: CreateTweetDto = {
        userId,
        parentId,
        tweetType,
        content,
      };

      const service = new TweetService();
      const result = await service.create(data);

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  public static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, take, search } = req.query;

      const service = new TweetService();
      const result = await service.findAll({
        page: page ? Number(page) - 1 : undefined,
        take: take ? Number(take) : undefined,
        search: search ? String(search) : undefined,
      });

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  public static async findFeed(req: Request, res: Response): Promise<void> {
    try {
      const { page, take, search } = req.query;
      const { id: userId } = req.AuthUser;

      const service = new TweetService();
      const result = await service.findFeed(userId, {
        page: page ? Number(page) - 1 : undefined,
        take: take ? Number(take) : undefined,
        search: search ? String(search) : undefined,
      });

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  public static async findOne(req: Request, res: Response): Promise<void> {
    try {
      const { tweetId } = req.params;
      const service = new TweetService();

      const result = await service.findOne(tweetId);
      const { code, ...response } = result;

      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const { tweetId } = req.params;
      const { id: userId } = req.AuthUser;
      const { content } = req.body;

      const service = new TweetService();
      const result = await service.update({ tweetId, userId, content });

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  public static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { tweetId } = req.params;
      const { id: userId } = req.AuthUser;

      const service = new TweetService();
      const result = await service.remove({ tweetId, userId });

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  public static async like(req: Request, res: Response): Promise<void> {
    try {
      const { id: userId } = req.AuthUser;
      const tweetId = req.params.id;

      const service = new TweetService();
      const result = await service.like({ tweetId, userId });

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  public static async retweet(req: Request, res: Response): Promise<void> {
    try {
      const { id: userId } = req.AuthUser;
      const tweetId = req.params.id;

      const service = new TweetService();
      const result = await service.retweet({ tweetId, userId });

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }
}
