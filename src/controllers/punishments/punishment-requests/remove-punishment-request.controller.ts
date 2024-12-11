import { RequestHandler } from 'express';
import { dataSource } from '../../../config/typeorm';
import { NotFound } from '../../../errors/notfound-error';
import { PunishmentRequest } from '../../../models/punishment-request.model';
import { ErrCodes } from '../../../types/error-code';
import { SuccessResponse } from '../../../types/responses';

export const removePunishmentRequestHandler: RequestHandler<
  { punishmentRequestId: string },
  SuccessResponse
> = async (req, res, next) => {
  const punishmentRequest = await dataSource
    .getRepository(PunishmentRequest)
    .createQueryBuilder('punishmentRequest')
    .innerJoinAndSelect('punishmentRequest.punishment', 'punishment')
    .where('punishmentRequest.id = :punishmentRequestId', {
      punishmentRequestId: req.params.punishmentRequestId,
    })
    .andWhere('punishment.provider_id = :providerId', { providerId: req.loggedUser.provider_id })
    .getOne();

  if (!punishmentRequest) return next(new NotFound(ErrCodes.NOT_FOUND));

  await dataSource.getRepository(PunishmentRequest).delete({ id: req.params.punishmentRequestId });

  return res.status(200).json({
    success: true,
    message: 'Punishment Request Deleted Successfully',
    data: {},
  });
};
