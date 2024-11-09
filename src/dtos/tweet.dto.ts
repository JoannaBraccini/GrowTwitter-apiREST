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
  parentId?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes?: { id: string; userId: string }[] | number;
  retweets?: { id: string; userId: string }[] | number;
  replies?: TweetDto[] | number;
}

export interface TweetUpdateDto {
  content: string;
}
