import { RequestHandler } from 'express';

import { MedicineCategory } from '../../models/medicine_category.model';
import { SuccessResponse } from '../../types/responses';
import { ErrCodes } from '../../types/error-code';
import { dataSource } from '../../config/typeorm';
import { Errors } from '../../errors';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../constants/query';
import { DurationType } from '../../models/vacation.model';
import { env } from 'process';

export const getMedicineCategoryByIdHandler: RequestHandler<
  { medicine_category_id: string },
  SuccessResponse
> = async (req, res, next) => {
  const { medicine_category_id } = req.params;

  const medicineCategory = await dataSource
    .getRepository(MedicineCategory)
    .createQueryBuilder('medicine_category')
    .leftJoinAndSelect('medicine_category.created_by', 'createdBy')
    .leftJoinAndSelect('medicine_category.parent_id', 'parent_id')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select([
      'medicine_category',
      ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
    ])
    .where('medicine_category.id = :medicineCategoryId', {
      medicineCategoryId: medicine_category_id,
    })
    .andWhere('medicine_category.is_deleted = false')
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();
  if (!medicineCategory) return next(new Errors.NotFound(ErrCodes.MEDICINE_CATEGORY_NOT_FOUND));

  if (medicineCategory.created_by.user_company_profile === null)
    (medicineCategory as any).created_by.user_company_profile = undefined;
  if (medicineCategory.created_by.user_pharmacy_profile === null)
    (medicineCategory as any).created_by.user_pharmacy_profile = undefined;
  if (medicineCategory.created_by.user_doctor_profile === null)
    (medicineCategory as any).created_by.user_doctor_profile = undefined;
  if (medicineCategory.created_by.user_company_profile)
    medicineCategory.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${medicineCategory.created_by.user_company_profile.profile_image}`;
  if (medicineCategory.created_by.user_pharmacy_profile)
    medicineCategory.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${medicineCategory.created_by.user_pharmacy_profile.profile_image}`;
  if (medicineCategory.created_by.user_doctor_profile)
    medicineCategory.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${medicineCategory.created_by.user_doctor_profile.profile_image}`;
  (medicineCategory as any).duration_type = DurationType[(medicineCategory as any).duration_type];

  return res.json({
    success: true,
    message: 'Medicine category fetched successfully',
    data: medicineCategory,
  });
};
