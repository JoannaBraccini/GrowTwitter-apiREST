import { prisma } from "../database/prisma.database";
import { CreateUserDto, UserDto, QueryFilterDto } from "../dtos";
import { ResponseApi } from "../types/response";
import { Bcrypt } from "../utils/bcrypt";
import { Prisma, User } from "@prisma/client";

export class UserService {
  //CREATE
  public async create(createUser: CreateUserDto): Promise<ResponseApi> {
    const { name, email, password, username } = createUser;

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }, //verificar se usuário já existe com email/username cadastrado
    });
    if (user) {
      //se um dos dois retornar, então:
      return {
        ok: false,
        code: 409,
        message:
          user.email === email
            ? "Email is already in use."
            : "Username is already in use.",
      };
    }
    //gerar hash da senha
    const bcrypt = new Bcrypt();
    const passwordHash = await bcrypt.generateHash(password);
    //criar novo user
    const userCreated = await prisma.user.create({
      data: { name, email, password: passwordHash, username },
    });

    return {
      ok: true,
      code: 201,
      message: "User created successfully!",
      data: this.mapToDto(userCreated), //retornar somente dados básicos
    };
  }

  //READ
  public async findMany({
    name,
    username,
  }: QueryFilterDto): Promise<ResponseApi> {
    const where: Prisma.UserWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }
    if (username) {
      where.username = { contains: username, mode: "insensitive" };
    }

    const users = await prisma.user.findMany({ where });

    return {
      ok: true,
      code: 200,
      message: "Users retrieved successfully",
      data: users.map((user) => this.mapToDto(user)), //retorna dados básicos
    };
  }

  //READ
  public async findOne(id: string): Promise<ResponseApi> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        //lista de seguidores deste usuário
        followers: {
          select: {
            follower: { select: { id: true, name: true, username: true } },
          },
        },
        //lista de seguidos por este usuário
        following: {
          select: {
            followed: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        //lista de tweets deste usuário
        tweets: {
          select: {
            id: true,
            type: true,
            content: true,
            //lista de likes que cada tweet tem
            likes: { select: { id: true, userId: true } },
            //lista de retweets que cada tweet tem
            retweets: { select: { id: true, userId: true } },
            //lista de replies que cada tweet tem
            replies: {
              select: {
                id: true,
                user: { select: { id: true, username: true, name: true } },
                content: true,
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

  //mapeamento para userDto básico
  private mapToDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
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
        type: string;
        content: string;
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
        type: tweet.type,
        content: tweet.content,
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
