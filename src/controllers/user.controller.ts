import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  //READ (many by query)
  public static async findMany(req: Request, res: Response): Promise<void> {
    try {
      //recebe o query
      const search =
        typeof req.query.search === "string" ? req.query.search : undefined;

      //chama o service
      const service = new UserService();
      const result = await service.findMany(search);

      //responder o cliente
      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  //READ (one by id)
  public static async findOne(req: Request, res: Response): Promise<void> {
    try {
      //recebe o id nos params
      const { id } = req.params;
      //chama o service
      const service = new UserService();
      //aguarda a resposta da busca
      const result = await service.findOne(id);
      //desestrutura a resposta
      const { code, ...response } = result;
      //retorna para o cliente
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  //UPDATE (id)
  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { id: userId } = req.AuthUser; //criado no index.d.ts
      const { name, username, oldPassword, newPassword } = req.body;

      const service = new UserService();
      const result = await service.update({
        id,
        userId,
        name,
        username,
        oldPassword,
        newPassword,
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

  //DELETE (id)
  public static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { id: userId } = req.AuthUser;

      const service = new UserService();
      const result = await service.remove({ id, userId });

      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }

  //FOLLOW/UNFOLLOW (id)
  public static async follow(req: Request, res: Response): Promise<void> {
    try {
      const { id: userId } = req.AuthUser;
      const { id } = req.params;

      const service = new UserService();
      const result = await service.follow({ userId, id });

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
