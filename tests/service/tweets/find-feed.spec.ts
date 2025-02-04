import { TweetService } from "../../../src/services/tweet.service";
import { prismaMock } from "../../config/prisma.mock";
import { TweetMock } from "../mock/tweet.mock";

describe("Find Feed TweetService", () => {
  const createSut = () => new TweetService();

  it("Deve retornar 404 quando não houverem tweets no sistema", async () => {
    const sut = createSut();
    const query = {};

    //Usuário não segue ninguém
    prismaMock.follower.findMany.mockResolvedValueOnce([]);
    //Usuário não tem tweets
    prismaMock.tweet.findMany.mockResolvedValueOnce([]);
    const result = await sut.findFeed("id-valido", query);

    expect(result).toEqual({
      ok: false,
      code: 404,
      message: "No tweets found",
    });
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar 500 quando ocorrer erro de exceção", async () => {
    const sut = createSut();
    const userMock = Array.from({ length: 4 }, (_, index) => {
      return {
        id: "id-usuario-logado",
        createdAt: new Date(),
        followerId: "id-usuario-logado",
        followedId: `followed${index}`,
      };
    });
    const query = {};

    const prisma = prismaMock.follower.findMany.mockResolvedValueOnce(userMock);
    prismaMock.tweet.findMany.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.findFeed("id-usuario-logado", query);

    expect(result.code).toBe(500);
    expect(result.ok).toBeFalsy();
    expect(result.message).toMatch("Internal server error: Exception");
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar 200 quando encontrar tweets no sistema", async () => {
    const sut = createSut();
    const tweetMock = Array.from({ length: 4 }, (_, index) => {
      return TweetMock.build({
        userId: "id-usuario-logado",
        content: `Texto do tweet${index}`,
      });
    });
    const query = {};

    prismaMock.follower.findMany.mockResolvedValueOnce([]);
    prismaMock.tweet.findMany.mockResolvedValueOnce(tweetMock);

    const result = await sut.findFeed("id-usuario-logado", query);

    expect(result.code).toBe(200);
    expect(result.ok).toBeTruthy();
    expect(result.message).toMatch("Tweets retrieved successfully");
    expect(result.data).toBeDefined();
    result.data.forEach((tweet: TweetMock) => {
      expect(tweet).toEqual({
        id: expect.any(String),
        userId: "id-usuario-logado",
        type: "TWEET",
        parentId: null,
        content: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        user: expect.any(Object),
        likesCount: expect.any(Number),
        retweetsCount: expect.any(Number),
        repliesCount: expect.any(Number),
        likes: undefined,
        retweets: undefined,
        replies: undefined,
      });
    });
  });
});
