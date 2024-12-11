import { Request, Response, NextFunction, RequestHandler } from 'express';

import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { Article } from '../../models/article.model';
import { ErrCodes } from '../../types/error-code';
import { SuccessResponse } from '../../types/responses';
import { ArticleComment } from '../../models/article-comment.model';
import { ArticleAction } from '../../models/article-action.model';
import { env } from '../../config/env';
import { buildArticlesQuery } from './get-articles.controller';
interface IResponseData {
  id: string;
  // user:{id:string, name:string};
  picture: string | null;
  title: string;
  description: string;
  created_at: Date;
  specializations: { id: string; title: string }[];
}

export const getOneArticle: RequestHandler<{ id: string }, SuccessResponse<IResponseData>> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;
  console.log(id);
  try {
    const article = await buildArticlesQuery(req.loggedUser.id, { articleId: id }).getRawOne();
    if (!article) return next(new Errors.NotFound(ErrCodes.NOT_FOUND));
    res.json({
      success: true,
      message: 'Articles fetched successfully',
      data: article,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
