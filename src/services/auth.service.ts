import { randomUUID } from "crypto";
import { prisma } from "../database/prisma.database";
import { CreatedUserDto, LoginDto, SignupDto } from "../dtos";
import { ResponseApi } from "../types/response";
import { Bcrypt } from "../utils/bcrypt";
import { User } from "@prisma/client";

export class AuthService {
  public async signup(createUser: SignupDto): Promise<ResponseApi> {
    const { name, email, password, username } = createUser;

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }, //verificar se usuário já existe com email/username cadastrado
    });
    if (user) {
      //se um dos dois retornar, então:
      return {
        ok: false,
        code: 409,
        message:
          user.email === email
            ? "Email is already in use."
            : "Username is already in use.",
      };
    }
    //gerar hash da senha
    const bcrypt = new Bcrypt();
    const passwordHash = await bcrypt.generateHash(password);
    //criar novo user
    const userCreated = await prisma.user.create({
      data: { name, email, password: passwordHash, username },
    });

    return {
      ok: true,
      code: 201,
      message: "User created successfully!",
      data: this.mapToDto(userCreated), //retornar somente dados básicos
    };
  }

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

    const loggedUser = {
      token,
      userId: user.id,
      username: user.username,
      name: user.name,
    };

    //feedback de sucesso
    return {
      ok: true,
      code: 200,
      message: "Successfully logged in!",
      data: loggedUser,
    };
  }

  public async validateToken(token: string): Promise<User | null> {
    //busca o user pelo token
    const user = await prisma.user.findFirst({
      where: { authToken: token },
    });

    return user; //usuário se a validação passar
  }
  //mapeamento para userDto básico
  private mapToDto(user: User): CreatedUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}
