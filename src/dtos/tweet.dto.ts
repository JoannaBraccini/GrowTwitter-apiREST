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
  user?: {
    name: string;
    username: string;
  };
  type: TweetType;
  parentId?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;

  likesCount?: number;
  retweetsCount?: number;
  repliesCount?: number;

  likes?: ActionsDto[];
  retweets?: ActionsDto[];
  replies?: TweetDto[];
}

export interface ActionsDto {
  id: string;
  userId: string;
  user: {
    name: string;
    username: string;
  };
}
