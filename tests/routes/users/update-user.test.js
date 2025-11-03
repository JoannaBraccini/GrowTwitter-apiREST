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
describe("PUT /users/{id}", () => {
    //Auth
    it("Deve retornar status 401 quando token não for informado", async () => {
        const response = await (0, supertest_1.default)(server).put(`${endpoint}userID`);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Token is required",
        });
    });
    it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}userID`)
            .set("Authorization", "invalid_token");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Invalid or missing token",
        });
    });
    it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
        const response = await (0, supertest_1.default)(server)
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
        const token = (0, make_token_1.makeToken)();
        const response = await (0, supertest_1.default)(server)
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
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        const response = await (0, supertest_1.default)(server)
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
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        const response = await (0, supertest_1.default)(server)
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
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        const payload = {
            id: (0, crypto_1.randomUUID)(),
            name: "Jo",
        };
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(payload);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Name must be at least 3 characters long"],
        });
    });
    it("Deve retornar status 400 quando Bio tiver mais de 100 caracteres", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        const payload = {
            id: id,
            bio: "Esta é uma bio de teste para validar a restrição de caracteres no campo bio. Deve ter mais de cem caracteres.",
        };
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}${id}`)
            .send(payload)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Bio cannot be so long"],
        });
    });
    it("Deve retornar status 400 quando url do avatar tiver mais de 200 caracteres", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        const payload = {
            id: id,
            avatarUrl: "https://exemplo.com/imagens/avatar/este-e-um-link-muito-longo-para-testar-a-validacao-de-url-que-deve-ter-mais-de-duzentos-caracteres-1234567890123456789012345678901234567890123456789012345678901234567890.jpg",
        };
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}${id}`)
            .send(payload)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Link cannot be so long"],
        });
    });
    //Controller
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        // Simulando um erro no controller
        jest.spyOn(user_service_1.UserService.prototype, "update").mockImplementationOnce(() => {
            throw new Error("Exception");
        });
        const response = await (0, supertest_1.default)(server)
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
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
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
        jest.spyOn(user_service_1.UserService.prototype, "update").mockResolvedValue(mockService);
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ username: "user_mod" });
        expect(response.body).toEqual(responseBody);
    });
});
