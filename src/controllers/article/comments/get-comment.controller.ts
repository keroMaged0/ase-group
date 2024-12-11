import { RequestHandler } from 'express';
import { ArticleComment } from '../../../models/article-comment.model';
import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { IsNull } from 'typeorm';
import { ErrCodes } from '../../../types/error-code';
import { Errors } from '../../../errors';
import { getCommentQueryBuilder } from './get-comments.controller';

export const getComment: RequestHandler<{ id: string }, SuccessResponse<ArticleComment[]>> = async (
  req,
  res,
  next,
) => {
  const commentId = req.params.id;

  try {
    const comment = await getCommentQueryBuilder(req.loggedUser.id,{
      id: commentId
    }).getRawOne();
    const replies = await getCommentQueryBuilder(req.loggedUser.id,{
      parent: { id: commentId }
    }).getRawMany();
    if (!comment) return next(new Errors.NotFound(ErrCodes.NOT_FOUND));
    res.json({
      success: true,
      data: { ...comment, replies },
      message: 'Comments retrieved successfully',
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
