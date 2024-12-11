import { Custom } from './custom-error';
import { ErrCodes } from '../types/error-code';
import { ErrorResponse } from '../types/responses';

export class NotAllowed extends Custom {
  statusCode: number = 406;
  message: string;
  constructor(
    { en, ar }: { en: string; ar: string } = ErrCodes.NOT_ALLOWED,
    lang: 'en' | 'ar' = 'en',
  ) {
    super({ en, ar }, lang);
    this.message = lang === 'en' ? en : ar;
    Object.setPrototypeOf(this, NotAllowed.prototype);
  }
  serializeError(): ErrorResponse {
    return { success: false, message: this.message, data: {} };
  }
}
