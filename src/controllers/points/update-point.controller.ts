import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { Point } from '../../models/point.model';

export const updatePointHandler: RequestHandler<
  { point_id: string },
  SuccessResponse,
  {
    name?: string;
    amount?: number;
    points?: number;
    description?: string;
  }
> = async (req, res, next) => {
  const { name, amount, points, description } = req.body;
  const { point_id } = req.params;

  const point = await dataSource
    .getRepository(Point)
    .createQueryBuilder('point')
    .leftJoinAndSelect('point.created_by', 'createdBy')
    .select('point.id')
    .where('point.id = :pointId', { pointId: point_id })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();

  if (!point) return next(new Errors.NotFound(ErrCodes.POINT_NOT_FOUND));

  await dataSource.getRepository(Point).update(
    { id: point_id },
    {
      name,
      amount,
      points,
      description,
    },
  );

  return res.json({
    success: true,
    message: 'Point updated successfully',
    data: {},
  });
};
