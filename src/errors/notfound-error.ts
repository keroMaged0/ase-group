import { Custom } from './custom-error';
import { ErrCodes } from '../types/error-code';
import { ErrorResponse } from '../types/responses';

export class NotFound extends Custom {
  statusCode: number = 404;
  message: string;
  constructor(
    { en, ar }: { en: string; ar: string } = ErrCodes.NOT_FOUND,
    lang: 'en' | 'ar' = 'en',
  ) {
    super({ en, ar }, lang);
    this.message = lang === 'en' ? en : ar;
    Object.setPrototypeOf(this, NotFound.prototype);
  }
  serializeError(): ErrorResponse {
    return { success: false, message: this.message, data: {} };
  }
}
