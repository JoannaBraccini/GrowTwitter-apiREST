import { TweetType } from "@prisma/client";
export interface TweetDto {
  id: string;
  userId: string;
  user?: {
    name: string;
    username: string;
  };
  tweetType: TweetType;
  parentId?: string;
  content?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt?: Date;

  likesCount?: number;
  retweetsCount?: number;
  repliesCount?: number;

  likes?: ActionsDto[];
  retweets?: ActionsDto[];
  replies?: TweetDto[];
}

export type CreateTweetDto = Pick<
  TweetDto,
  "userId" | "tweetType" | "parentId" | "content" | "imageUrl"
>;

export interface ActionsDto {
  id: string;
  user: {
    name: string;
    username: string;
  };
}

export type UpdateTweetDto = Pick<
  TweetDto,
  "userId" | "content" | "imageUrl"
> & {
  tweetId: string;
};

export type ActionsTweetDto = Pick<UpdateTweetDto, "userId" | "tweetId">;

export type RetweetDto = Pick<UpdateTweetDto, "userId" | "tweetId"> & {
  comment?: string;
};
