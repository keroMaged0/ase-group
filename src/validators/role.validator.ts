import { body, param } from 'express-validator';

import { validator } from '../middlewares/validator.middleware';

const createRoleValidator = [
  body('key').isString().withMessage('Key must be a string'),
  body('description').isString().withMessage('Description must be a string'),
  body('permissions').isArray().withMessage('Permissions must be an array').optional(),
  validator,
];

const updateRoleValidator = [
  param('role_id').isUUID().withMessage('roleId must be a UUID'),
  body('description').isString().withMessage('Description must be a string').optional(),
  body('permissions').isArray().withMessage('Permissions must be an array').optional(),
  body().custom((value, { req }) => {
    const { description, permissions } = req.body;
    if (!description && (!permissions || !permissions.length)) {
      throw new Error('At least one field (description or permissions) is required');
    }
    return true;
  }),
  validator,
];

const paramRoleValidator = [
  param('role_id').isUUID().withMessage('roleId must be a UUID'),
  validator,
];

export { createRoleValidator, updateRoleValidator, paramRoleValidator };
