import supertest from "supertest";
import { createServer } from "../../../src/express.server";
import { LoginDto } from "../../../src/dtos";
import { randomUUID } from "crypto";
import { AuthService } from "../../../src/services/auth.service";

const server = createServer();
const endpoint = "/login";

describe("POST /login", () => {
  //Required

  it("Deve retornar 400 quando nem email nem username forem fornecidos", async () => {
    const body: LoginDto = {
      email: "",
      username: "",
      password: "umaSenha",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: "Email or username are required",
    });
  });

  it("Deve retornar 400 quando senha não for fornecida", async () => {
    const body: LoginDto = {
      email: "",
      username: "username",
      password: "",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: "Password is required",
    });
  });
  //Types
  it("Deve retornar 400 quando campos obrigatórios não forem String", async () => {
    const body = {
      email: "email@email.com",
      username: "",
      password: 1234,
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: "All fields must be strings",
    });
  });
  //Controller
  it("Deve retornar 500 quando ocorrer erro de exceção", async () => {
    const body: LoginDto = {
      email: "",
      username: "username",
      password: "umaSenha",
    };

    // Simulando um erro no controller
    jest.spyOn(AuthService.prototype, "login").mockImplementationOnce(() => {
      throw new Error("Exception");
    });

    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      message: "An unexpected error occurred: Exception",
    });
  });
  //Service
  it("Deve retornar 200 quando autenticação for completada", async () => {
    const body: LoginDto = {
      email: "",
      username: "username",
      password: "umaSenha",
    };
    const mockAuth = {
      ok: true,
      code: 200,
      message: "Successfully logged in",
      data: {
        token: "Bearer token",
        user: {
          id: randomUUID(),
          name: "Nome do Usuário",
          username: "username",
          email: "email@email.com",
        },
      },
    };
    jest.spyOn(AuthService.prototype, "login").mockResolvedValueOnce(mockAuth);

    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      message: "Successfully logged in",
      data: {
        token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
        }),
      },
    });
  });
});
