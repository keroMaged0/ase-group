import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { Product } from '../../models/product.model';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { awsS3 } from '../../config/s3';
import { FOLDERS } from '../../types/folders';

export const updateProductHandler: RequestHandler<
  { product_id: string },
  SuccessResponse,
  {
    name: string;
    description: string;
    price: number;
    scientific_name: string;
    caliber: string;
    cover_image?: string;
  }
> = async (req, res, next) => {
  const { product_id } = req.params;
  const { name, description, price, scientific_name, caliber } = req.body;
  const userId = req.loggedUser.id;

  if (req.file) {
    const oldImage = await dataSource.getRepository(Product).findOne({
      where: { id: product_id },
      select: ['cover_image'],
    });

    if (oldImage?.cover_image) {
      await awsS3.removeBucketFiles(oldImage.cover_image);
    }

    req.body.cover_image = FOLDERS.products + '/' + req.file.filename;
    await awsS3.saveBucketFiles(FOLDERS.products, req.file);
  }

  const product = await dataSource
    .getRepository(Product)
    .createQueryBuilder()
    .update(Product)
    .set({
      name,
      description,
      price,
      scientific_name,
      caliber,
      cover_image: req.body.cover_image,
    })
    .where('id = :id AND provider_id = :provider_id', { id: product_id, provider_id: userId })
    .execute();
  if (product.affected === 0) return next(new Errors.NotFound(ErrCodes.PRODUCT_NOT_FOUND));

  return res.json({
    success: true,
    message: 'Product updated successfully',
    data: {},
  });
};
