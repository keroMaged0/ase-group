import { RequestHandler } from 'express';

import { PaginationResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Target, TargetStatus, TargetType } from '../../models/target.model';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../constants/query';
import { DurationType } from '../../models/vacation.model';
import { env } from 'process';
import { FindOptionsWhere } from 'typeorm';
import { Errors } from '../../errors';
import { ErrCodes } from '../../types/error-code';

export const getAllTargetsHandler: RequestHandler<unknown, PaginationResponse> = async (
  req,
  res,
  next,
) => {
  const targetCount = await dataSource
    .getRepository(Target)
    .count({ where: req.pagination.filter });

  const targets = await dataSource
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
    .where('createdBy.account_provider_id = :providerId ', {
      providerId: req.loggedUser.provider_id,
    })
    .andWhere(req.pagination.filter)
    .take(req.pagination.limit)
    .skip(req.pagination.skip)
    .getMany();

  targets.forEach((t: any) => {
    if (t.created_by.user_company_profile === null) t.created_by.user_company_profile = undefined;
    if (t.created_by.user_pharmacy_profile === null) t.created_by.user_pharmacy_profile = undefined;
    if (t.created_by.user_doctor_profile === null) t.created_by.user_doctor_profile = undefined;
    if (t.created_by.user_company_profile?.profile_image != undefined)
      t.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${t.created_by.user_company_profile.profile_image}`;
    if (t.created_by.user_pharmacy_profile?.profile_image != undefined)
      t.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${t.created_by.user_pharmacy_profile.profile_image}`;
    if (t.created_by.user_doctor_profile?.profile_image != undefined)
      t.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${t.created_by.user_doctor_profile.profile_image}`;
    t.duration_type = DurationType[t.duration_type];
  });

  return res.json({
    success: true,
    message: 'Target fetched successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(targetCount / req.pagination.limit),
      resultCount: targetCount,
    },
    data: targets,
  });
};

export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    target_type?: TargetType;
    target_status?: TargetStatus;
    start_date?: string;
    end_date?: string;
    employee_id?: string;
    product_id?: string;
  }
> = async (req, res, next) => {
  req.pagination = req.pagination || {};
  const filter: FindOptionsWhere<Target> = req.pagination.filter;

  if (req.query.target_type) {
    filter.target_type = req.query.target_type;
  }

  if (req.query.target_status) {
    filter.status = req.query.target_status;
  }

  if (req.query.start_date) {
    const startDate = new Date(req.query.start_date);
    if (!isNaN(startDate.getTime())) {
      filter.start_date = startDate;
    } else {
      return next(new Errors.BadRequest(ErrCodes.INVALID_DATE_FORMAT));
    }
  }

  if (req.query.end_date) {
    const endDate = new Date(req.query.end_date);
    if (!isNaN(endDate.getTime())) {
      filter.end_date = endDate;
    } else {
      return next(new Errors.BadRequest(ErrCodes.INVALID_DATE_FORMAT));
    }
  }

  if (req.query.employee_id) {
    filter.employee_id = { id: req.query.employee_id };
  }

  if (req.query.product_id) {
    filter.product_id = { id: req.query.product_id };
  }

  req.pagination.filter = filter;
  next();
};
