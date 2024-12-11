import { body, param, query } from 'express-validator';
import { Middlewares } from '../middlewares';
import { CommissionType } from '../models/commission.model';

export const create = [
  body('title').isString().trim().isLength({ min: 1 }),
  body('description').isString(),
  body('commission_type')
    .isIn(['typeOne', 'typeTwo', 'typeThree'])
    .customSanitizer((val) => {
      if (val === 'type1') return CommissionType.TypeOne;
      else if (val === 'type2') return CommissionType.TypeTwo;
      else return CommissionType.TypeThree;
    }),
  body('percentage').isFloat({ min: 0, max: 100 }), 
  body('collection_duration_days').isInt({ min: 1 }), 
  Middlewares.validator,
];

export const update = [
  param('commissionId').isUUID('4'),
  body('title').optional().isString().trim().isLength({ min: 1 }),
  body('description').optional().isString(),
  body('commission_type')
    .optional()
    .isIn(['typeOne', 'typeTwo', 'typeThree'])
    .customSanitizer((val) => {
      if (val === 'typeOne') return CommissionType.TypeOne;
      else if (val === 'typeTwo') return CommissionType.TypeTwo;
      else return CommissionType.TypeThree;
    }),
  body('percentage').optional().isFloat({ min: 0, max: 100 }),
  body('collection_duration_days').optional().isInt({ min: 1 }),
  Middlewares.validator,
];

export const getPagination = [
  query('title').optional().isString().trim().isLength({ min: 1 }),
  query('commission_type')
    .optional()
    .isIn(['typeOne', 'typeTwo', 'typeThree'])
    .bail()
    .customSanitizer((val) => {
      if (val === 'typeOne') return CommissionType.TypeOne;
      else if (val === 'typeTwo') return CommissionType.TypeTwo;
      else return CommissionType.TypeThree;
    }),
  query('created_at_from').optional().isISO8601().toDate(),
  query('created_at_to').optional().isISO8601().toDate(),
  query('created_by').optional().isUUID('4'),
  query('limit').optional().isInt({ min: 1 }).bail().toInt(),
  query('page').optional().isInt({ min: 1 }).bail().toInt(),
  Middlewares.validator,
];

export const commissionParam = [param('commissionId').isUUID('4'), Middlewares.validator];
