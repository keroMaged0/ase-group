import { body, param, query } from 'express-validator';
import { Middlewares } from '../middlewares';

export const create = [
  body('title').isString().trim().isLength({ min: 1 }),
  body('description').isString().optional(),
  body('punishment_type').isString().trim().isLength({ min: 1 }),
  body('deduction').optional().isFloat({ min: 0 }),
  Middlewares.validator,
];

export const update = [
  param('punishmentId').isUUID('4'),
  body('title').optional().isString().trim().isLength({ min: 1 }),
  body('description').optional().isString(),
  body('punishment_type').optional().isString().trim().isLength({ min: 1 }),
  body('deduction').optional().isFloat({ min: 0 }),
  Middlewares.validator,
];

export const getPagination = [
  query('title').optional().isString().trim().isLength({ min: 1 }),
  query('punishment_type').optional().isString().trim().isLength({ min: 1 }),
  query('created_at_from').optional().isISO8601().toDate(),
  query('created_at_to').optional().isISO8601().toDate(),
  query('created_by').optional().isUUID('4'),
  query('limit').optional().isInt({ min: 1 }).bail().toInt(),
  query('page').optional().isInt({ min: 1 }).bail().toInt(),
  Middlewares.validator,
];

export const punishmentParam = [param('punishmentId').isUUID('4'), Middlewares.validator];
