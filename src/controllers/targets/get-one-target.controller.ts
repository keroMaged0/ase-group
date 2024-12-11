import { RequestHandler } from 'express';

import { SuccessResponse } from '../../types/responses';
import { ErrCodes } from '../../types/error-code';
import { dataSource } from '../../config/typeorm';
import { Target } from '../../models/target.model';
import { Errors } from '../../errors';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../constants/query';
import { DurationType } from '../../models/vacation.model';
import { env } from 'process';

export const getTargetByIdHandler: RequestHandler<{ target_id: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const { target_id } = req.params;

  const target = await dataSource
    .getRepository(Target)
    .createQueryBuilder('target')
    .leftJoinAndSelect('target.employee_id', 'employeeId')
    .leftJoinAndSelect('employeeId.user_company_profile', 'employeeId_user_company_profile')
    .leftJoinAndSelect('employeeId.user_pharmacy_profile', 'employeeId_user_pharmacy_profile')
    .leftJoinAndSelect('employeeId.user_doctor_profile', 'employeeId_user_doctor_profile')
    .leftJoinAndSelect('target.product_id', 'productId')
    .leftJoinAndSelect('target.provider_id', 'providerId')
    .leftJoinAndSelect('providerId.user_company_profile', 'providerId_user_company_profile')
    .leftJoinAndSelect('providerId.user_pharmacy_profile', 'providerId_user_pharmacy_profile')
    .leftJoinAndSelect('providerId.user_doctor_profile', 'providerId_user_doctor_profile')
    .leftJoinAndSelect('target.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select([
      'target',
      'productId.id',
      'productId.name',
      'productId.description',
      'productId.price',
      ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
      ...selectCreatedByJoinFields('employeeId'),
      ...selectUserProfileJoinFields('employeeId_user_company_profile'),
      ...selectUserProfileJoinFields('employeeId_user_pharmacy_profile'),
      ...selectUserProfileJoinFields('employeeId_user_doctor_profile'),
      ...selectCreatedByJoinFields('providerId'),
      ...selectUserProfileJoinFields('providerId_user_company_profile'),
      ...selectUserProfileJoinFields('providerId_user_pharmacy_profile'),
      ...selectUserProfileJoinFields('providerId_user_doctor_profile'),
    ])
    .where('target.id = :id', { id: target_id })
    .andWhere('createdBy.account_provider_id = :providerId ', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();

  if (!target) return next(new Errors.NotFound(ErrCodes.TARGET_NOT_FOUND));

  if (target.created_by.user_company_profile === null)
    (target as any).created_by.user_company_profile = undefined;
  if (target.created_by.user_pharmacy_profile === null)
    (target as any).created_by.user_pharmacy_profile = undefined;
  if (target.created_by.user_doctor_profile === null)
    (target as any).created_by.user_doctor_profile = undefined;
  if (target.created_by.user_company_profile)
    target.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${target.created_by.user_company_profile.profile_image}`;
  if (target.created_by.user_pharmacy_profile)
    target.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${target.created_by.user_pharmacy_profile.profile_image}`;
  if (target.created_by.user_doctor_profile)
    target.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${target.created_by.user_doctor_profile.profile_image}`;
  (target as any).duration_type = DurationType[(target as any).duration_type];

  return res.json({
    success: true,
    message: 'Target fetched successfully',
    data: target,
  });
};
