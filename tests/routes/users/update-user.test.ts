import supertest from "supertest";
import { createServer } from "../../../src/express.server";
import { UserService } from "../../../src/services/user.service";
import { makeToken } from "../make-token";
import { randomUUID } from "crypto";

const server = createServer();
const endpoint = "/users/";

describe("PUT /users/{id}", () => {
  //Auth
  it("Deve retornar status 401 quando token não for informado", async () => {
    const response = await supertest(server).put(`${endpoint}userID`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Token is required",
    });
  });

  it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
    const response = await supertest(server)
      .put(`${endpoint}userID`)
      .set("Authorization", "invalid_token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      message: "Unauthorized: Invalid or missing token",
    });
  });

  it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
    const response = await supertest(server)
      .put(`${endpoint}userID`)
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
  it("Deve retornar status 400 quando forem informados Name, Username ou Passwords de formato inválido", async () => {
    const token = makeToken();
    const id = randomUUID();

    const response = await supertest(server)
      .put(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: 1234 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Name must be a string"],
    });
  });

  it("Deve retornar status 400 quando for informado nome com conteúdo numérico", async () => {
    const token = makeToken();
    const id = randomUUID();

    const response = await supertest(server)
      .put(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "1234" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Name can only contain letters and spaces"],
    });
  });

  it("Deve retornar status 400 quando forem informados Name, Username ou Passwords de tamanho inválido", async () => {
    const token = makeToken();
    const id = randomUUID();
    const payload = {
      id: randomUUID(),
      name: "Jo",
    };

    const response = await supertest(server)
      .put(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Name must be at least 3 characters long"],
    });
  });
  //Controller
  it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
    const token = makeToken();
    const id = randomUUID();
    // Simulando um erro no controller
    jest.spyOn(UserService.prototype, "update").mockImplementationOnce(() => {
      throw new Error("Exception");
    });

    const response = await supertest(server)
      .put(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      message: "An unexpected error occurred: Exception",
    });
  });
  //Service
  it("Deve retornar status 200 ao atualizar os dados do usuário com sucesso", async () => {
    const token = makeToken();
    const id = randomUUID();
    const mockUser = {
      id: id,
      name: "Usuário Alterado",
      username: "user_mod",
      email: "user@email.com",
    };
    const mockService = {
      ok: true,
      code: 200,
      message: "User profile updated successfully",
      data: mockUser,
    };

    const { code, ...responseBody } = mockService;

    jest.spyOn(UserService.prototype, "update").mockResolvedValue(mockService);
    const response = await supertest(server)
      .put(`${endpoint}${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "user_mod" });

    expect(response.body).toEqual(responseBody);
  });
});
