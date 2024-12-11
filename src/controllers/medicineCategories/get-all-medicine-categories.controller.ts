import { RequestHandler } from 'express';

import { MedicineCategory } from '../../models/medicine_category.model';
import { PaginationResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { FindOptionsWhere, ILike } from 'typeorm';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../constants/query';
import { env } from 'process';
import { DurationType } from '../../models/vacation.model';

export const getAllMedicineCategoriesHandler: RequestHandler<unknown, PaginationResponse> = async (
  req,
  res,
  next,
) => {
  const categoryCount = await dataSource
    .getRepository(MedicineCategory)
    .count({ where: req.pagination.filter });

  const medicineCategories = await dataSource
    .getRepository(MedicineCategory)
    .createQueryBuilder('medicine_category')
    .leftJoinAndSelect('medicine_category.parent_id', 'parent_id')
    .leftJoinAndSelect('medicine_category.created_by', 'createdBy')
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
    .where('createdBy.account_provider_id = :providerId AND medicine_category.is_deleted = false', {
      providerId: req.loggedUser.provider_id,
    })
    .andWhere(req.pagination.filter)
    .take(req.pagination.limit)
    .skip(req.pagination.skip)
    .getMany();

  medicineCategories.forEach((m: any) => {
    if (m.created_by.user_company_profile === null) m.created_by.user_company_profile = undefined;
    if (m.created_by.user_pharmacy_profile === null) m.created_by.user_pharmacy_profile = undefined;
    if (m.created_by.user_doctor_profile === null) m.created_by.user_doctor_profile = undefined;
    if (m.created_by.user_company_profile?.profile_image != undefined)
      m.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${m.created_by.user_company_profile.profile_image}`;
    if (m.created_by.user_pharmacy_profile?.profile_image != undefined)
      m.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${m.created_by.user_pharmacy_profile.profile_image}`;
    if (m.created_by.user_doctor_profile?.profile_image != undefined)
      m.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${m.created_by.user_doctor_profile.profile_image}`;
    m.duration_type = DurationType[m.duration_type];
  });

  return res.json({
    success: true,
    message: 'Medicine category fetched successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(categoryCount / req.pagination.limit),
      resultCount: categoryCount,
    },
    data: medicineCategories,
  });
};

export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    name?: string;
  }
> = async (req, res, next) => {
  req.pagination = req.pagination || {};
  const filter: FindOptionsWhere<MedicineCategory> = req.pagination.filter;

  if (req.query.name) filter.name = ILike(`%${req.query.name}%`);

  next();
};
