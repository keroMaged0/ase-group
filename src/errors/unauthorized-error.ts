import { Custom } from './custom-error';
import { ErrCodes } from '../types/error-code';
import { ErrorResponse } from '../types/responses';

export class Unauthorized extends Custom {
  statusCode: number = 403;
  message: string;
  constructor(
    { en, ar }: { en: string; ar: string } = ErrCodes.UNAUTHORIZED,
    lang: 'en' | 'ar' = 'en',
  ) {
    super({ en, ar }, lang);
    this.message = lang === 'en' ? en : ar;
    Object.setPrototypeOf(this, Unauthorized.prototype);
  }
  serializeError(): ErrorResponse {
    return { success: false, message: this.message, data: {} };
  }
}
