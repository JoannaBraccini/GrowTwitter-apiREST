"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginMiddleware = void 0;
class LoginMiddleware {
    static validateRequired(req, res, next) {
        const { email, username, password } = req.body;
        if (!email && !username) {
            res.status(400).json({
                ok: false,
                message: "Email or username are required",
            });
            return;
        }
        if (!password) {
            res.status(400).json({
                ok: false,
                message: "Password is required",
            });
            return;
        }
        next();
    }
}
exports.LoginMiddleware = LoginMiddleware;
