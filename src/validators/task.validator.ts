import { body, param } from 'express-validator';
import { Middlewares } from '../middlewares';

export const createTaskValidator = [
  body('description').isString().trim().isLength({ min: 1 }),
  body('start_at').isISO8601().toDate(),
  body('end_at')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (value < req.body.start_at) {
        throw new Error();
      }
      return true;
    }),
  body('target_user').isUUID('4'),
  Middlewares.validator,
];

export const updateTaskValidator = [
  param('id').isUUID('4'),
  body('description').optional().isString().trim().isLength({ min: 1 }),
  body('start_at').optional().isISO8601().toDate(),
  body('end_at')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (value < req.body.start_at) {
        throw new Error();
      }
      return true;
    }),
  body().custom((value, { req }) => {
    if (!req.body.description && !req.body.start_at && !req.body.end_at) {
      throw new Error();
    }
    return true;
  }),
  Middlewares.validator,
];

export const idValidator = [param('id').isUUID('4'), Middlewares.validator];

export const updateStatusValidator = [
  param('id').isUUID('4'),
  body('action').isIn(['accept', 'reject', 'complete']).custom((value, { req }) => {
    if (value === 'reject' && !req.body.rejection_reason) {
      throw new Error();
    }
    return true;
  }),
  body('rejection_reason')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .custom((value, { req }) => {
      if (req.body.action !== 'reject') {
        throw new Error();
      }
      return true;
    }),
  Middlewares.validator,
];
