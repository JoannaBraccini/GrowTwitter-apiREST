"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tweet_service_1 = require("../../../src/services/tweet.service");
const prisma_mock_1 = require("../../config/prisma.mock");
const tweet_mock_1 = require("../mock/tweet.mock");
describe("Find All TweetService", () => {
    const createSut = () => new tweet_service_1.TweetService();
    it("Deve retornar status 404 quando não forem localizados tweets no sistema", async () => {
        const sut = createSut();
        const query = { page: 1, take: 10 };
        prisma_mock_1.prismaMock.tweet.findMany.mockResolvedValueOnce([]);
        const result = await sut.findAll(query);
        expect(result.code).toBe(404);
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("No tweets found");
        expect(result.data).toBeUndefined();
        expect(result.data).not.toBeDefined();
    });
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const sut = createSut();
        const query = {};
        prisma_mock_1.prismaMock.tweet.findMany.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.findAll(query);
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
    });
    it("Deve retornar status 200 quando tweets existirem no sistema", async () => {
        const sut = createSut();
        const query = {};
        const tweetsMock = Array.from({ length: 5 }, (_, index) => {
            return tweet_mock_1.TweetMock.build({
                id: `id${index}`,
                content: `Tweet ${index} Here`,
                userId: `user${index}`,
            });
        });
        prisma_mock_1.prismaMock.tweet.findMany.mockResolvedValueOnce(tweetsMock);
        const result = await sut.findAll(query);
        expect(result.code).toBe(200);
        expect(result.ok).toBeTruthy();
        expect(result.message).toMatch("Tweets retrieved successfully");
        expect(result.data).toHaveLength(5);
        result.data.forEach((tweet) => {
            expect(tweet).toHaveProperty("content");
        });
    });
});
