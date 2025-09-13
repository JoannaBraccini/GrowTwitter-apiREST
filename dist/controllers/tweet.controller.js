"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetController = void 0;
const tweet_service_1 = require("../services/tweet.service");
class TweetController {
    static async create(req, res) {
        try {
            const { parentId, tweetType, content, imageUrl } = req.body;
            const { id: userId } = req.AuthUser;
            const data = {
                userId,
                parentId,
                tweetType,
                content,
                imageUrl,
            };
            const service = new tweet_service_1.TweetService();
            const result = await service.create(data);
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
    static async findAll(req, res) {
        try {
            const { page, take, search } = req.query;
            const service = new tweet_service_1.TweetService();
            const result = await service.findAll({
                page: page ? Number(page) - 1 : undefined,
                take: take ? Number(take) : undefined,
                search: search ? String(search) : undefined,
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
    static async findFeed(req, res) {
        try {
            const { page, take, search } = req.query;
            const { id: userId } = req.AuthUser;
            const service = new tweet_service_1.TweetService();
            const result = await service.findFeed(userId, {
                page: page ? Number(page) - 1 : undefined,
                take: take ? Number(take) : undefined,
                search: search ? String(search) : undefined,
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
    static async findOne(req, res) {
        try {
            const tweetId = req.params.id;
            const service = new tweet_service_1.TweetService();
            const result = await service.findOne(tweetId);
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
    static async update(req, res) {
        try {
            const tweetId = req.params.id;
            const { id: userId } = req.AuthUser;
            const { content, imageUrl } = req.body;
            const service = new tweet_service_1.TweetService();
            const result = await service.update({
                tweetId,
                userId,
                content,
                imageUrl,
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
    static async remove(req, res) {
        try {
            const tweetId = req.params.id;
            const { id: userId } = req.AuthUser;
            const service = new tweet_service_1.TweetService();
            const result = await service.remove({ tweetId, userId });
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
    static async like(req, res) {
        try {
            const { id: userId } = req.AuthUser;
            const tweetId = req.params.id;
            const service = new tweet_service_1.TweetService();
            const result = await service.like({ tweetId, userId });
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
    static async retweet(req, res) {
        try {
            const { id: userId } = req.AuthUser;
            const tweetId = req.params.id;
            const { comment } = req.body;
            const service = new tweet_service_1.TweetService();
            const result = await service.retweet({ tweetId, comment, userId });
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
exports.TweetController = TweetController;
