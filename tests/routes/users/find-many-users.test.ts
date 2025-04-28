import { createServer } from "../../../src/express.server";
import supertest from "supertest";
import { UserService } from "../../../src/services/user.service";

const server = createServer();
const endpoint = "/users";

describe("GET /users", () => {
  //Controller
  it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
    // Simulando um erro no controller
    jest.spyOn(UserService.prototype, "findMany").mockImplementationOnce(() => {
      throw new Error("Exception");
    });

    const response = await supertest(server).get(endpoint);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      message: "An unexpected error occurred: Exception",
    });
  });
  //Service
  it("Deve retornar status 200 e uma lista geral de usuários ao buscar sem filtros", async () => {
    const mockUsers = Array.from({ length: 10 }, (_, i) => ({
      id: `id-${i}`,
      name: `${i} Name ${i}${i}`,
      username: `username_${i}`,
      followers: i * 2,
      tweets: i * 2 - i,
    }));
    const mockService = {
      ok: true,
      code: 200,
      message: "Users retrieved successfully",
      data: mockUsers,
    };

    const { code, ...responseBody } = mockService;

    jest
      .spyOn(UserService.prototype, "findMany")
      .mockResolvedValue(mockService);
    const response = await supertest(server).get(endpoint);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(responseBody);
  });

  it("Deve retornar status 200 e uma lista específica de usuários ao buscar com filtros", async () => {
    const mockUsers = Array.from({ length: 5 }, (_, i) => ({
      id: `id-${i}`,
      name: "Nome buscado",
      username: `username_${i}`,
      followers: i * 2,
      tweets: i * 2 - i,
    }));
    const mockService = {
      ok: true,
      code: 200,
      message: "Users retrieved successfully",
      data: mockUsers,
    };

    const { code, ...responseBody } = mockService;

    jest
      .spyOn(UserService.prototype, "findMany")
      .mockResolvedValue(mockService);
    const response = await supertest(server).get(
      `${endpoint}?search=Nome buscado`
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(responseBody);
  });
});
