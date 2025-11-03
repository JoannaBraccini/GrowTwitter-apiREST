export interface UserDto {
  id: string;
  name: string;
  email?: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  followers?: UserBaseDto[];
  following?: UserBaseDto[];
}

export type UserUpdateDto = Partial<
  Pick<UserDto, "name" | "username" | "bio" | "avatarUrl" | "coverUrl">
> & {
  id: string;
  userId: string;
  oldPassword?: string;
  newPassword?: string;
};

export type UserBaseDto = Pick<
  UserDto,
  "id" | "name" | "username" | "avatarUrl"
>;
export type ActionUserDto = Pick<UserUpdateDto, "id" | "userId">;
