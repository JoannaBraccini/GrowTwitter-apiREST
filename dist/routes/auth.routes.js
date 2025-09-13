"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth/auth.middleware");
const login_middleware_1 = require("../middlewares/auth/login.middleware");
const express_1 = require("express");
const signup_midleware_1 = require("../middlewares/auth/signup.midleware");
const user_middleware_1 = require("../middlewares/user.middleware");
class AuthRoutes {
    static execute() {
        const router = (0, express_1.Router)();
        router.post("/signup", [
            signup_midleware_1.SignupMiddleware.validateRequired,
            user_middleware_1.UserMiddleware.validateTypes,
            user_middleware_1.UserMiddleware.validateLength,
        ], auth_controller_1.AuthController.signup);
        router.post("/login", [login_middleware_1.LoginMiddleware.validateRequired, user_middleware_1.UserMiddleware.validateTypes], auth_controller_1.AuthController.login);
        router.get("/validate", auth_middleware_1.AuthMiddleware.validate, (req, res) => {
            res.status(200).json({
                ok: true,
            });
        });
        return router;
    }
}
exports.AuthRoutes = AuthRoutes;
