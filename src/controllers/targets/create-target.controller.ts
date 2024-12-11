import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { Target, TargetType } from '../../models/target.model';
import { Product } from '../../models/product.model';
import { UserAuth } from '../../models/user-auth.model';

interface CreateTargetBody {
  employee_id: string;
  product_id: string;
  target_type: TargetType;
  target_quantity: number;
  target_amount: number;
  start_date: string;
}

export const createTargetHandler: RequestHandler<
  unknown,
  SuccessResponse,
  CreateTargetBody
> = async (req, res, next) => {
  const { employee_id, target_type, product_id, target_quantity, target_amount, start_date } =
    req.body;
  const userId = req.loggedUser;

  try {
    const startDate = new Date(start_date);
    let endDate = new Date(startDate);
    if (target_type === TargetType.Monthly) {
      endDate.setMonth(startDate.getMonth() + 1);
    } else if (target_type === TargetType.Quarterly) {
      endDate.setMonth(startDate.getMonth() + 3);
    }

    const target = await dataSource.getRepository(Target).save({
      employee_id: { id: employee_id } as UserAuth,
      product_id: { id: product_id } as Product,
      target_quantity,
      target_amount,
      target_type,
      start_date: startDate,
      end_date: endDate,
      provider_id: { id: userId.provider_id },
      created_by: { id: userId.id },
    });

    return res.json({
      success: true,
      message: 'Target category created successfully',
      data: target,
    });
  } catch (error) {
    return next(new Errors.BadRequest(ErrCodes.SAVE_TARGET_FAILED));
  }
};
