import { RequestHandler } from 'express';

import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { pointsRequest } from '../../../models/point-request.model';

export const getProviderPointReqHandler: RequestHandler<unknown, SuccessResponse, {}> = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.loggedUser;

    const pointReqRepo = dataSource
      .getRepository(pointsRequest)
      .createQueryBuilder('pr')
      .select('pr.target_user', 'providerId')
      .addSelect('pr.request_type', 'requestType')
      .addSelect('pr.points', 'points')
      .addSelect('pr.withdraw', 'withdraw')
      .addSelect('pr.title', 'title')
      .addSelect('pr.description', 'description')
      .addSelect('pr.id', 'id')
      .addSelect('pr.status', 'status')
      .where('pr.created_by = :userId', { userId: userId.id })
      .getRawMany();

    return res.status(200).json({
      success: true,
      message: 'Points and requests retrieved successfully',
      data: pointReqRepo,
    });
  } catch (error) {
    console.error(error);
  }
};
