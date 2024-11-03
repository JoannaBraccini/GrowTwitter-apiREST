import { Request, Response } from "express";
import { CreateUserDto } from "../dtos";
import { UserService } from "../services/user.service";

export class UserController {
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      //busca os dados na requisição
      const { name, email, password, username } = req.body;
      //cria o objeto que vai armazenar os dados
      const data: CreateUserDto = {
        name,
        email,
        password,
        username,
      };
      //chama o service
      const service = new UserService();
      //recebe a resposta
      const result = await service.create(data);
      //desestrutura a resposta
      const { code, ...response } = result;
      //retorna para o cliente
      res.status(code).json(response);
      //em caso de erro de servidor cai no catch
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An error occurred while creating the user: ${error.message}`,
      });
    }
  }
}
