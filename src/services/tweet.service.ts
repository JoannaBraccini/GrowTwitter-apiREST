import {
  ActionsTweetDto,
  CreateTweetDto,
  RetweetDto,
  UpdateTweetDto,
} from "../dtos";
import { Like, Prisma, Retweet } from "@prisma/client";

import { ResponseApi } from "../types/response";
import { prisma } from "../database/prisma.database";

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
    const tweets = await this.getTweetsPaginated({}, query); // Busca todos os tweets sem filtro de usuário logado

    return tweets;
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
    return this.getTweetsPaginated({ userId: { in: idsToSearch } }, query);
  }

  //FIND ONE
  public async findOne(id: string): Promise<ResponseApi> {
    try {
      const tweet = await prisma.tweet.findUnique({
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
        data: tweetUpdated,
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
      const tweetToDelete = tweet;
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
      const alreadyLiked: Like | null = await prisma.like.findUnique({
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
        const newLike: Like = await prisma.like.create({
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

      let retweeted: Retweet | null = null; // Inicializa a variável retweeted como nula
      if (alreadyRetweeted) {
        // Se já retweetou, remove o retweet
        await prisma.retweet.delete({ where: { id: alreadyRetweeted.id } });
      } else {
        // Se ainda não retweetou, cria o retweet
        retweeted = await prisma.retweet.create({
          data: { userId, tweetId, comment },
        });
      }

      return {
        ok: true,
        code: alreadyRetweeted ? 200 : 201,
        message: alreadyRetweeted
          ? "Retweet removed successfully"
          : "Retweeted successfully",
        data: { retweet: retweeted },
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
    query?: { page?: number; take?: number; search?: string }
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
      replies: {
        select: {
          id: true,
          userId: true,
          tweetType: true,
          content: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { name: true, username: true } },
          likes: true,
          retweets: true,
          replies: true, // Inclui nested replies
        },
      },
    };
  }
}
