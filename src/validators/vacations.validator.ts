import { body, param, query } from 'express-validator';
import { Middlewares } from '../middlewares';
import { DurationType } from '../models/vacation.model';

export const create = [
  body('title').isString().trim().isLength({ min: 1 }),
  body('description').isString(),
  body('vacation_type').isString().trim().isLength({ min: 1 }),
  body('duration_type')
    .isIn(['monthly', 'yearly'])
    .customSanitizer((val) => {
      if (val === 'monthly') return DurationType.monthly;
      else return DurationType.yearly;
    }),
  body('max_days').isInt({ min: 1 }),
  Middlewares.validator,
];

export const update = [
  param('vacationId').isUUID('4'),
  body('title').optional().isString().trim().isLength({ min: 1 }),
  body('description').optional().isString(),
  body('vacation_type').optional().isString().trim().isLength({ min: 1 }),
  body('duration_type')
    .optional()
    .isIn(['monthly', 'yearly'])
    .customSanitizer((val) => {
      if (val === 'monthly') return DurationType.monthly;
      else return DurationType.yearly;
    }),
  body('max_days').optional().isInt({ min: 1 }),
  Middlewares.validator,
];

export const getPagination = [
  query('title').optional().isString().trim().isLength({ min: 1 }),
  query('vacation_type').optional().isString().trim().isLength({ min: 1 }),
  query('duration_type')
    .optional()
    .isIn(['monthly', 'yearly'])
    .bail()
    .customSanitizer((val) => {
      if (val === 'monthly') return DurationType.monthly;
      else return DurationType.yearly;
    }),
  query('max_days_from').optional().isInt({ min: 1 }).bail().toInt(),
  query('max_days_to').optional().isInt({ min: 1 }).bail().toInt(),
  query('created_at_from').optional().isISO8601().toDate(),
  query('created_at_to').optional().isISO8601().toDate(),
  query('created_by').optional().isUUID('4'),
  query('limit').optional().isInt({ min: 1 }).bail().toInt(),
  query('page').optional().isInt({ min: 1 }).bail().toInt(),
  Middlewares.validator,
];

export const vacationParam = [param('vacationId').isUUID('4'), Middlewares.validator];
