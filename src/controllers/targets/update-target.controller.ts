import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { Target, TargetStatus, TargetType } from '../../models/target.model';

export const updateTargetHandler: RequestHandler<
  { target_id: string },
  SuccessResponse,
  {
    achieved_quantity: number;
    achieved_amount: number;
    status: TargetStatus;
    product_id: string;
    target_quantity: number;
    target_amount: number;
    target_type: TargetType;
  }
> = async (req, res, next) => {
  const {
    achieved_quantity,
    achieved_amount,
    status,
    product_id,
    target_quantity,
    target_amount,
    target_type,
  } = req.body;
  const { target_id } = req.params;

  const target = await dataSource
    .getRepository(Target)
    .createQueryBuilder('target')
    .leftJoinAndSelect('target.created_by', 'createdBy')
    .select('target.id')
    .where('target.id = :id', { id: target_id })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();
  if (!target) return next(new Errors.NotFound(ErrCodes.TARGET_NOT_FOUND));

  await dataSource.getRepository(Target).update(
    { id: target_id },
    {
      achieved_quantity,
      achieved_amount,
      status,
      target_type,
      product_id: { id: product_id },
      target_quantity,
      target_amount,
    },
  );

  return res.json({
    success: true,
    message: 'Target category updated successfully',
    data: {},
  });
};
