import { Request, RequestHandler } from 'express';
import { PaginationResponse, SuccessResponse } from '../../types/responses';
import { UserReward } from '../../models/user-reward.model';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';

interface IGetrewardsQuery {
  date?: Date;
  title?: string;
}

export const getGivenRewards: RequestHandler<
  unknown,
  PaginationResponse<UserReward[]>,
  Request,
  IGetrewardsQuery
> = async (req, res, next) => {
  const { page, limit, skip } = req.pagination;
  const { date, title } = req.query as IGetrewardsQuery;

  console.log(page, limit, skip);
  try {
    const userRewardRepo = dataSource.getRepository(UserReward);

    const baseQuery = userRewardRepo
      .createQueryBuilder('userReward')
      .leftJoinAndSelect('userReward.reward', 'reward')
      .leftJoinAndSelect('userReward.user', 'user');

    const totalCountQuery = baseQuery;

    const userRewards = baseQuery.select([
      'userReward.id AS id',
      'userReward.user_id AS user_id',
      'userReward.description AS description',
      'reward.title AS title',
      'reward.amount AS amount',
      'userReward.created_at AS created_at',
    ]);

    if (date) {
      userRewards.andWhere('userReward.created_at >= :date', { date });
      totalCountQuery.where('userReward.created_at >= :date', { date });
    }

    if (title) {
      userRewards.andWhere('reward.title = :title', { title });
      totalCountQuery.andWhere('reward.title = :title', { title });
    }

    const result = await userRewards.limit(limit).offset(skip).getRawMany();
    const totalCount = await totalCountQuery.getCount();

    if (!result) return next(new Errors.NotFound());

    res.json({
      success: false,
      message: 'Reward fetched successfully',
      data: result,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        resultCount: result.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
