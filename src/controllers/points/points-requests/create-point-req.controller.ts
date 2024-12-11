import { RequestHandler } from 'express';

import { pointsRequest, PointsRequestType } from '../../../models/point-request.model';
import { SuccessResponse } from '../../../types/responses';
import { ErrCodes } from '../../../types/error-code';
import { dataSource } from '../../../config/typeorm';
import { Point } from '../../../models/point.model';
import { Errors } from '../../../errors';
export const createPointReqHandler: RequestHandler<
  unknown,
  SuccessResponse,
  {
    point: string;
    target_user: string;
    title: string;
    description?: string;
  }
> = async (req, res, next) => {
  const { point, target_user, title, description } = req.body;
  const userId = req.loggedUser;

  const pointEntity = await dataSource.getRepository(Point).findOneBy({ id: point });
  if (!pointEntity) return next(new Errors.BadRequest(ErrCodes.POINT_NOT_FOUND));

  const pointReq = await dataSource.getRepository(pointsRequest).save({
    target_user: { id: target_user },
    created_by: { id: userId.id },
    point: { id: point },
    request_type: PointsRequestType.gift,
    points: pointEntity.points,
    title,
    description,
  });

  res.status(201).json({
    success: true,
    message: 'Point request created successfully',
    data: pointReq,
  });
};
