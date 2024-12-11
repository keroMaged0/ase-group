import { hash, compare } from 'bcryptjs';

const hashPwd = async (pwd: string, salt: string | number, paper?: string): Promise<string> => {
  const hashedPwd = await hash(pwd + paper, salt);
  return hashedPwd;
};

const comparePwd = async (pwd: string, hashed: string, paper?: string): Promise<boolean> => {
  const isMatch = await compare(pwd + paper, hashed);
  return isMatch;
};

export const Bcrypt = { hashPwd, comparePwd };
