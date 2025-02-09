import { User } from "@prisma/client";
import { randomUUID } from "crypto";
import { TweetDto, UserBaseDto, UserDto } from "../../../src/dtos";

interface UserMockParams {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  bio?: string;
  avatarUrl?: string;
  followers?: UserBaseDto[];
  following?: UserBaseDto[];
  tweets?: TweetDto[];
}

export class UserMock {
  public static build(params?: UserMockParams): User & Partial<UserDto> {
    const user = {
      id: params?.id || randomUUID(),
      name: params?.name || "Usuario Teste",
      username: params?.username || "usertest",
      email: params?.email || "teste@email.com",
      password: params?.password || "umaSenha",
      bio: params?.bio || "Uma biografia",
      avatarUrl: params?.avatarUrl || "http://imagem.svg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const followers = params?.followers || [];
    const following = params?.following || [];
    const tweets = params?.tweets || [];

    return {
      ...user,
      followers,
      following,
      tweets,
    };
  }
}
