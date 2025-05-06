import { Follower } from "@prisma/client";
import { UserMock } from "../mock/user.mock";
import { UserService } from "../../../src/services/user.service";
import { prismaMock } from "../../config/prisma.mock";
import { randomUUID } from "crypto";

describe("Follow UserService", () => {
  const makeFollow = (params?: Partial<Follower>) => ({
    id: params?.id || randomUUID(),
    followerId: params?.followerId || randomUUID(),
    followedId: params?.followedId || randomUUID(),
    createdAt: new Date(),
  });
  const createSut = () => new UserService();

  it("Deve retornar status 404 quando ID fornecido (Follower) não existir no sistema", async () => {
    const sut = createSut();
    const body = { id: "id-seguido", userId: "id-seguidor-invalido" };

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const result = await sut.follow(body);

    expect(result).toEqual({
      ok: false,
      code: 404,
      message: "User not found",
    });
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar status 404 quando ID fornecido (Followed) não existir no sistema", async () => {
    const sut = createSut();
    const body = { id: "id-seguido-invalido", userId: "id-seguidor" };

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const result = await sut.follow(body);

    expect(result).toEqual({
      ok: false,
      code: 404,
      message: "User not found",
    });
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar status 409 quando IDs fornecidos (Followed e Follower) forem iguais", async () => {
    const sut = createSut();
    const userMock = UserMock.build({ id: "id-seguidor" });
    const body = { id: "id-seguidor", userId: "id-seguidor" };

    prismaMock.user.findUnique.mockResolvedValueOnce(userMock); //Verifica o seguidor
    prismaMock.user.findUnique.mockResolvedValueOnce(userMock); //Verifica o seguido
    const result = await sut.follow(body);

    expect(result).toEqual({
      ok: false,
      code: 409,
      message: "You cannot follow yourself",
    });
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar status 500 quando ocorrer erro de Exceção", async () => {
    const sut = createSut();
    const body = { id: "id-seguidor", userId: "id-seguido" };
    prismaMock.user.findUnique.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.follow(body);

    expect(result).toEqual({
      ok: false,
      code: 500,
      message: "Internal server error: Exception",
    });
  });

  it("Deve retornar status 201 quando o Follow for cadastrado do sistema", async () => {
    const sut = createSut();
    const body = { id: "id-seguidor", userId: "id-seguido" };
    const userMock = UserMock.build({
      id: "id-seguidor",
    });
    const followMock = makeFollow({
      followedId: "id-seguido",
      followerId: "id-seguidor",
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(userMock); // Follower
    prismaMock.user.findUnique.mockResolvedValueOnce(userMock); // Followed
    prismaMock.follower.findUnique.mockResolvedValueOnce(null); // Não existe Follow
    prismaMock.follower.create.mockResolvedValueOnce(followMock); // Cria o Follow

    const result = await sut.follow(body);

    expect(result).toEqual({
      ok: true,
      code: 201,
      message: "Successfully followed the user",
      data: followMock,
    });
  });

  it("Deve retornar status 200 quando o Follow existente for removido do sistema", async () => {
    const sut = createSut();
    const body = { id: "id-seguido", userId: "id-seguidor" };
    const userMock = UserMock.build({
      id: "id-seguidor",
    });
    const followMock = makeFollow({
      followedId: "id-seguido",
      followerId: "id-seguidor",
    });
    //Encontra os usuários
    prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
    prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
    //Follow já existe
    prismaMock.follower.findUnique.mockResolvedValueOnce(followMock);
    //Remove o Follow
    prismaMock.follower.delete.mockResolvedValueOnce(followMock);
    const result = await sut.follow(body);

    expect(result).toEqual({
      ok: true,
      code: 200,
      message: "Successfully unfollowed the user",
      data: followMock,
    });
  });
});
