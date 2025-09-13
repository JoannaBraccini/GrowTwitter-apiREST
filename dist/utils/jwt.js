"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
class JWT {
    generateToken(data) {
        if (!process.env.JWT_SECRET)
            throw new Error("Secret not defined");
        const token = jsonwebtoken_1.default.sign(data, process.env.JWT_SECRET, {
            algorithm: "HS256",
            expiresIn: process.env.JWT_EXPIRES_IN
        });
        return token;
    }
    verifyToken(token) {
        try {
            if (!process.env.JWT_SECRET)
                throw new Error("Secret not defined");
            const data = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            return data;
        }
        catch {
            return null;
        }
    }
}
exports.JWT = JWT;
