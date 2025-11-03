"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMock = void 0;
const crypto_1 = require("crypto");
class UserMock {
    static build(params) {
        const user = {
            id: params?.id || (0, crypto_1.randomUUID)(),
            name: params?.name || "Usuario Teste",
            username: params?.username || "usertest",
            email: params?.email || "teste@email.com",
            password: params?.password || "umaSenha",
            bio: params?.bio || "Uma biografia",
            avatarUrl: params?.avatarUrl || "http://image.com/ex.svg",
            coverUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            verified: params?.verified || "NONE",
        };
        const followers = params?.followers || [];
        const following = params?.following || [];
        return {
            ...user,
            followers,
            following,
        };
    }
}
exports.UserMock = UserMock;
