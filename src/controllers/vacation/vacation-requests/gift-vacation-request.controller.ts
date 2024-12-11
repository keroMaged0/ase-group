import { RequestHandler } from 'express';
import { dataSource } from '../../../config/typeorm';
import { BadRequest } from '../../../errors/bad-request-error';
import { NotFound } from '../../../errors/notfound-error';
import {
  VacationRequest,
  VacationRequestStatus,
  VacationRequestType,
} from '../../../models/vacation-request.model';
import { Vacation, DurationType } from '../../../models/vacation.model';
import { ErrCodes } from '../../../types/error-code';
import { SuccessResponse } from '../../../types/responses';
import { Server } from 'socket.io';
import { SocketEvents } from '../../../socket/socket-events';

export const giftVacationHandler: RequestHandler<
  unknown,
  SuccessResponse,
  {
    vacation: string;
    start_date: Date;
    end_date: Date;
    real_vacation_days: number;
    target_user: string;
  }
> = async (req, res, next) => {
  const vacation = await dataSource.getRepository(Vacation).findOne({
    where: { id: req.body.vacation, provider_id: { id: req.loggedUser.provider_id } },
  });
  if (!vacation) return next(new NotFound(ErrCodes.NOT_FOUND));

  const targetStartDate =
    vacation.duration_type === DurationType.monthly
      ? new Date(req.body.start_date.getFullYear(), req.body.start_date.getMonth(), 1)
      : new Date(req.body.start_date.getFullYear(), 0, 1);
  const targetEndDate =
    vacation.duration_type === DurationType.monthly
      ? new Date(targetStartDate.getFullYear(), targetStartDate.getMonth() + 1, 1)
      : new Date(targetStartDate.getFullYear() + 1, 0, 1);
  const lastVacationRequests = await dataSource
    .getRepository(VacationRequest)
    .createQueryBuilder('vacationRequest')
    .select('SUM(vacationRequest.real_vacation_days)', 'totalRealVacationDays')
    .where('vacationRequest.target_user = :targetUserId', { targetUserId: req.body.target_user })
    .andWhere('vacationRequest.status = :status', { status: VacationRequestStatus.approved })
    .andWhere('vacationRequest.start_date >= :startDate', { startDate: targetStartDate })
    .andWhere('vacationRequest.end_date <= :endDate', { endDate: targetEndDate })
    .getRawOne();
  const totalRealVacationDays = +lastVacationRequests.totalRealVacationDays || 0;

  if (vacation.max_days < totalRealVacationDays + req.body.real_vacation_days)
    return next(new BadRequest(ErrCodes.EXCEED_TOTAL_ALLOWED_DAYS, req.language));

  const vacationRequest = await dataSource.getRepository(VacationRequest).save({
    ...req.body,
    target_user: { id: req.body.target_user },
    vacation: { id: req.body.vacation },
    status: VacationRequestStatus.approved,
    created_by: { id: req.loggedUser.id },
    request_type: VacationRequestType.gift,
  });

  // TODO: create notification model
  const io: Server = req.app.get('socket');
  io.to(req.body.target_user).emit(SocketEvents.gift_vacation, vacationRequest);

  return res.status(200).json({
    success: true,
    message: 'Vacation Request Created Successfully',
    data: vacationRequest,
  });
};
