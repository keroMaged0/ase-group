import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { Product } from '../../models/product.model';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';

export const updateQuantityHandler: RequestHandler<
  { product_id: string },
  SuccessResponse,
  {
    quantity: number;
  }
> = async (req, res, next) => {
  const { product_id } = req.params;
  const { quantity } = req.body;

  const product = await dataSource
    .getRepository(Product)
    .createQueryBuilder()
    .update(Product)
    .set({
      quantity,
    })
    .where('id = :id AND provider_id = :provider_id', {
      id: product_id,
      provider_id: req.loggedUser.provider_id,
    })
    .execute();
  if (product.affected === 0) return next(new Errors.NotFound(ErrCodes.PRODUCT_NOT_FOUND));

  return res.json({
    success: true,
    message: 'Quantity updated successfully',
    data: {},
  });
};
