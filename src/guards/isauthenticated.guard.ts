import { RequestHandler } from 'express';

import { Errors } from '../errors';
import { IjwtPayload } from '../types/jwt-payload';

export const isauthenticated: RequestHandler = async (req, res, next) => {
  const loggedUser = req.loggedUser as IjwtPayload;
  if (!loggedUser?.id) return next(new Errors.Unauthenticated());
  next();
};
