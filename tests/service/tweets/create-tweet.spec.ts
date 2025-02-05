import { TweetType } from "@prisma/client";
import { CreateTweetDto } from "../../../src/dtos";
import { TweetService } from "../../../src/services/tweet.service";
import { prismaMock } from "../../config/prisma.mock";
import { TweetMock } from "../mock/tweet.mock";

describe("Create TweetService", () => {
  const makeCreate = (params?: Partial<CreateTweetDto>) => ({
    tweetType: params?.type || TweetType.TWEET,
    parentId: params?.parentId || undefined,
    userId: params?.userId || "id-do-usuario",
    content: params?.content || "Texto do Tweet",
  });
  const createSut = () => new TweetService();

  it("Deve retornar status 404 quando, na criação de um reply, o ID do tweet respondido não for encontrado no sistema", async () => {
    const sut = createSut();
    const body = makeCreate({ parentId: "id-invalido" });

    prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
    const result = await sut.create(body);

    expect(result.code).not.toBe(201);
    expect(result.code).toBe(404);
    expect(result.ok).toBeFalsy();
    expect(result.message).toMatch("Tweet not found");
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
    const sut = createSut();
    const body = makeCreate();

    prismaMock.tweet.create.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.create(body);

    expect(result.code).not.toBe(201);
    expect(result.code).toBe(500);
    expect(result.ok).not.toBeTruthy();
    expect(result.ok).toBeFalsy();
    expect(result.message).toMatch("Internal server error: Exception");
    expect(result.data).not.toBeDefined();
  });

  it("Deve retornar status 201 quando tweet/reply for cadastrado no sistema", async () => {
    const sut = createSut();
    const body = makeCreate();
    const tweetMock = TweetMock.build(body);

    prismaMock.tweet.create.mockResolvedValueOnce(tweetMock);
    const result = await sut.create(body);

    expect(result).toEqual({
      ok: true,
      code: 201,
      message: "Tweet created successfully",
      data: tweetMock,
    });
  });
});
