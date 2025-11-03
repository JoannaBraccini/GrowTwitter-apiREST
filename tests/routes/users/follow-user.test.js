"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = require("../../../src/services/user.service");
const express_server_1 = require("../../../src/express.server");
const make_token_1 = require("../make-token");
const crypto_1 = require("crypto");
const supertest_1 = __importDefault(require("supertest"));
const server = (0, express_server_1.createServer)();
const endpoint = "/users/follow/";
describe("PATCH /users/follow/{id}", () => {
    //Auth
    it("Deve retornar status 401 quando token não for informado", async () => {
        const response = await (0, supertest_1.default)(server).patch(`${endpoint}userID`);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Token is required",
        });
    });
    it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
        const response = await (0, supertest_1.default)(server)
            .patch(`${endpoint}userID`)
            .set("Authorization", "invalid_token");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Invalid or missing token",
        });
    });
    it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
        const response = await (0, supertest_1.default)(server)
            .patch(`${endpoint}userID`)
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
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        // Simulando um erro no controller
        jest.spyOn(user_service_1.UserService.prototype, "follow").mockImplementationOnce(() => {
            throw new Error("Exception");
        });
        const response = await (0, supertest_1.default)(server)
            .patch(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send((0, crypto_1.randomUUID)());
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            ok: false,
            message: "An unexpected error occurred: Exception",
        });
    });
    //Service
    it("Deve retornar status 201 e os ids dos usuários ao Seguir com sucesso", async () => {
        const token = (0, make_token_1.makeToken)();
        const followerId = "074096fa-6fc4-4c3a-8e8a-ea50f45a1dc9";
        const followedId = "cf45bcb9-af65-44e6-8e60-cf077db87544";
        const mockService = {
            ok: true,
            code: 201,
            message: "Successfully followed the user",
            data: {
                id: (0, crypto_1.randomUUID)(),
                followerId,
                followedId,
                createdAt: new Date().toISOString(),
            },
        };
        const { code, ...responseBody } = mockService;
        jest.spyOn(user_service_1.UserService.prototype, "follow").mockResolvedValue(mockService);
        const response = await (0, supertest_1.default)(server)
            .patch(`${endpoint}${followedId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(followerId);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(responseBody);
    });
    it("Deve retornar status 200 ao remover o Follow com sucesso", async () => {
        const token = (0, make_token_1.makeToken)();
        const followerId = "074096fa-6fc4-4c3a-8e8a-ea50f45a1dc9";
        const followedId = "cf45bcb9-af65-44e6-8e60-cf077db87544";
        const mockService = {
            ok: true,
            code: 200,
            message: "Followed removed successfully",
        };
        const { code, ...responseBody } = mockService;
        jest.spyOn(user_service_1.UserService.prototype, "follow").mockResolvedValue(mockService);
        const response = await (0, supertest_1.default)(server)
            .patch(`${endpoint}${followedId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(followerId);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(responseBody);
    });
});
