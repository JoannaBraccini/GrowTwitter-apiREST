"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_mock_1 = require("../mock/user.mock");
const user_service_1 = require("../../../src/services/user.service");
const prisma_mock_1 = require("../../config/prisma.mock");
describe("Find One UsertService", () => {
    const createSut = () => new user_service_1.UserService();
    it("Deve retornar status 404 quando o ID fornecido não existir no sistema", async () => {
        const sut = createSut();
        const prisma = prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(null);
        const result = await sut.findOne("id-invalido");
        expect(result).toEqual({
            ok: false,
            code: 404,
            message: "User not found",
        });
        expect(prisma).toHaveBeenCalled();
    });
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const sut = createSut();
        prisma_mock_1.prismaMock.user.findUnique.mockRejectedValueOnce(new Error("Exception"));
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
        const userMock = user_mock_1.UserMock.build({ id: "id-valido" });
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
        const result = await sut.findOne("id-valido");
        expect(result.code).toBe(200);
        expect(result.ok).toBeTruthy();
        expect(result.message).toMatch("User details retrieved successfully");
        expect(result.data).toEqual({
            id: "id-valido",
            name: expect.any(String),
            username: expect.any(String),
            avatarUrl: expect.any(String),
            bio: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            verified: expect.any(String),
            followers: [],
            following: [],
        });
    });
});
