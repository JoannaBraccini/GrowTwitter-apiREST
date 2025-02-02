import { SignupDto } from "../../../src/dtos";
import { AuthService } from "../../../src/services/auth.service";
import { Bcrypt } from "../../../src/utils/bcrypt";
import { prismaMock } from "../../config/prisma.mock";
import { UserMock } from "../mock/user.mock";

describe("Signup AuthService", () => {
  const makeSignup = (params?: Partial<SignupDto>) => ({
    name: params?.name || "Novo Usuário",
    email: params?.email || "novo@email.com",
    username: params?.username || "novousuario",
    password: params?.password || "umaSenha",
  });
  const createSut = () => new AuthService();

  it("Deve retornar 409 quando email já existir no sistema", async () => {
    const sut = createSut();
    const body = makeSignup({ email: "teste@email.com" });
    const userMock = UserMock.build({ email: "teste@email.com" });

    prismaMock.user.findFirst.mockResolvedValueOnce(userMock);
    const result = await sut.signup(body);

    expect(result.code).toBe(409);
    expect(result.ok).toBeFalsy();
    expect(result.message).toMatch("Email is already in use.");
    expect(result.data).toBeUndefined;
    expect(result).not.toBeNull();
  });

  it("Deve retornar 409 quando username já existir no sistema", async () => {
    const sut = createSut();
    const body = makeSignup({ username: "usertest" });
    const userMock = UserMock.build({ username: "usertest" });

    prismaMock.user.findFirst.mockResolvedValueOnce(userMock);
    const result = await sut.signup(body);

    expect(result.code).toBe(409);
    expect(result.ok).toBeFalsy();
    expect(result.message).toMatch("Username is already in use.");
    expect(result.data).toBeUndefined;
    expect(result).not.toBeNull();
  });

  it("Deve retornar 500 quando ocorrer erro de exceção", async () => {
    const sut = createSut();
    const body = makeSignup();

    prismaMock.user.findFirst.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.signup(body);

    expect(result).toEqual({
      ok: false,
      code: 500,
      message: "Internal server error: Exception",
    });
  });

  it("Deve retornar 201 quando usuário for cadastrado no sistema", async () => {
    const sut = createSut();
    const body = makeSignup();

    prismaMock.user.findFirst.mockResolvedValueOnce(null);

    const bcrypt = jest
      .spyOn(Bcrypt.prototype, "generateHash")
      .mockResolvedValueOnce("senha_criptografada");

    prismaMock.user.create.mockResolvedValueOnce({
      ...body,
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      password: "senha_criptografada",
    });
    const result = await sut.signup(body);

    expect(bcrypt).toHaveBeenCalledWith(body.password);
    expect(result).toEqual({
      ok: true,
      code: 201,
      message: "User created successfully.",
      data: {
        id: expect.any(String),
        name: body.name,
        email: body.email,
        username: body.username,
        createdAt: expect.any(Date),
      },
    });
  });
});
