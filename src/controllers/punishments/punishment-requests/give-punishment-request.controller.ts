import { RequestHandler } from 'express';
import { dataSource } from '../../../config/typeorm';
import { BadRequest } from '../../../errors/bad-request-error';
import { NotFound } from '../../../errors/notfound-error';
import { PunishmentRequest } from '../../../models/punishment-request.model';
import { ErrCodes } from '../../../types/error-code';
import { SuccessResponse } from '../../../types/responses';
import { Punishment } from '../../../models/punishments.model';

export const givePunishmentHandler: RequestHandler<
  unknown,
  SuccessResponse,
  {
    punishment: string;
    target_user: string; 
  }
> = async (req, res, next) => {
  const punishment = await dataSource.getRepository(Punishment).findOne({
    where: { id: req.body.punishment, provider_id: { id: req.loggedUser.provider_id } },
  });
  if (!punishment) return next(new NotFound(ErrCodes.NOT_FOUND));

  const punishmentRequest = await dataSource.getRepository(PunishmentRequest).save({
    ...req.body,
    target_user: { id: req.body.target_user },
    punishment: { id: req.body.punishment },
    created_by: { id: req.loggedUser.id },
  });

  return res.status(200).json({
    success: true,
    message: 'Punishment Request Created Successfully',
    data: punishmentRequest,
  });
};
