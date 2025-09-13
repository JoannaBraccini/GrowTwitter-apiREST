"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async signup(req, res) {
        try {
            //busca os dados na requisição
            const { name, email, password, username } = req.body;
            //cria o objeto que vai armazenar os dados
            const data = {
                name,
                email,
                password,
                username,
            };
            //chama o service
            const service = new auth_service_1.AuthService();
            //recebe a resposta
            const result = await service.signup(data);
            //desestrutura a resposta
            const { code, ...response } = result;
            //retorna para o cliente
            res.status(code).json(response);
            //em caso de erro de servidor cai no catch
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                message: `An unexpected error occurred: ${error.message}`,
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, username, password } = req.body;
            const service = new auth_service_1.AuthService();
            const result = await service.login({ email, username, password });
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
exports.AuthController = AuthController;
