import { createServer } from "http";
import supertest from "supertest";
import { TweetMock } from "../../service/mock/tweet.mock";
import { TweetService } from "../../../src/services/tweet.service";

const server = createServer();
const endpoint = "/tweets";

describe("GET /tweets", () => {
  it.only("Deve retornar status 200 e uma lista de tweets ao buscar sem filtros", async () => {
    const mockTweets = Array.from({ length: 10 }, (_, i) => {
      return TweetMock.build({
        content: `Tweet ${i + 1} here.`,
      });
    });
    const mockService = {
      ok: true,
      code: 200,
      message: "Tweets retrieved successfully",
      data: mockTweets,
    };

    const { code, ...responseBody } = mockService;

    jest
      .spyOn(TweetService.prototype, "findAll")
      .mockResolvedValue(mockService);
    const response = await supertest(server).get(endpoint);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(responseBody);
  });

  it("Deve retornar status 200 e uma lista com até 5 tweets da página 2 ao buscar com paginação", async () => {
    const mockTweets = Array.from({ length: 10 }, (_, i) => {
      return TweetMock.build({
        content: `Tweet ${i + 1} here.`,
      });
    });
    const page = 2;
    const take = 5;
    const skip = (page - 1) * take; // O controller já subtrai 1 do page
    const paginatedTweets = mockTweets.slice(skip, skip + take);
    const mockService = {
      ok: true,
      code: 200,
      message: "Tweets retrieved successfully",
      data: paginatedTweets,
    };

    jest
      .spyOn(TweetService.prototype, "findAll")
      .mockResolvedValue(mockService);
    const response = await supertest(server).get(`${endpoint}/?page=2&take=5`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(paginatedTweets);
  });
});
