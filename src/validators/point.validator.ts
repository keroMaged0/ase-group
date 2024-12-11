import { body, param, query } from 'express-validator';
import { validator } from '../middlewares/validator.middleware';

const getPagination = [
  query('name').optional().isString(),
  query('created_at_from').optional().isISO8601().toDate(),
  query('created_at_to').optional().isISO8601().toDate(),
  query('provider_id').optional().isUUID(),
];

const createPointValidator = [
  body('product_id').optional().isUUID().withMessage('productId must be a UUID'),
  body('name').isString().withMessage('name must be a string'),
  body('description').optional().isString().withMessage('description must be a string'),
  body('points').isInt().withMessage('points must be an integer'),
  body('amount').optional().isDecimal().withMessage('amount must be a decimal'),

  validator,
];

const updatePointValidator = [
  param('point_id').isUUID().withMessage('pointId must be a UUID'),

  body('name').optional().isString().withMessage('name must be a string'),
  body('description').optional().isString().withMessage('description must be a string'),
  body('points').optional().isInt().withMessage('points must be an integer'),
  body('amount').optional().isDecimal().withMessage('amount must be a decimal'),

  validator,
];

const paramPointValidator = [
  param('point_id').isUUID().withMessage('pointId must be a UUID'),

  validator,
];

export { createPointValidator, updatePointValidator, paramPointValidator, getPagination };
