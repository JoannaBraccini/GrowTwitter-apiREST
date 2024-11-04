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
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes?: { id: string; userId: string }[];
  retweets?: { id: string; userId: string }[];
  replies?: ReplyDto[];
}

export interface ReplyDto {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
  content: string;
}

//para like e retweet
export interface CreateEngagementDto {
  tweetId: string; //id do tweet pai
  userId: string;
  type: "like" | "retweet";
}
