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

    return {
      ok: true,
      code: 201,
      message: "Tweet created successfully!",
      data: this.mapToDto(tweetCreated),
    };
  }

  //FIND ALL - com paginação e search
  public async findAll(
    id: string,
    query?: { page?: number; take?: number; search?: string }
  ): Promise<ResponseApi> {
    const tweets = await prisma.tweet.findMany({
      skip: query?.page,
      take: query?.take,
      where: {
        userId: id,
        content: { contains: query?.search, mode: "insensitive" },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!tweets || tweets.length === 0) {
      return {
        ok: false,
        code: 404,
        message: "No tweets found",
      };
    }

    return {
      ok: true,
      code: 200,
      message: "Tweets retrieved successfully",
      data: tweets.map((tweet) => this.mapToDto(tweet)),
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
    id: string,
    tweetUpdate: TweetUpdateDto
  ): Promise<ResponseApi> {
    const tweet = await prisma.tweet.findUnique({
      where: { id },
    });

    if (!tweet) {
      return {
        ok: false,
        code: 404,
        message: "Tweet not found.",
      };
    }

    const tweetUpdated = await prisma.tweet.update({
      where: { id },
      data: { ...tweetUpdate },
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
  public async remove(id: string): Promise<ResponseApi> {
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

    const tweetDeleted = await prisma.tweet.delete({
      where: { id },
    });

    return {
      ok: true,
      code: 200,
      message: "Tweet removed successfully",
      data: this.mapToDto(tweetDeleted),
    };
  }

  private mapToDto(tweet: Tweet): TweetDto {
    return {
      id: tweet.id,
      userId: tweet.userId,
      type: tweet.type,
      parentId: tweet.parentId || undefined,
      content: tweet.content,
      createdAt: tweet.createdAt,
    };
  }

  // Mapeamento para UserDto completo
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
      parentId,
      content,
      createdAt,
      updatedAt,
      likes: tweet.likes?.map((like) => ({
        id: like.id,
        userId: like.userId,
      })),
      retweets: tweet.retweets.map((retweet) => ({
        id: retweet.id,
        userId: retweet.userId,
      })),
      replies: tweet.replies.map((reply) => ({
        id: reply.id,
        userId: reply.userId,
        type: reply.type,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
    };
  }
}
