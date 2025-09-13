"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const auth_middleware_1 = require("../middlewares/auth/auth.middleware");
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const user_middleware_1 = require("../middlewares/user.middleware");
const validate_uuid_middleware_1 = require("../middlewares/validate-uuid.middleware");
class UserRoutes {
    static execute() {
        const router = (0, express_1.Router)();
        //FIND ALL USERS (with optional query)
        router.get("/users", user_controller_1.UserController.findMany);
        //FIND ONE USER (by id)
        router.get("/users/:id", [auth_middleware_1.AuthMiddleware.validate, validate_uuid_middleware_1.ValidateUuidMiddleware.validate], user_controller_1.UserController.findOne);
        //UPDATE USER (by id)
        router.put("/users/:id", [
            auth_middleware_1.AuthMiddleware.validate,
            validate_uuid_middleware_1.ValidateUuidMiddleware.validate,
            user_middleware_1.UserMiddleware.validateTypes,
            user_middleware_1.UserMiddleware.validateLength,
        ], user_controller_1.UserController.update);
        //DELETE USER (by id)
        router.delete("/users/:id", [auth_middleware_1.AuthMiddleware.validate, validate_uuid_middleware_1.ValidateUuidMiddleware.validate], user_controller_1.UserController.remove);
        //FOLLOW ACTIONS (by id)
        router.patch("/users/follow/:id", [auth_middleware_1.AuthMiddleware.validate, validate_uuid_middleware_1.ValidateUuidMiddleware.validate], user_controller_1.UserController.follow);
        return router;
    }
}
exports.UserRoutes = UserRoutes;
