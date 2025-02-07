import { Retweet } from "@prisma/client";
import { TweetService } from "../../../src/services/tweet.service";
import { prismaMock } from "../../config/prisma.mock";
import { TweetMock } from "../mock/tweet.mock";

describe("Retweet TweetService", () => {
  const makeRetweet = (params?: Partial<Retweet>) => ({
    id: params?.id || "id-retweet",
    tweetId: params?.tweetId || "id-tweet",
    userId: params?.userId || "id-usuario",
    comment: params?.comment || null,
    createdAt: new Date(),
  });
  const createSut = () => new TweetService();

  it("Deve retornar status 404 quando ID fornecido não existir no sistema", async () => {
    const sut = createSut();
    const body = { tweetId: "id-invalido", userId: "id-usuario" };

    prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
    const result = await sut.retweet(body);

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
    const result = await sut.retweet(body);

    expect(result).toEqual({
      ok: false,
      code: 500,
      message: "Internal server error: Exception",
    });
  });

  it("Deve retornar status 201 quando o retweet for cadastrado do sistema", async () => {
    const sut = createSut();
    const body = { tweetId: "id-tweet", userId: "id-usuario" };
    const tweetMock = TweetMock.build({
      id: "id-tweet",
      userId: "id-usuario",
    });
    const retweet = makeRetweet();
    //Encontra o tweet
    prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
    //Não existe retweet deste usuário
    prismaMock.retweet.findUnique.mockResolvedValueOnce(null);
    //Cria o retweet
    prismaMock.retweet.create.mockResolvedValueOnce(retweet);
    const result = await sut.retweet(body);

    expect(result).toEqual({
      ok: true,
      code: 201,
      message: "Retweeted successfully",
      data: retweet,
    });
  });

  it("Deve retornar status 200 quando o retweet existente for removido do sistema", async () => {
    const sut = createSut();
    const body = { tweetId: "id-tweet", userId: "id-usuario" };
    const tweetMock = TweetMock.build({
      id: "id-tweet",
      userId: "id-usuario",
    });
    const retweetMock = makeRetweet();
    //Encontra o tweet
    prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
    //retweet já existe
    prismaMock.retweet.findUnique.mockResolvedValueOnce(retweetMock);
    //Remove o retweet
    prismaMock.retweet.delete.mockResolvedValueOnce(retweetMock);
    const result = await sut.retweet(body);

    expect(result).toEqual({
      ok: true,
      code: 200,
      message: "Retweet removed successfully",
    });
    expect(result.data).toBeUndefined();
  });
});
