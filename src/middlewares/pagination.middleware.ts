import { RequestHandler } from 'express';

export const pagination: RequestHandler = async (req, res, next) => {
  const limit = +(req.query.limit || 200);
  const page = +(req.query.page || 1);
  const skip = (page - 1) * limit;

  (req as any).pagination = { limit, skip, page, filter: {} };
  next();
};
