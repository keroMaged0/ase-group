import { RequestHandler } from 'express';
import { dataSource } from '../../../config/typeorm';
import { selectCreatedByJoinFields, selectUserProfileJoinFields, userDataSubQuery } from '../../../constants/query';
import { NotFound } from '../../../errors/notfound-error';
import { PunishmentRequest } from '../../../models/punishment-request.model';
import { ErrCodes } from '../../../types/error-code';
import { SuccessResponse } from '../../../types/responses';
import { punishmentRequestSelectFields } from './get-punishment-requests.controller';


export const getOnePunishmentRequestHandler: RequestHandler<
  { punishmentRequestId: string },
  SuccessResponse
> = async (req, res, next) => {
  const punishmentRequest = await dataSource
  .getRepository(PunishmentRequest)
  .createQueryBuilder('punishmentRequest')
  .leftJoinAndSelect('punishmentRequest.punishment', 'punishment')
  .select(punishmentRequestSelectFields)
  .addSelect(userDataSubQuery('punishmentRequest.created_by'), 'createdBy')
  .addSelect(userDataSubQuery('punishmentRequest.target_user'),'target_user')
    .where('punishmentRequest.id = :punishmentRequestId', {
      punishmentRequestId: req.params.punishmentRequestId,
    })
    .andWhere('punishment.provider_id= :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getRawOne();

  if (!punishmentRequest) return next(new NotFound(ErrCodes.NOT_FOUND));

  return res.status(200).json({
    success: true,
    message: 'Punishment Request retrieved successfully',
    data: punishmentRequest,
  });
};
