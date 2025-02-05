import { UserService } from "../../../src/services/user.service";
import { prismaMock } from "../../config/prisma.mock";
import { UserMock } from "../mock/user.mock";

describe("Find Many UserService", () => {
  const createSut = () => new UserService();

  it("Deve retornar status 404 quando não forem localizados usuários no sistema", async () => {
    const sut = createSut();

    prismaMock.user.findMany.mockResolvedValueOnce([]);
    const result = await sut.findMany();

    expect(result).toEqual({ ok: false, code: 404, message: "No users found" });
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
    const sut = createSut();

    prismaMock.user.findMany.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.findMany();

    expect(result).toEqual({
      ok: false,
      code: 500,
      message: "Internal server error: Exception",
    });
  });

  it("Deve retornar status 200 quando usuários buscados por query existirem no sistema", async () => {
    const sut = createSut();
    const usersMock = Array.from({ length: 5 }, (_, index) => {
      return UserMock.build({
        name: "Nome Buscado",
      });
    });

    prismaMock.user.findMany.mockResolvedValueOnce(usersMock);
    const result = await sut.findMany("Nome Buscado");

    expect(result.data).toHaveLength(5);
    expect(result).toEqual({
      ok: true,
      code: 200,
      message: "Users retrieved successfully",
      data: expect.arrayContaining([
        expect.objectContaining({
          name: "Nome Buscado",
        }),
      ]),
    });
  });

  it("Deve retornar status 200 quando usuários existirem no sistema", async () => {
    const sut = createSut();
    const usersMock = Array.from({ length: 10 }, (_, index) => {
      return UserMock.build({
        name: `Nome ${index}User`,
        email: `${index}user@email.com`,
        username: `${index}_user`,
      });
    });

    prismaMock.user.findMany.mockResolvedValueOnce(usersMock);
    const result = await sut.findMany();

    expect(result.data).toHaveLength(10);
    expect(result).toEqual({
      ok: true,
      code: 200,
      message: "Users retrieved successfully",
      data: expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
        }),
      ]),
    });
  });
});
