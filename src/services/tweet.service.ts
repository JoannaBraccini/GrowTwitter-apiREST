import { Prisma, Tweet } from "@prisma/client";
import { prisma } from "../database/prisma.database";
import {
  ActionsDto,
  CreateTweetDto,
  TweetDto,
  UpdateTweetDto,
  RetweetDto,
  ActionsTweetDto,
} from "../dtos";
import { ResponseApi } from "../types/response";

export class TweetService {
  //CREATE
  public async create(createTweet: CreateTweetDto): Promise<ResponseApi> {
    const { userId, parentId, tweetType, content, imageUrl } = createTweet;

    try {
      //Verificar se o tweet sendo respondido ou compartilhado existe no banco de dados
      if (parentId) {
        const parentTweet = await prisma.tweet.findUnique({
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

      const tweetCreated = await prisma.tweet.create({
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
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //FIND ALL - com paginação e search
  public async findAll(query?: {
    page?: number;
    take?: number;
    search?: string;
  }): Promise<ResponseApi> {
    return this.getTweetsPaginated({}, query); // Busca todos os tweets sem filtro de usuário logado
  }

  //FIND FEED - com paginação e search
  public async findFeed(
    userId: string,
    query?: { page?: number; take?: number; search?: string }
  ): Promise<ResponseApi> {
    //Filtra os usuários da lista de seguidos
    const following = await prisma.follower.findMany({
      where: { followerId: userId },
      select: { followedId: true },
    });

    //Mapeia os usuários da lista de seguidos
    const followingIds = following ? following.map((f) => f.followedId) : [];

    // Se o usuário não segue ninguém, garante que ele veja seus próprios tweets
    const idsToSearch =
      followingIds.length > 0 ? [...followingIds, userId] : [userId];

    // Busca os tweets onde o userId seja do usuário logado ou do usuário seguido
    return this.getTweetsPaginated(
      { userId: { in: idsToSearch } },
      query,
      true // Para Map Full
    );
  }

  //FIND ONE
  public async findOne(id: string): Promise<ResponseApi> {
    try {
      const tweet = await prisma.tweet.findUnique({
        where: { id },
        include: this.includeTweetRelations(),
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
        data: this.mapToFullDto(tweet), // Mapeia detalhes
      };
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //UPDATE
  public async update({
    tweetId,
    userId,
    content,
    imageUrl,
  }: UpdateTweetDto): Promise<ResponseApi> {
    try {
      const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } });

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
      if (content) tweetToUpdate.content = content;
      if (imageUrl) tweetToUpdate.imageUrl = imageUrl;
      const tweetUpdated = await prisma.tweet.update({
        where: { id: tweetId },
        data: tweetToUpdate,
      });

      return {
        ok: true,
        code: 200,
        message: "Tweet content updated successfully",
        data: await this.mapToDto(tweetUpdated),
      };
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //DELETE
  public async remove({
    tweetId,
    userId,
  }: ActionsTweetDto): Promise<ResponseApi> {
    try {
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
          code: 401,
          message: "Not authorized to delete this tweet",
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
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //LIKE/UNLIKE
  public async like({
    tweetId,
    userId,
  }: ActionsTweetDto): Promise<ResponseApi> {
    try {
      const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } });

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
        // Se já curtiu, remove o like
        await prisma.like.delete({ where: { id: alreadyLiked.id } });
      } else {
        // Se ainda não curtiu, adiciona o like
        await prisma.like.create({ data: { tweetId, userId } });
      }

      // Conta os likes atuais após a ação
      const likeCount = await prisma.like.count({
        where: { tweetId },
      });
      return {
        ok: true,
        code: alreadyLiked ? 200 : 201,
        message: alreadyLiked
          ? "Like removed successfully"
          : "Tweet liked successfully",
        data: { tweetId, likeCount }, // Retorna o número atualizado de likes
      };
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //RETWEET/CANCEL RETWEET
  public async retweet({
    tweetId,
    comment,
    userId,
  }: RetweetDto): Promise<ResponseApi> {
    try {
      const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } });

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

      let retweeted = null;
      //se já tiver retweetado, deleta o retweet
      if (alreadyRetweeted) {
        // Se já retweetou, remove o retweet
        await prisma.retweet.delete({ where: { id: alreadyRetweeted.id } });
      } else {
        // Se ainda não retweetou, cria o retweet
        retweeted = await prisma.retweet.create({
          data: { userId, tweetId, comment },
        });
      }

      // Conta os retweets atuais após a ação
      const retweetCount = await prisma.retweet.count({
        where: { tweetId },
      });

      return {
        ok: true,
        code: alreadyRetweeted ? 200 : 201,
        message: alreadyRetweeted
          ? "Retweet removed successfully"
          : "Retweeted successfully",
        data: { tweetId, retweetCount, retweet: retweeted }, // Retorna a contagem atualizada junto com o retweet
      };
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //Métodos Privados
  //FIND PAGINATED
  private async getTweetsPaginated(
    where: Prisma.TweetWhereInput,
    query?: { page?: number; take?: number; search?: string },
    useFullDto: boolean = false
  ): Promise<ResponseApi> {
    const skip =
      query?.page && query?.take ? query.page * query.take : undefined;

    if (query?.search) {
      where.content = { contains: query.search, mode: "insensitive" };
    }

    try {
      const tweets = await prisma.tweet.findMany({
        skip,
        take: query?.take,
        where,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }], // Mostrar os mais recentes primeiro
        include: this.includeTweetRelations(),
      });

      if (!tweets || tweets.length < 1) {
        return { ok: false, code: 404, message: "No tweets found" };
      }

      const tweetDtos = await Promise.all(
        tweets.map((tweet) =>
          useFullDto ? this.mapToFullDto(tweet) : this.mapToDto(tweet)
        )
      );

      return {
        ok: true,
        code: 200,
        message: "Tweets retrieved successfully",
        data: tweetDtos,
      };
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
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
      tweetType: tweet.tweetType,
      parentId: tweet.parentId ?? undefined,
      content: tweet.content ?? undefined,
      imageUrl: tweet.imageUrl ?? undefined,
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
      tweetType: tweet.tweetType,
      parentId: tweet.parentId,
      content: tweet.content,
      imageUrl: tweet.imageUrl,
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
        user: {
          name: like.user.name,
          username: like.user.username,
        },
      })),
      retweets: tweet.retweets?.map((retweet: ActionsDto) => ({
        id: retweet.id,
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
        tweetType: reply.tweetType,
        content: reply.content,
        imageUrl: reply.imageUrl,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        likesCount: reply.likes?.length || 0,
        retweetsCount: reply.retweets?.length || 0,
        repliesCount: reply.replies?.length || 0,
        likes: reply.likes?.map((like: ActionsDto) => ({
          id: like.id,
          user: {
            name: like.user.name,
            username: like.user.username,
          },
        })),
        retweets: reply.retweets?.map((retweet: ActionsDto) => ({
          id: retweet.id,
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
          tweetType: reply.tweetType,
          content: reply.content,
          imageUrl: reply.imageUrl,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
        })),
      })),
    };
  }
}
