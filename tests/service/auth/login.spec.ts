import { LoginDto } from "../../../src/dtos";
import { AuthService } from "../../../src/services/auth.service";
import { Bcrypt } from "../../../src/utils/bcrypt";
import { JWT } from "../../../src/utils/jwt";
import { prismaMock } from "../../config/prisma.mock";
import { UserMock } from "../mock/user.mock";

describe("Login AuthService", () => {
  const createSut = () => new AuthService();

  it("Deve retornar 401 quando o dado (email ou username) fornecido não existir no sistema", async () => {
    const sut = createSut();
    const body: LoginDto = {
      email: "invalid@email.com",
      password: "senhaCorreta",
    };

    prismaMock.user.findFirst.mockResolvedValueOnce(null);
    const result = await sut.login(body);

    expect(result.code).toBe(401);
    expect(result.ok).toBeFalsy();
    expect(result.message).toBeDefined();
    expect(result.message).toMatch("Invalid credentials.");
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar 401 quando a senha informada estiver incorreta", async () => {
    const sut = createSut();
    const body: LoginDto = {
      username: "username",
      password: "senhaErrada",
    };
    const userMock = UserMock.build({
      username: "username",
      password: "senhaCorreta",
    });

    prismaMock.user.findFirst.mockResolvedValueOnce(userMock);

    const bcrypt = jest
      .spyOn(Bcrypt.prototype, "verify")
      .mockResolvedValueOnce(false);

    const result = await sut.login(body);

    expect(bcrypt).toHaveBeenCalledTimes(1);
    expect(result.code).toBe(401);
    expect(result.ok).toBeFalsy();
    expect(result.message).toMatch("Invalid credentials.");
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar 500 quando ocorrer um erro de exceção", async () => {
    const sut = createSut();
    const body: LoginDto = {
      username: "username",
      password: "senhaCorreta",
    };

    prismaMock.user.findFirst.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.login(body);

    expect(result).toEqual({
      ok: false,
      code: 500,
      message: "Internal server error: Exception",
    });
  });

  it("Deve retornar 200 quando o usuário entrar no sistema", async () => {
    const sut = createSut();
    const body: LoginDto = {
      username: "username",
      password: "umaSenha",
    };
    const userMock = UserMock.build({
      username: "username",
      password: "senhaCritpografada",
    });

    prismaMock.user.findFirst.mockResolvedValueOnce(userMock);

    const bcrypt = jest
      .spyOn(Bcrypt.prototype, "verify")
      .mockResolvedValueOnce(true);
    const jwt = jest
      .spyOn(JWT.prototype, "generateToken")
      .mockReturnValueOnce("token_valido");
    const result = await sut.login(body);

    expect(bcrypt).toHaveBeenCalledTimes(2);
    expect(jwt).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      ok: true,
      code: 200,
      message: "Successfully logged in.",
      data: {
        token: expect.any(String),
        user: {
          id: userMock.id,
          name: userMock.name,
          username: userMock.username,
          email: userMock.email,
        },
      },
    });
  });
});
