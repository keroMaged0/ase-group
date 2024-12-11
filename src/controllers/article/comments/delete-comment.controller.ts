import { RequestHandler } from 'express';
import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { ArticleComment } from '../../../models/article-comment.model';
import { Errors } from '../../../errors';
import { ErrCodes } from '../../../types/error-code';

export const deleteComment: RequestHandler<{ id: string }, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const commentId = req.params.id;
  const userId = req.loggedUser.id;
  try {
    const commentRepo = dataSource.getRepository(ArticleComment);
    const comment = await commentRepo
      .createQueryBuilder()
      .delete()
      .from(ArticleComment)
      .where({ id: commentId, user: userId })
      .execute();
    if (!comment || comment.affected === 0) return next(new Errors.NotFound(ErrCodes.NOT_FOUND));
    return res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
