import { Tweet } from "@prisma/client";
import { prisma } from "../database/prisma.database";
import { CreateTweetDto, TweetDto } from "../dtos";
import { ResponseApi } from "../types/response";

export class TweetService {
  public async create(createTweet: CreateTweetDto): Promise<ResponseApi> {
    const { userId, parentId, type, content } = createTweet;

    const tweetCreated = await prisma.tweet.create({
      data: { userId, parentId, type, content },
    });

    return {
      ok: true,
      code: 201,
      message: "Tweet created successfully!",
      data: this.mapToDto(tweetCreated),
    };
  }

  private mapToDto(tweet: Tweet): TweetDto {
    return {
      id: tweet.id,
      userId: tweet.userId,
      type: tweet.type,
      content: tweet.content,
      createdAt: tweet.createdAt,
    };
  }
}
