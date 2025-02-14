import { Tweet } from "@prisma/client";
import { UpdateTweetDto } from "../../../src/dtos";
import { TweetService } from "../../../src/services/tweet.service";
import { prismaMock } from "../../config/prisma.mock";
import { TweetMock } from "../mock/tweet.mock";

describe("Update TweetService", () => {
  const makeUpdate = (params?: Partial<UpdateTweetDto>) => ({
    tweetId: params?.tweetId || "id-tweet",
    userId: params?.userId || "id-usuario",
    content: params?.content || "Tweet alterado",
    imageUrl: params?.content || "Imagem substituída",
  });
  const createSut = () => new TweetService();

  it("Deve retornar status 404 quando ID fornecido não existir no sistema", async () => {
    const sut = createSut();
    const body = makeUpdate();

    prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
    const result = await sut.update(body);

    expect(result).toEqual({
      ok: false,
      code: 404,
      message: "Tweet not found",
    });
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar status 401 quando ID do usuário logado não for igual ao userId do Tweet", async () => {
    const sut = createSut();
    const tweetMock = TweetMock.build({ userId: "outro-usuario" });
    const body = makeUpdate();

    prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
    const result = await sut.update(body);

    expect(result.code).toBe(401);
    expect(result.ok).toBeFalsy();
    expect(result.message).toMatch("Not authorized to modify this tweet");
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar status 500 quando ocorrer erro de Exceção", async () => {
    const sut = createSut();
    const body = makeUpdate();

    prismaMock.tweet.findUnique.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.update(body);

    expect(result).toEqual({
      ok: false,
      code: 500,
      message: "Internal server error: Exception",
    });
  });

  it("Deve retornar status 200 quando o tweet for atualizado no sistema", async () => {
    const sut = createSut();
    const body = makeUpdate({ tweetId: "id-tweet", userId: "id-usuario" });
    const tweetMock: Tweet = TweetMock.build({
      id: "id-tweet",
      userId: "id-usuario",
    });

    prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
    prismaMock.tweet.update.mockResolvedValueOnce(tweetMock);
    const result = await sut.update(body);

    expect(result).toEqual({
      ok: true,
      code: 200,
      message: "Tweet content updated successfully",
      data: expect.objectContaining({
        content: "Texto do Tweet",
        imageUrl: expect.any(String),
        id: "id-tweet",
        tweetType: "TWEET",
        updatedAt: expect.any(Date),
      }),
    });
  });
});
