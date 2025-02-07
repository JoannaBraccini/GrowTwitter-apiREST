import { TweetDto } from "./tweet.dto";
export interface UserDto {
  id: string;
  name: string;
  email?: string;
  username: string;
  followers?: UserBaseDto[];
  following?: UserBaseDto[];
  tweets?: TweetDto[];
}

export interface UserUpdateDto {
  id: string;
  userId: string;
  name?: string;
  username?: string;
  oldPassword?: string;
  newPassword?: string;
}

export type UserBaseDto = Pick<UserDto, "id" | "name" | "username">;
export type ActionUserDto = Pick<UserUpdateDto, "id" | "userId">;
