import { TweetType } from "@prisma/client";
import { UserBaseDto } from "./user.dto";

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
  likes?: { id: string; userId: string }[];
  retweets?: { id: string; userId: string }[];
  replies?: TweetDto[];
}

//para like e retweet
export interface CreateEngagementDto {
  tweetId: string; //id do tweet pai
  userId: string;
}
