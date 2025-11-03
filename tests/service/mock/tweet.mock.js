"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetMock = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
class TweetMock {
    static build(params) {
        return {
            id: params?.id || (0, crypto_1.randomUUID)(),
            userId: params?.userId || (0, crypto_1.randomUUID)(),
            tweetType: params?.tweetType || client_1.TweetType.TWEET,
            parentId: params?.parentId || null,
            content: params?.content || "Texto do Tweet",
            imageUrl: params?.imageUrl || "http://image.com/ex.svg",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
exports.TweetMock = TweetMock;
