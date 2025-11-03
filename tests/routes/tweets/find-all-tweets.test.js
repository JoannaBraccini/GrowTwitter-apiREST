"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_server_1 = require("../../../src/express.server");
const supertest_1 = __importDefault(require("supertest"));
const tweet_service_1 = require("../../../src/services/tweet.service");
const server = (0, express_server_1.createServer)();
const endpoint = "/tweets";
describe("GET /tweets", () => {
    //Controller
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        // Simulando um erro no controller
        jest.spyOn(tweet_service_1.TweetService.prototype, "findAll").mockImplementationOnce(() => {
            throw new Error("Exception");
        });
        const response = await (0, supertest_1.default)(server).get(endpoint);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            ok: false,
            message: "An unexpected error occurred: Exception",
        });
    });
    it("Deve retornar status 200 e uma lista de tweets ao buscar sem filtros", async () => {
        const mockTweets = Array.from({ length: 10 }, (_, i) => ({
            id: `id-${i}`,
            userId: `userid-${i}`,
            tweetType: "TWEET",
            createdAt: new Date().toISOString(),
            content: `Tweet ${i + 1} here.`,
        }));
        const mockService = {
            ok: true,
            code: 200,
            message: "Tweets retrieved successfully",
            data: mockTweets,
        };
        const { code, ...responseBody } = mockService;
        jest
            .spyOn(tweet_service_1.TweetService.prototype, "findAll")
            .mockResolvedValue(mockService);
        const response = await (0, supertest_1.default)(server).get(endpoint);
        expect(response.body).toEqual(responseBody);
    });
    it("Deve retornar status 200 e uma lista de tweets específicos ao buscar por conteúdo", async () => {
        const mockTweets = Array.from({ length: 5 }, (_, i) => ({
            id: `id-${i}`,
            userId: `userid-${i}`,
            tweetType: "TWEET",
            createdAt: new Date().toISOString(),
            content: `Tweet ${i + 1} searched here.`,
        }));
        const mockService = {
            ok: true,
            code: 200,
            message: "Tweets retrieved successfully",
            data: mockTweets,
        };
        const { code, ...responseBody } = mockService;
        jest
            .spyOn(tweet_service_1.TweetService.prototype, "findAll")
            .mockResolvedValue(mockService);
        const response = await (0, supertest_1.default)(server).get(`${endpoint}?search=searched here.`);
        expect(response.body).toEqual(responseBody);
    });
    it("Deve retornar status 200 e uma lista com até 5 tweets da página 2 ao buscar com paginação", async () => {
        const mockTweets = Array.from({ length: 10 }, (_, i) => ({
            id: `id-${i}`,
            userId: `userid-${i}`,
            tweetType: "TWEET",
            createdAt: new Date().toISOString(),
            content: `Tweet ${i + 1} here.`,
        }));
        const page = 2;
        const take = 5;
        const skip = (page - 1) * take; // O controller já subtrai 1 do page
        const paginatedTweets = mockTweets.slice(skip, skip + take);
        const mockService = {
            ok: true,
            code: 200,
            message: "Tweets retrieved successfully",
            data: paginatedTweets,
        };
        jest
            .spyOn(tweet_service_1.TweetService.prototype, "findAll")
            .mockResolvedValue(mockService);
        const response = await (0, supertest_1.default)(server).get(`${endpoint}?page=2&take=5`);
        expect(response.status).toBe(200);
        expect(response.body.message).toMatch("Tweets retrieved successfully");
        expect(response.body.data).toEqual(paginatedTweets);
    });
});
