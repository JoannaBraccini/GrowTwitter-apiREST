"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetMiddleware = void 0;
class TweetMiddleware {
    static validateRequired(req, res, next) {
        const { tweetType, parentId, content, imageUrl } = req.body;
        const errors = [];
        if (tweetType === "REPLY" && !parentId) {
            errors.push("Parent Tweet ID is required for REPLY");
        }
        if (parentId && tweetType !== "REPLY") {
            errors.push("Parent Tweed ID is only valid for RETWEET or REPLY");
        }
        if (!tweetType) {
            errors.push("Tweet type is required");
        }
        if (!content && !imageUrl) {
            errors.push("Text or image is required for content");
        }
        if ((content && typeof content === "string" && content.trim().length === 0) ||
            (imageUrl && typeof content === "string" && content.trim().length === 0)) {
            errors.push("Text or image is required for content");
        }
        if (errors.length > 0) {
            res.status(400).json({
                ok: false,
                message: errors,
            });
            return;
        }
        next();
    }
    static validateTypes(req, res, next) {
        const { tweetType, content, imageUrl, comment } = req.body;
        const { page, take, search } = req.query;
        const errors = [];
        if (tweetType && tweetType !== "TWEET" && tweetType !== "REPLY") {
            errors.push("Tweet type must be TWEET, REPLY");
        }
        if (content && typeof content !== "string") {
            errors.push("Text must be a string");
        }
        if (imageUrl && typeof imageUrl !== "string") {
            errors.push("Image link must be a string");
        }
        if (imageUrl && typeof imageUrl === "string") {
            const imageUrlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?\.(jpg|jpeg|png|gif|webp|svg)$/i;
            if (imageUrl && !imageUrlRegex.test(imageUrl)) {
                errors.push("Image URL must be a valid image link");
            }
        }
        if (comment && typeof comment !== "string") {
            errors.push("Comment must be a string");
        }
        if (page && typeof page !== "number") {
            errors.push("Page must be a number");
        }
        if (take && typeof take !== "number") {
            errors.push("Take must be a number");
        }
        if (search && typeof search !== "string") {
            errors.push("Search term must be a string");
        }
        if (errors.length > 0) {
            res.status(400).json({
                ok: false,
                message: errors,
            });
            return;
        }
        next();
    }
    static validateLength(req, res, next) {
        const { content, comment } = req.body;
        if (content.length > 280) {
            res.status(400).json({
                ok: false,
                message: "Text content exceeds the maximum allowed length of 280 characters",
            });
            return;
        }
        if (comment && comment.length > 140) {
            res.status(400).json({
                ok: false,
                message: "Comment exceeds the maximum allowed length of 280 characters",
            });
            return;
        }
        next();
    }
}
exports.TweetMiddleware = TweetMiddleware;
