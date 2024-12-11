import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { ArticleAction } from '../../models/article-action.model';
import { toggleAction } from './toggle-action';
import { dataSource } from '../../config/typeorm';
import { Article } from '../../models/article.model';
import { Errors } from '../../errors';

export const toggleArticleAction: RequestHandler<{ id: string }, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const recordId = req.params.id;
  const userId = req.loggedUser.id;
  try {
    const article = await dataSource.getRepository(Article).findOne({ where: { id: recordId } });
    if (!article) return next(new Errors.NotFound());

    await toggleAction(ArticleAction, 'article', {
      userId,
      recordId,
    });

    res.status(200).json({
      success: true,
      data: null,
      message: 'Article action toggled successfully',
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
