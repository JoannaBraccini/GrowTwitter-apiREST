"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../../src/services/auth.service");
const bcrypt_1 = require("../../../src/utils/bcrypt");
const user_mock_1 = require("../mock/user.mock");
const prisma_mock_1 = require("../../config/prisma.mock");
describe("Signup AuthService", () => {
    const makeSignup = (params) => ({
        name: params?.name || "Novo Usuário",
        email: params?.email || "novo@email.com",
        username: params?.username || "novousuario",
        password: params?.password || "umaSenha",
    });
    const createSut = () => new auth_service_1.AuthService();
    it("Deve retornar status 409 quando email já existir no sistema", async () => {
        const sut = createSut();
        const body = makeSignup({ email: "teste@email.com" });
        const userMock = user_mock_1.UserMock.build({ email: "teste@email.com" });
        prisma_mock_1.prismaMock.user.findFirst.mockResolvedValueOnce(userMock);
        const result = await sut.signup(body);
        expect(result.code).toBe(409);
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("Email is already in use");
        expect(result.data).toBeUndefined;
        expect(result).not.toBeNull();
    });
    it("Deve retornar status 409 quando username já existir no sistema", async () => {
        const sut = createSut();
        const body = makeSignup({ username: "usertest" });
        const userMock = user_mock_1.UserMock.build({ username: "usertest" });
        prisma_mock_1.prismaMock.user.findFirst.mockResolvedValueOnce(userMock);
        const result = await sut.signup(body);
        expect(result.code).toBe(409);
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("Username is already in use");
        expect(result.data).toBeUndefined;
        expect(result).not.toBeNull();
    });
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const sut = createSut();
        const body = makeSignup();
        prisma_mock_1.prismaMock.user.findFirst.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.signup(body);
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
    });
    it("Deve retornar status 201 quando usuário for cadastrado no sistema", async () => {
        const sut = createSut();
        const body = makeSignup();
        prisma_mock_1.prismaMock.user.findFirst.mockResolvedValueOnce(null);
        const bcrypt = jest
            .spyOn(bcrypt_1.Bcrypt.prototype, "generateHash")
            .mockResolvedValueOnce("senha_criptografada");
        prisma_mock_1.prismaMock.user.create.mockResolvedValueOnce({
            ...body,
            id: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            password: "senha_criptografada",
            avatarUrl: null,
            bio: null,
            coverUrl: null,
            verified: "NONE",
        });
        const result = await sut.signup(body);
        expect(bcrypt).toHaveBeenCalledWith(body.password);
        expect(result).toEqual({
            ok: true,
            code: 201,
            message: "User created successfully",
            data: {
                id: expect.any(String),
                name: body.name,
                email: body.email,
                username: body.username,
                createdAt: expect.any(Date),
            },
        });
    });
});
