import { Request, RequestHandler } from 'express';
import { PaginationResponse, SuccessResponse } from '../../types/responses';
import { UserReward } from '../../models/user-reward.model';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { Reward } from '../../models/reward.model';

interface IGetrewardsQuery {
  date?: Date;
  title?: string;
}

export const getRewards: RequestHandler<
  unknown,
  PaginationResponse<Reward[]>,
  Request,
  IGetrewardsQuery
> = async (req, res, next) => {
  const { page, limit, skip } = req.pagination;
  const { date, title } = req.query as IGetrewardsQuery;

  console.log(page, limit, skip);
  try {
    const rewardRepo = dataSource.getRepository(Reward);

    const baseQuery = rewardRepo.createQueryBuilder('reward');

    const totalCountQuery = baseQuery;

    const userRewards = baseQuery.select([
      'reward.id AS id',
      'reward.title AS title',
      'reward.amount AS amount',
      'reward.created_at AS created_at',
    ]);

    const result = await userRewards.limit(limit).offset(skip).getRawMany();
    const totalCount = await totalCountQuery.getCount();

    if (!result) return next(new Errors.NotFound());

    res.json({
      success: false,
      message: 'Rewards fetched successfully',
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
