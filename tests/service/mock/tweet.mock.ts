import { Tweet, TweetType } from "@prisma/client";
import { randomUUID } from "crypto";

interface TweetMockParams {
  id?: string;
  parentId?: string;
  type?: TweetType;
  userId?: string;
  content?: string;
}

export class TweetMock {
  public static build(params?: TweetMockParams): Tweet {
    return {
      id: params?.id || randomUUID(),
      parentId: params?.parentId || null,
      type: params?.type || TweetType.TWEET,
      userId: params?.userId || randomUUID(),
      content: params?.content || "Texto do Tweet",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
