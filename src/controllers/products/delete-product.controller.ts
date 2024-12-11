import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { Product } from '../../models/product.model';

export const deleteProductHandler: RequestHandler<{ product_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { product_id } = req.params;
  const userId = req.loggedUser.id;

  const product = await dataSource
    .createQueryBuilder()
    .update(Product)
    .set({ is_deleted: true })
    .where('id = :id AND is_deleted = false AND provider_id = :provider_id', {
      id: product_id,
      is_deleted: false,
      provider_id: userId,
    })
    .execute();
  if (product.affected === 0) return next(new Errors.NotFound(ErrCodes.PRODUCT_NOT_FOUND));

  return res.json({
    success: true,
    message: 'Product deleted successfully',
    data: {},
  });
};
