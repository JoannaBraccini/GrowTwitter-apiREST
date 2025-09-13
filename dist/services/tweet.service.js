"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetService = void 0;
const prisma_database_1 = require("../database/prisma.database");
class TweetService {
    //CREATE
    async create(createTweet) {
        const { userId, parentId, tweetType, content, imageUrl } = createTweet;
        try {
            //Verificar se o tweet sendo respondido ou compartilhado existe no banco de dados
            if (parentId) {
                const parentTweet = await prisma_database_1.prisma.tweet.findUnique({
                    where: { id: parentId },
                });
                if (!parentTweet) {
                    return {
                        ok: false,
                        code: 404,
                        message: "Tweet not found",
                    };
                }
            }
            const tweetCreated = await prisma_database_1.prisma.tweet.create({
                data: { userId, parentId, tweetType, content, imageUrl },
            });
            return {
                ok: true,
                code: 201,
                message: "Tweet created successfully",
                data: {
                    id: tweetCreated.id,
                    userId: tweetCreated.userId,
                    parentId: tweetCreated.parentId,
                    tweetType: tweetCreated.tweetType,
                    content: tweetCreated.content,
                    imageUrl: tweetCreated.imageUrl,
                    createdAt: tweetCreated.createdAt,
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                code: 500,
                message: `Internal server error: ${error.message}`,
            };
        }
    }
    //FIND ALL - com paginação e search
    async findAll(query) {
        const tweets = await this.getTweetsPaginated({}, query); // Busca todos os tweets sem filtro de usuário logado
        return tweets;
    }
    //FIND FEED - com paginação e search
    async findFeed(userId, query) {
        //Filtra os usuários da lista de seguidos
        const following = await prisma_database_1.prisma.follower.findMany({
            where: { followerId: userId },
            select: { followedId: true },
        });
        //Mapeia os usuários da lista de seguidos
        const followingIds = following ? following.map((f) => f.followedId) : [];
        // Se o usuário não segue ninguém, garante que ele veja seus próprios tweets
        const idsToSearch = followingIds.length > 0 ? [...followingIds, userId] : [userId];
        // Busca os tweets onde o userId seja do usuário logado ou do usuário seguido
        return this.getTweetsPaginated({ userId: { in: idsToSearch } }, query);
    }
    //FIND ONE
    async findOne(id) {
        try {
            const tweet = await prisma_database_1.prisma.tweet.findUnique({
                where: { id },
                include: this.includeTweetRelations(), // Inclui todas as relações necessárias
            });
            if (!tweet) {
                return {
                    ok: false,
                    code: 404,
                    message: "Tweet not found",
                };
            }
            return {
                ok: true,
                code: 200,
                message: "Tweet details retrieved successfully",
                data: tweet, // Retorna o tweet diretamente
            };
        }
        catch (error) {
            return {
                ok: false,
                code: 500,
                message: `Internal server error: ${error.message}`,
            };
        }
    }
    //UPDATE
    async update({ tweetId, userId, content, imageUrl, }) {
        try {
            const tweet = await prisma_database_1.prisma.tweet.findUnique({ where: { id: tweetId } });
            if (!tweet) {
                return {
                    ok: false,
                    code: 404,
                    message: "Tweet not found",
                };
            }
            // Verifica se o tweet pertence ao usuário
            if (tweet.userId !== userId) {
                return {
                    ok: false,
                    code: 401,
                    message: "Not authorized to modify this tweet",
                };
            }
            let tweetToUpdate = { content, imageUrl };
            if (content)
                tweetToUpdate.content = content;
            if (imageUrl)
                tweetToUpdate.imageUrl = imageUrl;
            const tweetUpdated = await prisma_database_1.prisma.tweet.update({
                where: { id: tweetId },
                data: tweetToUpdate,
            });
            return {
                ok: true,
                code: 200,
                message: "Tweet content updated successfully",
                data: tweetUpdated,
            };
        }
        catch (error) {
            return {
                ok: false,
                code: 500,
                message: `Internal server error: ${error.message}`,
            };
        }
    }
    //DELETE
    async remove({ tweetId, userId, }) {
        try {
            const tweet = await prisma_database_1.prisma.tweet.findUnique({
                where: { id: tweetId },
                include: this.includeTweetRelations(),
            });
            if (!tweet) {
                return {
                    ok: false,
                    code: 404,
                    message: "Tweet not found",
                };
            }
            // Verifica se o tipo do tweet é válido
            if (tweet.tweetType !== "TWEET" && tweet.tweetType !== "REPLY") {
                return {
                    ok: false,
                    code: 400,
                    message: "Invalid tweet type for this operation",
                };
            }
            // Verifica se o tweet pertence ao usuário
            if (tweet.userId !== userId) {
                return {
                    ok: false,
                    code: 401,
                    message: "Not authorized to delete this tweet",
                };
            }
            // Mapeia os dados do tweet antes da exclusão
            const tweetToDelete = tweet;
            // Exclui os dependentes (like, retweet e reply)
            await prisma_database_1.prisma.like.deleteMany({ where: { tweetId: tweetId } });
            await prisma_database_1.prisma.retweet.deleteMany({ where: { tweetId: tweetId } });
            await prisma_database_1.prisma.tweet.deleteMany({ where: { parentId: tweetId } });
            // Exclui o tweet
            await prisma_database_1.prisma.tweet.delete({ where: { id: tweetId } });
            return {
                ok: true,
                code: 200,
                message: "Tweet removed successfully",
                data: tweetToDelete,
            };
        }
        catch (error) {
            return {
                ok: false,
                code: 500,
                message: `Internal server error: ${error.message}`,
            };
        }
    }
    //LIKE/UNLIKE
    async like({ tweetId, userId, }) {
        try {
            const tweet = await prisma_database_1.prisma.tweet.findUnique({ where: { id: tweetId } });
            if (!tweet) {
                return {
                    ok: false,
                    code: 404,
                    message: "Tweet not found",
                };
            }
            // Verificar se o usuário já curtiu
            const alreadyLiked = await prisma_database_1.prisma.like.findUnique({
                where: {
                    //constraint de chave composta
                    tweetId_userId: { tweetId, userId },
                },
            });
            //se já tiver curtido, deleta o like
            if (alreadyLiked) {
                // Se já curtiu, remove o like
                await prisma_database_1.prisma.like.delete({ where: { id: alreadyLiked.id } });
            }
            else {
                // Se ainda não curtiu, adiciona o like
                const newLike = await prisma_database_1.prisma.like.create({
                    data: { tweetId, userId },
                });
                return {
                    ok: true,
                    code: 201,
                    message: "Tweet liked successfully",
                    data: newLike, // Retorna o like adicionado
                };
            }
            return {
                ok: true,
                code: 200,
                message: "Like removed successfully",
                data: alreadyLiked, // Retorna o like removido
            };
        }
        catch (error) {
            return {
                ok: false,
                code: 500,
                message: `Internal server error: ${error.message}`,
            };
        }
    }
    //RETWEET/CANCEL RETWEET
    async retweet({ tweetId, comment, userId, }) {
        try {
            const tweet = await prisma_database_1.prisma.tweet.findUnique({ where: { id: tweetId } });
            if (!tweet) {
                return {
                    ok: false,
                    code: 404,
                    message: "Tweet not found",
                };
            }
            // Verificar se o usuário já retweetou
            const alreadyRetweeted = await prisma_database_1.prisma.retweet.findUnique({
                where: {
                    tweetId_userId: { tweetId, userId }, // constraint de chave composta
                },
            });
            if (alreadyRetweeted) {
                // Se já retweetou, remove apenas o registro de retweet
                // await prisma.retweet.delete({ where: { id: alreadyRetweeted.id } });
                return {
                    ok: true,
                    code: 200,
                    message: "Retweet removed successfully",
                    data: alreadyRetweeted, // Retorna o retweet removido
                };
            }
            else {
                // Se ainda não retweetou, cria o retweet
                const retweet = await prisma_database_1.prisma.retweet.create({
                    data: { userId, tweetId, comment },
                });
                return {
                    ok: true,
                    code: 201,
                    message: "Retweeted successfully",
                    data: retweet, // Retorna o retweet adicionado
                };
            }
        }
        catch (error) {
            return {
                ok: false,
                code: 500,
                message: `Internal server error: ${error.message}`,
            };
        }
    }
    //Métodos Privados
    //FIND PAGINATED
    async getTweetsPaginated(where, query) {
        const skip = query?.page && query?.take ? query.page * query.take : undefined;
        if (query?.search) {
            where.content = { contains: query.search, mode: "insensitive" };
        }
        try {
            const tweets = await prisma_database_1.prisma.tweet.findMany({
                skip,
                take: query?.take,
                where,
                orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
                include: this.includeTweetRelations(), // Inclui todas as relações necessárias
            });
            if (!tweets || tweets.length < 1) {
                return { ok: false, code: 404, message: "No tweets found" };
            }
            return {
                ok: true,
                code: 200,
                message: "Tweets retrieved successfully",
                data: tweets, // Retorna os tweets diretamente
            };
        }
        catch (error) {
            return {
                ok: false,
                code: 500,
                message: `Internal server error: ${error.message}`,
            };
        }
    }
    //FIND RELATED
    includeTweetRelations() {
        return {
            user: { select: { name: true, username: true } },
            likes: { select: { user: { select: { name: true, username: true } } } },
            retweets: {
                select: { user: { select: { name: true, username: true } } },
            },
            replies: {
                select: {
                    id: true,
                    userId: true,
                    tweetType: true,
                    content: true,
                    imageUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    likes: true,
                    retweets: true,
                    replies: true, // Inclui nested replies
                },
            },
        };
    }
}
exports.TweetService = TweetService;
