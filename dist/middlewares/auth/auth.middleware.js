"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jwt_1 = require("../../utils/jwt");
class AuthMiddleware {
    static async validate(req, res, next) {
        //Busca o dado
        const authorization = req.headers.authorization;
        if (!authorization) {
            res.status(401).json({
                ok: false,
                message: "Unauthorized: Token is required",
            });
            return;
        }
        //Desestrutura o bearer token para usar somente o token
        // const [_, token] = authorization.split(" ");
        const token = authorization.split(" ")[1];
        if (!token || !authorization.startsWith("Bearer")) {
            res.status(401).json({
                ok: false,
                message: "Unauthorized: Invalid or missing token",
            });
            return;
        }
        const jwt = new jwt_1.JWT();
        const userDecoded = jwt.verifyToken(token);
        if (!userDecoded) {
            res.status(401).json({
                ok: false,
                message: "Unauthorized: Invalid or expired token",
            });
            return;
        }
        req.AuthUser = {
            id: userDecoded.id,
            name: userDecoded.name,
            username: userDecoded.username,
            email: userDecoded.email,
        };
        next();
    }
}
exports.AuthMiddleware = AuthMiddleware;
