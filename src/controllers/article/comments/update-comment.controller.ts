import { RequestHandler } from 'express';
import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { ArticleComment } from '../../../models/article-comment.model';
import { Errors } from '../../../errors';
import { ErrCodes } from '../../../types/error-code';

interface ICommentBody {
  content: string;
}

export const updateComment: RequestHandler<{ id: string }, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const { content } = req.body as ICommentBody;
  const commentId = req.params.id;
  const userId = req.loggedUser.id;
  try {
    const commentRepo = dataSource.getRepository(ArticleComment);
    
    const comment = await commentRepo
      .createQueryBuilder()
      .update(ArticleComment)
      .set({ content })
      .where({ id: commentId, user: userId })
      .execute();

    if (!comment || comment.affected === 0) return next(new Errors.NotFound(ErrCodes.NOT_FOUND));

    return res.json({
      success: true,
      message: 'Comment updated successfully',
      data: null,
    });
  } catch (error) {
    console.log(error);
    next(new Errors.BadRequest());
  }
};
