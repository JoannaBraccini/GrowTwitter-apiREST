import { randomUUID } from "crypto";
import { JWT } from "../../src/utils/jwt";
import { AuthUser } from "../../src/types/user";

export function makeToken(params?: Partial<AuthUser>) {
  const payload: AuthUser = {
    id: randomUUID(),
    name: params?.name || "Test Name",
    username: params?.username || "username",
    email: params?.email || "test@email.com",
  };

  const jwt = new JWT();
  const token = jwt.generateToken(payload);

  return token;
}
