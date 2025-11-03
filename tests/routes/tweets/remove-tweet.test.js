"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_server_1 = require("../../../src/express.server");
const tweet_service_1 = require("../../../src/services/tweet.service");
const make_token_1 = require("../make-token");
const crypto_1 = require("crypto");
const server = (0, express_server_1.createServer)();
const endpoint = "/tweets/";
describe("DELETE /tweets/{id}", () => {
    //Auth
    it("Deve retornar status 401 quando token não for informado", async () => {
        const response = await (0, supertest_1.default)(server).delete(`${endpoint}tweetID`);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Token is required",
        });
    });
    it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
        const response = await (0, supertest_1.default)(server)
            .delete(`${endpoint}tweetID`)
            .set("Authorization", "invalid_token");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Invalid or missing token",
        });
    });
    it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
        const response = await (0, supertest_1.default)(server)
            .delete(`${endpoint}tweetID`)
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
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        // Simulando um erro no controller
        jest.spyOn(tweet_service_1.TweetService.prototype, "remove").mockImplementationOnce(() => {
            throw new Error("Exception");
        });
        const response = await (0, supertest_1.default)(server)
            .delete(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            ok: false,
            message: "An unexpected error occurred: Exception",
        });
    });
    //Service
    it("Deve retornar status 200 e uma cópia do tweet ao remover o Tweet com sucesso", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        const mockTweet = {
            id: id,
            userId: (0, crypto_1.randomUUID)(),
            tweetType: "TWEET",
            content: "This is a test tweet!",
            createdAt: new Date().toISOString(),
        };
        const mockService = {
            ok: true,
            code: 200,
            message: "Tweet removed successfully",
            data: mockTweet,
        };
        const { code, ...responseBody } = mockService;
        jest.spyOn(tweet_service_1.TweetService.prototype, "remove").mockResolvedValue(mockService);
        const response = await (0, supertest_1.default)(server)
            .delete(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(responseBody);
    });
});
