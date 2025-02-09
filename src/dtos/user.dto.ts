import { TweetDto } from "./tweet.dto";
export interface UserDto {
  id: string;
  name: string;
  email?: string;
  username: string;
  bio?: string;
  avatarUrl: string;
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
  bio?: string;
  avatarUrl?: string;
}

export type UserBaseDto = Pick<
  UserDto,
  "id" | "name" | "username" | "avatarUrl"
>;
export type ActionUserDto = Pick<UserUpdateDto, "id" | "userId">;
