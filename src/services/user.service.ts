import { prisma } from "../database/prisma.database";
import { UserDto, QueryFilterDto, UserBaseDto, UserUpdateDto } from "../dtos";
import { ResponseApi } from "../types/response";
import { Prisma, TweetType, User } from "@prisma/client";
import { Bcrypt } from "../utils/bcrypt";

export class UserService {
  //CREATE -> movido para authService: signup
  //READ (query many)
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
      data: this.mapToDto(userDeleted),
    };
  }

  //FOLLOW/UNFOLLOW (id)
  public async follow(
    followedId: string,
    followerId: string
  ): Promise<ResponseApi> {
    // Verificar se os usuários existem
    const followed = await prisma.user.findUnique({
      where: { id: followedId },
    });

    const follower = await prisma.user.findUnique({
      where: { id: followerId },
    });

    if (!followed || !follower) {
      return {
        ok: false,
        code: 404,
        message: "User not found",
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

    //se já tiver curtido, deleta o like
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
      // Criar o like caso não tenha
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
    const [followersCount, followingCount] = await Promise.all([
      prisma.follower.count({ where: { followedId: user.id } }),
      prisma.follower.count({ where: { followerId: user.id } }),
    ]);

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      followers: followersCount, //Contagem de seguidores deste usuário
      following: followingCount, //Contagem de usuários seguidos por este usuário
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
        parentId: string | null;
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
      followers: followers.map(({ follower }) => ({
        id: follower.id,
        name: follower.name,
        username: follower.username,
      })),
      following: following.map(({ followed }) => ({
        id: followed.id,
        name: followed.name,
        username: followed.username,
      })),
      tweets: tweets.map((tweet) => ({
        id: tweet.id,
        userId: tweet.userId,
        type: tweet.type,
        parentId: tweet.parentId,
        content: tweet.content,
        createdAt: tweet.createdAt,
        updatedAt: tweet.updatedAt,
        likeCount: tweet._count.likes,
        replyCount: tweet._count.replies,
        retweetCount: tweet._count.retweets,
      })),
    };
  }
}
