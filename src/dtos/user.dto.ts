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
  // followers?: number;
  // following?: number;
}
export interface UserUpdateDto {
  id: string;
  userId: string;
  name?: string;
  username?: string;
  oldPassword?: string;
  newPassword?: string;
}

export type ActionUserDto = Pick<UserUpdateDto, "id" | "userId">;
