"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const tweet_service_1 = require("../../../src/services/tweet.service");
const prisma_mock_1 = require("../../config/prisma.mock");
const tweet_mock_1 = require("../mock/tweet.mock");
describe("Create TweetService", () => {
    const makeCreate = (params) => ({
        tweetType: params?.tweetType || client_1.TweetType.TWEET,
        parentId: params?.parentId || undefined,
        userId: params?.userId || "id-do-usuario",
        content: params?.content || "Texto do Tweet",
        imageUrl: params?.imageUrl || "http://image.jpg",
    });
    const createSut = () => new tweet_service_1.TweetService();
    it("Deve retornar status 404 quando, na criação de um reply, o ID do tweet respondido não for encontrado no sistema", async () => {
        const sut = createSut();
        const body = makeCreate({ parentId: "id-invalido" });
        prisma_mock_1.prismaMock.tweet.findUnique.mockResolvedValueOnce(null);
        const result = await sut.create(body);
        expect(result.code).not.toBe(201);
        expect(result.code).toBe(404);
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("Tweet not found");
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const sut = createSut();
        const body = makeCreate();
        prisma_mock_1.prismaMock.tweet.create.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.create(body);
        expect(result.code).not.toBe(201);
        expect(result.code).toBe(500);
        expect(result.ok).not.toBeTruthy();
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("Internal server error: Exception");
        expect(result.data).not.toBeDefined();
    });
    it("Deve retornar status 201 quando tweet/reply for cadastrado no sistema", async () => {
        const sut = createSut();
        const body = makeCreate();
        const tweetMock = tweet_mock_1.TweetMock.build(body);
        prisma_mock_1.prismaMock.tweet.create.mockResolvedValueOnce(tweetMock);
        const result = await sut.create(body);
        expect(result).toEqual({
            ok: true,
            code: 201,
            message: "Tweet created successfully",
            data: {
                id: tweetMock.id,
                userId: tweetMock.userId,
                parentId: tweetMock.parentId,
                tweetType: tweetMock.tweetType,
                content: tweetMock.content,
                imageUrl: tweetMock.imageUrl,
                createdAt: tweetMock.createdAt,
            },
        });
    });
});
