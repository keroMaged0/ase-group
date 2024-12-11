import { body, param } from 'express-validator';
import { Middlewares } from '../middlewares';

export const create = [
  body('title').isString().isLength({ max: 100 }),
  body('country_id').isUUID(),
  Middlewares.validator,
];

export const cityParam = [param('city_id').isUUID(), Middlewares.validator];
export const countryParam = [param('country_id').isUUID(), Middlewares.validator];
