import { RequestHandler } from 'express';
import { SuccessResponse } from '../../../types/responses';
import { ArticleCommentAction } from '../../../models/article-comment-action.model';
import { toggleAction } from '../toggle-action';
import { dataSource } from '../../../config/typeorm';
import { ArticleComment } from '../../../models/article-comment.model';
import { Errors } from '../../../errors';
export const toggleCommentAction: RequestHandler<{ id: string }, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const recordId = req.params.id;
  const userId = req.loggedUser.id;
  try {
    const article = await dataSource
      .getRepository(ArticleComment)
      .findOne({ where: { id: recordId } });
    if (!article) return next(new Errors.NotFound());

    await toggleAction(ArticleCommentAction, 'comment', {
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
