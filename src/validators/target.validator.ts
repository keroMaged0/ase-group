import { body, param, query } from 'express-validator';
import { validator } from '../middlewares/validator.middleware';

const getPagination = [
  query('created_at_from').optional().isISO8601().toDate(),
  query('created_at_to').optional().isISO8601().toDate(),
  query('employee_id').optional().isUUID(),
  query('product_id').optional().isUUID(),
  query('status').optional().isIn(['In Progress', 'Completed', 'Expired']),
  query('target_type').optional().isIn(['Monthly', 'Quarterly']),
];

const createTargetValidator = [
  body('employee_id').isString().withMessage('Employee id must be a string'),
  body('target_type')
    .isIn(['Monthly', 'Quarterly'])
    .withMessage('Target type must be either Monthly or Quarterly'),
  body('product_id').isUUID().withMessage('Product id must be a valid UUID'),
  body('target_quantity').isInt().withMessage('Target quantity must be an integer'),
  body('target_amount').isDecimal().withMessage('Target amount must be a decimal'),
  body('start_date').isDate().withMessage('Start date must be a date'),
  body('status')
    .optional()
    .isIn(['In Progress', 'Completed', 'Expired'])
    .withMessage('Status must be either active or inactive'),
  validator,
];

const updateTargetValidator = [
  param('target_id').isUUID().withMessage('Target id must be a valid UUID'),

  body('achieved_quantity').isInt().withMessage('Achieved quantity must be an integer').optional(),
  body('achieved_amount').isDecimal().withMessage('Achieved amount must be a decimal').optional(),
  body('status')
    .optional()
    .isIn(['In Progress', 'Completed', 'Expired'])
    .withMessage('Status must be either active or inactive')
    .optional(),
  body('product_id').isUUID().withMessage('Product id must be a valid UUID').optional(),
  body('target_quantity').isInt().withMessage('Target quantity must be an integer').optional(),
  body('target_amount').isDecimal().withMessage('Target amount must be a decimal').optional(),

  validator,
];

const paramTargetValidator = [
  param('target_id').isUUID().withMessage('Target id must be a valid UUID'),

  validator,
];

export { createTargetValidator, updateTargetValidator, paramTargetValidator, getPagination };
