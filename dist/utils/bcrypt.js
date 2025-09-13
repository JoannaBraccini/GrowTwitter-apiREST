"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bcrypt = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class Bcrypt {
    async generateHash(password) {
        //criar um hash com o número de salt indicado no env
        const hash = await bcrypt_1.default.hash(password, Number(process.env.BCRYPT_SALT));
        return hash;
    }
    async verify(password, hash) {
        //verificar que a senha e o hash combinam
        const isValid = await bcrypt_1.default.compare(password, hash);
        return isValid;
    }
}
exports.Bcrypt = Bcrypt;
