import { body, param, query } from 'express-validator';
import { Middlewares } from '../middlewares';
import { CommissionRequestStatus, CollectType } from '../models/commission-request.model';

export const create = [
  body('commission_id').isUUID('4'),
  body('target_user_id').isUUID('4'),
  body('status').isIn([CommissionRequestStatus.Done, CommissionRequestStatus.NotDone]),
  body('collect_type').isIn([CollectType.Full, CollectType.Part]),
  body('collected_at').optional().isISO8601(),
  Middlewares.validator,
];

export const update = [
  param('id').isUUID('4'),
  body('status').optional().isIn([CommissionRequestStatus.Done, CommissionRequestStatus.NotDone]),
  body('collect_type').optional().isIn([CollectType.Full, CollectType.Part]),
  body('collected_at').optional().isISO8601(),
  Middlewares.validator,
];

export const getPagination = [
  query('commission_id').optional().isUUID('4'),
  query('target_user_id').optional().isUUID('4'),
  query('status').optional().isIn([CommissionRequestStatus.Done, CommissionRequestStatus.NotDone]),
  query('collect_type').optional().isIn([CollectType.Full, CollectType.Part]),
  query('created_at_from').optional().isISO8601().toDate(),
  query('created_at_to').optional().isISO8601().toDate(),
  query('limit').optional().isInt({ min: 1 }).bail().toInt(),
  query('page').optional().isInt({ min: 1 }).bail().toInt(),
  Middlewares.validator,
];

export const commissionRequestParam = [
  param('id').isUUID('4'),
  Middlewares.validator,
];
