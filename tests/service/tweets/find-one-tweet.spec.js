"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tweet_mock_1 = require("../mock/tweet.mock");
const tweet_service_1 = require("../../../src/services/tweet.service");
const prisma_mock_1 = require("../../config/prisma.mock");
describe("Find One TweetService", () => {
    const createSut = () => new tweet_service_1.TweetService();
    it("Deve retornar status 404 quando o ID fornecido não existir no sistema", async () => {
        const sut = createSut();
        const prisma = prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
        const result = await sut.findOne("id-invalido");
        expect(result).toEqual({
            ok: false,
            code: 404,
            message: "Tweet not found",
        });
        expect(prisma).toHaveBeenCalled();
    });
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const sut = createSut();
        prisma_mock_1.prismaMock.tweet.findUnique.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.findOne("id-valido");
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 200 quando o ID fornecido for encontrado no sistema", async () => {
        const sut = createSut();
        const tweetMock = tweet_mock_1.TweetMock.build({ id: "id-valido" });
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
        const result = await sut.findOne("id-valido");
        expect(result.code).toBe(200);
        expect(result.ok).toBeTruthy();
        expect(result.message).toMatch("Tweet details retrieved successfully");
        expect(result.data).toMatchObject({
            id: "id-valido",
            userId: expect.any(String),
            content: expect.any(String),
            imageUrl: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        });
    });
});
