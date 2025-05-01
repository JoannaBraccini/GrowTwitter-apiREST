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

  likes?: ActionsTweetDto[];
  retweets?: RetweetDto[];
  replies?: TweetDto[];
}

export type CreateTweetDto = Pick<
  TweetDto,
  "userId" | "tweetType" | "parentId" | "content" | "imageUrl"
>;

export type UpdateTweetDto = Pick<
  TweetDto,
  "userId" | "content" | "imageUrl"
> & {
  tweetId: string;
};

export type ActionsTweetDto = Pick<UpdateTweetDto, "userId" | "tweetId">; //Remove and Like

export type RetweetDto = Pick<UpdateTweetDto, "userId" | "tweetId"> & {
  comment?: string;
};
