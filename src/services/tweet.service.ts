import { Tweet } from "@prisma/client";
import { prisma } from "../database/prisma.database";
import { ActionsDto, CreateTweetDto, TweetDto } from "../dtos";
import { ResponseApi } from "../types/response";

export class TweetService {
  //CREATE
  public async create(createTweet: CreateTweetDto): Promise<ResponseApi> {
    const { userId, parentId, type, content } = createTweet;

    //Verificar se o tweet sendo respondido ou compartilhado existe no banco de dados
    if (parentId) {
      const parentTweet = await this.getTweetById(parentId);

      if (!parentTweet) {
        return {
          ok: false,
          code: 404,
          message: "Tweet not found!",
        };
      }
    }

    const tweetCreated = await prisma.tweet.create({
      data: { userId, parentId, type, content },
    });

    return {
      ok: true,
      code: 201,
      message: "Tweet created successfully!",
      data: tweetCreated,
    };
  }

  //FIND ALL - com paginação e search
  public async findAll(
    userId?: string,
    query?: {
      page?: number;
      take?: number;
      search?: string;
    }
  ): Promise<ResponseApi> {
    const skip =
      query?.page && query?.take ? query.page * query.take : undefined;

    let where: any = {};

    if (query?.search) {
      //Validação para feed de usuários seguidos
      if (userId && query.search === "following") {
        const following = await prisma.follower.findMany({
          //Filtra os usuários da lista de seguidos
          where: { followerId: userId },
          select: { followedId: true },
        });
        //Mapeia os usuários da lista de seguidos
        const followingIds = following.map((f) => f.followedId);
        where.userId = { in: followingIds };
        //Busca comum
      } else {
        where.content = { contains: query.search, mode: "insensitive" };
      }
    }

    const tweets = await prisma.tweet.findMany({
      skip,
      take: query?.take,
      where,
      orderBy: { createdAt: "desc", updatedAt: "desc" }, // Mostrar os mais recentes primeiro
      include: this.includeTweetRelations(),
    });

    if (tweets.length === 0) {
      return {
        ok: false,
        code: 404,
        message: "No tweets found",
      };
    }

    const tweetDtos = await Promise.all(
      tweets.map((tweet) => this.mapToDto(tweet))
    );

    return {
      ok: true,
      code: 200,
      message: "Tweets retrieved successfully",
      data: tweetDtos,
    };
  }

  //FIND ONE
  public async findOne(id: string): Promise<ResponseApi> {
    const tweet = await prisma.tweet.findUnique({
      where: { id },
      include: this.includeTweetRelations(),
    });

    if (!tweet) {
      return {
        ok: false,
        code: 404,
        message: "Tweet not found.",
      };
    }

    return {
      ok: true,
      code: 200,
      message: "Tweet details retrieved successfully.",
      data: this.mapToFullDto(tweet), // Mapeia detalhes
    };
  }

  //UPDATE
  public async update(
    tweetId: string,
    userId: string,
    content: string
  ): Promise<ResponseApi> {
    const tweet = await this.getTweetById(tweetId);

    if (!tweet) {
      return {
        ok: false,
        code: 404,
        message: "Tweet not found.",
      };
    }

    // Verifica se o tweet pertence ao usuário
    if (tweet.userId !== userId) {
      return {
        ok: false,
        code: 403,
        message: "Not authorized to modify this tweet!",
      };
    }

    const tweetUpdated = await prisma.tweet.update({
      where: { id: tweetId },
      data: { content: content },
    });

    return {
      ok: true,
      code: 200,
      message: "Tweet content updated successfully!",
      data: await this.mapToDto(tweetUpdated),
    };
  }

  //DELETE
  public async remove(tweetId: string, userId: string): Promise<ResponseApi> {
    const tweet = await prisma.tweet.findUnique({
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

    // Verifica se o tweet pertence ao usuário
    if (tweet.userId !== userId) {
      return {
        ok: false,
        code: 404,
        message: "Not authorized to delete this tweet!",
      };
    }

    // Mapeia os dados do tweet antes da exclusão
    const tweetToDelete = await this.mapToDto(tweet);
    //Exclui os dependentes (like, retweet e reply)
    await prisma.like.deleteMany({ where: { tweetId: tweetId } });
    await prisma.retweet.deleteMany({ where: { tweetId: tweetId } });
    await prisma.tweet.deleteMany({ where: { parentId: tweetId } });
    //Exclui o tweet
    await prisma.tweet.delete({ where: { id: tweetId } });

    return {
      ok: true,
      code: 200,
      message: "Tweet removed successfully",
      data: tweetToDelete,
    };
  }

  //LIKE/UNLIKE
  public async like(tweetId: string, userId: string): Promise<ResponseApi> {
    const tweet = await this.getTweetById(tweetId);

    if (!tweet) {
      return {
        ok: false,
        code: 404,
        message: "Tweet not found",
      };
    }

    // Verificar se o usuário já curtiu
    const alreadyLiked = await prisma.like.findUnique({
      where: {
        //constraint de chave composta
        tweetId_userId: { tweetId, userId },
      },
    });
    //se já tiver curtido, deleta o like
    if (alreadyLiked) {
      await prisma.like.delete({ where: { id: alreadyLiked.id } });
      return { ok: true, code: 200, message: "Like removed successfully" };
    } else {
      // Criar o like caso não exista
      const like = await prisma.like.create({
        data: { tweetId, userId },
      });
      return {
        ok: true,
        code: 200,
        message: "Tweet liked successfully",
        data: like,
      };
    }
  }

  //RETWEET/CANCEL RETWEET
  public async retweet(tweetId: string, userId: string): Promise<ResponseApi> {
    const tweet = await this.getTweetById(tweetId);

    if (!tweet) {
      return {
        ok: false,
        code: 404,
        message: "Tweet not found",
      };
    }

    // Verificar se o usuário já retweetou
    const alreadyRetweeted = await prisma.retweet.findUnique({
      where: {
        //constraint de chave composta
        tweetId_userId: { tweetId, userId },
      },
    });

    //se já tiver retweetado, deleta o retweet
    if (alreadyRetweeted) {
      await prisma.retweet.delete({
        where: { id: alreadyRetweeted.id },
      });
      return {
        ok: true,
        code: 200,
        message: "Retweet removed successfully",
      };
    } else {
      // Cria o retweet caso não exista
      const retweet = await prisma.retweet.create({
        data: { userId, tweetId },
      });

      return {
        ok: true,
        code: 201,
        message: "Retweeted successfully",
        data: retweet,
      };
    }
  }

  //Métodos Privados
  //FIND UNIQUE
  private async getTweetById(tweetId: string) {
    return await prisma.tweet.findUnique({ where: { id: tweetId } });
  }

  //FIND RELATED
  private includeTweetRelations() {
    return {
      user: { select: { name: true, username: true } },
      likes: { select: { user: { select: { name: true, username: true } } } },
      retweets: {
        select: { user: { select: { name: true, username: true } } },
      },
      replies: { select: { user: { select: { name: true, username: true } } } },
    };
  }

  //MAP To DTO
  private async mapToDto(
    tweet: Tweet & { user?: { name: string; username: string } }
  ): Promise<TweetDto> {
    const [likesCount, retweetsCount, repliesCount] = await Promise.all([
      prisma.like.count({ where: { tweetId: tweet.id } }),
      prisma.retweet.count({ where: { tweetId: tweet.id } }),
      prisma.tweet.count({ where: { parentId: tweet.id } }),
    ]);
    return {
      id: tweet.id,
      userId: tweet.userId,
      user: tweet.user
        ? {
            name: tweet.user.name,
            username: tweet.user.username,
          }
        : undefined,
      type: tweet.type,
      parentId: tweet.parentId === null ? undefined : tweet.parentId,
      content: tweet.content,
      createdAt: tweet.createdAt,
      updatedAt: tweet.updatedAt,
      likesCount: likesCount > 0 ? likesCount : undefined,
      retweetsCount: retweetsCount > 0 ? retweetsCount : undefined,
      repliesCount: repliesCount > 0 ? repliesCount : undefined,
    };
  }

  // Mapeamento para TweetDto completo
  private mapToFullDto(tweet: any): TweetDto {
    return {
      id: tweet.id,
      userId: tweet.userId,
      type: tweet.type,
      parentId: tweet.parentId,
      content: tweet.content,
      createdAt: tweet.createdAt,
      updatedAt: tweet.updatedAt,
      user: {
        name: tweet.user.name,
        username: tweet.user.username,
      },
      likesCount: tweet.likes?.length || 0,
      retweetsCount: tweet.retweets?.length || 0,
      repliesCount: tweet.replies?.length || 0,
      likes: tweet.likes?.map((like: ActionsDto) => ({
        id: like.id,
        userId: like.userId,
        user: {
          name: like.user.name,
          username: like.user.username,
        },
      })),
      retweets: tweet.retweets?.map((retweet: ActionsDto) => ({
        id: retweet.id,
        userId: retweet.userId,
        user: {
          name: retweet.user.name,
          username: retweet.user.username,
        },
      })),
      replies: tweet.replies?.map((reply: TweetDto) => ({
        id: reply.id,
        userId: reply.userId,
        user: {
          name: reply.user?.name ?? "",
          username: reply.user?.username ?? "",
        },
        type: reply.type,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        likesCount: reply.likes?.length || 0,
        retweetsCount: reply.retweets?.length || 0,
        repliesCount: reply.replies?.length || 0,
        likes: reply.likes?.map((like: ActionsDto) => ({
          id: like.id,
          userId: like.userId,
          user: {
            name: like.user.name,
            username: like.user.username,
          },
        })),
        retweets: reply.retweets?.map((retweet: ActionsDto) => ({
          id: retweet.id,
          userId: retweet.userId,
          user: {
            name: retweet.user.name,
            username: retweet.user.username,
          },
        })),
        replies: reply.replies?.map((reply: TweetDto) => ({
          id: reply.id,
          userId: reply.userId,
          user: {
            name: reply.user?.name ?? "",
            username: reply.user?.username ?? "",
          },
          type: reply.type,
          content: reply.content,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
        })),
      })),
    };
  }
}
