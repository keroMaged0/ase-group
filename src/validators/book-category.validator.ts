import { body, param } from 'express-validator';
import { Middlewares } from '../middlewares';

export const create = [body('name').isString().isLength({ max: 50 }), Middlewares.validator];

export const update = [
  param('id').isUUID(),
  body('name').optional().isString().isLength({ max: 50 }),
  Middlewares.validator,
];
