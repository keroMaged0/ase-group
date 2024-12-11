import crypto from 'crypto';

const hashCode = (code: string) => crypto.createHash('sha256').update(code).digest('hex');

const generateCode = (length: number = 3) =>
  new Promise<string>((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString('hex'));
      }
    });
  });

export const Crypto = { hashCode, generateCode };
