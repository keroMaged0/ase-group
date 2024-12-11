import { RequestHandler } from 'express';

import { Errors } from '../errors';
import { ErrCodes } from '../types/error-code';

export const routeNotFound: RequestHandler = async (req, res, next) => {
  return next(new Errors.NotFound(ErrCodes.ROUTE_NOT_FOUND));
};
