import { body, param, query } from 'express-validator';
import { validator } from '../middlewares/validator.middleware';
import { PointsRequestType } from '../models/point-request.model';

const getPagination = [
  query('title').optional().isString(),
  query('request_type').optional().isIn(Object.values(PointsRequestType)),
  query('created_at_from').optional().isISO8601().toDate(),
  query('created_at_to').optional().isISO8601().toDate(),
  query('provider_id').optional().isString(),
  query('target_user').optional().isString(),
];

const createPointReqValidator = [
  body('point').isUUID().withMessage('Point id must be a UUID'),
  body('target_user').isUUID().withMessage('Target user id must be a UUID'),
  body('title').isString().withMessage('Title must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),

  validator,
];

const updatePointReqValidator = [
  param('point_request_id').isUUID().withMessage('Point request id must be a UUID'),
  body('title').optional().isString().withMessage('Title must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status').optional().isInt().withMessage('Status must be an integer'),

  validator,
];

const paramPointReqValidator = [
  param('point_request_id').isUUID().withMessage('pointId must be a UUID'),

  validator,
];

export { createPointReqValidator, updatePointReqValidator, paramPointReqValidator, getPagination };
