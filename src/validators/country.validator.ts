import { body, param } from 'express-validator';
import { Middlewares } from '../middlewares';

export const create = [body('title').isString().isLength({ max: 100 }), Middlewares.validator];

export const remove = [param('id').isUUID(), Middlewares.validator];
