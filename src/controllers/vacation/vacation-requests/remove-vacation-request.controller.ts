import { RequestHandler } from 'express';
import { dataSource } from '../../../config/typeorm';
import { NotFound } from '../../../errors/notfound-error';
import { VacationRequest } from '../../../models/vacation-request.model';
import { ErrCodes } from '../../../types/error-code';
import { SuccessResponse } from '../../../types/responses';

export const removeVacationRequestHandler: RequestHandler<
  { vacationRequestId: string },
  SuccessResponse
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

  await dataSource.getRepository(VacationRequest).delete({ id: req.params.vacationRequestId });

  return res.status(200).json({
    success: true,
    message: 'Vacation Request Deleted Successfully',
    data: {},
  });
};
