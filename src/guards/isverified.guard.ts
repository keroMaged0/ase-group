/* eslint-disable indent */
import { RequestHandler } from 'express';

import { Errors } from '../errors';
import { ErrCodes } from '../types/error-code';
import { IjwtPayload } from '../types/jwt-payload';

export const isverified: RequestHandler = async (req, res, next) => {
  const loggedUser = (req as any).loggedUser as IjwtPayload;
  // if (!loggedUser.isVerified) return next(new Errors.Unauthorized(ErrCodes.VERIFY_YOUR_ACCOUNT));
  next();
};
