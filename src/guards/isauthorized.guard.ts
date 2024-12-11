/* eslint-disable indent */
import { RequestHandler } from 'express';

import { Unauthorized } from '../errors/unauthorized-error';

export const isauthorized = (permission: string) => <RequestHandler>(async (req, res, next) => {
    if (!req.loggedUser?.permissions.includes(permission)) return next(new Unauthorized());
    next();
  });
