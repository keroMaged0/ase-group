import { RequestHandler } from 'express';

import { pointsRequest } from '../../../models/point-request.model';
import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { ErrCodes } from '../../../types/error-code';
import { Errors } from '../../../errors';

export const deletePointHandler: RequestHandler<
  {
    point_request_id: string;
  },
  SuccessResponse,
  {}
> = async (req, res, next) => {
  const point = await dataSource
    .getRepository(pointsRequest)
    .createQueryBuilder('pr')
    .leftJoinAndSelect('pr.created_by', 'createdBy')
    .where('pr.id = :point_request_id AND pr.is_deleted = false', {
      point_request_id: req.params.point_request_id,
    })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();

  if (!point) return next(new Errors.NotFound(ErrCodes.POINT_REQUEST_NOT_FOUND));

  await dataSource
    .getRepository(pointsRequest)
    .update({ id: req.params.point_request_id }, { is_deleted: true });

  res.status(200).json({
    success: true,
    message: 'Point Request deleted Successfully',
    data: {},
  });
};
