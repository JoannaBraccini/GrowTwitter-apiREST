import supertest from "supertest";
import { createServer } from "../../../src/express.server";

const server = createServer();

describe("GET /", () => {
  it("Deve retornar status 200 e mensagem de boas-vindas", async () => {
    const response = await supertest(server).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      message: "GrowTwitter API 💻🌍",
    });
  });
});
