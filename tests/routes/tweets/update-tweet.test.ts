import supertest from "supertest";
import { createServer } from "../../../src/express.server";
import { TweetService } from "../../../src/services/tweet.service";
import { makeToken } from "../make-token";
import { randomUUID } from "crypto";

const server = createServer();
const endpoint = "/tweets/";

describe("PUT /tweets/{id}", () => {
  //Auth
  it("Deve retornar status 401 quando token não for informado", async () => {
    const response = await supertest(server).put(`${endpoint}tweetID`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Token is required",
    });
  });

  it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
    const response = await supertest(server)
      .put(`${endpoint}tweetID`)
      .set("Authorization", "invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Invalid or missing token",
    });
  });

  it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
    const response = await supertest(server)
      .put(`${endpoint}tweetID`)
      .set("Authorization", "Bearer invalidToken");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Invalid or expired token",
    });
  });
  //UUID
  it("Deve retornar status 400 quando for informado ID inválido", async () => {
    const token = makeToken();

    const response = await supertest(server)
      .put(`${endpoint}invalid-uuid`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: "Identifier must be a UUID",
    });
  });
  //Types
  it("Deve retornar status 400 quando informado TweetType inválido", async () => {
    const token = makeToken();
    const id = "c8d1f1f5-3b37-45f4-bff7-7cf745a2f9b9";
    const payload = { type: "TWIT" };

    const response = await supertest(server)
      .put(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Type must be TWEET, REPLY or RETWEET"],
    });
  });
  //Controller
  it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
    const token = makeToken();
    const id = randomUUID();
    const body = {};
    // Simulando um erro no controller
    jest.spyOn(TweetService.prototype, "update").mockImplementationOnce(() => {
      throw new Error("Exception");
    });

    const response = await supertest(server)
      .put(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      message: "An unexpected error occurred: Exception",
    });
  });
  //Service
  it("Deve retornar status 200 e os detalhes de um tweet específico ao buscar o ID fornecido com sucesso", async () => {
    const token = makeToken({ id: "id-user" });
    const id = randomUUID();
    const mockTweet = {
      id: id,
      userId: "id-user",
      type: "TWEET",
      content: "I'm writing a tweet to be searched!",
      createdAt: new Date().toISOString(),
      likesCount: 5,
    };
    const mockService = {
      ok: true,
      code: 200,
      message: "Tweet details retrieved successfully",
      data: mockTweet,
    };

    const { code, ...responseBody } = mockService;

    jest
      .spyOn(TweetService.prototype, "findOne")
      .mockResolvedValue(mockService);
    const response = await supertest(server)
      .put(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toEqual(responseBody);
  });
});
