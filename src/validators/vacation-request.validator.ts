import { body, param, query } from 'express-validator';
import { VacationRequestStatus, VacationRequestType } from '../models/vacation-request.model';
import { validator } from '../middlewares/validator.middleware';

export const gift = [
  body('vacation').isUUID('4'),
  body('target_user').isUUID('4'),
  body('start_date').isISO8601().bail().toDate(),
  body('end_date').isISO8601().bail().toDate(),
  body('real_vacation_days').isInt({ min: 1 }),
  validator,
];

export const request = [
  body('vacation').isUUID('4'),
  body('start_date').isISO8601().bail().toDate(),
  body('end_date').isISO8601().bail().toDate(),
  body('real_vacation_days').isInt({ min: 1 }),
  validator,
];

export const update = [
  param('vacationRequestId').isUUID('4'),
  body('status')
    .isIn(['approved', 'rejected'])
    .bail()
    .custom((val, { req }) => {
      if (val === 'rejected' && !req.body.rejection_reason) throw new Error();
      return true;
    })
    .customSanitizer((val) => VacationRequestStatus[val]),
  body('rejection_reason').optional().isString(),
  validator,
];

export const vacationRequestParam = [param('vacationRequestId').isUUID('4'), validator];

export const get = [
  query('limit').optional().isInt({ min: 1 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('status')
    .optional()
    .isString()
    .isIn(['pending', 'approved', 'rejected'])
    .bail()
    .customSanitizer((val) => VacationRequestStatus[val]),
  query('type')
    .optional()
    .isString()
    .isIn(['order', 'gift'])
    .bail()
    .customSanitizer((val) => VacationRequestType[val]),
  query('created_at_from').optional().isISO8601().toDate(),
  query('created_at_to').optional().isISO8601().toDate(),
  query('created_by').optional().isUUID('4'),
  query('target_user').optional().isUUID('4'),
  query('vacation').optional().isUUID('4'),
  validator,
];

export const retreive = [
  body('vacation').isUUID('4'),
  body('user_id').isUUID('4'),
  body('date').isISO8601().bail().toDate(),
  validator,
];
