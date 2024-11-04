import { TweetDto } from "./tweet.dto";
export interface CreateUserDto {
  name: string;
  email: string;
  username: string;
  password: string;
}

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
