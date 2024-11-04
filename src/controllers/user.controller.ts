import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  //CREATE -> movido para authController: signup

  //READ
  public static async findMany(req: Request, res: Response): Promise<void> {
    try {
      //recebe o query
      const { name, username } = req.query;
      const { user } = req.body;

      //chama o service
      const service = new UserService();
      const result = await service.findMany({
        name: name as string,
        username: username as string,
      });

      //responder o cliente
      const { code, ...response } = result;
      res.status(code).json(response);
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `Server error: ${error.message}`,
      });
    }
  }
}
