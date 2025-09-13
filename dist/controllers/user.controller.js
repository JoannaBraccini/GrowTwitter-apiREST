"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    //READ (many by query)
    static async findMany(req, res) {
        try {
            //recebe o query
            const search = typeof req.query.search === "string" ? req.query.search : undefined;
            //chama o service
            const service = new user_service_1.UserService();
            const result = await service.findMany(search);
            //responder o cliente
            const { code, ...response } = result;
            res.status(code).json(response);
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                message: `An unexpected error occurred: ${error.message}`,
            });
        }
    }
    //READ (one by id)
    static async findOne(req, res) {
        try {
            //recebe o id nos params
            const { id } = req.params;
            //chama o service
            const service = new user_service_1.UserService();
            //aguarda a resposta da busca
            const result = await service.findOne(id);
            //desestrutura a resposta
            const { code, ...response } = result;
            //retorna para o cliente
            res.status(code).json(response);
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                message: `An unexpected error occurred: ${error.message}`,
            });
        }
    }
    //UPDATE (id)
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { id: userId } = req.AuthUser; //criado no index.d.ts
            const { name, username, oldPassword, newPassword, bio, avatarUrl } = req.body;
            const service = new user_service_1.UserService();
            const result = await service.update({
                id,
                userId,
                name,
                username,
                oldPassword,
                newPassword,
                bio,
                avatarUrl,
            });
            const { code, ...response } = result;
            res.status(code).json(response);
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                message: `An unexpected error occurred: ${error.message}`,
            });
        }
    }
    //DELETE (id)
    static async remove(req, res) {
        try {
            const { id } = req.params;
            const { id: userId } = req.AuthUser;
            const service = new user_service_1.UserService();
            const result = await service.remove({ id, userId });
            const { code, ...response } = result;
            res.status(code).json(response);
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                message: `An unexpected error occurred: ${error.message}`,
            });
        }
    }
    //FOLLOW/UNFOLLOW (id)
    static async follow(req, res) {
        try {
            const { id: userId } = req.AuthUser;
            const { id } = req.params;
            const service = new user_service_1.UserService();
            const result = await service.follow({ userId, id });
            const { code, ...response } = result;
            res.status(code).json(response);
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                message: `An unexpected error occurred: ${error.message}`,
            });
        }
    }
}
exports.UserController = UserController;
