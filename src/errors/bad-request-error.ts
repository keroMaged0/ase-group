import { Custom } from './custom-error';
import { ErrCodes } from '../types/error-code';
import { ErrorResponse } from '../types/responses';

export class BadRequest extends Custom {
  statusCode: number = 400;
  message: string;
  constructor(
    { en, ar }: { en: string; ar: string } = ErrCodes.BAD_REQUEST,
    lang: 'en' | 'ar' = 'en',
  ) {
    super({ en, ar }, lang);
    this.message = lang === 'en' ? en : ar;
    Object.setPrototypeOf(this, BadRequest.prototype);
  }
  serializeError(): ErrorResponse {
    return { success: false, message: this.message, data: {} };
  }
}
