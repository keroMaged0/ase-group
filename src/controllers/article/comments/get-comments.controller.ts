import { RequestHandler } from 'express';
import { FindOperator, IsNull } from 'typeorm';

import { dataSource } from '../../../config/typeorm';
import { Errors } from '../../../errors';
import { ArticleComment } from '../../../models/article-comment.model';
import { ErrCodes } from '../../../types/error-code';
import { PaginationResponse } from '../../../types/responses';
import { UserType } from '../../../models/user-auth.model';
import { ArticleCommentAction } from '../../../models/article-comment-action.model';
import { ArticleAction } from '../../../models/article-action.model';
import { userDataSubQuery } from '../../../constants/query';


const selectCommentFields = [
  'comment.id AS id',
  'comment.content AS content',
  'comment.created_at AS created_at',
  'comment.updated_at AS updated_at',
];

export const getCommentQueryBuilder = (
  loggedUserId: string,
  filter: {
    parent?: { id: string } | FindOperator<any>;
    article?: { id: string };
    id?: string;
  },
) => {
  const commentRepo = dataSource.getRepository(ArticleComment);

  const repliesCountSubQuery = (subQuery) =>
    subQuery
      .select('COUNT(replies.id)::int')
      .from(ArticleComment, 'replies')
      .where('replies.parent = comment.id');

  const likesCountSubQuery = (subQuery) =>
    subQuery
      .select('COUNT(action.comment_id)::int')
      .from(ArticleCommentAction, 'action')
      .where('action.comment_id = comment.id');

  const isLikedSubQuery = (subQuery) =>
    subQuery
      .select(
        `CASE 
           WHEN EXISTS (
             SELECT 1 
             WHERE action.comment_id = comment.id AND action.user_id = :loggedUserId
           ) THEN true 
           ELSE false 
         END`,
      )
      .from(ArticleCommentAction, 'action')
      .setParameter('loggedUserId', loggedUserId);

  return commentRepo
    .createQueryBuilder('comment')
    .leftJoinAndSelect('comment.replies', 'replies')
    .leftJoinAndSelect('comment.actions', 'actions')
    .select(selectCommentFields)
    .addSelect(userDataSubQuery('comment.user'), 'created_by')
    .addSelect(repliesCountSubQuery, 'replies_count')
    .addSelect(likesCountSubQuery, 'likes_count')
    .addSelect(isLikedSubQuery, 'is_liked')
    .where(filter);
};

export const getComments: RequestHandler<
  { id: string },
  PaginationResponse<ArticleComment[]>
> = async (req, res, next) => {
  const { page, limit, skip } = req.pagination;
  const articleId = req.params.id;

  const commentRepo = dataSource.getRepository(ArticleComment);

  const filter = { parent: IsNull(), article: { id: articleId } };
  const totalComments = await commentRepo.count({ where: filter });

  const comments = await getCommentQueryBuilder(req.loggedUser.id, filter)
    .offset(skip)
    .limit(limit)
    .getRawMany();
  if (!comments) return next(new Errors.NotFound(ErrCodes.NOT_FOUND));

  res.json({
    success: true,
    data: comments,
    message: 'Comments retrieved successfully',
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      resultCount: comments.length,
    },
  });
};
