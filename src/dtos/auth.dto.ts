export interface SignupDto {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface CreatedUserDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface LoginDto {
  email?: string;
  username?: string;
  password: string;
}
