import supertest from "supertest";
import { createServer } from "../../../src/express.server";
import { makeToken } from "../make-token";

const server = createServer();
const endpoint = "/validate";

describe("GET /validate", () => {
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

  it("Deve retornar status 200 quando token válido for informado", async () => {
    const token = makeToken();
    const response = await supertest(server)
      .get(endpoint)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
    });
  });
});
