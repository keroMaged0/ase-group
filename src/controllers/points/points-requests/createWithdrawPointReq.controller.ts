import { RequestHandler } from 'express';

import { SuccessResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';
import { ErrCodes } from '../../../types/error-code';
import {
  PointRequestStatus,
  pointsRequest,
  PointsRequestType,
} from '../../../models/point-request.model';
import { Errors } from '../../../errors';

export const createWithdrawPointReqHandler: RequestHandler<
  unknown,
  SuccessResponse,
  {
    target_user: string;
    title: string;
    description?: string;
    point: string;
  }
> = async (req, res, next) => {
  const { target_user, title, description, point } = req.body;
  const userId = req.loggedUser;

  const pointExit = await dataSource.getRepository(pointsRequest).findOne({
    where: {
      target_user: { id: target_user },
      point: { id: point },
      status: PointRequestStatus.completed,
    },
  });
  if (!pointExit) return next(new Errors.BadRequest(ErrCodes.POINT_NOT_FOUND));

  const withdrawPoints = await dataSource.getRepository(pointsRequest).save({
    target_user: { id: target_user },
    created_by: { id: userId.id },
    point: { id: point },
    request_type: PointsRequestType.withdraw,
    withdraw: pointExit.points,
    title,
    description,
  });

  pointExit.status = PointRequestStatus.remove;
  await dataSource.getRepository(pointsRequest).save(pointExit);

  res.status(201).json({
    success: true,
    message: 'Withdraw point request created successfully',
    data: withdrawPoints,
  });
};

// import { RequestHandler } from 'express';

// import { SuccessResponse } from '../../../types/responses';
// import { pointsRequest, PointsRequestType } from '../../../models/point-request.model';
// import { dataSource } from '../../../config/typeorm';
// import { Point } from '../../../models/point.model';
// import { ERR_CODES } from '../../../types/error-code';

// export const createWithdrawPointReqHandler: RequestHandler<
//   unknown,
//   SuccessResponse,
//   {
//     target_user: string;
//     title: string;
//     description?: string;
//     point: string;
//   }
// > = async (req, res, next) => {
//   try {
//     const { target_user, title, description, point } = req.body;
//     const userId = req.loggedUser;

//     const totalPointsResult = await dataSource
//       .getRepository(pointsRequest)
//       .createQueryBuilder('pr')
//       .select('SUM(pr.total_points)', 'totalPoints')
//       .where('pr.target_user = :target_user', { target_user })
//       .getRawOne();

//     const currentTotalPoints = parseInt(totalPointsResult?.totalPoints || '0');

//     const pointEntity = await dataSource.getRepository(Point).findOneBy({ id: point });
//     if (!pointEntity) return next(new Error(ERR_CODES.POINT_NOT_FOUND));

//     const points = pointEntity.points; // TODO: 200 points returned

//     if (points > currentTotalPoints) return next(new Error(ERR_CODES.INSUFFICIENT_POINTS));

//     const withdrawPoints = await dataSource.getRepository(pointsRequest).save({
//       target_user: { id: target_user },
//       created_by: { id: userId.id },
//       point: { id: point },
//       request_type: PointsRequestType.withdraw,
//       withdraw: points,
//       title,
//       description,
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Withdraw point request created successfully',
//       data: withdrawPoints,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };
