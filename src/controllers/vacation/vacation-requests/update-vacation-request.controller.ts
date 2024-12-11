import { RequestHandler } from 'express';
import { dataSource } from '../../../config/typeorm';
import { BadRequest } from '../../../errors/bad-request-error';
import { NotFound } from '../../../errors/notfound-error';
import { VacationRequestStatus, VacationRequest } from '../../../models/vacation-request.model';
import { ErrCodes } from '../../../types/error-code';
import { SuccessResponse } from '../../../types/responses';

export const updateVacationRequestHandler: RequestHandler<
  { vacationRequestId: string },
  SuccessResponse,
  {
    status: VacationRequestStatus;
    rejection_reason?: string;
  }
> = async (req, res, next) => {
  const vacationRequest = await dataSource
    .getRepository(VacationRequest)
    .createQueryBuilder('vacationRequest')
    .innerJoinAndSelect('vacationRequest.vacation', 'vacation')
    .where('vacationRequest.id = :vacationRequestId', {
      vacationRequestId: req.params.vacationRequestId,
    })
    .andWhere('vacation.provider_id = :providerId', { providerId: req.loggedUser.provider_id })
    .getOne();
  if (!vacationRequest) return next(new NotFound(ErrCodes.NOT_FOUND));

  if (vacationRequest.status !== VacationRequestStatus.pending)
    return next(new BadRequest(ErrCodes.STATUS_IS_ALREADY_UPDATED, req.language));

  await dataSource
    .getRepository(VacationRequest)
    .update({ id: req.params.vacationRequestId }, req.body);

  return res.status(200).json({
    success: true,
    message: 'Vacation Request Updated Successfully',
    data: {},
  });
};
