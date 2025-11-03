"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_server_1 = require("../../../src/express.server");
const make_token_1 = require("../make-token");
const server = (0, express_server_1.createServer)();
const endpoint = "/validate";
describe("GET /validate", () => {
    it("Deve retornar status 401 quando token não for informado", async () => {
        const response = await (0, supertest_1.default)(server).get(endpoint);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Token is required",
        });
    });
    it("Deve retornar status 401 quando for informado token de formato inválido", async () => {
        const response = await (0, supertest_1.default)(server)
            .get(endpoint)
            .set("Authorization", "invalid_token");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Invalid or missing token",
        });
    });
    it("Deve retornar status 401 quando for informado token inválido ou expirado", async () => {
        const response = await (0, supertest_1.default)(server)
            .get(endpoint)
            .set("Authorization", "Bearer invalidToken");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            ok: false,
            message: "Unauthorized: Invalid or expired token",
        });
    });
    it("Deve retornar status 200 quando token válido for informado", async () => {
        const token = (0, make_token_1.makeToken)();
        const response = await (0, supertest_1.default)(server)
            .get(endpoint)
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            ok: true,
        });
    });
});
