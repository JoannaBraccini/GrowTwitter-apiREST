"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tweet_mock_1 = require("../mock/tweet.mock");
const tweet_service_1 = require("../../../src/services/tweet.service");
const prisma_mock_1 = require("../../config/prisma.mock");
describe("Find Feed TweetService", () => {
    const createSut = () => new tweet_service_1.TweetService();
    it("Deve retornar status 404 quando não houverem tweets no sistema", async () => {
        const sut = createSut();
        const query = {};
        //Usuário não segue ninguém
        prisma_mock_1.prismaMock.follower.findMany.mockResolvedValueOnce([]);
        //Usuário não tem tweets
        prisma_mock_1.prismaMock.tweet.findMany.mockResolvedValueOnce([]);
        const result = await sut.findFeed("id-valido", query);
        expect(result).toEqual({
            ok: false,
            code: 404,
            message: "No tweets found",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const sut = createSut();
        const userMock = Array.from({ length: 4 }, (_, index) => {
            return {
                id: "id-usuario-logado",
                createdAt: new Date(),
                followerId: "id-usuario-logado",
                followedId: `followed${index}`,
            };
        });
        const query = {};
        prisma_mock_1.prismaMock.follower.findMany.mockResolvedValueOnce(userMock);
        prisma_mock_1.prismaMock.tweet.findMany.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.findFeed("id-usuario-logado", query);
        expect(result.code).toBe(500);
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("Internal server error: Exception");
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 200 quando encontrar tweets no sistema", async () => {
        const sut = createSut();
        const tweetMock = Array.from({ length: 4 }, (_, index) => {
            return tweet_mock_1.TweetMock.build({
                userId: "id-usuario-logado",
                content: `Texto do tweet${index}`,
            });
        });
        const query = {};
        prisma_mock_1.prismaMock.follower.findMany.mockResolvedValueOnce([]);
        prisma_mock_1.prismaMock.tweet.findMany.mockResolvedValueOnce(tweetMock);
        const result = await sut.findFeed("id-usuario-logado", query);
        expect(result.code).toBe(200);
        expect(result.ok).toBeTruthy();
        expect(result.message).toMatch("Tweets retrieved successfully");
        expect(result.data).toBeDefined();
        result.data.forEach((tweet) => {
            expect(tweet).toEqual({
                id: expect.any(String),
                userId: "id-usuario-logado",
                tweetType: "TWEET",
                parentId: null,
                content: expect.any(String),
                imageUrl: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                likes: undefined,
                retweets: undefined,
                replies: undefined,
            });
        });
    });
});
