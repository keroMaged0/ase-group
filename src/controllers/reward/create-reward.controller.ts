import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Reward } from '../../models/reward.model';

interface ICreateRewardBody {
  title: string;
  amount: number;
}

export const createReward: RequestHandler<unknown, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const userId = req.loggedUser.id;
  const { title, amount } = req.body as ICreateRewardBody;

  try {
    const rewardRepo = dataSource.getRepository(Reward);
    const reward = rewardRepo.create({ title, amount, createdBy: userId });
    await rewardRepo.save(reward);

    res.json({
      success: true,
      message: 'Reward created successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
