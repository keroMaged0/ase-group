import { Custom } from './custom-error';
import { ErrCodes } from '../types/error-code';
import { ErrorResponse } from '../types/responses';

export class Unauthenticated extends Custom {
  statusCode: number = 401;
  message: string;
  constructor(
    { en, ar }: { en: string; ar: string } = ErrCodes.UNAUTHENTICATED,
    lang: 'en' | 'ar' = 'en',
  ) {
    super({ en, ar }, lang);
    this.message = lang === 'en' ? en : ar;
    Object.setPrototypeOf(this, Unauthenticated.prototype);
  }
  serializeError(): ErrorResponse {
    return { success: false, message: this.message, data: {} };
  }
}
