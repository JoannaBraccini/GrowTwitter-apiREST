import { User, Verified } from "@prisma/client";
import { UserBaseDto, UserDto } from "../../../src/dtos";

import { randomUUID } from "crypto";

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
  verified?: Verified;
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
      avatarUrl: params?.avatarUrl || "http://image.com/ex.svg",
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: params?.verified || ("NONE" as Verified),
    };

    const followers = params?.followers || [];
    const following = params?.following || [];

    return {
      ...user,
      followers,
      following,
    };
  }
}
