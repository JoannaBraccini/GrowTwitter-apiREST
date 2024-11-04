import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { SignupDto } from "../dtos";
import { UserService } from "../services/user.service";

export class AuthController {
  public static async signup(req: Request, res: Response): Promise<void> {
    try {
      //busca os dados na requisição
      const { name, email, password, username } = req.body;
      //cria o objeto que vai armazenar os dados
      const data: SignupDto = {
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

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body;

      const service = new AuthService();
      const result = await service.login({ email, username, password });

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
