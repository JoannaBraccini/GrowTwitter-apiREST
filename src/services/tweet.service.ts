import { Tweet, TweetType } from "@prisma/client";
import { prisma } from "../database/prisma.database";
import { CreateTweetDto, TweetDto, TweetUpdateDto } from "../dtos";
import { ResponseApi } from "../types/response";

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

    const tweetDto = await this.mapToDto(tweetCreated);

    return {
      ok: true,
      code: 201,
      message: "Tweet created successfully!",
      data: tweetDto,
    };
  }

  //FIND ALL - com paginação e search
  public async findAll(query?: {
    page?: number;
    take?: number;
    search?: string;
  }): Promise<ResponseApi> {
    const tweetSearch = await prisma.tweet.findMany({
      skip: query?.page,
      take: query?.take,
      where: {
        content: { contains: query?.search, mode: "insensitive" },
      },
      orderBy: { createdAt: "asc" },
    });

    const tweetsDefault = await prisma.tweet.findMany({
      skip: query?.page,
      take: query?.take,
      orderBy: { createdAt: "asc" },
    });

    if (tweetSearch.length === 0 || tweetsDefault.length === 0) {
      return {
        ok: false,
        code: 404,
        message: "No tweets found",
      };
    }

    const tweets = tweetSearch.length > 0 ? tweetSearch : tweetsDefault;

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
        likes: true,
        retweets: true,
        replies: {
          include: {
            user: true,
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
      message: "User details retrieved successfully.",
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
  public async remove(id: string, userId: string): Promise<ResponseApi> {
    const tweet = await prisma.tweet.findUnique({
      where: { id },
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
    await prisma.tweet.delete({ where: { id } });

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

    //se já tiver retweetadp, deleta o retweet
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
  private async mapToDto(tweet: Tweet): Promise<TweetDto> {
    const [likesCount, retweetsCount, repliesCount] = await Promise.all([
      prisma.like.count({ where: { tweetId: tweet.id } }),
      prisma.retweet.count({ where: { tweetId: tweet.id } }),
      prisma.tweet.count({ where: { parentId: tweet.id } }),
    ]);
    return {
      id: tweet.id,
      userId: tweet.userId,
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
      likes: { id: string; userId: string }[];
      retweets: { id: string; userId: string }[];
      replies: {
        id: string;
        userId: string;
        type: TweetType;
        content: string;
        createdAt: Date;
        updatedAt?: Date;
      }[];
    }
  ): TweetDto {
    const { id, userId, type, parentId, content, createdAt, updatedAt } = tweet; //desestrutura
    return {
      id,
      userId,
      type,
      ...(parentId !== null && { parentId }), // Inclui parentId apenas se definido
      content,
      createdAt,
      updatedAt,
      ...(tweet.likes.length > 0 && {
        likes: tweet.likes.map((like) => ({
          id: like.id,
          userId: like.userId,
        })),
      }), // Inclui dado apenas se houver likes
      ...(tweet.retweets.length > 0 && {
        retweets: tweet.retweets.map((retweet) => ({
          id: retweet.id,
          userId: retweet.userId,
        })),
      }), // Inclui dado apenas se houver retweets
      ...(tweet.replies.length > 0 && {
        replies: tweet.replies.map((reply) => ({
          id: reply.id,
          userId: reply.userId,
          type: reply.type,
          content: reply.content,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
        })),
      }), // Inclui dado apenas se houver replies
    };
  }
}
