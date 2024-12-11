import { RequestHandler } from 'express';

import { pointsRequest, PointRequestStatus } from '../../../models/point-request.model';
import { SuccessResponse } from '../../../types/responses';
import { NotFound } from '../../../errors/notfound-error';
import { dataSource } from '../../../config/typeorm';
import { ErrCodes } from '../../../types/error-code';

export const updatePointReqHandler: RequestHandler<
  { point_request_id: string },
  SuccessResponse,
  {
    title?: string;
    description?: string;
    status?: PointRequestStatus;
  }
> = async (req, res, next) => {
  const { point_request_id } = req.params;
  const { title, description, status } = req.body;

  const pointRequest = await dataSource
    .getRepository(pointsRequest)
    .createQueryBuilder('pr')
    .where('pr.id = :point_request_id', { point_request_id })
    .andWhere('pr.is_deleted = false')
    .getOne();
  if (!pointRequest) return next(new NotFound(ErrCodes.NOT_FOUND));

  await dataSource.getRepository(pointsRequest).update(
    { id: point_request_id },
    {
      title,
      description,
      status,
    },
  );

  return res.status(200).json({
    success: true,
    message: 'Point Request updated successfully',
    data: {},
  });
};
