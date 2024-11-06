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

    const users = await prisma.user.findMany({ where });

    if (users.length === 0) {
      return {
        ok: false,
        code: 404,
        message: "No users found",
      };
    }

    return {
      ok: true,
      code: 200,
      message: "Users retrieved successfully",
      data: users.map((user) => this.mapToDto(user)), //retorna dados básicos
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
    userUpdate: UserUpdateDto
  ): Promise<ResponseApi> {
    //verificar se já existe usuário com username cadastrado
    if (userUpdate.username) {
      const existingUser = await prisma.user.findFirst({
        where: { username: userUpdate.username, NOT: { id } }, //ignora o próprio id na busca
      });
      if (existingUser) {
        return {
          ok: false,
          code: 409,
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
  public async remove(id: string): Promise<ResponseApi> {
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

  //mapeamento para userDto básico
  private mapToDto(user: User): UserBaseDto {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
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
