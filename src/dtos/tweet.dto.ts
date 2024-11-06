import { TweetType } from "@prisma/client";

export interface CreateTweetDto {
  userId: string;
  type: TweetType;
  parentId?: string;
  content: string;
}

export interface TweetDto {
  id: string;
  userId: string;
  type: TweetType;
  parentId?: string | null;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes?: { id: string; userId: string }[];
  retweets?: { id: string; userId: string }[];
  replies?: TweetDto[];
}

export interface TweetUpdateDto {
  content: string;
}

//para like e retweet
export interface CreateEngagementDto {
  tweetId: string; //id do tweet pai
  userId: string;
  type: "LIKE" | "RETWEET";
}
