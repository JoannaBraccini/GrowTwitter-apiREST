"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const restrictActionsMiddleware_1 = require("./middlewares/restrictActionsMiddleware");
const createServer = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: "*" }));
    app.use(express_1.default.json());
    app.use(restrictActionsMiddleware_1.restrictActionsMiddleware);
    (0, routes_1.makeRoutes)(app);
    return app;
};
exports.createServer = createServer;
