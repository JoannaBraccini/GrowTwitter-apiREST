import { Like } from "@prisma/client";
import { TweetService } from "../../../src/services/tweet.service";
import { prismaMock } from "../../config/prisma.mock";
import { TweetMock } from "../mock/tweet.mock";

describe("Like TweetService", () => {
  const makeLike = (params?: Partial<Like>) => ({
    tweetId: params?.tweetId || "id-tweet",
    userId: params?.userId || "id-usuario",
    id: params?.id || "id-like",
    createdAt: new Date(),
  });
  const createSut = () => new TweetService();

  it("Deve retornar status 404 quando ID fornecido não existir no sistema", async () => {
    const sut = createSut();
    const body = { tweetId: "id-invalido", userId: "id-usuario" };

    prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
    const result = await sut.like(body);

    expect(result).toEqual({
      ok: false,
      code: 404,
      message: "Tweet not found",
    });
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar status 500 quando ocorrer erro de Exceção", async () => {
    const sut = createSut();
    const body = { tweetId: "id-tweet", userId: "id-usuario" };
    prismaMock.tweet.findUnique.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.like(body);

    expect(result).toEqual({
      ok: false,
      code: 500,
      message: "Internal server error: Exception",
    });
  });

  it("Deve retornar status 201 quando o like for cadastrado do sistema", async () => {
    const sut = createSut();
    const body = { tweetId: "id-tweet", userId: "id-usuario" };
    const tweetMock = TweetMock.build({
      id: "id-tweet",
      userId: "id-usuario",
    });
    const like = makeLike();
    //Encontra o tweet
    prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
    //Não existe like deste usuário
    prismaMock.like.findUnique.mockResolvedValueOnce(null);
    //Cria o like
    prismaMock.like.create.mockResolvedValueOnce(like);
    const result = await sut.like(body);

    expect(result).toEqual({
      ok: true,
      code: 201,
      message: "Tweet liked successfully",
      data: like,
    });
  });

  it("Deve retornar status 200 quando o like existente for removido do sistema", async () => {
    const sut = createSut();
    const body = { tweetId: "id-tweet", userId: "id-usuario" };
    const tweetMock = TweetMock.build({
      id: "id-tweet",
      userId: "id-usuario",
    });
    const likeMock = makeLike();
    //Encontra o tweet
    prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
    //Like já existe
    prismaMock.like.findUnique.mockResolvedValueOnce(likeMock);
    //Remove o like
    prismaMock.like.delete.mockResolvedValueOnce(likeMock);
    const result = await sut.like(body);

    expect(result).toEqual({
      ok: true,
      code: 200,
      message: "Like removed successfully",
    });
    expect(result.data).toBeUndefined();
  });
});
