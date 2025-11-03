"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../../src/services/auth.service");
const express_server_1 = require("../../../src/express.server");
const crypto_1 = require("crypto");
const supertest_1 = __importDefault(require("supertest"));
const server = (0, express_server_1.createServer)();
const endpoint = "/signup";
describe("POST /signup", () => {
    const makeSignup = (params) => ({
        name: params?.name ?? "Novo Usuário",
        email: params?.email ?? "novo@email.com",
        username: params?.username ?? "novousuario",
        password: params?.password ?? "umaSenha",
    });
    //Required
    it("Deve retornar status 400 quando nome não for fornecido", async () => {
        const body = makeSignup({ name: "" });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Name is required"],
        });
    });
    it("Deve retornar status 400 quando email não for fornecido", async () => {
        const body = makeSignup({ email: "" });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Email is required"],
        });
    });
    it("Deve retornar status 400 quando senha não for fornecida", async () => {
        const body = makeSignup({ password: "" });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Password is required"],
        });
    });
    it("Deve retornar status 400 quando nome de usuário não for fornecido", async () => {
        const body = makeSignup({ username: "" });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Username is required"],
        });
    });
    //Types
    it("Deve retornar status 400 quando campos obrigatórios não forem String", async () => {
        const body = makeSignup({ name: 1234 });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Name must be a string"],
        });
    });
    //Length
    it("Deve retornar status 400 quando nome tiver menos de 3 caracteres", async () => {
        const body = makeSignup({ name: "No" });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Name must be at least 3 characters long"],
        });
    });
    it("Deve retornar status 400 quando nome de usuário tiver menos de 3 caracteres", async () => {
        const body = makeSignup({ username: "us" });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Username must be at least 3 characters long"],
        });
    });
    it("Deve retornar status 400 quando senha tiver menos de 4 caracteres", async () => {
        const body = makeSignup({ password: "uma" });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Password must be at least 4 characters long"],
        });
    });
    it("Deve retornar status 400 quando email não passar na validação de formato", async () => {
        const body = makeSignup({ email: "email@email" });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            ok: false,
            message: ["Invalid email"],
        });
    });
    it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
        const body = makeSignup();
        // Simulando um erro no controller
        jest.spyOn(auth_service_1.AuthService.prototype, "signup").mockImplementationOnce(() => {
            throw new Error("Exception");
        });
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            ok: false,
            message: "An unexpected error occurred: Exception",
        });
    });
    it("Deve retornar status 201 quando cadastro for completado", async () => {
        const body = makeSignup();
        const mockAuth = {
            ok: true,
            code: 201,
            message: "User created successfully",
            data: {
                id: (0, crypto_1.randomUUID)(),
                name: "Novo Usuário",
                email: "novo@email.com",
                username: "novousuario",
                createdAt: new Date(),
            },
        };
        jest.spyOn(auth_service_1.AuthService.prototype, "signup").mockResolvedValueOnce(mockAuth);
        const response = await (0, supertest_1.default)(server).post(endpoint).send(body);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            ok: true,
            message: "User created successfully",
            data: {
                id: expect.any(String),
                name: expect.any(String),
                email: expect.any(String),
                username: expect.any(String),
                createdAt: expect.any(String),
            },
        });
    });
});
