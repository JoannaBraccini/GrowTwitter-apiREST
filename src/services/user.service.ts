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
            likes: true,
            retweets: true,
            replies: {
              include: {
                user: true, // Inclui os dados do usuário que fez o reply
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
    //pega apenas as entradas não vazias do objeto
    const filteredData = Object.fromEntries(
      Object.entries(userUpdate).filter(([_, value]) => value !== "")
    );

    //extrai o username do filteredData e armazena em username
    const { username } = filteredData as { username?: string };
    if (username) {
      //verificar se já existe usuário com username cadastrado
      const existingUser = await prisma.user.findFirst({
        where: { username: username, NOT: { id } }, //ignora o próprio id na busca
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
    if (filteredData.password) {
      const bcrypt = new Bcrypt();
      filteredData.password = await bcrypt.generateHash(filteredData.password);
    }

    const userUpdated = await prisma.user.update({
      where: { id },
      data: { ...filteredData },
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
        content: string;
        createdAt: Date;
        updatedAt?: Date;
        likes: { id: string; userId: string }[];
        retweets: { id: string; userId: string }[];
        replies: {
          id: string;
          user: { id: string; name: string; username: string };
          content: string;
        }[];
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
        content: tweet.content,
        createdAt: tweet.createdAt,
        updatedAt: tweet.updatedAt,
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
          user: {
            id: reply.user.id,
            name: reply.user.name,
            username: reply.user.username,
          },
          content: reply.content,
        })),
      })),
    };
  }
}
