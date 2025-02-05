import { TweetType } from "@prisma/client";

export interface CreateTweetDto {
  userId: string;
  tweetType: TweetType;
  parentId?: string;
  content: string;
}

export type UpdateTweetDto = Pick<TweetDto, "userId" | "content"> & {
  tweetId: string;
};

export type ActionTweetDto = Pick<TweetDto, "userId"> & { tweetId: string };

export interface TweetDto {
  id: string;
  userId: string;
  user?: {
    name: string;
    username: string;
  };
  tweetType: TweetType;
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
