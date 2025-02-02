import { Follower, User } from "@prisma/client";
import { randomUUID } from "crypto";
import { UserBaseDto, UserDto } from "../../../src/dtos";

interface UserMockParams {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  followers?: { followerId: string; followedId: string }[];
}

export class UserMock {
  public static build(
    params?: UserMockParams
  ): User & { followers: Follower[] } {
    const user: User = {
      id: params?.id || randomUUID(),
      name: params?.name || "Usuario Teste",
      username: params?.username || "usertest",
      email: params?.email || "teste@email.com",
      password: params?.password || "umaSenha",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Cria o array de seguidores com base nos params
    const followers =
      params?.followers?.map((follower) => ({
        id: randomUUID(),
        followerId: follower.followerId,
        followedId: follower.followedId,
        createdAt: new Date(),
      })) || [];

    return {
      ...user,
      followers, // Adiciona followers aos dados
    };
  }
}
