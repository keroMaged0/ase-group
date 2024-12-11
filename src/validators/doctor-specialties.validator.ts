import { body, param } from 'express-validator';
import { validator } from '../middlewares/validator.middleware';

export const createDoctorSpecialtyValidator = [
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString().trim(),
  body('parent_id').optional().isUUID(),
  validator,
];

export const updateDoctorSpecialtiesValidator = [
  param('specialty_id').isUUID(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().isString(),
  validator,
];

export const doctorSpecialtiesParamValidator = [param('specialty_id').isUUID(), validator];
