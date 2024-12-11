import { body, param } from 'express-validator';
import { Middlewares } from '../middlewares';

export const update = [
  body('saturday.start').optional().isString(),
  body('saturday.end').optional().isString(),

  body('sunday.start').optional().isString(),
  body('sunday.end').optional().isString(),

  body('monday.start').optional().isString(),
  body('monday.end').optional().isString(),

  body('tuesday.start').optional().isString(),
  body('tuesday.end').optional().isString(),

  body('wednesday.start').optional().isString(),
  body('wednesday.end').optional().isString(),

  body('thursday.start').optional().isString(),
  body('thursday.end').optional().isString(),

  body('friday.start').optional().isString(),
  body('friday.end').optional().isString(),
  Middlewares.validator,
];
