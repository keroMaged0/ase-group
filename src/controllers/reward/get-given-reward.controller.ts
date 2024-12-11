import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { UserReward } from '../../models/user-reward.model';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';

export const getGivenReward: RequestHandler<{ id: string }, SuccessResponse<UserReward>> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;

  try {
    const userRewardRepo = dataSource.getRepository(UserReward);

    const userReward = await userRewardRepo
      .createQueryBuilder('userReward')
      .leftJoinAndSelect('userReward.reward', 'reward')
      .leftJoinAndSelect('userReward.user', 'user')
      .select([
        'userReward.id AS id',
        'userReward.user_id AS user_id',
        'userReward.description AS description',
        'reward.title AS title',
        'reward.amount AS amount',
        'userReward.created_at AS created_at',
      ])
      .where('userReward.id = :id', { id })
      .getRawOne();

    if (!userReward) return next(new Errors.NotFound());

    res.json({ success: false, message: 'Reward fetched successfully', data: userReward });
  } catch (error) {
    next(error);
  }
};
