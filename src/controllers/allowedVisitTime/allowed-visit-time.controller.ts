import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { AllowedVisitTime } from '../../models/allowed-visit-times.model';
import { SuccessResponse } from '../../types/responses';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';

interface TimeRange {
  start: string;
  end: string;
}

interface UpdateAllowedVisitTimeRequestBody {
  user_id: string;
  saturday?: TimeRange;
  sunday?: TimeRange;
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
}

export const get: RequestHandler<unknown, SuccessResponse> = async (req, res, next) => {
  const allowedVisitTimeRepository = dataSource.getRepository(AllowedVisitTime);

  try {
    const { id } = req.query;

    if (typeof id === 'string') {
      const allowedVisitTime = await allowedVisitTimeRepository.findOne({
        where: { user_id: { id: req.loggedUser.id }, id },
      });

      if (!allowedVisitTime) {
        return next(new Errors.NotFound(ErrCodes.NOT_FOUND));
      }

      return res.status(201).json({
        success: true,
        message: 'Allowed visit time retrieved successfully',
        data: allowedVisitTime,
      });
    } else {
      const allowedVisitTimes = await allowedVisitTimeRepository.find({
        where: { user_id: { id: req.loggedUser.id } },
      });

      return res.status(201).json({
        success: true,
        message: 'Allowed visit times retrieved successfully',
        data: allowedVisitTimes,
      });
    }
  } catch (error) {
    return next(new Errors.BadRequest(ErrCodes.BAD_REQUEST));
  }
};

export const update: RequestHandler<
  unknown,
  SuccessResponse,
  UpdateAllowedVisitTimeRequestBody
> = async (req, res, next) => {
  const { ...visitTimes } = req.body;

  const allowedVisitTimeRepository = dataSource.getRepository(AllowedVisitTime);

  const updatedData = Object.keys(visitTimes).reduce((acc, day) => {
    if (visitTimes[day]) {
      acc[`${day}_time_start`] = visitTimes[day].start;
      acc[`${day}_time_end`] = visitTimes[day].end;
    }
    return acc;
  }, {});

  const allowedVisitTime = await allowedVisitTimeRepository.update(
    { user_id: { id: req.loggedUser.id } },
    updatedData,
  );

  if (allowedVisitTime.affected === 0)
    return next(new Errors.NotFound(ErrCodes.ALLOWED_VISIT_TIME_NOT_FOUND));

  return res.status(201).json({
    success: true,
    message: 'Allowed visit time updated successfully',
    data: {},
  });
};
