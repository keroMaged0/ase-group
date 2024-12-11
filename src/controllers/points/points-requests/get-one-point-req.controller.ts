import { RequestHandler } from 'express';

import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../../constants/query';
import { pointsRequest } from '../../../models/point-request.model';
import { SuccessResponse } from '../../../types/responses';
import { NotFound } from '../../../errors/notfound-error';
import { dataSource } from '../../../config/typeorm';
import { ErrCodes } from '../../../types/error-code';

export const getOnePointReqHandler: RequestHandler<
  { point_request_id: string },
  SuccessResponse
> = async (req, res, next) => {
  const pointRequest = await dataSource
    .getRepository(pointsRequest)
    .createQueryBuilder('pr')
    .leftJoinAndSelect('pr.target_user', 'targetUser')
    .leftJoinAndSelect('targetUser.user_company_profile', 'targetUser_user_company_profile')
    .leftJoinAndSelect('targetUser.user_pharmacy_profile', 'targetUser_user_pharmacy_profile')
    .leftJoinAndSelect('targetUser.user_doctor_profile', 'targetUser_user_doctor_profile')
    .leftJoinAndSelect('pr.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .leftJoinAndSelect('pr.point', 'point')
    .leftJoinAndSelect('point.provider_id', 'providerId')
    .leftJoinAndSelect('providerId.user_company_profile', 'providerId_user_company_profile')
    .leftJoinAndSelect('providerId.user_pharmacy_profile', 'providerId_user_pharmacy_profile')
    .leftJoinAndSelect('providerId.user_doctor_profile', 'providerId_user_doctor_profile')
    .select([
      'pr',
      'point',
      ...selectCreatedByJoinFields('providerId'),
      ...selectUserProfileJoinFields('providerId_user_company_profile'),
      ...selectUserProfileJoinFields('providerId_user_pharmacy_profile'),
      ...selectUserProfileJoinFields('providerId_user_doctor_profile'),
      ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
      ...selectCreatedByJoinFields('targetUser'),
      ...selectUserProfileJoinFields('targetUser_user_company_profile'),
      ...selectUserProfileJoinFields('targetUser_user_pharmacy_profile'),
      ...selectUserProfileJoinFields('targetUser_user_doctor_profile'),
    ])
    .where('pr.id = :pointRequestId', {
      pointRequestId: req.params.point_request_id,
    })
    .andWhere('createdBy.account_provider_id = :providerId AND pr.is_deleted=false', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();

  if (!pointRequest) return next(new NotFound(ErrCodes.POINT_REQUEST_NOT_FOUND));

  return res.status(200).json({
    success: true,
    message: 'Point Request retrieved successfully',
    data: pointRequest,
  });
};
