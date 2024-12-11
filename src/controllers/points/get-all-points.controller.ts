import { RequestHandler } from 'express';

import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../constants/query';
import { Between, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { DurationType } from '../../models/vacation.model';
import { PaginationResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Point } from '../../models/point.model';
import { env } from 'process';

export const getAllPointsHandler: RequestHandler<unknown, PaginationResponse> = async (
  req,
  res,
  next,
) => {
  const pointsCount = await dataSource.getRepository(Point).count({ where: req.pagination.filter });

  const points = await dataSource
    .getRepository(Point)
    .createQueryBuilder('points')
    .leftJoinAndSelect('points.product_id', 'productId')
    .addSelect(['productId.id', 'productId.name', 'productId.description', 'productId.price'])
    .leftJoinAndSelect('points.provider_id', 'providerId')
    .leftJoinAndSelect('providerId.user_company_profile', 'providerId_user_company_profile')
    .leftJoinAndSelect('providerId.user_pharmacy_profile', 'providerId_user_pharmacy_profile')
    .leftJoinAndSelect('providerId.user_doctor_profile', 'providerId_user_doctor_profile')
    .leftJoinAndSelect('points.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select([
      'points',
      ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
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

  points.forEach((p: any) => {
    if (p.created_by.user_company_profile === null) p.created_by.user_company_profile = undefined;
    if (p.created_by.user_pharmacy_profile === null) p.created_by.user_pharmacy_profile = undefined;
    if (p.created_by.user_doctor_profile === null) p.created_by.user_doctor_profile = undefined;
    if (p.created_by.user_company_profile?.profile_image != undefined)
      p.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${p.created_by.user_company_profile.profile_image}`;
    if (p.created_by.user_pharmacy_profile?.profile_image != undefined)
      p.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${p.created_by.user_pharmacy_profile.profile_image}`;
    if (p.created_by.user_doctor_profile?.profile_image != undefined)
      p.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${p.created_by.user_doctor_profile.profile_image}`;
    p.duration_type = DurationType[p.duration_type];
  });

  return res.json({
    success: true,
    message: 'Points fetched successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(pointsCount / req.pagination.limit),
      resultCount: pointsCount,
    },
    data: points,
  });
};

export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    name: string;
    point_type: string;
    created_at_from: Date;
    created_at_to: Date;
    provider_id: string;
  }
> = async (req, res, next) => {
  req.pagination = req.pagination || {};
  const filter: FindOptionsWhere<Point> = req.pagination.filter;

  if (req.query.name) filter.name = ILike(`%${req.query.name}%`);

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

  if (req.query.provider_id) filter.provider_id = { id: req.query.provider_id };

  req.pagination.filter = filter;
  next();
};
