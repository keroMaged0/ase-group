import { body, param } from 'express-validator';

import { Middlewares } from '../middlewares';

export const createSalaryValidator = [
  body('target_user').isUUID('4'),
  body('amount').isFloat({ min: 1 }),
  body('sales_ratio').optional().isFloat({ min: 0, max: 1 }),
  Middlewares.validator,
];

export const updateSalaryValidator = [
  param('id').isUUID('4'),
  body('amount').optional().isFloat({ min: 1 }),
  body('sales_ratio').optional().isFloat({ min: 0, max: 1 }),
  body().custom((val, { req }) => {
    if (!req.body.amount && !req.body.sales_ratio) throw new Error();
    return true;
  }),
  Middlewares.validator,
];

export const addSalaryToHistory = [
  body('target_user').isUUID('4'),
  body('real_salary').optional().isFloat({min:1}),
  body('commissions').optional().isFloat({min:1}),
  Middlewares.validator
]

export const updateSalaryHistory = [
  param('id').isUUID('4'),
  body('real_salary').optional().isFloat({min:1}),
  body('commissions').optional().isFloat({min:1}),
  Middlewares.validator
]


export const idValidator = [param('id').isUUID('4'), Middlewares.validator];
