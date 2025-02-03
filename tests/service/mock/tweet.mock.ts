import { TweetType } from "@prisma/client";
import { randomUUID } from "crypto";

interface TweetMockParams {
  id?: string;
  userId?: string;
  type?: TweetType;
  parentId?: string | undefined;
  content?: string;
  user?: {
    name?: string;
    username?: string;
  };
}

export class TweetMock {
  public static build(params?: TweetMockParams) {
    return {
      id: params?.id || randomUUID(),
      userId: params?.userId || randomUUID(),
      type: params?.type || TweetType.TWEET,
      parentId: params?.parentId || null,
      content: params?.content || "Texto do Tweet",
      user: params?.user || { name: "Nome", username: "username" },
      likesCount: undefined,
      repliesCount: undefined,
      retweetsCount: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
