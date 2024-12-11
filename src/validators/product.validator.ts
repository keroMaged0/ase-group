import { body, param } from 'express-validator';
import { validator } from '../middlewares/validator.middleware';

const createProductValidator = [
  body('medicine_category_id').isUUID().withMessage('medicine_category_id must be a valid UUID'),
  body('name').isString().withMessage('name must be a string'),
  body('description').isString().withMessage('description must be a string').optional(),
  body('price').isFloat().withMessage('price must be a valid float'),
  body('quantity').isInt({ gt: 0 }).withMessage('quantity must be a positive integer').optional(),
  body('scientific_name').isString().withMessage('scientific_name must be a string').optional(),
  body('caliber').isString().withMessage('caliber must be a string').optional(),
  validator,
];

const updateProductValidator = [
  param('product_id').isUUID().withMessage('Product id must be a valid UUID').optional(),
  body('medicine_category_id')
    .isUUID()
    .withMessage('medicine_category_id must be a valid UUID')
    .optional(),
  body('name').isString().withMessage('name must be a string').optional(),
  body('description').isString().withMessage('description must be a string').optional(),
  body('price').isFloat().withMessage('price must be a valid float').optional(),
  body('scientific_name').isString().withMessage('scientific_name must be a string').optional(),
  body('caliber').isString().withMessage('caliber must be a string').optional(),

  validator,
];

const updateQuantityValidator = [
  param('product_id').isUUID().withMessage('Product id must be a valid UUID'),
  body('quantity').isInt({ gt: 0 }).withMessage('quantity must be a positive integer'),

  validator,
];

const paramProductValidator = [
  param('product_id').isUUID().withMessage('Product id must be a valid UUID'),
  validator,
];

export {
  createProductValidator,
  updateProductValidator,
  paramProductValidator,
  updateQuantityValidator,
};
