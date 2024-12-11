import { RequestHandler } from 'express';
import { SuccessResponse } from '../../types/responses';
import { UserReward } from '../../models/user-reward.model';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { Reward } from '../../models/reward.model';

export const deleteReward: RequestHandler<{ id: string }, SuccessResponse<null>> = async (
  req,
  res,
  next,
) => {
  const { id } = req.params;

  try {
    const rewardRepo = dataSource.getRepository(Reward);
    const deletedReward = await rewardRepo
      .createQueryBuilder()
      .update(Reward)
      .set({ isDeleted: true })
      .where('id = :id', { id })
      .execute();
    if (!deletedReward.affected) return next(new Errors.NotFound());
    res.json({ success: true, message: 'Reward deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};
