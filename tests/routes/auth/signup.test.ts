import supertest from "supertest";
import { createServer } from "../../../src/express.server";
import { SignupDto } from "../../../src/dtos";
import { randomUUID } from "crypto";
import { AuthService } from "../../../src/services/auth.service";

const server = createServer();
const endpoint = "/signup";

describe("POST /signup", () => {
  //Required
  it("Deve retornar 400 quando nome não for fornecido", async () => {
    const body: SignupDto = {
      name: "",
      email: "email@email.com",
      username: "username",
      password: "umaSenha",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Name is required."],
    });
  });

  it("Deve retornar 400 quando email não for fornecido", async () => {
    const body: SignupDto = {
      name: "Nome do Usuário",
      email: "",
      username: "username",
      password: "umaSenha",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Email is required."],
    });
  });

  it("Deve retornar 400 quando senha não for fornecida", async () => {
    const body: SignupDto = {
      name: "Nome do Usuário",
      email: "email@email.com",
      username: "username",
      password: "",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Password is required."],
    });
  });

  it("Deve retornar 400 quando nome de usuário não for fornecido", async () => {
    const body: SignupDto = {
      name: "Nome do Usuário",
      email: "email@email.com",
      username: "",
      password: "umaSenha",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Username is required."],
    });
  });
  //Types
  it("Deve retornar 400 quando campos obrigatórios não forem String", async () => {
    const body = {
      name: 1234,
      email: "email@email.com",
      username: "username",
      password: "umaSenha",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: "All fields must be strings.",
    });
  });
  //Length
  it("Deve retornar 400 quando nome tiver menos de 3 caracteres", async () => {
    const body: SignupDto = {
      name: "No",
      email: "email@email.com",
      username: "username",
      password: "umaSenha",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Name must be at least 3 characters long."],
    });
  });

  it("Deve retornar 400 quando nome de usuário tiver menos de 3 caracteres", async () => {
    const body: SignupDto = {
      name: "Nome do Usuário",
      email: "email@email.com",
      username: "us",
      password: "umaSenha",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Username must be at least 3 characters long."],
    });
  });

  it("Deve retornar 400 quando senha tiver menos de 4 caracteres", async () => {
    const body: SignupDto = {
      name: "Nome do Usuário",
      email: "email@email.com",
      username: "username",
      password: "uma",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Password must be at least 4 characters long."],
    });
  });

  it("Deve retornar 400 quando email não passar na validação de formato", async () => {
    const body: SignupDto = {
      name: "Nome do Usuário",
      email: "email@email",
      username: "username",
      password: "umaSenha",
    };
    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      message: ["Invalid email."],
    });
  });

  it("Deve retornar 500 quando ocorrer erro de exceção", async () => {
    const body: SignupDto = {
      name: "Nome do Usuário",
      email: "email@email.com",
      username: "username",
      password: "umaSenha",
    };

    // Simulando um erro no controller
    jest.spyOn(AuthService.prototype, "signup").mockImplementationOnce(() => {
      throw new Error("Exception");
    });

    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      message: "An unexpected error occurred: Exception",
    });
  });

  it("Deve retornar 201 quando cadastro for completado", async () => {
    const body: SignupDto = {
      name: "Nome do Usuário",
      email: "email@email.com",
      username: "username",
      password: "umaSenha",
    };
    const mockAuth = {
      ok: true,
      code: 201,
      message: "User created successfully.",
      data: {
        id: randomUUID(),
        name: "Nome do Usuário",
        email: "email@email.com",
        username: "username",
        createdAt: new Date(),
      },
    };
    jest.spyOn(AuthService.prototype, "signup").mockResolvedValueOnce(mockAuth);

    const response = await supertest(server).post(endpoint).send(body);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ok: true,
      message: "User created successfully.",
      data: {
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        username: expect.any(String),
        createdAt: expect.any(String),
      },
    });
  });
});
