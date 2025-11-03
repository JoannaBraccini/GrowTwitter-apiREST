"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = require("../../../src/services/user.service");
const prisma_mock_1 = require("../../config/prisma.mock");
const user_mock_1 = require("../mock/user.mock");
describe("Remove UserService", () => {
    const createSut = () => new user_service_1.UserService();
    it("Deve retornar status 404 quando ID fornecido não existir no sistema", async () => {
        const sut = createSut();
        const body = { id: "id-invalido", userId: "id-usuario" };
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(null);
        const result = await sut.remove(body);
        expect(result).toEqual({
            ok: false,
            code: 404,
            message: "User not found",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 401 quando ID do usuário autenticado não for igual ao ID do usuário a ser removido", async () => {
        const sut = createSut();
        const body = { id: "id-logado", userId: "id-a-remover" };
        const userMock = user_mock_1.UserMock.build({ id: "outro-usuario" });
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
        const result = await sut.remove(body);
        expect(result.code).toBe(401);
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("You are not authorized to delete this profile");
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 500 quando ocorrer erro de Exceção", async () => {
        const sut = createSut();
        const body = { id: "id-usuario", userId: "id-usuario" };
        prisma_mock_1.prismaMock.user.findUnique.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.remove(body);
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
    });
    it("Deve retornar status 200 quando o usuário for removido do sistema", async () => {
        const sut = createSut();
        const body = { id: "id-usuario", userId: "id-usuario" };
        const userMock = user_mock_1.UserMock.build({
            id: "id-usuario",
        });
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
        prisma_mock_1.prismaMock.user.delete.mockResolvedValueOnce(userMock);
        const result = await sut.remove(body);
        expect(result).toEqual({
            ok: true,
            code: 200,
            message: "User removed successfully",
            data: expect.objectContaining({
                id: "id-usuario",
                name: expect.any(String),
                username: expect.any(String),
            }),
        });
    });
});
