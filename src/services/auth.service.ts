import { randomUUID } from "crypto";
import { prisma } from "../database/prisma.database";
import { LoginDto } from "../dtos";
import { ResponseApi } from "../types/response";
import { Bcrypt } from "../utils/bcrypt";
import { User } from "@prisma/client";

export class AuthService {
  public async login(data: LoginDto): Promise<ResponseApi> {
    const { email, username, password } = data;
    //verificar email/username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }], //o prisma ignora os undefined (um dos dois será, pois o usuario loga com um apenas)
      },
    });

    if (!user) {
      return {
        ok: false,
        code: 401, //não autorizado
        message: "Invalid credentials.",
      };
    }
    //verificar senha
    const hash = user.password;
    const bcrypt = new Bcrypt();
    const isValidPassword = await bcrypt.verify(password, hash);

    if (!isValidPassword) {
      return {
        ok: false,
        code: 401,
        message: "Invalid credentials.",
      };
    }

    //gerar token
    const token = randomUUID();
    //atualizar db com novo token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        authToken: token,
      },
    });

    //feedback de sucesso
    return {
      ok: true,
      code: 200,
      message: "Successfully logged in!",
      data: { token },
    };
  }

  public async validateToken(token: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { authToken: token },
    });

    return user;
  }
}
