"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_server_1 = require("../../../src/express.server");
const crypto_1 = require("crypto");
const auth_service_1 = require("../../../src/services/auth.service");
const server = (0, express_server_1.createServer)();
const endpoint = "/login";
describe("POST /login", () => {
    //Required
    it("Deve retornar status 400 quando nem email nem username forem fornecidos", async () => {
        const body = {
            email: "",
            username: "",
            password: "umaSenha",
        };
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: "Email or username are required",
        });
    });
    it("Deve retornar status 400 quando senha não for fornecida", async () => {
        const body = {
            email: "",
            username: "username",
            password: "",
        };
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: "Password is required",
        });
    });
    //Types
    it("Deve retornar status 400 quando campos obrigatórios não forem String", async () => {
        const body = {
            email: "email@email.com",
            username: "username",
            password: 1234,
        };
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Password must be a string"],
        });
    });
    //Controller
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const body = {
            email: "",
            username: "username",
            password: "umaSenha",
        };
        // Simulando um erro no controller
        jest.spyOn(auth_service_1.AuthService.prototype, "login").mockImplementationOnce(() => {
            throw new Error("Exception");
        });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            ok: false,
            message: "An unexpected error occurred: Exception",
        });
    });
    //Service
    it("Deve retornar status 200 quando autenticação for completada", async () => {
        const body = {
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
                    id: (0, crypto_1.randomUUID)(),
                    name: "Nome do Usuário",
                    username: "username",
                    email: "email@email.com",
                },
            },
        };
        jest.spyOn(auth_service_1.AuthService.prototype, "login").mockResolvedValueOnce(mockAuth);
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
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
