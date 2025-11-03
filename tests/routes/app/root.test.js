"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_server_1 = require("../../../src/express.server");
const server = (0, express_server_1.createServer)();
describe("GET /", () => {
    it("Deve retornar status 200 e mensagem de boas-vindas", async () => {
        const response = await (0, supertest_1.default)(server).get("/");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            ok: true,
            message: "GrowTwitter API 💻🌍",
        });
    });
});
