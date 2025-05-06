import { TweetType } from "@prisma/client";
import { randomUUID } from "crypto";

interface TweetMockParams {
  id?: string;
  userId?: string;
  tweetType?: TweetType;
  parentId?: string | undefined;
  content?: string;
  imageUrl?: string;
}

export class TweetMock {
  public static build(params?: TweetMockParams) {
    return {
      id: params?.id || randomUUID(),
      userId: params?.userId || randomUUID(),
      tweetType: params?.tweetType || TweetType.TWEET,
      parentId: params?.parentId || null,
      content: params?.content || "Texto do Tweet",
      imageUrl: params?.imageUrl || "http://image.com/ex.svg",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
