"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetRoutes = void 0;
const auth_middleware_1 = require("../middlewares/auth/auth.middleware");
const express_1 = require("express");
const tweet_controller_1 = require("../controllers/tweet.controller");
const tweet_middleware_1 = require("../middlewares/tweet.middleware");
const validate_uuid_middleware_1 = require("../middlewares/validate-uuid.middleware");
class TweetRoutes {
    static execute() {
        const router = (0, express_1.Router)();
        //CREATE TWEET/REPLY
        router.post("/tweets", [
            auth_middleware_1.AuthMiddleware.validate,
            tweet_middleware_1.TweetMiddleware.validateRequired,
            tweet_middleware_1.TweetMiddleware.validateTypes,
            tweet_middleware_1.TweetMiddleware.validateLength,
        ], tweet_controller_1.TweetController.create);
        //FIND ALL TWEETS (with optional content search)
        router.get("/tweets", tweet_controller_1.TweetController.findAll); //sem validação de token para visualizar
        //FEED (tweet do usuário e usuários seguidos)
        router.get("/tweets/feed", auth_middleware_1.AuthMiddleware.validate, tweet_controller_1.TweetController.findFeed);
        //FIND ONE TWEET (by id)
        router.get("/tweets/:id", [auth_middleware_1.AuthMiddleware.validate, validate_uuid_middleware_1.ValidateUuidMiddleware.validate], tweet_controller_1.TweetController.findOne);
        //UPDATE TWEET (by id)
        router.put("/tweets/:id", [
            auth_middleware_1.AuthMiddleware.validate,
            validate_uuid_middleware_1.ValidateUuidMiddleware.validate,
            tweet_middleware_1.TweetMiddleware.validateTypes,
            tweet_middleware_1.TweetMiddleware.validateLength,
        ], tweet_controller_1.TweetController.update);
        //DELETE TWEET (by id)
        router.delete("/tweets/:id", [auth_middleware_1.AuthMiddleware.validate, validate_uuid_middleware_1.ValidateUuidMiddleware.validate], tweet_controller_1.TweetController.remove);
        //LIKE ACTIONS TWEET (by id)
        router.patch("/tweets/like/:id", [auth_middleware_1.AuthMiddleware.validate, validate_uuid_middleware_1.ValidateUuidMiddleware.validate], tweet_controller_1.TweetController.like);
        //RETWEET ACTIONS (by id)
        router.patch("/tweets/retweet/:id", [auth_middleware_1.AuthMiddleware.validate, validate_uuid_middleware_1.ValidateUuidMiddleware.validate], tweet_controller_1.TweetController.retweet);
        return router;
    }
}
exports.TweetRoutes = TweetRoutes;
