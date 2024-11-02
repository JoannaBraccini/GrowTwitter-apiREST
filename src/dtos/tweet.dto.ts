import { TweetType } from "@prisma/client";

export interface CreateTweetDto {
  userId: string;
  type: TweetType;
  parentId?: string;
  content: string;
}

export interface TweetDto {
  id: string;
  user: {
    userId: string;
    name: string;
    username: string;
  };
  type: TweetType;
  content: string;
  likes?: LikeDto[];
  retweets?: RetweetDto[];
  replies?: TweetDto[];
}

export interface CreateLikeDto {
  tweetId: string;
  userId: string;
}

interface LikeDto {
  id: string;
  userId: string;
}

export interface CreateRetweetDto {
  userId: string;
  tweetId: string;
}

interface RetweetDto {
  id: string;
  userId: string;
}
