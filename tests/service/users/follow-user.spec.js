"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_mock_1 = require("../mock/user.mock");
const user_service_1 = require("../../../src/services/user.service");
const prisma_mock_1 = require("../../config/prisma.mock");
const crypto_1 = require("crypto");
describe("Follow UserService", () => {
    const makeFollow = (params) => ({
        id: params?.id || (0, crypto_1.randomUUID)(),
        followerId: params?.followerId || (0, crypto_1.randomUUID)(),
        followedId: params?.followedId || (0, crypto_1.randomUUID)(),
        createdAt: new Date(),
    });
    const createSut = () => new user_service_1.UserService();
    it("Deve retornar status 404 quando ID fornecido (Follower) não existir no sistema", async () => {
        const sut = createSut();
        const body = { id: "id-seguido", userId: "id-seguidor-invalido" };
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(null);
        const result = await sut.follow(body);
        expect(result).toEqual({
            ok: false,
            code: 404,
            message: "User not found",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 404 quando ID fornecido (Followed) não existir no sistema", async () => {
        const sut = createSut();
        const body = { id: "id-seguido-invalido", userId: "id-seguidor" };
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(null);
        const result = await sut.follow(body);
        expect(result).toEqual({
            ok: false,
            code: 404,
            message: "User not found",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 409 quando IDs fornecidos (Followed e Follower) forem iguais", async () => {
        const sut = createSut();
        const userMock = user_mock_1.UserMock.build({ id: "id-seguidor" });
        const body = { id: "id-seguidor", userId: "id-seguidor" };
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock); //Verifica o seguidor
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock); //Verifica o seguido
        const result = await sut.follow(body);
        expect(result).toEqual({
            ok: false,
            code: 409,
            message: "You cannot follow yourself",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 500 quando ocorrer erro de Exceção", async () => {
        const sut = createSut();
        const body = { id: "id-seguidor", userId: "id-seguido" };
        prisma_mock_1.prismaMock.user.findUnique.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.follow(body);
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
    });
    it("Deve retornar status 201 quando o Follow for cadastrado do sistema", async () => {
        const sut = createSut();
        const body = { id: "id-seguidor", userId: "id-seguido" };
        const userMock = user_mock_1.UserMock.build({
            id: "id-seguidor",
        });
        const followMock = makeFollow({
            followedId: "id-seguido",
            followerId: "id-seguidor",
        });
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock); // Follower
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock); // Followed
        prisma_mock_1.prismaMock.follower.findUnique.mockResolvedValueOnce(null); // Não existe Follow
        prisma_mock_1.prismaMock.follower.create.mockResolvedValueOnce(followMock); // Cria o Follow
        const result = await sut.follow(body);
        expect(result).toEqual({
            ok: true,
            code: 201,
            message: "Successfully followed the user",
            data: followMock,
        });
    });
    it("Deve retornar status 200 quando o Follow existente for removido do sistema", async () => {
        const sut = createSut();
        const body = { id: "id-seguido", userId: "id-seguidor" };
        const userMock = user_mock_1.UserMock.build({
            id: "id-seguidor",
        });
        const followMock = makeFollow({
            followedId: "id-seguido",
            followerId: "id-seguidor",
        });
        //Encontra os usuários
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
        //Follow já existe
        prisma_mock_1.prismaMock.follower.findUnique.mockResolvedValueOnce(followMock);
        //Remove o Follow
        prisma_mock_1.prismaMock.follower.delete.mockResolvedValueOnce(followMock);
        const result = await sut.follow(body);
        expect(result).toEqual({
            ok: true,
            code: 200,
            message: "Successfully unfollowed the user",
            data: followMock,
        });
    });
});
