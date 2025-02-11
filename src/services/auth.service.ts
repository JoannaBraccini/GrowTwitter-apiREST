import { prisma } from "../database/prisma.database";
import { LoginDto, SignupDto } from "../dtos";
import { ResponseApi } from "../types/response";
import { Bcrypt } from "../utils/bcrypt";
import { JWT } from "../utils/jwt";
import { AuthUser } from "../types/user";

export class AuthService {
  public async signup(createUser: SignupDto): Promise<ResponseApi> {
    const { name, email, password, username } = createUser;

    try {
      const user = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] }, //verificar se usuário já existe com email/username cadastrado
      });

      // Se um dos dois retornar, então:
      if (user) {
        const message =
          user.email === email
            ? "Email is already in use"
            : "Username is already in use";
        return {
          ok: false,
          code: 409, //conflict
          message,
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
        message: "User created successfully",
        data: {
          id: userCreated.id,
          name: userCreated.name,
          email: userCreated.email,
          username: userCreated.username,
        },
      };
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  public async login(data: LoginDto): Promise<ResponseApi> {
    const { email, username, password } = data;

    try {
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
          message: "Invalid credentials",
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
          message: "Invalid credentials",
        };
      }

      //gerar token
      const jwt = new JWT();

      const payload: AuthUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      };
      const token = jwt.generateToken(payload);

      //feedback de sucesso
      return {
        ok: true,
        code: 200,
        message: "Successfully logged in",
        data: { token, user: payload },
      };
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }
}
