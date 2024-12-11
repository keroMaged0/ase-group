import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { ErrCodes } from '../../types/error-code';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { Product } from '../../models/product.model';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../constants/query';
import { env } from 'process';
import { DurationType } from '../../models/vacation.model';

export const getProductByIdHandler: RequestHandler<
  { product_id: string },
  SuccessResponse
> = async (req, res, next) => {
  const { product_id } = req.params;

  const product = await dataSource
    .getRepository(Product)
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.created_by', 'createdBy')
    .leftJoinAndSelect('product.medicine_category_id', 'medicine_category_id')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select([
      'product',
      'medicine_category_id',
      ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
    ])
    .where('product.id = :productId', {
      productId: product_id,
    })
    .andWhere('product.is_deleted = false')
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();
  if (!product) return next(new Errors.NotFound(ErrCodes.PRODUCT_NOT_FOUND));

  if (product.created_by.user_company_profile === null)
    (product as any).created_by.user_company_profile = undefined;
  if (product.created_by.user_pharmacy_profile === null)
    (product as any).created_by.user_pharmacy_profile = undefined;
  if (product.created_by.user_doctor_profile === null)
    (product as any).created_by.user_doctor_profile = undefined;
  if (product.created_by.user_company_profile)
    product.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${product.created_by.user_company_profile.profile_image}`;
  if (product.created_by.user_pharmacy_profile)
    product.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${product.created_by.user_pharmacy_profile.profile_image}`;
  if (product.created_by.user_doctor_profile)
    product.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${product.created_by.user_doctor_profile.profile_image}`;
  (product as any).duration_type = DurationType[(product as any).duration_type];

  return res.json({
    success: true,
    message: 'Product fetched successfully',
    data: product,
  });
};
