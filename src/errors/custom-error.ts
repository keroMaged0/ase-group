import { ErrorResponse, ValidationErrorResponse } from '../types/responses';

export abstract class Custom extends Error {
  abstract statusCode: number;
  abstract message: string;
  constructor({ en, ar }: { en: string; ar: string }, lang: 'en' | 'ar' = 'en') {
    super(lang === 'en' ? en : ar);
    Object.setPrototypeOf(this, Custom.prototype);
  }

  abstract serializeError(): ErrorResponse | ValidationErrorResponse;
}
