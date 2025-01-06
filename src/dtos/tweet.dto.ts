import { TweetType } from "@prisma/client";

export interface CreateTweetDto {
  userId: string;
  type: TweetType;
  parentId?: string;
  content: string;
}

export interface TweetDto {
  id: string;
  user: string;
  username: string;
  userId: string;
  type: TweetType;
  parentId?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes?: { id: string; userId: string;  user: string;
  username: string; }[] | number;
  retweets?: { id: string; userId: string; user: string;
  username: string; }[] | number;
  replies?: TweetDto[] | number;
}

export interface TweetUpdateDto {
  content: string;
}
