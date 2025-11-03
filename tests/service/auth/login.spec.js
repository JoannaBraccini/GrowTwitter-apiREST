"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../../src/services/auth.service");
const bcrypt_1 = require("../../../src/utils/bcrypt");
const jwt_1 = require("../../../src/utils/jwt");
const prisma_mock_1 = require("../../config/prisma.mock");
const user_mock_1 = require("../mock/user.mock");
describe("Login AuthService", () => {
    const createSut = () => new auth_service_1.AuthService();
    it("Deve retornar status 401 quando o dado (email ou username) fornecido não existir no sistema", async () => {
        const sut = createSut();
        const body = {
            email: "invalid@email.com",
            password: "senhaCorreta",
        };
        prisma_mock_1.prismaMock.user.findFirst.mockResolvedValueOnce(null);
        const result = await sut.login(body);
        expect(result.code).toBe(401);
        expect(result.ok).toBeFalsy();
        expect(result.message).toBeDefined();
        expect(result.message).toMatch("Invalid credentials");
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 401 quando a senha informada estiver incorreta", async () => {
        const sut = createSut();
        const body = {
            username: "username",
            password: "senhaErrada",
        };
        const userMock = user_mock_1.UserMock.build({
            username: "username",
            password: "senhaCorreta",
        });
        prisma_mock_1.prismaMock.user.findFirst.mockResolvedValueOnce(userMock);
        const bcrypt = jest
            .spyOn(bcrypt_1.Bcrypt.prototype, "verify")
            .mockResolvedValueOnce(false);
        const result = await sut.login(body);
        expect(bcrypt).toHaveBeenCalledTimes(1);
        expect(result.code).toBe(401);
        expect(result.ok).toBeFalsy();
        expect(result.message).toMatch("Invalid credentials");
        expect(result.data).toBeUndefined();
    });
    it("Deve retornar status 500 quando ocorrer um erro de exceção", async () => {
        const sut = createSut();
        const body = {
            username: "username",
            password: "senhaCorreta",
        };
        prisma_mock_1.prismaMock.user.findFirst.mockRejectedValueOnce(new Error("Exception"));
        const result = await sut.login(body);
        expect(result).toEqual({
            ok: false,
            code: 500,
            message: "Internal server error: Exception",
        });
    });
    it("Deve retornar status 200 quando o usuário entrar no sistema", async () => {
        const sut = createSut();
        const body = {
            username: "username",
            password: "umaSenha",
        };
        const userMock = user_mock_1.UserMock.build({
            username: "username",
            password: "senhaCritpografada",
        });
        prisma_mock_1.prismaMock.user.findFirst.mockResolvedValueOnce(userMock);
        const bcrypt = jest
            .spyOn(bcrypt_1.Bcrypt.prototype, "verify")
            .mockResolvedValueOnce(true);
        const jwt = jest
            .spyOn(jwt_1.JWT.prototype, "generateToken")
            .mockReturnValueOnce("token_valido");
        const result = await sut.login(body);
        expect(bcrypt).toHaveBeenCalledTimes(2);
        expect(jwt).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            ok: true,
            code: 200,
            message: "Successfully logged in",
            data: {
                token: expect.any(String),
                user: {
                    id: userMock.id,
                    name: userMock.name,
                    username: userMock.username,
                    email: userMock.email,
                    avatarUrl: userMock.avatarUrl,
                },
            },
        });
    });
});
