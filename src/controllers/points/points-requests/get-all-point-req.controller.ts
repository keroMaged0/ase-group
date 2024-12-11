import { Between, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { RequestHandler } from 'express';

import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../../constants/query';
import { pointsRequest, PointsRequestType } from '../../../models/point-request.model';
import { PaginationResponse } from '../../../types/responses';
import { dataSource } from '../../../config/typeorm';

export const getAllPointReqHandler: RequestHandler<unknown, PaginationResponse> = async (
  req,
  res,
  next,
) => {
  const totalCount = await dataSource
    .getRepository(pointsRequest)
    .count({ where: req.pagination.filter });

  const pointRequests = await dataSource
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
    .where('createdBy.account_provider_id = :providerId AND pr.is_deleted=false', {
      providerId: req.loggedUser.provider_id,
    })
    .andWhere(req.pagination.filter)
    .take(req.pagination.limit)
    .skip(req.pagination.skip)
    .getMany();

  res.status(200).json({
    success: true,
    message: 'Point Request Catch Successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(totalCount / req.pagination.limit),
      resultCount: totalCount,
    },
    data: pointRequests,
  });
};

export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    title?: string;
    request_type?: PointsRequestType;
    created_at_from?: Date;
    created_at_to?: Date;
    target_user?: string;
    provider_id?: string;
  }
> = async (req, res, next) => {
  req.pagination = req.pagination || {};
  const filter: FindOptionsWhere<pointsRequest> = req.pagination.filter;

  if (req.query.title) {
    filter.title = ILike(`%${req.query.title}%`);
  }

  if (req.query.request_type) {
    filter.request_type = req.query.request_type;
  }

  if (req.query.created_at_from && req.query.created_at_to) {
    filter.created_at = Between(
      new Date(req.query.created_at_from),
      new Date(req.query.created_at_to),
    );
  } else if (req.query.created_at_from || req.query.created_at_to) {
    if (req.query.created_at_from)
      filter.created_at = MoreThanOrEqual(new Date(req.query.created_at_from));
    if (req.query.created_at_to)
      filter.created_at = LessThanOrEqual(new Date(req.query.created_at_to));
  }

  if (req.query.target_user) {
    filter.target_user = { id: req.query.target_user };
  }

  if (req.query.provider_id) {
    filter.point = { provider_id: { id: req.query.provider_id } };
  }

  req.pagination.filter = filter;
  next();
};

// import { Between, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
// import { RequestHandler } from 'express';

// import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../../constants/query';
// import { pointsRequest, PointsRequestType } from '../../../models/point-request.model';
// import { PaginationResponse } from '../../../types/responses';
// import { dataSource } from '../../../config/typeorm';

// export const getAllPointReqHandler: RequestHandler<unknown, PaginationResponse> = async (
//   req,
//   res,
//   next,
// ) => {
//   const totalCount = await dataSource
//     .getRepository(pointsRequest)
//     .count({ where: req.pagination.filter });

//   const pointRequests = await dataSource
//     .getRepository(pointsRequest)
//     .createQueryBuilder('pointRequests')
//     .leftJoinAndSelect('pointRequests.point', 'point')
//     .leftJoinAndSelect('point.provider_id', 'providerId')
//     .leftJoinAndSelect('providerId.user_company_profile', 'providerId_user_company_profile')
//     .leftJoinAndSelect('providerId.user_pharmacy_profile', 'providerId_user_pharmacy_profile')
//     .leftJoinAndSelect('providerId.user_doctor_profile', 'providerId_user_doctor_profile')
//     .leftJoinAndSelect('point.target_user', 'targetUser')
//     .leftJoinAndSelect('targetUser.user_company_profile', 'targetUser_user_company_profile')
//     .leftJoinAndSelect('targetUser.user_pharmacy_profile', 'targetUser_user_pharmacy_profile')
//     .leftJoinAndSelect('targetUser.user_doctor_profile', 'targetUser_user_doctor_profile')
//     .leftJoinAndSelect('pointRequests.created_by', 'createdBy')
//     .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
//     .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
//     .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
//     .select([
//       'pointRequests',
//       'point',
//       ...selectCreatedByJoinFields('createdBy'),
//       ...selectUserProfileJoinFields('user_company_profile'),
//       ...selectUserProfileJoinFields('user_pharmacy_profile'),
//       ...selectUserProfileJoinFields('user_doctor_profile'),
//       ...selectCreatedByJoinFields('providerId'),
//       ...selectUserProfileJoinFields('providerId_user_company_profile'),
//       ...selectUserProfileJoinFields('providerId_user_pharmacy_profile'),
//       ...selectUserProfileJoinFields('providerId_user_doctor_profile'),
//       ...selectCreatedByJoinFields('targetUser'),
//       ...selectUserProfileJoinFields('targetUser_user_company_profile'),
//       ...selectUserProfileJoinFields('targetUser_user_pharmacy_profile'),
//       ...selectUserProfileJoinFields('targetUser_user_doctor_profile'),
//     ])
//     .where('createdBy.account_provider_id = :providerId', {
//       providerId: req.loggedUser.provider_id,
//     })
//     .andWhere(req.pagination.filter)
//     .take(req.pagination.limit)
//     .skip(req.pagination.skip)
//     .getMany();

//   res.status(201).json({
//     success: true,
//     message: 'Point Request Catch Successfully',
//     pagination: {
//       currentPage: req.pagination.page,
//       totalPages: Math.ceil(totalCount / req.pagination.limit),
//       resultCount: totalCount,
//     },
//     data: pointRequests,
//   });
// };

// export const getPagination: RequestHandler<
//   unknown,
//   unknown,
//   unknown,
//   {
//     title?: string;
//     request_type?: PointsRequestType;
//     created_at_from?: Date;
//     created_at_to?: Date;
//     provider_id?: string;
//     target_user?: string;
//   }
// > = async (req, res, next) => {
//   req.pagination = req.pagination || {};
//   const filter: FindOptionsWhere<pointsRequest> = req.pagination.filter;

//   if (req.query.title) filter.title = ILike(`%${req.query.title}%`);
//   if (req.query.request_type) filter.request_type = req.query.request_type;

//   if (req.query.created_at_from && req.query.created_at_to) {
//     filter.created_at = Between(
//       new Date(req.query.created_at_from),
//       new Date(req.query.created_at_to),
//     );
//   } else if (req.query.created_at_from || req.query.created_at_to) {
//     if (req.query.created_at_from)
//       filter.created_at = MoreThanOrEqual(new Date(req.query.created_at_from));
//     if (req.query.created_at_to)
//       filter.created_at = LessThanOrEqual(new Date(req.query.created_at_to));
//   }

//   if (req.query.provider_id) {
//     filter.point = { provider_id: { id: req.query.provider_id } };
//   }
//   if (req.query.target_user) {
//     filter.point = { target_user: { id: req.query.target_user } };
//   }

//   req.pagination.filter = filter;
//   next();
// };
