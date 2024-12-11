import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { ErrCodes } from '../../types/error-code';
import { Point } from '../../models/point.model';
import { Errors } from '../../errors';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../constants/query';
import { DurationType } from '../../models/vacation.model';
import { env } from 'process';

export const getPointByIdHandler: RequestHandler<{ point_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const point = await dataSource
    .getRepository(Point)
    .createQueryBuilder('point')
    .leftJoinAndSelect('point.product_id', 'productId')
    .addSelect(['productId.id', 'productId.name', 'productId.description', 'productId.price'])
    .leftJoinAndSelect('point.provider_id', 'providerId')
    .leftJoinAndSelect('providerId.user_company_profile', 'providerId_user_company_profile')
    .leftJoinAndSelect('providerId.user_pharmacy_profile', 'providerId_user_pharmacy_profile')
    .leftJoinAndSelect('providerId.user_doctor_profile', 'providerId_user_doctor_profile')
    .leftJoinAndSelect('point.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select([
      'point',
      ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
      ...selectCreatedByJoinFields('providerId'),
      ...selectUserProfileJoinFields('providerId_user_company_profile'),
      ...selectUserProfileJoinFields('providerId_user_pharmacy_profile'),
      ...selectUserProfileJoinFields('providerId_user_doctor_profile'),
    ])
    .where('point.id = :pointId', { pointId: req.params.point_id })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();
  if (!point) return next(new Errors.NotFound(ErrCodes.POINT_NOT_FOUND));

  if (point.created_by.user_company_profile === null)
    (point as any).created_by.user_company_profile = undefined;
  if (point.created_by.user_pharmacy_profile === null)
    (point as any).created_by.user_pharmacy_profile = undefined;
  if (point.created_by.user_doctor_profile === null)
    (point as any).created_by.user_doctor_profile = undefined;
  if (point.created_by.user_company_profile)
    point.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${point.created_by.user_company_profile.profile_image}`;
  if (point.created_by.user_pharmacy_profile)
    point.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${point.created_by.user_pharmacy_profile.profile_image}`;
  if (point.created_by.user_doctor_profile)
    point.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${point.created_by.user_doctor_profile.profile_image}`;
  (point as any).duration_type = DurationType[(point as any).duration_type];

  return res.json({
    success: true,
    message: 'Point fetched successfully',
    data: point,
  });
};
