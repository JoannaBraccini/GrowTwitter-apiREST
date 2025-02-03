import { User } from "@prisma/client";
import { UserService } from "../../../src/services/user.service";
import { prismaMock } from "../../config/prisma.mock";
import { UserMock } from "../mock/user.mock";

describe("Remove UserService", () => {
  const createSut = () => new UserService();

  it("Deve retornar 404 quando ID fornecido não existir no sistema", async () => {
    const sut = createSut();
    const body = { id: "id-invalido", userId: "id-usuario" };

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const result = await sut.remove(body);

    expect(result).toEqual({
      ok: false,
      code: 404,
      message: "User not found",
    });
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar 401 quando ID do usuário autenticado não for igual ao ID do usuário a ser removido", async () => {
    const sut = createSut();
    const body = { id: "id-logado", userId: "id-a-remover" };
    const userMock = UserMock.build({ id: "outro-usuario" });

    prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
    const result = await sut.remove(body);

    expect(result.code).toBe(401);
    expect(result.ok).toBeFalsy();
    expect(result.message).toMatch(
      "You are not authorized to delete this profile."
    );
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar 500 quando ocorrer erro de Exceção", async () => {
    const sut = createSut();
    const body = { id: "id-usuario", userId: "id-usuario" };
    prismaMock.user.findUnique.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.remove(body);

    expect(result).toEqual({
      ok: false,
      code: 500,
      message: "Internal server error: Exception",
    });
  });

  it("Deve retornar 200 quando o usuário for removido do sistema", async () => {
    const sut = createSut();
    const body = { id: "id-usuario", userId: "id-usuario" };
    const userMock = UserMock.build({
      id: "id-usuario",
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
    prismaMock.user.delete.mockResolvedValueOnce(userMock);
    const result = await sut.remove(body);

    expect(result).toEqual({
      ok: true,
      code: 200,
      message: "User removed successfully",
      data: expect.objectContaining({
        id: "id-usuario",
        name: expect.any(String),
        username: expect.any(String),
        email: expect.any(String),
        password: expect.any(String),
      }),
    });
  });
});
