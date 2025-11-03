"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeToken = makeToken;
const crypto_1 = require("crypto");
const jwt_1 = require("../../src/utils/jwt");
function makeToken(params) {
    const payload = {
        id: (0, crypto_1.randomUUID)(),
        name: params?.name || "Nome do Usuário",
        username: params?.username || "username",
        email: params?.email || "email@email.com",
    };
    const jwt = new jwt_1.JWT();
    const token = jwt.generateToken(payload);
    return token;
}
