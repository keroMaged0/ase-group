import { body, param } from 'express-validator';

import { Middlewares } from '../middlewares';

export const createRewardValidator = [
  body('title').isString().isLength({ min: 3, max: 255 }),
  body('amount').isInt({ min: 1 }),
  Middlewares.validator,
];

export const giveRewardValidator = [
  body('rewardId').isUUID('4'),
  body('target_user').isUUID('4'),
  body('description').isString().isLength({ min: 3, max: 255 }),
  Middlewares.validator,
];

export const idValidator = [param('id').isUUID('4'), Middlewares.validator];
