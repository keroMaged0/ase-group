import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Reward } from '../../models/reward.model';
import { UserReward } from '../../models/user-reward.model';
import { Errors } from '../../errors';

interface IGiveRewardBody {
  rewardId: string;
  target_user: string;
  description: string;
}

export const giveReward: RequestHandler<unknown, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const { rewardId, target_user, description } = req.body as IGiveRewardBody;

  try {
    const reward = await dataSource
      .getRepository(Reward)
      .findOne({ where: { id: rewardId, isDeleted: false } });

    if (!reward) return next(new Errors.BadRequest());

    const userRewardRepo = dataSource.getRepository(UserReward);
    const userReward = userRewardRepo.create({
      user_id: target_user,
      reward_id: rewardId,
      description,
    });
    await userRewardRepo.save(userReward);

    res.json({
      success: true,
      message: 'Giving reward success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
