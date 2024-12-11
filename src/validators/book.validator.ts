import { body, param } from 'express-validator';
import { Middlewares } from '../middlewares';

export const create = [
  body('title').isString().isLength({ max: 255 }),

  body('fileUrl').isString(),

  body('category_id').isUUID(),

  Middlewares.validator,
];

export const update = [
  param('id').isUUID(),

  body('title').optional().isString().isLength({ max: 255 }),

  body('fileUrl').optional().isString(),

  body('category_id').optional().isUUID(),

  Middlewares.validator,
];
