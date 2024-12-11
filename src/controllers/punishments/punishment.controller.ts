import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { Punishment } from '../../models/punishments.model';
import { NotFound } from '../../errors/notfound-error';
import { ErrCodes } from '../../types/error-code';
import { SuccessResponse, PaginationResponse } from '../../types/responses';
import { Between, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { env } from '../../config/env';
import { selectCreatedByJoinFields, selectUserProfileJoinFields, userDataSubQuery } from '../../constants/query';
import { UserAuth } from '../../models/user-auth.model';

interface CreatePunishmentBody {
  title: string;
  description: string;
  punishment_type: string;
  deduction: number | null;
}

export const create: RequestHandler<unknown, SuccessResponse, CreatePunishmentBody> = async (
  req,
  res,
  next,
) => {
  const punishment = await dataSource.getRepository(Punishment).save({
    ...req.body,
    provider_id: { id: req.loggedUser.id },
    created_by: { id: req.loggedUser.id },
  });

  res.status(201).json({
    success: true,
    message: 'Punishment Created Successfully',
    data: punishment,
  });
};

export const punishmentSelectFields = [
  'punishment.id AS id',
  'punishment.title AS title',
  'punishment.description AS description',
  'punishment.punishment_type AS punishment_type',
  'punishment.deduction AS deduction',
  'punishment.provider_id AS provider_id',
  'punishment.created_at AS created_at',
  'punishment.updated_at AS updated_at',
];


export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    title?: string;
    punishment_type?: string;
    max_deduction_from?: number;
    max_deduction_to?: number;
    created_at_from?: Date;
    created_at_to?: Date;
    created_by?: string;
  }
> = async (req, res, next) => {
  const filter: FindOptionsWhere<Punishment> = req.pagination.filter;
  
  if (req.query.title) filter.title = ILike(`%${req.query.title}%`);
  if (req.query.punishment_type) filter.punishment_type = req.query.punishment_type;
  if (req.query.max_deduction_from && req.query.max_deduction_to) {
    filter.deduction = Between(req.query.max_deduction_from, req.query.max_deduction_to);
  } else if (req.query.max_deduction_from || req.query.max_deduction_to) {
    if (req.query.max_deduction_from !== undefined) {
      filter.deduction = MoreThanOrEqual(req.query.max_deduction_from);
    }
    if (req.query.max_deduction_to !== undefined) {
      filter.deduction = LessThanOrEqual(req.query.max_deduction_to);
    }
  }
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
  
  req.pagination.filter = filter;
  next();
};

export const get: RequestHandler<unknown, PaginationResponse> = async (req, res, next) => {
  const punishmentsCount = await dataSource
    .getRepository(Punishment)
    .count({ where: req.pagination.filter });

  const punishments = await dataSource
    .getRepository(Punishment)
    .createQueryBuilder('punishment')
    .select(punishmentSelectFields)
    .addSelect(userDataSubQuery('punishment.created_by'), 'createdBy')
    .leftJoin(UserAuth, 'createdBy', 'punishment.created_by = createdBy.id')
    .where('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.id,
    })
    .andWhere(req.pagination.filter)
    .take(req.pagination.limit)
    .skip(req.pagination.skip)
    .getRawMany();
    
  res.status(200).json({
    success: true,
    message: 'Punishments retrieved successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(punishmentsCount / req.pagination.limit),
      resultCount: punishmentsCount,
    },
    data: punishments,
  });
};

export const getOne: RequestHandler<{ punishmentId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const punishment = await dataSource
    .getRepository(Punishment)
    .createQueryBuilder('punishment')
    .select(punishmentSelectFields)
    .addSelect(userDataSubQuery('punishment.created_by'), 'createdBy')
    .leftJoin(UserAuth, 'createdBy', 'punishment.created_by = createdBy.id')
    .where('punishment.id = :punishmentId', { punishmentId: req.params.punishmentId })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.id,
    })
    .getRawOne();

  res.status(200).json({
    success: true,
    message: 'Punishment retrieved successfully',
    data: punishment,
  });
};

export const update: RequestHandler<{ punishmentId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const punishment = await dataSource
    .getRepository(Punishment)
    .createQueryBuilder('punishment')
    .leftJoinAndSelect('punishment.created_by', 'createdBy')
    .select('punishment.id')
    .where('punishment.id = :punishmentId', { punishmentId: req.params.punishmentId })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.id,
    })
    .getOne();

  if (!punishment) return next(new NotFound(ErrCodes.NOT_FOUND));

  await dataSource.getRepository(Punishment).update({ id: req.params.punishmentId }, req.body);

  res.status(200).json({
    success: true,
    message: 'Punishment updated successfully',
    data: {},
  });
};

export const remove: RequestHandler<{ punishmentId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const punishment = await dataSource
    .getRepository(Punishment)
    .createQueryBuilder('punishment')
    .leftJoinAndSelect('punishment.created_by', 'createdBy')
    .select('punishment.id')
    .where('punishment.id = :punishmentId', { punishmentId: req.params.punishmentId })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.id,
    })
    .getOne();

  if (!punishment) return next(new NotFound(ErrCodes.NOT_FOUND));
  
  await dataSource.getRepository(Punishment).delete({ id: req.params.punishmentId });

  return res.status(200).json({
    success: true,
    message: 'Punishment Deleted Successfully',
    data: {},
  });
};


