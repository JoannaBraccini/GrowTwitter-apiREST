import { TweetService } from "../../../src/services/tweet.service";
import { prismaMock } from "../../config/prisma.mock";
import { TweetMock } from "../mock/tweet.mock";

describe("Find One TweetService", () => {
  const createSut = () => new TweetService();

  it("Deve retornar status 404 quando o ID fornecido não existir no sistema", async () => {
    const sut = createSut();

    const prisma = prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
    const result = await sut.findOne("id-invalido");

    expect(result).toEqual({
      ok: false,
      code: 404,
      message: "Tweet not found",
    });
    expect(prisma).toHaveBeenCalled();
  });

  it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
    const sut = createSut();

    prismaMock.tweet.findUnique.mockRejectedValueOnce(new Error("Exception"));
    const result = await sut.findOne("id-valido");

    expect(result).toEqual({
      ok: false,
      code: 500,
      message: "Internal server error: Exception",
    });
    expect(result.data).toBeUndefined();
  });

  it("Deve retornar status 200 quando o ID fornecido for encontrado no sistema", async () => {
    const sut = createSut();
    const tweetMock = TweetMock.build({ id: "id-valido" });

    prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
    const result = await sut.findOne("id-valido");

    expect(result.code).toBe(200);
    expect(result.ok).toBeTruthy();
    expect(result.message).toMatch("Tweet details retrieved successfully");
    expect(result.data).toMatchObject({
      id: "id-valido",
      userId: expect.any(String),
      content: expect.any(String),
      imageUrl: expect.any(String),
      user: expect.objectContaining({
        name: expect.any(String),
        username: expect.any(String),
      }),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
