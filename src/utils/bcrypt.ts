import bcrypt from "bcrypt";

export class Bcrypt {
  public async generateHash(password: string): Promise<string> {
    //criar um hash com o número de salt indicado no env
    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
    return hash;
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    //verificar que a senha e o hash combinam
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  }
}
