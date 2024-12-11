/* eslint-disable no-unused-vars */
import { ValidationError as vError } from 'express-validator';

import { Custom } from './custom-error';
import { ErrCodes } from '../types/error-code';
import { ValidationErrorResponse } from '../types/responses';

export class Validation extends Custom {
  statusCode = 422;
  message: string;
  // eslint-disable-next-line no-unused-vars
  constructor(public error: vError[]) {
    super(ErrCodes.VALIDATION_ERROR);
    this.message = 'VALIDATION_ERROR';
    Object.setPrototypeOf(this, Validation.prototype);
  }
  serializeError(): ValidationErrorResponse {
    return {
      success: false,
      message: this.message,
      data: {},
      errors: this.error.map((el) => {
        if (el.type === 'field') return { message: el.msg, field: el.path };
        return { message: el.msg };
      }),
    };
  }
}
