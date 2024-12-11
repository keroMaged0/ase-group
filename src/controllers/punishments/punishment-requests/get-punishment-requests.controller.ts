import { RequestHandler } from 'express';
import { FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { PunishmentRequest } from '../../../models/punishment-request.model';
import { dataSource } from '../../../config/typeorm';
import { PaginationResponse } from '../../../types/responses';
import {  userDataSubQuery } from '../../../constants/query';
import { UserAuth } from '../../../models/user-auth.model';


export const punishmentRequestSelectFields = [
  'punishmentRequest.id AS id',
  'punishmentRequest.punishment_id AS punishment_id',
  'punishmentRequest.created_at AS created_at',
  'punishmentRequest.updated_at AS updated_at',
];


export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    created_at_from?: Date;
    created_at_to?: Date;
    created_by?: string;
    target_user?: string;
    punishment?: string;
  }
> = async (req, res, next) => {
  const filter: FindOptionsWhere<PunishmentRequest> = req.pagination.filter;

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
  if (req.query.punishment) filter.punishment = { id: req.query.punishment };

  req.pagination.filter = filter;
  next();
};


export const get: RequestHandler<unknown, PaginationResponse> = async (req, res, next) => {
  const count = await dataSource
    .getRepository(PunishmentRequest)
    .count({ where: req.pagination.filter });

  const punishmentRequests = await dataSource
    .getRepository(PunishmentRequest)
    .createQueryBuilder('punishmentRequest')
    .leftJoinAndSelect('punishmentRequest.punishment', 'punishment')
    .select(punishmentRequestSelectFields)
    .addSelect(userDataSubQuery('punishmentRequest.created_by'), 'createdBy')
    .addSelect(userDataSubQuery('punishmentRequest.target_user'),'target_user')
    .leftJoin(UserAuth, 'createdBy', 'punishment.created_by = createdBy.id')
    .where('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .andWhere(req.pagination.filter)
    .take(req.pagination.limit)
    .skip(req.pagination.skip)
    .orderBy('punishmentRequest.created_at', 'DESC')
    .getRawMany();

  return res.status(200).json({
    success: true,
    message: 'Punishment Requests retrieved successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(count / req.pagination.limit),
      resultCount: count,
    },
    data: punishmentRequests,
  });
};
