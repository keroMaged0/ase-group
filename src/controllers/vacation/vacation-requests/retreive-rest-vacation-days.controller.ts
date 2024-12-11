import { RequestHandler } from 'express';
import { SuccessResponse } from '../../../types/responses';
import { DurationType, Vacation } from '../../../models/vacation.model';
import { dataSource } from '../../../config/typeorm';
import { NotFound } from '../../../errors/notfound-error';
import { ErrCodes } from '../../../types/error-code';
import { VacationRequest, VacationRequestStatus } from '../../../models/vacation-request.model';

export const retreiveRestVacationDays: RequestHandler<
  unknown,
  SuccessResponse,
  {
    vacation: string;
    user_id: string;
    date: Date;
  }
> = async (req, res, next) => {
  const vacation = await dataSource.getRepository(Vacation).findOne({
    where: { id: req.body.vacation, provider_id: { id: req.loggedUser.provider_id } },
  });
  if (!vacation) return next(new NotFound(ErrCodes.NOT_FOUND));

  const targetStartDate =
    vacation.duration_type === DurationType.monthly
      ? new Date(req.body.date.getFullYear(), req.body.date.getMonth(), 1)
      : new Date(req.body.date.getFullYear(), 0, 1);
  const targetEndDate =
    vacation.duration_type === DurationType.monthly
      ? new Date(targetStartDate.getFullYear(), targetStartDate.getMonth() + 1, 1)
      : new Date(targetStartDate.getFullYear() + 1, 0, 1);

  const lastVacationRequests = await dataSource
    .getRepository(VacationRequest)
    .createQueryBuilder('vacationRequest')
    .select('SUM(vacationRequest.real_vacation_days)', 'totalRealVacationDays')
    .where('vacationRequest.target_user = :targetUserId', { targetUserId: req.body.user_id })
    .andWhere('vacationRequest.status = :status', { status: VacationRequestStatus.approved })
    .andWhere('vacationRequest.start_date >= :startDate', { startDate: targetStartDate })
    .andWhere('vacationRequest.end_date <= :endDate', { endDate: targetEndDate })
    .getRawOne();

  const totalRealVacationDays = lastVacationRequests.totalRealVacationDays || 0;

  res.status(200).json({
    success: true,
    message: 'Vacation Request retrieved successfully',
    data: {
      total_vacation_days: vacation.max_days,
      remaining_days: vacation.max_days - totalRealVacationDays,
    },
  });
};
