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
  user: UserBaseDto;
  type: TweetType;
  content: string;
  likes?: LikeDto[];
  retweets?: RetweetDto[];
  replies?: TweetDto[];
}

//ação base
interface CreateActionDto {
  tweedId: string;
  userId: string;
}
export interface CreateLikeDto extends CreateActionDto {}
export interface CreateRetweetDto extends CreateActionDto {}
interface ActionDto {
  id: string;
  userId: string;
}

export interface LikeDto extends ActionDto {}
export interface RetweetDto extends ActionDto {}
