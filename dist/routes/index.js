"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRoutes = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../docs/swagger.json"));
const auth_routes_1 = require("./auth.routes");
const user_routes_1 = require("./user.routes");
const tweet_routes_1 = require("./tweet.routes");
const makeRoutes = (app) => {
    app.get("/", (req, res) => {
        res.status(200).json({
            ok: true,
            message: "GrowTwitter API 💻🌍",
        });
    });
    app.use("/docs", swagger_ui_express_1.default.serve);
    app.get("/docs", swagger_ui_express_1.default.setup(swagger_json_1.default));
    app.use(auth_routes_1.AuthRoutes.execute());
    app.use(user_routes_1.UserRoutes.execute());
    app.use(tweet_routes_1.TweetRoutes.execute());
};
exports.makeRoutes = makeRoutes;
