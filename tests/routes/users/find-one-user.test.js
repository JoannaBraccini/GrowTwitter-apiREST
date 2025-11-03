"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_server_1 = require("../../../src/express.server");
const user_service_1 = require("../../../src/services/user.service");
const make_token_1 = require("../make-token");
const crypto_1 = require("crypto");
const server = (0, express_server_1.createServer)();
const endpoint = "/users/";
describe("GET /users/{id}", () => {
    //Auth
    it("Deve retornar status 401 quando token não for informado", async () => {
        const response = await (0, supertest_1.default)(server).get(`${endpoint}userID`);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Token is required",
        });
    });
    it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
        const response = await (0, supertest_1.default)(server)
            .get(`${endpoint}userID`)
            .set("Authorization", "invalid_token");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Invalid or missing token",
        });
    });
    it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
        const response = await (0, supertest_1.default)(server)
            .get(`${endpoint}userID`)
            .set("Authorization", "Bearer invalidToken");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Invalid or expired token",
        });
    });
    //UUID
    it("Deve retornar status 400 quando for informado ID inválido", async () => {
        const token = (0, make_token_1.makeToken)();
        const response = await (0, supertest_1.default)(server)
            .get(`${endpoint}invalid-uuid`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: "Identifier must be a UUID",
        });
    });
    //Controller
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        // Simulando um erro no controller
        jest.spyOn(user_service_1.UserService.prototype, "findOne").mockImplementationOnce(() => {
            throw new Error("Exception");
        });
        const response = await (0, supertest_1.default)(server)
            .get(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            ok: false,
            message: "An unexpected error occurred: Exception",
        });
    });
    //Service
    it("Deve retornar status 200 e os detalhes de um usuário específico ao buscar o ID fornecido com sucesso", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        const mockUser = {
            id: id,
            name: "Usuário Específico",
            username: "user_specific",
            followers: [],
            following: [],
            tweets: [],
        };
        const mockService = {
            ok: true,
            code: 200,
            message: "User details retrieved successfully",
            data: mockUser,
        };
        const { code, ...responseBody } = mockService;
        jest.spyOn(user_service_1.UserService.prototype, "findOne").mockResolvedValue(mockService);
        const response = await (0, supertest_1.default)(server)
            .get(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.body).toEqual(responseBody);
    });
});
