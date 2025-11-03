"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tweet_mock_1 = require("../mock/tweet.mock");
const tweet_service_1 = require("../../../src/services/tweet.service");
const prisma_mock_1 = require("../../config/prisma.mock");
describe("Like TweetService", () => {
    const makeLike = (params) => ({
        tweetId: params?.tweetId || "id-tweet",
        userId: params?.userId || "id-usuario",
        id: params?.id || "id-like",
        createdAt: new Date(),
    });
    const createSut = () => new tweet_service_1.TweetService();
    it("Deve retornar status 404 quando ID fornecido não existir no sistema", async () => {
        const sut = createSut();
        const body = { tweetId: "id-invalido", userId: "id-usuario" };
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
        const result = await sut.like(body);
        expect(result).toEqual({
            ok: false,
            code: 404,
            message: "Tweet not found",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 500 quando ocorrer erro de Exceção", async () => {
        const sut = createSut();
        const body = { tweetId: "id-tweet", userId: "id-usuario" };
        prisma_mock_1.prismaMock.tweet.findUnique.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.like(body);
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
    });
    it("Deve retornar status 201 quando o like for cadastrado do sistema", async () => {
        const sut = createSut();
        const body = { tweetId: "id-tweet", userId: "id-usuario" };
        const tweetMock = tweet_mock_1.TweetMock.build({
            id: "id-tweet",
            userId: "id-usuario",
        });
        const like = makeLike();
        //Encontra o tweet
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
        //Não existe like deste usuário
        prisma_mock_1.prismaMock.like.findUnique.mockResolvedValueOnce(null);
        //Cria o like
        prisma_mock_1.prismaMock.like.create.mockResolvedValueOnce(like);
        const result = await sut.like(body);
        expect(result).toEqual({
            ok: true,
            code: 201,
            message: "Tweet liked successfully",
            data: {
                id: "id-like",
                userId: "id-usuario",
                tweetId: "id-tweet",
                createdAt: expect.any(Date),
            },
        });
    });
    it("Deve retornar status 200 quando o like existente for removido do sistema", async () => {
        const sut = createSut();
        const body = { tweetId: "id-tweet", userId: "id-usuario" };
        const tweetMock = tweet_mock_1.TweetMock.build({
            id: "id-tweet",
            userId: "id-usuario",
        });
        const likeMock = makeLike();
        //Encontra o tweet
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
        //Like já existe
        prisma_mock_1.prismaMock.like.findUnique.mockResolvedValueOnce(likeMock);
        //Remove o like
        prisma_mock_1.prismaMock.like.delete.mockResolvedValueOnce(likeMock);
        const result = await sut.like(body);
        expect(result).toEqual({
            ok: true,
            code: 200,
            message: "Like removed successfully",
            data: {
                id: "id-like",
                userId: "id-usuario",
                tweetId: "id-tweet",
                createdAt: expect.any(Date),
            },
        });
    });
});
