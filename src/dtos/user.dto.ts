import { TweetDto } from "./tweet.dto";
//CreateUserDto->movido para auth.dto: signup
export interface UserDto {
  id: string;
  name: string;
  email?: string;
  username: string;
  followers?: UserBaseDto[];
  following?: UserBaseDto[];
  tweets?: TweetDto[];
}

export interface UserBaseDto {
  id: string;
  name: string;
  username: string;
}

export interface QueryFilterDto {
  name?: string;
  username?: string;
}
