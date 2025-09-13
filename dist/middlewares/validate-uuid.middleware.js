"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateUuidMiddleware = void 0;
class ValidateUuidMiddleware {
    static validate(req, res, next) {
        const { id } = req.params;
        const { parentId, userId } = req.body;
        const regexUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!regexUuid.test(id)) {
            res.status(400).json({
                ok: false,
                message: "Identifier must be a UUID",
            });
            return;
        }
        // Validação do parentId no corpo da requisição
        if (parentId && !regexUuid.test(parentId)) {
            res.status(400).json({
                ok: false,
                message: "Parent-Tweet ID must be a UUID",
            });
            return;
        }
        if (userId && !regexUuid.test(userId)) {
            res.status(400).json({
                ok: false,
                message: "Identifier must be a UUID",
            });
            return;
        }
        next();
    }
}
exports.ValidateUuidMiddleware = ValidateUuidMiddleware;
