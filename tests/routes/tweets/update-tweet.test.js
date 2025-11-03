"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tweet_service_1 = require("../../../src/services/tweet.service");
const express_server_1 = require("../../../src/express.server");
const make_token_1 = require("../make-token");
const crypto_1 = require("crypto");
const supertest_1 = __importDefault(require("supertest"));
const server = (0, express_server_1.createServer)();
const endpoint = "/tweets/";
describe("PUT /tweets/{id}", () => {
    //Auth
    it("Deve retornar status 401 quando token não for informado", async () => {
        const response = await (0, supertest_1.default)(server).put(`${endpoint}tweetID`);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Token is required",
        });
    });
    it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}tweetID`)
            .set("Authorization", "invalid_token");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Invalid or missing token",
        });
    });
    it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}tweetID`)
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
    it("Deve retornar status 400 quando informado TweetType inválido", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = "c8d1f1f5-3b37-45f4-bff7-7cf745a2f9b9";
        const payload = {
            tweetType: "TWIT",
            content: "This is a test tweet!",
        };
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(payload);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Tweet type must be TWEET, REPLY"],
        });
    });
    it("Deve retornar status 400 quando informado Content inválido", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = "c8d1f1f5-3b37-45f4-bff7-7cf745a2f9b9";
        const payload = {
            tweetType: "TWEET",
            content: 1234,
            imageUrl: "http://image.com.jpg",
        };
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(payload);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Text must be a string"],
        });
    });
    //Controller
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        const payload = {
            tweetType: "TWEET",
            content: "This is a test tweet!",
        };
        // Simulando um erro no controller
        jest.spyOn(tweet_service_1.TweetService.prototype, "update").mockImplementationOnce(() => {
            throw new Error("Exception");
        });
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(payload);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            ok: false,
            message: "An unexpected error occurred: Exception",
        });
    });
    //Service
    it("Deve retornar status 200 ao atualizar um Tweet com sucesso", async () => {
        const token = (0, make_token_1.makeToken)();
        const id = (0, crypto_1.randomUUID)();
        const payload = {
            tweetType: "TWEET",
            content: "This is a test tweet!",
        };
        const mockTweet = {
            id: id,
            userId: (0, crypto_1.randomUUID)(),
            tweetType: "TWEET",
            content: "This is a test tweet!",
            createdAt: new Date().toISOString(),
            retweetsCount: 5,
        };
        const mockService = {
            ok: true,
            code: 200,
            message: "Tweet content updated successfully",
            data: mockTweet,
        };
        const { code, ...responseBody } = mockService;
        jest.spyOn(tweet_service_1.TweetService.prototype, "update").mockResolvedValue(mockService);
        const response = await (0, supertest_1.default)(server)
            .put(`${endpoint}${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(payload);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(responseBody);
    });
});
