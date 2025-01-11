import { Tweet, TweetType } from "@prisma/client";
import { prisma } from "../database/prisma.database";
import { CreateTweetDto, TweetDto } from "../dtos";
import { ResponseApi } from "../types/response";
import { AuthUser } from "../types/user";

export class TweetService {
  //CREATE
  public async create(createTweet: CreateTweetDto): Promise<ResponseApi> {
    const { userId, parentId, type, content } = createTweet;

    //Verificar se o tweet sendo respondido ou compartilhado existe no banco de dados
    if (parentId) {
      const parentTweet = await prisma.tweet.findUnique({
        where: { id: parentId },
      });

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
      orderBy: { createdAt: "desc" }, // Mostrar os mais recentes primeiro
      include: {
        user: {
          select: { name: true, username: true },
        },
        likes: {
          select: { user: { select: { name: true, username: true } } },
        },
        retweets: {
          select: { user: { select: { name: true, username: true } } },
        },
        replies: {
          select: { user: { select: { name: true, username: true } } },
        },
      },
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
      include: {
        user: {
          select: { name: true, username: true },
        },
        likes: {
          include: {
            user: {
              select: { name: true, username: true },
            },
          },
        },
        retweets: {
          include: {
            user: {
              select: { name: true, username: true },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: { name: true, username: true },
            },
          },
        },
      },
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
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
    });

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
      data: {
        id: tweetUpdated.id,
        type: tweetUpdated.type,
        content: tweetUpdated.content,
        createdAt: tweetUpdated.createdAt,
        updatedAt: tweetUpdated.updatedAt,
      },
    };
  }

  //DELETE
  public async remove(tweetId: string, userId: string): Promise<ResponseApi> {
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
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
    //exclui
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
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
    });

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
        tweetId_userId: {
          tweetId: tweetId,
          userId: userId,
        },
      },
    });
    //se já tiver curtido, deleta o like
    if (alreadyLiked) {
      await prisma.like.delete({
        where: { id: alreadyLiked.id },
      });
      return {
        ok: true,
        code: 200,
        message: "Like removed successfully",
      };
    } else {
      // Criar o like caso não exista
      const like = await prisma.like.create({
        data: {
          tweetId: tweetId,
          userId: userId,
        },
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
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
    });

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
        tweetId_userId: {
          tweetId: tweetId,
          userId: userId,
        },
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
        data: {
          userId: userId,
          tweetId: tweetId,
        },
      });

      return {
        ok: true,
        code: 201,
        message: "Retweeted successfully",
        data: retweet,
      };
    }
  }

  //MAP To DTO
  private async mapToDto(
    tweet: Tweet & { user: { name: string; username: string } }
  ): Promise<TweetDto> {
    const [likesCount, retweetsCount, repliesCount] = await Promise.all([
      prisma.like.count({ where: { tweetId: tweet.id } }),
      prisma.retweet.count({ where: { tweetId: tweet.id } }),
      prisma.tweet.count({ where: { parentId: tweet.id } }),
    ]);
    return {
      id: tweet.id,
      userId: tweet.userId,
      user: {
        name: tweet.user.name,
        username: tweet.user.username,
      },
      type: tweet.type,
      ...(tweet.parentId !== null && { parentId: tweet.parentId }), // Inclui parentId apenas se definido
      content: tweet.content,
      createdAt: tweet.createdAt,
      ...(likesCount > 0 && { likes: likesCount }), // Inclui contagem de likes apenas se maior que 0
      ...(retweetsCount > 0 && { retweets: retweetsCount }), // Inclui contagem de retweets apenas se maior que 0
      ...(repliesCount > 0 && { replies: repliesCount }), // Inclui contagem de replies apenas se maior que 0
    };
  }

  // Mapeamento para TweetDto completo
  private mapToFullDto(
    tweet: Tweet & {
      user: { name: string; username: string };
      likes: {
        id: string;
        userId: string;
        user: { name: string; username: string };
      }[];
      retweets: {
        id: string;
        userId: string;
        user: { name: string; username: string };
      }[];
      replies: {
        id: string;
        userId: string;
        user: { name: string; username: string };
        type: TweetType;
        content: string;
        createdAt: Date;
        updatedAt?: Date;
      }[];
    }
  ): TweetDto {
    const { id, userId, type, parentId, content, createdAt, updatedAt, user } =
      tweet; //desestrutura
    return {
      id,
      userId,
      type,
      ...(parentId !== null && { parentId }), // Inclui parentId apenas se definido
      content,
      createdAt,
      updatedAt,
      user: {
        name: user.name,
        username: user.username,
      },
      ...(tweet.likes.length > 0 && {
        likes: tweet.likes.map((like) => ({
          id: like.id,
          userId: like.userId,
          user: { name: like.user.name, username: like.user.username },
        })),
      }), // Inclui dado apenas se houver likes
      ...(tweet.retweets.length > 0 && {
        retweets: tweet.retweets.map((retweet) => ({
          id: retweet.id,
          userId: retweet.userId,
          user: { name: retweet.user.name, username: retweet.user.username },
        })),
      }), // Inclui dado apenas se houver retweets
      ...(tweet.replies.length > 0 && {
        replies: tweet.replies.map((reply) => ({
          id: reply.id,
          userId: reply.userId,
          user: { name: reply.user.name, username: reply.user.username },
          type: reply.type,
          content: reply.content,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
        })),
      }), // Inclui dado apenas se houver replies
    };
  }
}
