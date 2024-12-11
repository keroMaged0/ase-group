import { RequestHandler } from 'express';

import { MedicineCategory } from '../../models/medicine_category.model';
import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Errors } from '../../errors';
import { Product } from '../../models/product.model';
import { FOLDERS } from '../../types/folders';
import { awsS3 } from '../../config/s3';

interface CreateProductBody {
  medicine_category_id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  scientific_name: string;
  caliber: string;
  cover_image?: string;
}

export const createProductHandler: RequestHandler<
  unknown,
  SuccessResponse,
  CreateProductBody
> = async (req, res, next) => {
  const { medicine_category_id, name, price, quantity, description, scientific_name, caliber } =
    req.body;
  const userId = req.loggedUser;

  if (req.file) {
    req.body.cover_image = FOLDERS.products + '/' + req.file.filename;
    await awsS3.saveBucketFiles(FOLDERS.products, req.file);
  }

  try {
    const product = await dataSource.getRepository(Product).save({
      medicine_category_id: { id: medicine_category_id },
      name,
      price,
      quantity,
      description,
      scientific_name,
      caliber,
      provider_id: { id: userId.provider_id },
      created_by: { id: userId.id },
      cover_image: req.body.cover_image || '',
    });

    return res.json({
      success: true,
      message: 'Medicine category created successfully',
      data: product,
    });
  } catch (error) {
    return next(new Errors.BadRequest(ErrCodes.SAVE_PRODUCT_FAILED));
  }
};
