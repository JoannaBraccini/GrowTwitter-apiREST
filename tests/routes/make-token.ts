import { randomUUID } from "crypto";
import { JWT } from "../../src/utils/jwt";
import { AuthUser } from "../../src/types/user";

export function makeToken(params?: Partial<AuthUser>) {
  const payload: AuthUser = {
    id: randomUUID(),
    name: params?.name || "Nome do Usuário",
    username: params?.username || "username",
    email: params?.email || "email@email.com",
  };

  const jwt = new JWT();
  const token = jwt.generateToken(payload);

  return token;
}
