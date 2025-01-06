import { prisma } from "../database/prisma.database";
import { UserDto, QueryFilterDto, UserBaseDto, UserUpdateDto } from "../dtos";
import { ResponseApi } from "../types/response";
import { Prisma, TweetType, User } from "@prisma/client";
import { Bcrypt } from "../utils/bcrypt";

export class UserService {
  //CREATE -> movido para authService: signup
  //READ (optional search query)
  public async findMany({
    name,
    username,
    email,
  }: QueryFilterDto): Promise<ResponseApi> {
    const where: Prisma.UserWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }
    if (username) {
      where.username = { contains: username, mode: "insensitive" };
    }
    if (email) {
      where.email = { contains: email, mode: "insensitive" };
    }

    const users = where
      ? await prisma.user.findMany({ where })
      : await prisma.user.findMany();

    if (users.length === 0) {
      return {
        ok: false,
        code: 404,
        message: "No users found",
      };
    }
    const userDtos = await Promise.all(
      users.map((user) => this.mapToDto(user))
    );

    return {
      ok: true,
      code: 200,
      message: "Users retrieved successfully",
      data: userDtos, //retorna dados básicos
    };
  }

  //READ (id one)
  public async findOne(id: string): Promise<ResponseApi> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        //lista de seguidores deste usuário
        followers: {
          include: {
            follower: true, //dados do seguidor
          },
        },
        //lista de seguidos por este usuário
        following: {
          include: {
            followed: true, //dados do usuário seguido
          },
        },
        //lista de tweets deste usuário
        tweets: {
          include: {
            //incluir a contagem de:
            _count: {
              select: {
                //likes, replies e retweets
                likes: true,
                replies: true,
                retweets: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return {
        ok: false,
        code: 404,
        message: "User not found.",
      };
    }

    return {
      ok: true,
      code: 200,
      message: "User details retrieved successfully.",
      data: this.mapToFullDto(user), // Mapeia detalhes
    };
  }

  //UPDATE (id)
  public async update(
    id: string,
    userId: string,
    userUpdate: UserUpdateDto
  ): Promise<ResponseApi> {
    // Verificar se o usuário autenticado é o mesmo que está sendo atualizado
    if (id !== userId) {
      return {
        ok: false,
        code: 403, //forbidden
        message: "You are not authorized to modify this profile.",
      };
    }
    //verificar se já existe usuário com username cadastrado
    if (userUpdate.username) {
      const existingUser = await prisma.user.findFirst({
        where: { username: userUpdate.username, NOT: { id } }, //ignora o próprio id na busca
      });
      if (existingUser) {
        return {
          ok: false,
          code: 409, //conflict
          message: "Username is already in use.",
        };
      }
    }

    //gerar novo hash para a senha atualizada
    if (userUpdate.password) {
      const bcrypt = new Bcrypt();
      userUpdate.password = await bcrypt.generateHash(userUpdate.password);
    }

    //salva os dados novos
    const userUpdated = await prisma.user.update({
      where: { id },
      data: { ...userUpdate },
    });

    return {
      ok: true,
      code: 200,
      message: "User profile updated successfully!",
      data: {
        id: userUpdated.id,
        name: userUpdated.name,
        username: userUpdated.username,
        email: userUpdated.email,
      },
    };
  }

  //DELETE (id)
  public async remove(id: string, userId: string): Promise<ResponseApi> {
    // Verificar se o usuário autenticado é o mesmo que está sendo atualizado
    if (id !== userId) {
      return {
        ok: false,
        code: 403, //forbidden
        message: "You are not authorized to delete this profile.",
      };
    }
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return {
        ok: false,
        code: 404,
        message: "User not found",
      };
    }

    const userDeleted = await prisma.user.delete({
      where: { id },
    });

    return {
      ok: true,
      code: 200,
      message: "User removed successfully",
      data: userDeleted,
    };
  }

  //FOLLOW/UNFOLLOW (id)
  public async follow(
    followerId: string,
    followedId: string
  ): Promise<ResponseApi> {
    if (followerId === followedId) {
      return {
        ok: false,
        code: 409, //conflict
        message: "Follower ID and Followed ID can't be the same.",
      };
    }

    // Verificar se os usuários existem
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
    });

    const followed = await prisma.user.findUnique({
      where: { id: followedId },
    });

    if (!follower || !followed) {
      return {
        ok: false,
        code: 400, // Bad Request
        message: "Invalid user ID(s) provided.",
      };
    }

    // Verificar se usuário já segue
    const alreadyFollows = await prisma.follower.findUnique({
      where: {
        followerId_followedId: {
          followerId: followerId,
          followedId: followedId,
        },
      },
    });

    //se já estiver seguindo, remove o follow
    if (alreadyFollows) {
      await prisma.follower.delete({
        where: { id: alreadyFollows.id },
      });
      return {
        ok: true,
        code: 200,
        message: "Follow removed successfully",
      };
    } else {
      // Seguir caso ainda não seja seguidor
      const follow = await prisma.follower.create({
        data: {
          followerId: followerId,
          followedId: followedId,
        },
      });

      return {
        ok: true,
        code: 200,
        message: "User followed successfully",
        data: follow,
      };
    }
  }

  //mapeamento para userDto básico
  private async mapToDto(user: User): Promise<UserBaseDto> {
    const [followersCount, followingCount, tweetsCount] = await Promise.all([
      prisma.follower.count({ where: { followerId: user.id } }),
      prisma.follower.count({ where: { followedId: user.id } }),
      prisma.tweet.count({ where: { userId: user.id } }),
    ]);

    return {
      userId: user.id,
      name: user.name,
      username: user.username,
      // ...(followersCount > 0 && { followers: followersCount }), // Inclui contagem de seguidores apenas se maior que 0
      // ...(followingCount > 0 && { following: followingCount }), // Inclui contagem de seguidos apenas se maior que 0
      // ...(tweetsCount > 0 && { tweets: tweetsCount }), // Inclui contagem de tweets apenas se maior que 0
    };
  }

  // Mapeamento para UserDto completo
  private mapToFullDto(
    user: User & {
      followers: { follower: { id: string; name: string; username: string } }[];
      following: { followed: { id: string; name: string; username: string } }[];
      tweets: {
        id: string;
        userId: string;
        type: TweetType;
        parentId?: string | null;
        content: string;
        createdAt: Date;
        updatedAt?: Date;
        //contagem
        // _count: {
        //   likes: number;
        //   replies: number;
        //   retweets: number;
        // };
      }[];
    }
  ): UserDto {
    const { id, name, username, followers, following, tweets } = user; //desestrutura
    return {
      id,
      name,
      username,
      // Inclui apenas se a contagem for maior que 0
      ...(followers.length > 0 && {
        followers: followers.map(({ follower }) => ({
          userId: follower.id,
          name: follower.name,
          username: follower.username,
        })),
      }),
      ...(following.length > 0 && {
        following: following.map(({ followed }) => ({
          userId: followed.id,
          name: followed.name,
          username: followed.username,
        })),
      }),
      ...(tweets.length > 0 && {
        tweets: tweets.map((tweet) => ({
          id: tweet.id,
          userId: tweet.userId,
          type: tweet.type,
          ...(tweet.parentId && { parentId: tweet.parentId }), // Inclui apenas se não for null
          content: tweet.content,
          createdAt: tweet.createdAt,
          updatedAt: tweet.updatedAt,
          // ...(tweet._count.likes > 0 && { likeCount: tweet._count.likes }),
          // ...(tweet._count.replies > 0 && { replyCount: tweet._count.replies }),
          // ...(tweet._count.retweets > 0 && {
          //   retweetCount: tweet._count.retweets,
          // }),
        })),
      }),
    };
  }
}
