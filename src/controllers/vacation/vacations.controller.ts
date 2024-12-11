import { RequestHandler } from 'express';
import { dataSource } from '../../config/typeorm';
import { DurationType, Vacation } from '../../models/vacation.model';
import { NotFound } from '../../errors/notfound-error';
import { ErrCodes } from '../../types/error-code';
import { PaginationResponse, SuccessResponse } from '../../types/responses';
import { Between, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { env } from '../../config/env';
import { selectCreatedByJoinFields } from '../../constants/query';
import { UserAuth } from '../../models/user-auth.model';

interface CreateVacationBody {
  title: string;
  description: string;
  vacation_type: string;
  duration_type: DurationType;
  max_days: number;
}

export const create: RequestHandler<unknown, SuccessResponse, CreateVacationBody> = async (
  req,
  res,
  next,
) => {
  const vacation = await dataSource.getRepository(Vacation).save({
    ...req.body,
    provider_id: { id: req.loggedUser.provider_id },
    created_by: { id: req.loggedUser.id },
  });

  res.status(201).json({
    success: true,
    message: 'Vacation Created Successfully',
    data: vacation,
  });
};

export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    title?: string;
    vacation_type?: string;
    duration_type?: DurationType;
    max_days_from?: number;
    max_days_to?: number;
    created_at_from: Date;
    created_at_to: Date;
    created_by?: string;
  }
> = async (req, res, next) => {
  const filter: FindOptionsWhere<Vacation> = req.pagination.filter;
  if (req.query.title) filter.title = ILike(`%${req.query.title}%`);
  if (req.query.vacation_type) filter.vacation_type = req.query.vacation_type;
  if (req.query.duration_type !== undefined) filter.duration_type = req.query.duration_type;
  if (req.query.max_days_from && req.query.max_days_to) {
    filter.max_days = Between(req.query.max_days_from, req.query.max_days_to);
  } else if (req.query.max_days_from || req.query.max_days_to) {
    if (req.query.max_days_from !== undefined) {
      filter.max_days = MoreThanOrEqual(req.query.max_days_from);
    }
    if (req.query.max_days_to !== undefined) {
      filter.max_days = LessThanOrEqual(req.query.max_days_to);
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
  const vacataionsCount = await dataSource
    .getRepository(Vacation)
    .count({ where: req.pagination.filter });

  const vacations = await dataSource
    .getRepository(Vacation)
    .createQueryBuilder('vacation')
    .leftJoinAndSelect('vacation.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select([
      'vacation',
      // ...selectCreatedByJoinFields('createdBy'),
      // ...selectUserProfileJoinFields('user_company_profile'),
      // ...selectUserProfileJoinFields('user_pharmacy_profile'),
      // ...selectUserProfileJoinFields('user_doctor_profile'),
    ])
    .where('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .andWhere(req.pagination.filter)
    .take(req.pagination.limit)
    .skip(req.pagination.skip)
    .getMany();

  vacations.forEach((v: any) => {
    if (v.created_by.user_company_profile === null) v.created_by.user_company_profile = undefined;
    if (v.created_by.user_pharmacy_profile === null) v.created_by.user_pharmacy_profile = undefined;
    if (v.created_by.user_doctor_profile === null) v.created_by.user_doctor_profile = undefined;
    if (v.created_by.user_company_profile?.profile_image != undefined)
      v.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${v.created_by.user_company_profile.profile_image}`;
    if (v.created_by.user_pharmacy_profile?.profile_image != undefined)
      v.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${v.created_by.user_pharmacy_profile.profile_image}`;
    if (v.created_by.user_doctor_profile?.profile_image != undefined)
      v.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${v.created_by.user_doctor_profile.profile_image}`;
    v.duration_type = DurationType[v.duration_type];
  });

  res.status(200).json({
    success: true,
    message: 'Vacations retrieved successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(vacataionsCount / req.pagination.limit),
      resultCount: vacataionsCount,
    },
    data: vacations,
  });
};

export const getOne: RequestHandler<{ vacationId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const vacation = await dataSource
    .getRepository(Vacation)
    .createQueryBuilder('vacation')
    .leftJoinAndSelect('vacation.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select([
      'vacation',
      ...selectCreatedByJoinFields('createdBy'),
      // ...selectUserProfileJoinFields('user_company_profile'),
      // ...selectUserProfileJoinFields('user_pharmacy_profile'),
      // ...selectUserProfileJoinFields('user_doctor_profile'),
    ])
    .where('vacation.id = :vacationId', { vacationId: req.params.vacationId })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();
  if (!vacation) return next(new NotFound(ErrCodes.NOT_FOUND));

  if (vacation.created_by.user_company_profile === null)
    (vacation as any).created_by.user_company_profile = undefined;
  if (vacation.created_by.user_pharmacy_profile === null)
    (vacation as any).created_by.user_pharmacy_profile = undefined;
  if (vacation.created_by.user_doctor_profile === null)
    (vacation as any).created_by.user_doctor_profile = undefined;
  if (vacation.created_by.user_company_profile)
    vacation.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${vacation.created_by.user_company_profile.profile_image}`;
  if (vacation.created_by.user_pharmacy_profile)
    vacation.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${vacation.created_by.user_pharmacy_profile.profile_image}`;
  if (vacation.created_by.user_doctor_profile)
    vacation.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${vacation.created_by.user_doctor_profile.profile_image}`;
  (vacation as any).duration_type = DurationType[(vacation as any).duration_type];

  res.status(200).json({
    success: true,
    message: 'Vacation retrieved successfully',
    data: vacation,
  });
};

export const update: RequestHandler<{ vacationId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const vacation = await dataSource
    .getRepository(Vacation)
    .createQueryBuilder('vacation')
    .leftJoinAndSelect('vacation.created_by', 'createdBy')
    .select('vacation.id')
    .where('vacation.id = :vacationId', { vacationId: req.params.vacationId })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();

  if (!vacation) return next(new NotFound(ErrCodes.NOT_FOUND, req.language));

  await dataSource.getRepository(Vacation).update({ id: req.params.vacationId }, req.body);

  res.status(200).json({
    success: true,
    message: 'Vacation updated successfully',
    data: {},
  });
};

export const remove: RequestHandler<{ vacationId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const vacation = await dataSource
    .getRepository(Vacation)
    .createQueryBuilder('vacation')
    .leftJoinAndSelect('vacation.created_by', 'createdBy')
    .select('vacation.id')
    .where('vacation.id = :vacationId', { vacationId: req.params.vacationId })
    .andWhere('createdBy.account_provider_id = :providerId', {
      providerId: req.loggedUser.provider_id,
    })
    .getOne();

  if (!vacation) return next(new NotFound(ErrCodes.NOT_FOUND, req.language));
  await dataSource.getRepository(Vacation).delete({ id: req.params.vacationId });

  return res.status(200).json({
    success: true,
    message: 'Vacation Deleted Successfully',
    data: {},
  });
};
