import { Request, RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { Article } from '../../models/article.model';
import { PaginationResponse } from '../../types/responses';
import { env } from '../../config/env';
import { UserType } from '../../models/user-auth.model';
import { SelectQueryBuilder } from 'typeorm';
import { ArticleAction } from '../../models/article-action.model';
import { userDataSubQuery } from '../../constants/query';



export const buildArticlesQuery = (
  loggedUserId: string,
  filters: {
    specializationIds?: string[];
    date?: string;
    articleId?: string;
  } = {},
): SelectQueryBuilder<Article> => {
  const { specializationIds, date, articleId } = filters;
  const articleRepo = dataSource.getRepository(Article);

  // Base query builder
  const queryBuilder = articleRepo
    .createQueryBuilder('article')
    .select([
      'article.id AS id',
      'article.title AS title',
      'article.description AS description',
      `CASE 
        WHEN article.picture IS NOT NULL THEN CONCAT('${env.apiUrl}/api/v1/attachments?filePath=', article.picture)
        ELSE NULL 
      END AS picture`,
      'article.created_at AS created_at',
    ])
    .addSelect(userDataSubQuery('article.created_by'), 'created_by')
  // Subquery for specializations
  const specializationsSubQuery = articleRepo
    .createQueryBuilder()
    .subQuery()
    .select(`json_agg(json_build_object('id', s.id, 'title', s.title))`)
    .from('article_specialization', 'aspec')
    .leftJoin('doctor_specialty', 's', 'aspec.specialization_id = s.id')
    .where('aspec.article_id = article.id')
    .getQuery();

  queryBuilder.addSelect(`COALESCE((${specializationsSubQuery}), '[]')`, 'specializations');

  // Subquery for comments count
  const commentsSubQuery = articleRepo
    .createQueryBuilder()
    .subQuery()
    .select('COUNT(*)::int')
    .from('article_comment', 'comment')
    .where('comment.article_id = article.id')
    .getQuery();

  queryBuilder.addSelect(`COALESCE((${commentsSubQuery}), 0)`, 'comments_count');

  // Subquery for likes count
  const likesSubQuery = articleRepo
    .createQueryBuilder()
    .subQuery()
    .select('COUNT(*)::int')
    .from('article_action', 'action')
    .where('action.article_id = article.id')
    .getQuery();

  queryBuilder.addSelect(`COALESCE((${likesSubQuery}), 0)`, 'likes_count');

  // Fix for is_liked subquery
  queryBuilder.addSelect(
    `(SELECT EXISTS (
        SELECT 1
        FROM article_action action
        WHERE action.article_id = article.id AND action.user_id = :loggedUserId
      ))::boolean AS "is_liked"`,
  );

  queryBuilder.setParameter('loggedUserId', loggedUserId);

  // Apply filters
  if (specializationIds && specializationIds.length > 0) {
    queryBuilder.andWhere(
      `(SELECT COUNT(*) 
        FROM article_specialization aspec 
        WHERE aspec.article_id = article.id AND aspec.specialization_id IN (:...specializationIds)
      ) > 0`,
      { specializationIds },
    );
  }

  if (date) {
    queryBuilder.andWhere('article.created_at >= :date', { date });
  }

  if (articleId) {
    queryBuilder.andWhere('article.id = :articleId', { articleId });
  }

  return queryBuilder;
};


interface IGetArticlesQuery {
  specializations: string;
  date: Date;
}

interface IResponseData {
  id: string;
  picture: string | null;
  title: string;
  description: string;
  created_at: Date;
  specializations: { id: string; title: string }[];
}

export const getArticles: RequestHandler<IGetArticlesQuery, PaginationResponse> = async (
  req,
  res,
  next,
) => {
  const { page, limit, skip } = req.pagination;
  const { specializations, date: dateQuery } = req.query;
  const date = typeof dateQuery === 'string' ? dateQuery : undefined;

  const specializationIds = typeof specializations === 'string' ? specializations.split(',') : [];

  try {
    const queryBuilder = buildArticlesQuery(req.loggedUser.id, {
      specializationIds,
      date,
    });

    // Fetch paginated articles
    const articles = await queryBuilder.offset(skip).limit(limit).getRawMany();

    // Count total articles
    const totalCount = await queryBuilder.getCount();

    // Pagination response
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      resultCount: totalCount,
    };

    res.json({
      success: true,
      message: 'Articles fetched successfully',
      data: articles,
      pagination,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
