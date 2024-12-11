import { RequestHandler } from 'express';
import { dataSource } from '../../../config/typeorm';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../../constants/query';
import { NotFound } from '../../../errors/notfound-error';
import { VacationRequest } from '../../../models/vacation-request.model';
import { ErrCodes } from '../../../types/error-code';
import { PaginationResponse, SuccessResponse } from '../../../types/responses';
import { handleProfileImage } from './handle-profile-image.helper';

export const getRelatedToLoggedUser: RequestHandler<unknown, PaginationResponse> = async (
  req,
  res,
  next,
) => {
  const count = await dataSource
    .getRepository(VacationRequest)
    .count({ where: { ...req.pagination.filter, target_user: { id: req.loggedUser.id } } });

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
    .andWhere('targetUser.id = :userId', { userId: req.loggedUser.id })
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

export const getOneRelatedtoLoggedUser: RequestHandler<
  { vacationRequestId: string },
  SuccessResponse
> = async (req, res, next) => {
  const vacationRequest = await dataSource
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
    .where('vacationRequest.id = :vacationRequestId', {
      vacationRequestId: req.params.vacationRequestId,
    })
    .andWhere('targetUser.id = :userId', {
      userId: req.loggedUser.id,
    })
    .getMany();

  if (!vacationRequest[0]) return next(new NotFound(ErrCodes.NOT_FOUND));

  handleProfileImage(vacationRequest, ['created_by', 'target_user']);

  return res.status(200).json({
    success: true,
    message: 'Vacation Request retrieved successfully',
    data: vacationRequest[0],
  });
};
