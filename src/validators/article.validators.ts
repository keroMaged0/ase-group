import { body, param, query } from 'express-validator';

import { Middlewares } from '../middlewares';

export const createArticleValidators = [
  body('title').isString().trim().isLength({ min: 1 }),
  body('description').optional().isString(),
  body('specializations').isArray().isLength({ min: 1 }),
  body('specializations.*').isUUID('4'),
  Middlewares.validator,
];

export const updateArticleValidators = [
  param('id').isUUID('4'),
  body('title').optional().isString().trim().isLength({ min: 1 }),
  body('description').optional().isString(),
  body('specializations').optional().isArray().isLength({ min: 1 }),
  body('specializations.*').isUUID('4'),
  body().custom((val, {req})=>{
    if (!req.body.title && !req.body.description && !req.body.specializations?.length) {
      throw new Error();
    }
    return true;
  }),
  Middlewares.validator,
];

export const getArticlesValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('date').optional().isISO8601(),
  query('specializations')
    .optional()
    .isString()
    .custom((val, { req }) => {
      const ids = val.split(',');
      const v4 = new RegExp(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      );
      if (ids.some((id) => !id.match(v4))) {
        throw new Error();
      }
      return true;
    }),
  Middlewares.validator,
];

export const deleteArticleValidators = [param('id').isUUID('4'), Middlewares.validator];

export const createCommentValidators = [
  body('articleId').isUUID('4'),
  body('parentId').optional().isUUID('4'),
  body('content').isString(),
  Middlewares.validator,
];

export const updateCommentValidators = [
  param('id').isUUID('4'),
  body('content').isString(),
  Middlewares.validator,
];

export const deleteCommentValidators = [param('id').isUUID('4'), Middlewares.validator];

export const checkIdValidator = [param('id').isUUID('4'), Middlewares.validator];
