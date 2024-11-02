import { prisma } from "../database/prisma.database";
import { CreateUserDto, UserDto, TweetDto, FollowerDto } from "../dtos";
import { ResponseApi } from "../types/response";
import { Bcrypt } from "../utils/bcrypt";
import { Follower, Like, Retweet, Tweet, User } from "@prisma/client";

export class UserService {
  public async create(createUser: CreateUserDto): Promise<ResponseApi> {
    const { name, email, password, username } = createUser;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (user) {
      if (user.email === email) {
        return {
          ok: false,
          code: 409,
          message: "Email is already in use.",
        };
      }
      if (user.username === username) {
        return {
          ok: false,
          code: 409,
          message: "Username is already in use.",
        };
      }
    }

    const bcrypt = new Bcrypt();
    const passwordHash = await bcrypt.generateHash(password);

    const userCreated = await prisma.user.create({
      data: { name, email, password: passwordHash, username },
    });

    return {
      ok: true,
      code: 201,
      message: "User created successfully!",
      data: this.mapToDto(userCreated),
    };
  }

  private mapToDto(
    user: User & {
      followers?: FollowerDto[];
      tweets?: (TweetDto & {
        user: User;
        likes?: Like[];
        retweets?: Retweet[];
        replies?: (Tweet & { user: User })[];
      })[];
    }
  ): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      followers: user.followers?.map((follower) => ({
        id: follower.id,
        user: {
          userId: follower.user.userId,
          username: follower.user.username,
        },
      })),
      tweets: user.tweets?.map((tweet) => ({
        id: tweet.id,
        user: {
          userId: tweet.user.userId,
          username: tweet.user.username,
          name: tweet.user.name,
        },
        type: tweet.type,
        content: tweet.content,
        likes: tweet.likes?.map((like) => ({
          id: like.id,
          userId: like.userId,
        })),
        retweets: tweet.retweets?.map((retweet) => ({
          id: retweet.id,
          userId: retweet.userId,
        })),
        replies: tweet.replies?.map((reply) => ({
          id: reply.id,
          user: {
            userId: reply.user.userId,
            username: reply.user.username,
            name: reply.user.name,
          },
          type: tweet.type,
          content: tweet.content,
        })),
      })),
    };
  }
}
