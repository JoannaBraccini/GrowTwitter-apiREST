"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tweet_service_1 = require("../../../src/services/tweet.service");
const prisma_mock_1 = require("../../config/prisma.mock");
const tweet_mock_1 = require("../mock/tweet.mock");
describe("Update TweetService", () => {
    const makeUpdate = (params) => ({
        tweetId: params?.tweetId || "id-tweet",
        userId: params?.userId || "id-usuario",
        content: params?.content || "Tweet alterado",
        imageUrl: params?.content || "Imagem substituída",
    });
    const createSut = () => new tweet_service_1.TweetService();
    it("Deve retornar status 404 quando ID fornecido não existir no sistema", async () => {
        const sut = createSut();
        const body = makeUpdate();
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
        const result = await sut.update(body);
        expect(result).toEqual({
            ok: false,
            code: 404,
            message: "Tweet not found",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 401 quando ID do usuário logado não for igual ao userId do Tweet", async () => {
        const sut = createSut();
        const tweetMock = tweet_mock_1.TweetMock.build({ userId: "outro-usuario" });
        const body = makeUpdate();
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
        const result = await sut.update(body);
        expect(result.code).toBe(401);
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("Not authorized to modify this tweet");
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 500 quando ocorrer erro de Exceção", async () => {
        const sut = createSut();
        const body = makeUpdate();
        prisma_mock_1.prismaMock.tweet.findUnique.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.update(body);
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
    });
    it("Deve retornar status 200 quando o tweet for atualizado no sistema", async () => {
        const sut = createSut();
        const body = makeUpdate({ tweetId: "id-tweet", userId: "id-usuario" });
        const tweetMock = tweet_mock_1.TweetMock.build({
            id: "id-tweet",
            userId: "id-usuario",
        });
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
        prisma_mock_1.prismaMock.tweet.update.mockResolvedValueOnce(tweetMock);
        const result = await sut.update(body);
        expect(result).toEqual({
            ok: true,
            code: 200,
            message: "Tweet content updated successfully",
            data: expect.objectContaining({
                content: "Texto do Tweet",
                imageUrl: expect.any(String),
                id: "id-tweet",
                tweetType: "TWEET",
                updatedAt: expect.any(Date),
            }),
        });
    });
});
