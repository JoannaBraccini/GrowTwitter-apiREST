"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictActionsMiddleware = restrictActionsMiddleware;
function restrictActionsMiddleware(req, res, next) {
    const test = process.env.NODE_ENV === "test";
    if (test) {
        if (req.method !== "GET" && !req.path.includes("/login")) {
            res.status(403).json({
                ok: false,
                code: 403,
                message: "Ações sensíveis estão desabilitadas no ambiente de teste.",
            });
            return;
        }
    }
    next();
}
