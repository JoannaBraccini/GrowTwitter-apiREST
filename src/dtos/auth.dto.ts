export interface SignupDto {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  email?: string;
  username?: string;
  password: string;
}
