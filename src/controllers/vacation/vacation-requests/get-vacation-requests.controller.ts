import { RequestHandler } from 'express';
import {
  VacationRequest,
  VacationRequestStatus,
  VacationRequestType,
} from '../../../models/vacation-request.model';
import { FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { dataSource } from '../../../config/typeorm';
import { PaginationResponse } from '../../../types/responses';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../../constants/query';
import { handleProfileImage } from './handle-profile-image.helper';

export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    status?: VacationRequestStatus;
    type?: VacationRequestType;
    created_at_from?: Date;
    created_at_to?: Date;
    created_by?: string;
    target_user?: string;
    vacation?: string;
  }
> = async (req, res, next) => {
  const filter: FindOptionsWhere<VacationRequest> = req.pagination.filter;
  if (req.query.status !== undefined) filter.status = req.query.status;
  if (req.query.type !== undefined) filter.request_type = req.query.type;
  if (req.query.created_at_from && req.query.created_at_to) {
    filter.created_at = Between(req.query.created_at_from, req.query.created_at_to);
  } else if (req.query.created_at_from || req.query.created_at_to) {
    if (req.query.created_at_from !== undefined) {
      filter.created_at = MoreThanOrEqual(req.query.created_at_from);
    }
    if (req.query.created_at_to !== undefined) {
      filter.created_at = LessThanOrEqual(req.query.created_at_to);
    }
  }
  if (req.query.created_by) filter.created_by = { id: req.query.created_by };
  if (req.query.target_user) filter.target_user = { id: req.query.target_user };
  if (req.query.vacation) filter.vacation = { id: req.query.vacation };
  req.pagination.filter = filter;
  next();
};

export const get: RequestHandler<unknown, PaginationResponse> = async (req, res, next) => {
  const count = await dataSource
    .getRepository(VacationRequest)
    .count({ where: req.pagination.filter });

  const vacationRequests = await dataSource
    .getRepository(VacationRequest)
    .createQueryBuilder('vacationRequest')
    .leftJoinAndSelect('vacationRequest.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .leftJoinAndSelect('vacationRequest.target_user', 'targetUser')
    .leftJoinAndSelect('targetUser.user_company_profile', 'targetUserCompanyProfile')
    .leftJoinAndSelect('targetUser.user_pharmacy_profile', 'targetUserPharmacyProfile')
    .leftJoinAndSelect('targetUser.user_doctor_profile', 'targetUserDoctorProfile')
    .select([
      'vacationRequest',
      ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
      ...selectCreatedByJoinFields('targetUser'),
      ...selectUserProfileJoinFields('targetUserCompanyProfile'),
      ...selectUserProfileJoinFields('targetUserPharmacyProfile'),
      ...selectUserProfileJoinFields('targetUserDoctorProfile'),
    ])
    .where('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .andWhere(req.pagination.filter)
    .take(req.pagination.limit)
    .skip(req.pagination.skip)
    .orderBy('vacationRequest.created_at', 'DESC')
    .getMany();

  handleProfileImage(vacationRequests, ['created_by', 'target_user']);

  return res.status(200).json({
    success: true,
    message: 'Vacation Requests retrieved successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(count / req.pagination.limit),
      resultCount: count,
    },
    data: vacationRequests,
  });
};
