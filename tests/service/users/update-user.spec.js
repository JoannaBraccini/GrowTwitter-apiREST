"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const user_service_1 = require("../../../src/services/user.service");
const prisma_mock_1 = require("../../config/prisma.mock");
const user_mock_1 = require("../mock/user.mock");
const bcrypt_1 = require("../../../src/utils/bcrypt");
describe("Update UserService", () => {
    const makeUpdate = (params) => ({
        id: params?.id || (0, crypto_1.randomUUID)(),
        userId: params?.userId || (0, crypto_1.randomUUID)(),
        name: params?.name || undefined,
        username: params?.username || undefined,
        oldPassword: params?.oldPassword || undefined,
        newPassword: params?.newPassword || undefined,
        avatarUrl: params?.avatarUrl || undefined,
        bio: params?.bio || undefined,
    });
    const createSut = () => new user_service_1.UserService();
    it("Deve retornar status 404 quando ID fornecido não existir no sistema", async () => {
        const sut = createSut();
        const body = makeUpdate({ userId: "usuario-id", id: "id-invalido" });
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(null);
        const result = await sut.update(body);
        expect(result).toEqual({
            ok: false,
            code: 404,
            message: "User not found",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 401 quando ID do usuário logado não for igual ao ID do usuário a ser atualizado", async () => {
        const sut = createSut();
        const userMock = user_mock_1.UserMock.build({ id: "outro-usuario" });
        const body = makeUpdate();
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
        const result = await sut.update(body);
        expect(result.code).toBe(401);
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("You are not authorized to modify this profile");
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 409 quando o username escolhido já existir no sistema", async () => {
        const sut = createSut();
        const userMock1 = user_mock_1.UserMock.build({
            id: "usuario-id",
            username: "username",
        });
        const userMock2 = user_mock_1.UserMock.build({
            id: "usuario2-id",
            username: "user_name",
        });
        const body = makeUpdate({
            userId: "usuario-id",
            id: "usuario-id",
            username: "user_name",
        });
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock1);
        prisma_mock_1.prismaMock.user.findFirst.mockResolvedValueOnce(userMock2);
        const result = await sut.update(body);
        expect(result).toEqual({
            ok: false,
            code: 409,
            message: "Username is already in use",
        });
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 400 quando a senha fornecida (oldPassword) estiver incorreta", async () => {
        const sut = createSut();
        const userMock = user_mock_1.UserMock.build({
            id: "usuario-id",
            password: "hashedPass",
        });
        const body = makeUpdate({
            userId: "usuario-id",
            id: "usuario-id",
            oldPassword: "senha-errada",
            newPassword: "nova-senha",
        });
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
        const bcrypt = jest
            .spyOn(bcrypt_1.Bcrypt.prototype, "verify")
            .mockResolvedValueOnce(false);
        const result = await sut.update(body);
        expect(result).toEqual({
            ok: false,
            code: 400,
            message: "Wrong password",
        });
        expect(result.data).toBeUndefined();
        expect(bcrypt).toHaveBeenCalledWith(body.oldPassword, userMock.password);
    });
    it("Deve retornar status 400 quando a senha fornecida (newPassword) for igual à senha cadastrada no sistema", async () => {
        const sut = createSut();
        const userMock = user_mock_1.UserMock.build({
            id: "usuario-id",
            password: "hashedPass",
        });
        const body = makeUpdate({
            userId: "usuario-id",
            id: "usuario-id",
            oldPassword: "senha-antiga",
            newPassword: "senha-antiga",
        });
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
        const bcryptOld = jest
            .spyOn(bcrypt_1.Bcrypt.prototype, "verify")
            .mockResolvedValueOnce(true); //senha antiga correta
        const bcryptNew = jest
            .spyOn(bcrypt_1.Bcrypt.prototype, "verify")
            .mockResolvedValueOnce(true); //senha nova igual à antiga
        const result = await sut.update(body);
        expect(result).toEqual({
            ok: false,
            code: 400,
            message: "New password must be different from the previous one",
        });
        expect(result.data).toBeUndefined();
        expect(bcryptOld).toHaveBeenCalledWith(body.oldPassword, userMock.password);
        expect(bcryptNew).toHaveBeenCalledWith(body.newPassword, userMock.password);
    });
    it("Deve retornar status 500 quando ocorrer erro de Exceção", async () => {
        const sut = createSut();
        const body = makeUpdate();
        prisma_mock_1.prismaMock.user.findUnique.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.update(body);
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
    });
    it("Deve retornar status 200 quando o usuário for atualizado no sistema", async () => {
        const sut = createSut();
        const userMock = user_mock_1.UserMock.build({
            id: "id-usuario",
            username: "usernameOld",
        });
        const body = makeUpdate({
            userId: "id-usuario",
            id: "id-usuario",
            username: "usernameNew",
        });
        prisma_mock_1.prismaMock.user.findUnique.mockResolvedValueOnce(userMock);
        prisma_mock_1.prismaMock.user.update.mockResolvedValueOnce(userMock);
        const result = await sut.update(body);
        expect(result).toEqual({
            ok: true,
            code: 200,
            message: "User profile updated successfully",
            data: expect.objectContaining({
                id: userMock.id,
                name: userMock.name,
                username: userMock.username,
                email: userMock.email,
            }),
        });
    });
});
