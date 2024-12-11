import { RequestHandler } from 'express';

import { dataSource } from '../../config/typeorm';
import { Article } from '../../models/article.model';
import { awsS3 } from '../../config/s3';
import { SuccessResponse } from '../../types/responses';
import { Errors } from '../../errors';
import { ErrCodes } from '../../types/error-code';

export const deleteArticle: RequestHandler<{ id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const articleId = req.params.id;
  const userId = req.loggedUser.id;

  try {
    const articleRepo = dataSource.getRepository(Article);

    // Find the article first
    const article = await articleRepo.findOne({
      where: { id: articleId, created_by: { id: userId } },
    });

    if (!article) {
      return next(new Errors.NotFound(ErrCodes.NOT_FOUND));
    }

    await articleRepo.delete({ id: articleId, created_by: { id: userId } });

    if (article.picture) {
      await awsS3.removeBucketFiles(article.picture);
    }

    res.json({
      success: true,
      message: 'Article deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
