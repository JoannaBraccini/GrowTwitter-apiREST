export interface SignupDto {
  name: string;
  email: string;
  username: string;
  password: string;
  bio?: string;
  avatarUrl: string | "https://www.svgrepo.com/show/395881/bird.svg";
}

export interface CreatedUserDto {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string;
  createdAt: Date;
}

export interface LoginDto {
  email?: string;
  username?: string;
  password: string;
}
