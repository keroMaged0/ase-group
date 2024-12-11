import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { Target } from '../../models/target.model';

export const deleteTargetHandler: RequestHandler<{ target_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { target_id } = req.params;

  const target = await dataSource
    .getRepository(Target)
    .createQueryBuilder('target')
    .leftJoinAndSelect('target.created_by', 'createdBy')
    .where('target.id = :id AND target.is_deleted = false', { id: target_id })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();

  if (!target) return next(new Errors.NotFound(ErrCodes.TARGET_NOT_FOUND));

  await dataSource.getRepository(Target).update({ id: target_id }, { is_deleted: true });

  return res.json({
    success: true,
    message: 'Target deleted successfully',
    data: {},
  });
};
