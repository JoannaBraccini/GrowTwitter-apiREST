import { TweetService } from "../../../src/services/tweet.service";
import { createServer } from "../../../src/express.server";
import { makeToken } from "../make-token";
import { randomUUID } from "crypto";
import supertest from "supertest";

const server = createServer();
const endpoint = "/tweets/retweet/";

describe("PATCH /tweets/retweet/{id}", () => {
  //Auth
  it("Deve retornar status 401 quando token não for informado", async () => {
    const response = await supertest(server).patch(`${endpoint}tweetID`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Token is required",
    });
  });

  it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
    const response = await supertest(server)
      .patch(`${endpoint}tweetID`)
      .set("Authorization", "invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Invalid or missing token",
    });
  });

  it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
    const response = await supertest(server)
      .patch(`${endpoint}tweetID`)
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
      .patch(`${endpoint}invalid-uuid`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: "Identifier must be a UUID",
    });
  });
  //Controller
  it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
    const token = makeToken();
    const id = randomUUID();
    // Simulando um erro no controller
    jest.spyOn(TweetService.prototype, "retweet").mockImplementationOnce(() => {
      throw new Error("Exception");
    });

    const response = await supertest(server)
      .patch(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      message: "An unexpected error occurred: Exception",
    });
  });
  //Service
  it("Deve retornar status 201 e os dados do retweet ao curtir o Tweet com sucesso", async () => {
    const token = makeToken();
    const id = randomUUID();
    const mockService = {
      ok: true,
      code: 201,
      message: "Retweeted successfully",
      data: {
        id: randomUUID(),
        userId: randomUUID(),
        tweetId: id,
        createdAt: new Date().toISOString(),
      },
    };

    const { code, ...responseBody } = mockService;

    jest
      .spyOn(TweetService.prototype, "retweet")
      .mockResolvedValue(mockService);
    const response = await supertest(server)
      .patch(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(responseBody);
  });

  it("Deve retornar status 200 ao remover o retweet do Tweet com sucesso", async () => {
    const token = makeToken();
    const id = randomUUID();
    const mockService = {
      ok: true,
      code: 200,
      message: "Retweet removed successfully",
    };

    const { code, ...responseBody } = mockService;

    jest
      .spyOn(TweetService.prototype, "retweet")
      .mockResolvedValue(mockService);
    const response = await supertest(server)
      .patch(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(responseBody);
  });
});
