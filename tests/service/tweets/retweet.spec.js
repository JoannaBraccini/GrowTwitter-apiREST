"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tweet_mock_1 = require("../mock/tweet.mock");
const tweet_service_1 = require("../../../src/services/tweet.service");
const prisma_mock_1 = require("../../config/prisma.mock");
describe("Retweet TweetService", () => {
    const makeRetweet = (params) => ({
        id: params?.id || "id-retweet",
        tweetId: params?.tweetId || "id-tweet",
        userId: params?.userId || "id-usuario",
        comment: params?.comment || null,
        createdAt: new Date(),
    });
    const createSut = () => new tweet_service_1.TweetService();
    it("Deve retornar status 404 quando ID fornecido não existir no sistema", async () => {
        const sut = createSut();
        const body = { tweetId: "id-invalido", userId: "id-usuario" };
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
        const result = await sut.retweet(body);
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
        const result = await sut.retweet(body);
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
    });
    it("Deve retornar status 201 quando o retweet for cadastrado do sistema", async () => {
        const sut = createSut();
        const body = { tweetId: "id-tweet", userId: "id-usuario" };
        const tweetMock = tweet_mock_1.TweetMock.build({
            id: "id-tweet",
            userId: "id-usuario",
        });
        const retweet = makeRetweet();
        //Encontra o tweet
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
        //Não existe retweet deste usuário
        prisma_mock_1.prismaMock.retweet.findUnique.mockResolvedValueOnce(null);
        //Cria o retweet
        prisma_mock_1.prismaMock.retweet.create.mockResolvedValueOnce(retweet);
        const result = await sut.retweet(body);
        expect(result).toEqual({
            ok: true,
            code: 201,
            message: "Retweeted successfully",
            data: {
                id: retweet.id,
                tweetId: retweet.tweetId,
                userId: retweet.userId,
                comment: retweet.comment,
                createdAt: retweet.createdAt,
            },
        });
    });
    it("Deve retornar status 200 quando o retweet existente for removido do sistema", async () => {
        const sut = createSut();
        const body = { tweetId: "id-tweet", userId: "id-usuario" };
        const tweetMock = tweet_mock_1.TweetMock.build({
            id: "id-tweet",
            userId: "id-usuario",
        });
        const retweetMock = makeRetweet();
        //Encontra o tweet
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(tweetMock);
        //retweet já existe
        prisma_mock_1.prismaMock.retweet.findUnique.mockResolvedValueOnce(retweetMock);
        //Remove o retweet
        prisma_mock_1.prismaMock.retweet.delete.mockResolvedValueOnce(retweetMock);
        const result = await sut.retweet(body);
        expect(result).toEqual({
            ok: true,
            code: 200,
            message: "Retweet removed successfully",
            data: {
                id: retweetMock.id,
                tweetId: retweetMock.tweetId,
                userId: retweetMock.userId,
                comment: retweetMock.comment,
                createdAt: retweetMock.createdAt,
            },
        });
    });
});
