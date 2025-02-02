declare namespace Express {
  export interface Request {
    AuthUser: {
      id: string;
      name: string;
      username: string;
      email: string;
    };
  }
}
