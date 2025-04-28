import supertest from "supertest";
import { createServer } from "../../../src/express.server";
import { TweetService } from "../../../src/services/tweet.service";
import { makeToken } from "../make-token";

const server = createServer();
const endpoint = "/tweets/feed";

describe("GET /tweets/feed", () => {
  //Auth
  it("Deve retornar status 401 quando token não for informado", async () => {
    const response = await supertest(server).get(endpoint);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Token is required",
    });
  });

  it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
    const response = await supertest(server)
      .get(endpoint)
      .set("Authorization", "invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Invalid or missing token",
    });
  });

  it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
    const response = await supertest(server)
      .get(endpoint)
      .set("Authorization", "Bearer invalidToken");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Invalid or expired token",
    });
  });
  //Controller
  it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
    const token = makeToken();
    // Simulando um erro no controller
    jest
      .spyOn(TweetService.prototype, "findFeed")
      .mockImplementationOnce(() => {
        throw new Error("Exception");
      });

    const response = await supertest(server)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      message: "An unexpected error occurred: Exception",
    });
  });
  //Service
  it("Deve retornar status 200 e uma lista de tweets ao buscar sem filtros", async () => {
    const token = makeToken({ id: "id-user" });
    const mockTweets = Array.from({ length: 10 }, (_, i) => ({
      id: `id-${i}`,
      userId: "id-user",
      tweetType: "TWEET",
      createdAt: new Date().toISOString(),
      content: `Tweet ${i + 1} here.`,
    }));
    const mockService = {
      ok: true,
      code: 200,
      message: "Tweets retrieved successfully",
      data: mockTweets,
    };

    const { code, ...responseBody } = mockService;

    jest
      .spyOn(TweetService.prototype, "findFeed")
      .mockResolvedValue(mockService);
    const response = await supertest(server)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toEqual(responseBody);
  });

  it("Deve retornar status 200 e uma lista com até 5 tweets da página 2 ao buscar com paginação", async () => {
    const token = makeToken();
    const mockTweets = Array.from({ length: 10 }, (_, i) => ({
      id: `id-${i}`,
      userId: "id-user",
      tweetType: "TWEET",
      createdAt: new Date().toISOString(),
      content: `Tweet ${i + 1} here.`,
    }));
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
      .spyOn(TweetService.prototype, "findFeed")
      .mockResolvedValue(mockService);
    const response = await supertest(server)
      .get(`${endpoint}/?page=2&take=5`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch("Tweets retrieved successfully");
    expect(response.body.data).toEqual(paginatedTweets);
  });
});
