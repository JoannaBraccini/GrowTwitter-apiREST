import { prisma } from "../database/prisma.database";
import { UserDto, QueryFilterDto, UserBaseDto, UserUpdateDto } from "../dtos";
import { ResponseApi } from "../types/response";
import { Prisma, TweetType, User } from "@prisma/client";
import { Bcrypt } from "../utils/bcrypt";

export class UserService {
  //READ (optional search query)
  public async findMany({
    name,
    username,
    email,
  }: QueryFilterDto): Promise<ResponseApi> {
    try {
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
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //READ (id one)
  public async findOne(id: string): Promise<ResponseApi> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: this.includeUserRelations(),
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
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //UPDATE (id)
  public async update(updateUser: UserUpdateDto): Promise<ResponseApi> {
    const { id, userId, name, username, oldPassword, newPassword } = updateUser;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        return {
          code: 404,
          ok: false,
          message: "User not found",
        };
      }

      // Verificar se o usuário autenticado é o mesmo que está sendo atualizado
      if (id !== userId) {
        return {
          ok: false,
          code: 401,
          message: "You are not authorized to modify this profile.",
        };
      }

      //verificar se já existe usuário com username cadastrado
      if (username) {
        const existingUser = await prisma.user.findFirst({
          where: { username: username, NOT: { id } }, //ignora o próprio id na busca
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
      let hashedPassword: string | undefined;
      if (oldPassword && newPassword) {
        const bcrypt = new Bcrypt();
        const passwordValid = await bcrypt.verify(oldPassword, user.password);

        if (!passwordValid) {
          return {
            ok: false,
            code: 400,
            message: "Wrong password",
          };
        }

        const passwordCompare = await bcrypt.verify(newPassword, user.password);

        if (passwordCompare) {
          return {
            ok: false,
            code: 400,
            message: "New password must be different from the previous one",
          };
        }

        hashedPassword = await bcrypt.generateHash(newPassword);
      }

      const dataToUpdate: Partial<User> = {};
      if (name) dataToUpdate.name = name;
      if (username) dataToUpdate.username = username;
      if (hashedPassword) dataToUpdate.password = hashedPassword;

      //salva os dados novos
      const userUpdated = await prisma.user.update({
        where: { id },
        data: { ...dataToUpdate },
      });

      return {
        ok: true,
        code: 200,
        message: "User profile updated successfully.",
        data: {
          id: userUpdated.id,
          name: userUpdated.name,
          username: userUpdated.username,
          email: userUpdated.email,
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

  //DELETE (id)
  public async remove(id: string, userId: string): Promise<ResponseApi> {
    // Verificar se o usuário autenticado é o mesmo que está sendo atualizado
    if (id !== userId) {
      return {
        ok: false,
        code: 401,
        message: "You are not authorized to delete this profile.",
      };
    }

    try {
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
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
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

    try {
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
          code: 404, // Not Found
          message: "User not found.",
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
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //Métodos Privados
  //FIND UNIQUE
  private async getUserById(userId: string) {
    return await prisma.user.findUnique({ where: { id: userId } });
  }

  //FIND RELATED
  private includeUserRelations() {
    return {
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
    };
  }

  //mapeamento para userDto básico
  private async mapToDto(user: User): Promise<UserBaseDto> {
    const [followersCount, followingCount, tweetsCount] = await Promise.all([
      prisma.follower.count({ where: { followerId: user.id } }),
      prisma.follower.count({ where: { followedId: user.id } }),
      prisma.tweet.count({ where: { userId: user.id } }),
    ]);

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      ...(followersCount > 0 && { followers: followersCount }), // Inclui contagem de seguidores apenas se maior que 0
      ...(followingCount > 0 && { following: followingCount }), // Inclui contagem de seguidos apenas se maior que 0
      ...(tweetsCount > 0 && { tweets: tweetsCount }), // Inclui contagem de tweets apenas se maior que 0
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
        _count: {
          likes: number;
          replies: number;
          retweets: number;
        };
      }[];
    }
  ): UserDto {
    const { id, name, username, followers, following, tweets } = user; //desestrutura
    return {
      id,
      name,
      username,
      // Se a lista estiver vazia retorna []
      followers:
        followers.length > 0
          ? followers.map(({ follower }) => ({
              id: follower.id,
              name: follower.name,
              username: follower.username,
            }))
          : [],
      following:
        following.length > 0
          ? following.map(({ followed }) => ({
              id: followed.id,
              name: followed.name,
              username: followed.username,
            }))
          : [],
      tweets:
        tweets.length > 0
          ? tweets.map((tweet) => ({
              id: tweet.id,
              userId: tweet.userId,
              type: tweet.type,
              parentId: tweet.parentId ?? undefined,
              content: tweet.content,
              createdAt: tweet.createdAt,
              updatedAt: tweet.updatedAt,
              likeCount: tweet._count.likes,
              replyCount: tweet._count.replies,
              retweetCount: tweet._count.retweets,
            }))
          : [],
    };
  }
}
