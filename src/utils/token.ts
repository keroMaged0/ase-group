import { sign, verify } from 'jsonwebtoken';
import { env } from '../config/env';

const generateAccessToken = (payload: any) =>
  sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

const generateRefreshToken = (payload: { id: string }) =>
  sign(payload, process.env.JWT_SECRET!, { expiresIn: '1y' });

const verifyToken = (token: string) => {
  try {
    const payload = verify(token, process.env.JWT_SECRET!);
    return payload;
  } catch (error) {
    return undefined;
  }
};

export const isValidToken = (token: string) => {
  try {
    verify(token, env.jwt.secret);
    return true;
  } catch (error) {
    return false;
  }
};

export const Tokens = { generateAccessToken, generateRefreshToken, verifyToken, isValidToken };
