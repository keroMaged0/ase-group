import { body, param } from 'express-validator';
import { validator } from '../middlewares/validator.middleware';

const createMedicineCategoryValidator = [
  body('name').isString().withMessage('name must be a string'),
  body('parent_id').isUUID().withMessage('parent_id must be a valid UUID').optional(),
  validator,
];

const updateMedicineCategoryValidator = [
  param('medicine_category_id').isUUID().withMessage('Medicine category id must be a valid UUID'),

  body('name').isString().withMessage('name must be a string').optional(),
  body('parent_id').isUUID().withMessage('parent_id must be a valid UUID').optional(),

  validator,
];

const paramMedicineCategoryValidator = [
  param('medicine_category_id').isUUID().withMessage('Medicine category id must be a valid UUID'),

  validator,
];

export {
  createMedicineCategoryValidator,
  updateMedicineCategoryValidator,
  paramMedicineCategoryValidator,
};
