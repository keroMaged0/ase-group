import { Custom } from './custom-error';
import { ErrCodes } from '../types/error-code';
import { ErrorResponse } from '../types/responses';

export class DatabaseConnection extends Custom {
  statusCode = 500;
  message: string;
  constructor(
    { en, ar }: { en: string; ar: string } = ErrCodes.BAD_REQUEST,
    lang: 'en' | 'ar' = 'en',
  ) {
    super({ en, ar }, lang);
    this.message = lang === 'en' ? en : ar;
    Object.setPrototypeOf(this, DatabaseConnection.prototype);
  }

  serializeError(): ErrorResponse {
    return { success: false, message: this.message, data: {} };
  }
}
