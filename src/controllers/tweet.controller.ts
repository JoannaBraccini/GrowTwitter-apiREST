import { Request, Response } from "express";
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
      console.log("controller depois do service", [{ data }]);

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
      const { user } = req.body;
      const { page, take } = req.query;

      const service = new TweetService();
      const result = await service.findAll(user.id, {
        page: page ? Number(page) - 1 : undefined,
        take: take ? Number(take) : undefined,
      });

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An error occurred while fetching tweets: ${error.message}`,
      });
    }
  }

  public static async findMany(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;

      if (!query || query === "") {
        res.status(400).json({
          ok: false,
          message: "Search query is required.",
        });
        return;
      }

      const service = new TweetService();
      const result = await service.findMany(query as string);

      if (result.data.length === 0) {
        res.status(404).json({
          ok: false,
          message: "No tweets found matching the query.",
        });
        return;
      }
      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `Error fetching tweets: ${error.message}`,
      });
    }
  }

  public static async findOne(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = new TweetService();

      const result = await service.findOne(id);
      const { code, ...response } = result;

      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `Error fetching tweet: ${error.message}`,
      });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const service = new TweetService();
      const result = await service.update(id, content);

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `Error updating tweet: ${error.message}`,
      });
    }
  }

  public static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const service = new TweetService();
      const result = await service.remove(id);

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `Error removing tweet: ${error.message}`,
      });
    }
  }
}
