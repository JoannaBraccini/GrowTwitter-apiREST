import { User } from "@prisma/client";
import { randomUUID } from "crypto";

interface UserMockParams {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

export class UserMock {
  public static build(params?: UserMockParams): User {
    return {
      id: params?.id || randomUUID(),
      name: params?.name || "Usuario Teste",
      username: params?.username || "usertest",
      email: params?.email || "teste@email.com",
      password: params?.password || "umaSenha",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
