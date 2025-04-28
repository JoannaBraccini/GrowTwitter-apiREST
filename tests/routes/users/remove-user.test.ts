import supertest from "supertest";
import { createServer } from "../../../src/express.server";
import { UserService } from "../../../src/services/user.service";
import { makeToken } from "../make-token";
import { randomUUID } from "crypto";

const server = createServer();
const endpoint = "/users/";

describe("DELETE /users/{id}", () => {
  //Auth
  it("Deve retornar status 401 quando token não for informado", async () => {
    const response = await supertest(server).delete(`${endpoint}userID`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Token is required",
    });
  });

  it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
    const response = await supertest(server)
      .delete(`${endpoint}userID`)
      .set("Authorization", "invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Invalid or missing token",
    });
  });

  it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
    const response = await supertest(server)
      .delete(`${endpoint}userID`)
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
      .delete(`${endpoint}invalid-uuid`)
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
    jest.spyOn(UserService.prototype, "remove").mockImplementationOnce(() => {
      throw new Error("Exception");
    });

    const response = await supertest(server)
      .delete(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      message: "An unexpected error occurred: Exception",
    });
  });
  //Service
  it("Deve retornar status 200 e uma cópia do usuário ao removê-lo com sucesso", async () => {
    const token = makeToken();
    const id = randomUUID();
    const mockuser = {
      id: id,
      name: "Usuário Deletado",
      username: "delete_me",
      followers: 2,
      following: 10,
      tweets: 20,
    };
    const mockService = {
      ok: true,
      code: 200,
      message: "user removed successfully",
      data: mockuser,
    };

    const { code, ...responseBody } = mockService;

    jest.spyOn(UserService.prototype, "remove").mockResolvedValue(mockService);
    const response = await supertest(server)
      .delete(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(responseBody);
  });
});
