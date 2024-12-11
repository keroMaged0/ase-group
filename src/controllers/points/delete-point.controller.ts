import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Point } from '../../models/point.model';
import { Errors } from '../../errors';

export const deletePointHandler: RequestHandler<{ point_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const point = await dataSource
    .getRepository(Point)
    .createQueryBuilder('point')
    .leftJoinAndSelect('point.created_by', 'createdBy')
    .where('point.id = :point_id AND point.is_deleted = false', {
      point_id: req.params.point_id,
    })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();

  if (!point) {
    return next(new Errors.NotFound(ErrCodes.POINT_NOT_FOUND));
  }

  await dataSource.getRepository(Point).update({ id: req.params.point_id }, { is_deleted: true });

  return res.json({
    success: true,
    message: 'Point deleted successfully',
    data: {},
  });
};
