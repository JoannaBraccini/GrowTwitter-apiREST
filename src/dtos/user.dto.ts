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
  email: string;
  username: string;
  followers?: FollowerDto[];
  tweets?: TweetDto[];
}

export interface FollowerDto {
  id: string;
  user: {
    userId: string;
    username: string;
  };
}
