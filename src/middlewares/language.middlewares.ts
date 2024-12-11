import { RequestHandler } from 'express';

export const language: RequestHandler = async (req, res, next) => {
  req.language = req.headers['accept-language'] === 'ar' ? 'ar' : 'en';
  next();
};
