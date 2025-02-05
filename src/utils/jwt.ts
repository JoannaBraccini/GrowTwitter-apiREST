import jwt from "jsonwebtoken";
import { AuthUser } from "../types/user";
import "dotenv/config";
import {StringValue} from 'ms'

export class JWT {
  public generateToken(data: AuthUser): string {
    if (!process.env.JWT_SECRET) throw new Error("Secret not defined");

    const token = jwt.sign(data, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN as StringValue
    });
    return token;
  }
  public verifyToken(token: string): AuthUser | null {
    try {
      if (!process.env.JWT_SECRET) throw new Error("Secret not defined");

      const data = jwt.verify(token, process.env.JWT_SECRET) as AuthUser;
      return data;
    } catch {
      return null;
    }
  }
}
